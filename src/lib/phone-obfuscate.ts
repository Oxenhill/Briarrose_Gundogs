/**
 * Reversible obfuscation for the site's public phone number, paired with
 * <ObfuscatedPhone> (src/components/obfuscated-phone.tsx).
 *
 * The number is stored and edited normally in Sanity — this only runs at
 * render time, right before the digits would otherwise land in
 * server-rendered HTML. The goal is to keep the number out of view-source
 * and the Next.js RSC payload in a form a regex/text scraper recognises as
 * a phone number, since that's how it ends up on spam/robocall lists in
 * the first place. A real visitor in a real browser still sees the actual
 * number within a moment of the page loading, same as before.
 *
 * This is obfuscation, not encryption — it stops bulk scrapers that read
 * raw page source without running JavaScript, nothing more. Keep SHIFT in
 * sync with the copy of it in obfuscated-phone.tsx.
 */
const SHIFT = 5

export function encodePhone(raw: string): string {
  const shifted = raw
    .split('')
    .map((ch) => String.fromCharCode(ch.charCodeAt(0) + SHIFT))
    .join('')
  return Buffer.from(shifted, 'utf-8').toString('base64')
}
