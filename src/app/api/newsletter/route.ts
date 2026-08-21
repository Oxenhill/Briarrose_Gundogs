import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { writeClient, sanityWriteConfigured } from '@/sanity/lib/writeClient'
import { sendEmail, resendConfigured } from '@/lib/email'

/**
 * Newsletter signup endpoint.
 *
 * Saves each signup as a `newsletterSignup` document in Sanity (visible
 * under "Newsletter Signups" in the Studio) — that's the list. Requires
 * SANITY_API_WRITE_TOKEN; until it's set, this only logs the submission,
 * same placeholder behaviour as before.
 *
 * When RESEND_API_KEY is also set, a confirmation email goes out with an
 * unsubscribe link unique to that signup, so the list stays opt-in and
 * self-service — nobody has to email in to be removed.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    console.log('[newsletter] signup received:', email)

    if (sanityWriteConfigured) {
      // Typed as `string` (not left as an inline literal) so @sanity/client's
      // typed-GROQ inference doesn't try to match it against generated query
      // types — this project doesn't run `sanity typegen`, so a literal here
      // would otherwise fail to typecheck against a hand-written params object.
      // Cast the params object: @sanity/client's typed-GROQ params type only
      // accepts params matching generated query types (this project doesn't
      // run `sanity typegen`), so a hand-written params object needs an `any`
      // escape hatch here — the query and params are correct at runtime either way.
      const findByEmail: string = `*[_type == "newsletterSignup" && lower(email) == lower($email)][0]{_id, unsubscribeToken}`
      const existing = (await writeClient.fetch(findByEmail, { email } as any, {})) as {
        _id: string
        unsubscribeToken: string
      } | null

      const token = existing?.unsubscribeToken ?? randomUUID()
      const now = new Date().toISOString()

      if (existing) {
        await writeClient
          .patch(existing._id)
          .set({ unsubscribed: false, unsubscribedAt: null, subscribedAt: now })
          .commit()
      } else {
        await writeClient.create({
          _type: 'newsletterSignup',
          email,
          subscribedAt: now,
          unsubscribed: false,
          unsubscribeToken: token,
        })
      }

      if (resendConfigured && process.env.NEXT_PUBLIC_SITE_URL) {
        const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?token=${token}`
        await sendEmail({
          to: email,
          subject: "You're on the list — Briarrose Gundogs",
          text: `Thanks for signing up to Briarrose Gundogs updates.\n\nDon't want these emails? Unsubscribe any time: ${unsubscribeUrl}`,
        })
      }
    } else {
      console.log('[newsletter] SANITY_API_WRITE_TOKEN not set — signup logged only, not saved')
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[newsletter] error:', err)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
