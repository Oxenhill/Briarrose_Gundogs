import type { Metadata } from 'next'
import { getTestimonials, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Testimonials',
    description: `What clients say about training with ${site.businessName}.`,
    path: '/testimonials',
  })
}

export default async function TestimonialsPage() {
  const [testimonials, site] = await Promise.all([getTestimonials(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={site.testimonialsPageEyebrow || 'Testimonials'}
        heading={site.testimonialsPageHeading || 'What handlers say'}
        body={site.testimonialsPageBody}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        <div style={{ display: 'grid', gap: 56, maxWidth: 780, margin: '0 auto' }}>
          {testimonials.map((t) => (
            <blockquote key={t._id} style={{ textAlign: 'center' }} data-reveal="">
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(20px, 2.6vw, 28px)',
                  marginBottom: 20,
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <cite
                style={{
                  fontStyle: 'normal',
                  fontSize: 12,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-soft)',
                }}
              >
                {t.clientName}
                {t.location ? ` · ${t.location}` : ''}
                {t.dogName ? ` · with ${t.dogName}` : ''}
              </cite>
              {t.source && (
                <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--ink-soft)' }}>
                  {t.sourceUrl ? (
                    <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer">
                      via {t.source} ↗
                    </a>
                  ) : (
                    <span>via {t.source}</span>
                  )}
                </div>
              )}
            </blockquote>
          ))}
        </div>
      </section>
    </>
  )
}
