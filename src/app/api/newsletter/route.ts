import { NextResponse } from 'next/server'

/**
 * Newsletter signup endpoint.
 *
 * Placeholder implementation — logs the submission so the form works
 * end-to-end today. Swap the body of this handler for a real provider
 * (Mailchimp, Brevo, Resend Audiences, etc.) once one is chosen; nothing
 * else in the app needs to change.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    console.log('[newsletter] signup received:', email)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
