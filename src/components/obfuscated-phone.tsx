'use client'

import { useEffect, useState } from 'react'

// Mirror of the shift used in src/lib/phone-obfuscate.ts — keep both in
// sync if either changes.
const SHIFT = 5

function decode(encoded: string): string | null {
  try {
    const shifted = atob(encoded)
    return shifted
      .split('')
      .map((ch) => String.fromCharCode(ch.charCodeAt(0) - SHIFT))
      .join('')
  } catch {
    return null
  }
}

/**
 * Renders the site's phone number as a real `tel:` link, but only once
 * this component has mounted in an actual browser. The `encoded` prop is
 * an obfuscated blob (see src/lib/phone-obfuscate.ts), not the plain
 * number, so nothing resembling a phone number sits in the server-rendered
 * HTML, the Next.js RSC payload, or view-source — which is where bulk
 * scrapers that feed spam/robocall lists actually harvest numbers from.
 *
 * This is obfuscation, not security: anyone opening the page in a real
 * browser sees the real number almost immediately, same as before. It only
 * stops bots that read raw page source without running JavaScript.
 *
 * Renders as an <a> tag in both states (decoded or not) so it always
 * picks up the same CSS as a plain phone link and never shifts layout —
 * before decoding it just has no href, so it's inert rather than broken.
 */
export function ObfuscatedPhone({
  encoded,
  className,
}: {
  encoded: string
  className?: string
}) {
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    setPhone(decode(encoded))
  }, [encoded])

  return (
    <a className={className} href={phone ? `tel:${phone.replace(/\s+/g, '')}` : undefined}>
      {phone ?? 'Call us'}
    </a>
  )
}
