import { PortableText, type PortableTextComponents } from '@portabletext/react'

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 style={{ marginTop: 40, marginBottom: 16 }}>{children}</h2>,
    h3: ({ children }) => <h3 style={{ marginTop: 32, marginBottom: 14 }}>{children}</h3>,
    normal: ({ children }) => (
      <p style={{ marginBottom: 20, color: 'var(--ink-soft)', fontSize: 16 }}>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '2px solid var(--line)',
          paddingLeft: 24,
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 20,
          margin: '32px 0',
        }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ marginBottom: 20, paddingLeft: 22, color: 'var(--ink-soft)' }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ marginBottom: 20, paddingLeft: 22, color: 'var(--ink-soft)' }}>{children}</ol>
    ),
  },
  marks: {
    // @portabletext/react's built-in defaults already handle strong/em/
    // underline — only the custom `link` annotation (added for the Course
    // Builder's rich text editor) needs a component here.
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href
      if (!href) return <>{children}</>
      const isExternal = /^https?:\/\//i.test(href)
      return (
        <a
          href={href}
          style={{ color: 'inherit', textDecoration: 'underline' }}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
  },
}

/** Renders Sanity portable-text blocks (bio, policy body, post body). */
export function Prose({ value }: { value: unknown }) {
  if (!value) return null
  return <PortableText value={value as never} components={components} />
}
