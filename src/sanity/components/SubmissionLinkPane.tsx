import { useState } from 'react'
import { Card, Stack, Text, Button, Flex } from '@sanity/ui'

/**
 * Static info pane pinned inside the "Testimonials" section of the Studio
 * (see ../structure.ts) — not a document, just a permanent reminder of the
 * private "share your story" link and a one-click way to copy it.
 *
 * This link is deliberately not shown or linked anywhere on the public
 * website (see /testimonials/submit's page metadata and robots.ts) — hand
 * it to a client yourself (text, email, WhatsApp) when you'd like a
 * testimonial from them. Whatever they submit comes in unapproved and
 * shows up in the list below, marked "Awaiting approval".
 */
export function SubmissionLinkPane() {
  const [copied, setCopied] = useState(false)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://briarrosegundogs.co.uk'
  const link = `${siteUrl}/testimonials/submit`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. non-HTTPS or older browser) — the
      // link is still fully visible and selectable by hand below.
    }
  }

  return (
    <Card padding={4}>
      <Stack gap={4} style={{ maxWidth: 480 }}>
        <Stack gap={3}>
          <Flex align="center" gap={2}>
            <Text weight="semibold" size={2}>
              🔗 Private testimonial link
            </Text>
          </Flex>
          <Text size={1} muted>
            This page isn&apos;t linked anywhere on the website — copy it and send it directly to a client
            (by text, email, or WhatsApp) whenever you&apos;d like a testimonial from them. Whatever they
            submit comes in unapproved and appears in the list on the left, marked &ldquo;Awaiting
            approval,&rdquo; until you switch it on.
          </Text>
        </Stack>
        <Card padding={3} radius={2} tone="transparent" border>
          <Text size={1} style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {link}
          </Text>
        </Card>
        <Button
          text={copied ? 'Copied!' : 'Copy link'}
          tone={copied ? 'positive' : 'primary'}
          onClick={handleCopy}
          style={{ alignSelf: 'flex-start' }}
        />
      </Stack>
    </Card>
  )
}
