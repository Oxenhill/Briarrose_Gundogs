import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/queries'
import { sendEmail } from '@/lib/email'

/**
 * Contact form endpoint.
 *
 * Emails the submission to Site Settings → Contact Details →
 * "Where enquiries are sent" (falling back to the main Email address if
 * that's blank) via Resend — see src/lib/email.ts. Until RESEND_API_KEY is
 * set, sending is skipped and the submission is only logged, same as
 * before, so the form keeps working either way.
 */
export async function POST(request: Request) {
  try {
    const { name, email, dogName, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log('[contact] enquiry received:', { name, email, dogName, message })

    const site = await getSiteSettings()
    const recipient = site.enquiryNotificationEmail || site.email

    if (recipient) {
      await sendEmail({
        to: recipient,
        subject: `New enquiry from ${name}`,
        text: [`Name: ${name}`, `Email: ${email}`, dogName ? `Dog's name: ${dogName}` : null, '', message]
          .filter(Boolean)
          .join('\n'),
        replyTo: email,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
