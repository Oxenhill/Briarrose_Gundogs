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
  const testimonials = await getTestimonials()

  return (
    <>
      <PageHero eyebrow="Testimonials" heading="What handlers say" />
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
            </blockquote>
          ))}
        </div>
      </section>
    </>
  )
}
