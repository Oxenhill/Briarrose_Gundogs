import Link from 'next/link'
import type { SiteSettings } from '@/lib/fallback-content'
import { SocialLinks } from '@/components/social-links'
import { NewsletterForm } from '@/components/newsletter-form'
import { getPolicies } from '@/lib/queries'

const EXPLORE_LINKS = [
  { href: '/classes', label: 'Classes' },
  { href: '/dogs', label: 'Our Dogs' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
]

const MORE_LINKS = [
  { href: '/journal', label: 'Journal' },
  { href: '/videos', label: 'Video Hub' },
  { href: '/events', label: 'Events' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export async function SiteFooter({ site }: { site: SiteSettings }) {
  const policies = await getPolicies()

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-top">
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <h4
              style={{
                fontSize: 11.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
                marginBottom: 16,
              }}
            >
              {site.newsletterHeadline}
            </h4>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', marginBottom: 20 }}>
              {site.newsletterBody}
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="foot-cols">
          <div>
            <h4>Explore</h4>
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>More</h4>
            {MORE_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <h4>Get in Touch</h4>
            {site.phone && <a href={`tel:${site.phone.replace(/\s+/g, '')}`}>{site.phone}</a>}
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
            <span style={{ display: 'block', fontSize: 14.5, marginBottom: 10 }}>
              {site.coverageArea}
            </span>
            <SocialLinks links={site.socialLinks} />
          </div>
          {policies.length > 0 && (
            <div>
              <h4>Legal</h4>
              {policies.map((p) => (
                <Link key={p._id} href={`/policies/${p.slug.current}`}>
                  {p.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="foot-bottom">
          <p>
            {site.footerText} · {site.addressLocality}, {site.addressRegion}
          </p>
        </div>
      </div>
    </footer>
  )
}
