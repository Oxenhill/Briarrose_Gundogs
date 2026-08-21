import { NextResponse } from 'next/server'
import { writeClient, sanityWriteConfigured } from '@/sanity/lib/writeClient'
import { sendEmail } from '@/lib/email'
import { getSiteSettings } from '@/lib/queries'

/**
 * Client-submitted testimonial endpoint — the target of the "share your
 * story" form at /testimonials/submit. That page is private and unlisted
 * (not linked anywhere on the site — see the Studio's "Testimonials"
 * section for the link to copy and send out yourself, e.g. by email or text).
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
 * someone's testimonial.
 */
export async function POST(request: Request) {
  try {
    const { clientName, dogName, location, quote } = await request.json()

    if (!quote || typeof quote !== 'string' || !quote.trim()) {
      return NextResponse.json({ error: 'Missing testimonial text' }, { status: 400 })
    }

    if (!sanityWriteConfigured) {
      console.log('[testimonials] SANITY_API_WRITE_TOKEN not set — submission NOT saved:', {
        clientName,
        dogName,
        location,
        quote,
      })
      return NextResponse.json(
        { error: 'Submissions are not accepting entries online right now.' },
        { status: 503 }
      )
    }

    const created = await writeClient.create({
      _type: 'testimonial',
      quote: quote.trim(),
      clientName: typeof clientName === 'string' ? clientName.trim() : undefined,
      dogName: typeof dogName === 'string' ? dogName.trim() : undefined,
      location: typeof location === 'string' ? location.trim() : undefined,
      source: 'Submitted via website',
      approved: false,
      featured: false,
      order: 0,
    })

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
          '',
          quote,
        ]
          .filter(Boolean)
          .join('\n'),
      })
    }

    return NextResponse.json({ ok: true, id: created._id })
  } catch (err) {
    console.error('[testimonials] error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
