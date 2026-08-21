/**
 * Minimal transactional email sender, using Resend's HTTP API directly
 * (no SDK dependency needed — it's one POST request).
 *
 * Requires a RESEND_API_KEY environment variable — a free API key from
 * resend.com (free tier: 3,000 emails/month, 100/day, no card required).
 * Until that's set, `resendConfigured` is false and `sendEmail` silently
 * no-ops, so contact/newsletter submissions keep working (they're still
 * logged to the server console) without erroring.
 *
 * RESEND_FROM_EMAIL is optional and defaults to Resend's own shared test
 * domain, which works immediately with no setup. To send from your own
 * address (e.g. "Briarrose Gundogs <enquiries@briarrosegundogs.co.uk>"),
 * verify briarrosegundogs.co.uk in the Resend dashboard first (adds a
 * couple of DNS records), then set RESEND_FROM_EMAIL to that address.
 */

const RESEND_API_URL = 'https://api.resend.com/emails'

export const resendConfigured = Boolean(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string
  subject: string
  text: string
  replyTo?: string
}) {
  if (!resendConfigured) {
    console.log('[email] RESEND_API_KEY not set — skipping send:', { to, subject })
    return
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Briarrose Gundogs <onboarding@resend.dev>'

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!res.ok) {
      console.error('[email] Resend send failed:', res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('[email] Resend request threw:', err)
  }
}
