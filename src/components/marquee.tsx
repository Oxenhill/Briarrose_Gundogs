/**
 * Scrolling text band. Items come from the CMS class list (or any string
 * array) — duplicated once so the CSS animation loops seamlessly.
 */
export function Marquee({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null
  const loop = [...items, ...items]
  return (
    <div className="band">
      {loop.map((item, i) => (
        <span key={i}>{item}</span>
      ))}
    </div>
  )
}
