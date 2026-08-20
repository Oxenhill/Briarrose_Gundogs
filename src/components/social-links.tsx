type SocialLink = { platform: string; url: string }

/** Renders social links from CMS data. Renders nothing if none are set. */
export function SocialLinks({ links, className }: { links: SocialLink[]; className?: string }) {
  if (!links || links.length === 0) return null
  return (
    <div className={className}>
      {links.map((link) => (
        <a
          key={link.platform + link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: 16 }}
        >
          {link.platform}
        </a>
      ))}
    </div>
  )
}
