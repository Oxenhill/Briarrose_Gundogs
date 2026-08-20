/** Compact page-header treatment for interior pages (not the homepage hero). */
export function PageHero({ eyebrow, heading, body }: { eyebrow?: string; heading: string; body?: string }) {
  return (
    <section style={{ padding: '80px 0 60px', textAlign: 'center' }} className="container" data-reveal="">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', marginTop: 16 }}>{heading}</h1>
      {body && (
        <p
          style={{
            color: 'var(--ink-soft)',
            maxWidth: '52ch',
            margin: '20px auto 0',
            fontSize: 16,
          }}
        >
          {body}
        </p>
      )}
    </section>
  )
}
