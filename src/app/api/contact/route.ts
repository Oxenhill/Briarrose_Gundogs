import { NextResponse } from 'next/server'

/**
 * Contact form endpoint.
 *
 * Placeholder implementation — logs the submission so the form works
 * end-to-end today. Swap the body of this handler for a real email
 * provider (Resend, Postmark, etc.) once one is chosen; nothing else in
 * the app needs to change.
 */
export async function POST(request: Request) {
  try {
    const { name, email, dogName, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[contact] enquiry received:', { name, email, dogName, message })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
