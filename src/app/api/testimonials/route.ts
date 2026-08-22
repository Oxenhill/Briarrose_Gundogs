import { NextResponse } from 'next/server'
import { writeClient, sanityWriteConfigured } from '@/sanity/lib/writeClient'
import { sendEmail } from '@/lib/email'
import { getSiteSettings } from '@/lib/queries'

// Comfortably under Vercel's serverless request-body limit (4.5MB on most
// plans) — a submission that includes a larger photo gets a clear error
// back instead of the request just failing to arrive at all.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024

/**
 * Client-submitted testimonial endpoint — the target of the "share your
 * story" form at /testimonials/submit. That page is private and unlisted
 * (not linked anywhere on the site — see the Studio's "Testimonials"
 * section for the link to copy and send out yourself, e.g. by email or text).
 *
 * Sent as multipart form data (not JSON) so an optional photo upload can
 * ride along with the text fields.
 *
 * Every submission is saved with `approved: false`, so nothing from this
 * form ever appears on the site automatically — it shows up in the
 * Studio's "Testimonials" list marked "Awaiting approval" until you switch
 * "Approved — show on site?" on for it. This also emails a heads-up to the
 * enquiry address (Site Settings → Contact Details) so a submission isn't
 * missed.
 *
 * Requires SANITY_API_WRITE_TOKEN, same as the newsletter signup endpoint —
 * see src/sanity/lib/writeClient.ts. Until that's set, submissions can't be
 * saved at all, so this returns an error rather than silently discarding
 * someone's testimonial. The notification email (see src/lib/email.ts) is
 * treated as a courtesy on top of that saved record, not the source of
 * truth — a failure sending it must never make an already-saved submission
 * look like it failed, so it's wrapped in its own try/catch below.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const clientName = stringField(formData.get('clientName'))
    const dogName = stringField(formData.get('dogName'))
    const location = stringField(formData.get('location'))
    const quote = stringField(formData.get('quote')) ?? ''
    const photo = formData.get('photo')

    if (!quote.trim()) {
      return NextResponse.json({ error: 'Missing testimonial text' }, { status: 400 })
    }

    let rating: number | undefined
    const ratingRaw = stringField(formData.get('rating'))
    if (ratingRaw) {
      const parsed = Number(ratingRaw)
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 5) rating = parsed
    }

    if (!sanityWriteConfigured) {
      console.log('[testimonials] SANITY_API_WRITE_TOKEN not set — submission NOT saved:', {
        clientName,
        dogName,
        location,
        quote,
        rating,
        hasPhoto: photo instanceof File && photo.size > 0,
      })
      return NextResponse.json(
        { error: 'Submissions are not accepting entries online right now.' },
        { status: 503 }
      )
    }

    let photoAsset: { _type: 'image'; asset: { _type: 'reference'; _ref: string } } | undefined
    if (photo instanceof File && photo.size > 0) {
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json({ error: "That photo doesn't look like an image file." }, { status: 400 })
      }
      if (photo.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: 'That photo is too large — please choose one under 4MB.' }, { status: 400 })
      }
      try {
        const buffer = Buffer.from(await photo.arrayBuffer())
        const asset = await writeClient.assets.upload('image', buffer, {
          filename: photo.name || 'testimonial-photo',
          contentType: photo.type,
        })
        photoAsset = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
      } catch (err) {
        // Don't let a failed photo upload lose the rest of the testimonial —
        // save it without the photo and log the failure for follow-up.
        console.error('[testimonials] photo upload failed (saving without photo):', err)
      }
    }

    const created = await writeClient.create({
      _type: 'testimonial',
      quote: quote.trim(),
      clientName: clientName?.trim() || undefined,
      dogName: dogName?.trim() || undefined,
      location: location?.trim() || undefined,
      rating,
      photo: photoAsset,
      source: 'Submitted via website',
      approved: false,
      featured: false,
      order: 0,
    })

    try {
      const site = await getSiteSettings()
      const recipient = site.enquiryNotificationEmail || site.email
      if (recipient) {
        await sendEmail({
          to: recipient,
          subject: `New testimonial submitted${clientName ? ` by ${clientName}` : ''}`,
          text: [
            'A new testimonial was submitted through the website and is waiting for your approval in the Studio (Testimonials — marked "Awaiting approval").',
            '',
            clientName ? `From: ${clientName}` : null,
            dogName ? `Dog's name: ${dogName}` : null,
            location ? `Location: ${location}` : null,
            rating ? `Rating: ${rating}/5` : null,
            photoAsset ? 'A photo was attached — view it in the Studio.' : null,
            '',
            quote,
          ]
            .filter(Boolean)
            .join('\n'),
        })
      }
    } catch (err) {
      console.error('[testimonials] notification email failed (submission was still saved):', err)
    }

    return NextResponse.json({ ok: true, id: created._id })
  } catch (err) {
    console.error('[testimonials] error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

function stringField(value: FormDataEntryValue | null): string | undefined {
  return typeof value === 'string' ? value : undefined
}
