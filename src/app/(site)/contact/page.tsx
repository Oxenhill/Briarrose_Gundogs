import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { SocialLinks } from '@/components/social-links'
import { buildMetadata } from '@/lib/seo'
import { ASK_URL } from '@/lib/ask'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Contact',
    description: `Ask ${site.businessName} a question about gundog training — ${site.coverageArea}.`,
    path: '/contact',
  })
}

/**
 * Contact goes through the Ask page in the booking app (no public phone
 * number, email address or contact form). Routine questions are answered
 * straight away from live booking data; anything else goes to Oliver.
 * The email address stays in the footer, small, for anything formal.
 */
export default async function ContactPage() {
  const site = await getSiteSettings()
  const hasBooking = Boolean(site.bookingUrl && site.bookingUrl !== '#')

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
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}
        >
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 3,
              padding: '40px 36px',
              background: 'var(--panel)',
            }}
          >
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 500 }}>Ask a question</h2>
            <p style={{ color: 'var(--ink-soft)', margin: '14px 0 12px', fontSize: 15.5 }}>
              Ask about gundog one-to-ones, packages, the Gundog Development Club, the Sunday groups or how
              booking works, and you&rsquo;ll get an answer straight away.
            </p>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 28, fontSize: 15.5 }}>
              Anything that needs Oliver, including questions about your dog&rsquo;s behaviour, goes straight
              to him and he&rsquo;ll get back to you.
            </p>
            <PillLink href={ASK_URL} solid external>
              Ask a question
            </PillLink>
          </div>

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
              Where we train
            </h4>
            <div style={{ display: 'grid', gap: 10, marginBottom: 32, fontSize: 15.5 }}>
              <span style={{ color: 'var(--ink-soft)' }}>
                {site.addressLocality}, {site.addressRegion}
              </span>
              <span style={{ color: 'var(--ink-soft)' }}>
                {site.coverageArea}
                {site.travelRadiusMiles ? ` · within ${site.travelRadiusMiles} miles` : ''}
              </span>
            </div>

            {hasBooking && (
              <div style={{ marginBottom: 32 }}>
                <PillLink href={site.bookingUrl} external>
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
