import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { SocialLinks } from '@/components/social-links'
import { ContactForm } from '@/components/contact-form'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Contact',
    description: `Get in touch with ${site.businessName} — ${site.coverageArea}.`,
    path: '/contact',
  })
}

export default async function ContactPage() {
  const site = await getSiteSettings()

  return (
    <>
      <PageHero
        eyebrow={site.contactPageEyebrow || 'Get in Touch'}
        heading={site.contactPageHeading || "Let's talk about your dog"}
        body={site.coverageArea}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        <div
          className="about-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64 }}
        >
          <ContactForm />

          <div>
            <h4
              style={{
                fontSize: 11.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--ink-soft)',
                marginBottom: 20,
              }}
            >
              Details
            </h4>
            <div style={{ display: 'grid', gap: 10, marginBottom: 32, fontSize: 15.5 }}>
              {site.phone && <a href={`tel:${site.phone.replace(/\s+/g, '')}`}>{site.phone}</a>}
              {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
              <span style={{ color: 'var(--ink-soft)' }}>
                {site.addressLocality}, {site.addressRegion}
              </span>
              <span style={{ color: 'var(--ink-soft)' }}>
                {site.coverageArea}
                {site.travelRadiusMiles ? ` · within ${site.travelRadiusMiles} miles` : ''}
              </span>
            </div>

            {site.bookingUrl && site.bookingUrl !== '#' && (
              <div style={{ marginBottom: 32 }}>
                <PillLink href={site.bookingUrl} solid external>
                  Book Online
                </PillLink>
              </div>
            )}

            <SocialLinks links={site.socialLinks} />
          </div>
        </div>
      </section>
    </>
  )
}
