import type { Metadata } from 'next'
import Image from 'next/image'
import { getTestimonials, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { StarRating } from '@/components/star-rating'
import { urlForImage } from '@/sanity/lib/image'
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

  // Star ratings are optional per testimonial (see the schema) — only the
  // ones that have one count towards this average, so a page with zero
  // rated testimonials simply doesn't show the summary at all.
  const rated = testimonials.filter((t) => typeof t.rating === 'number')
  const average = rated.length
    ? rated.reduce((sum, t) => sum + (t.rating as number), 0) / rated.length
    : null

  return (
    <>
      <PageHero
        eyebrow={site.testimonialsPageEyebrow || 'Testimonials'}
        heading={site.testimonialsPageHeading || 'What handlers say'}
        body={site.testimonialsPageBody}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        {average !== null && (
          <div style={{ textAlign: 'center', marginBottom: 64 }} data-reveal="">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <StarRating value={average} size={20} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '0.04em' }}>
              {average.toFixed(1)} out of 5, from {rated.length} client review{rated.length === 1 ? '' : 's'}
            </p>
          </div>
        )}
        <div style={{ display: 'grid', gap: 56, maxWidth: 780, margin: '0 auto' }}>
          {testimonials.map((t) => {
            const photoUrl = t.photo ? urlForImage(t.photo).width(160).height(160).url() : null
            return (
              <blockquote key={t._id} style={{ textAlign: 'center' }} data-reveal="">
                {photoUrl && (
                  <div
                    style={{
                      position: 'relative',
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      margin: '0 auto 16px',
                    }}
                  >
                    <Image src={photoUrl} alt="" fill style={{ objectFit: 'cover' }} sizes="64px" />
                  </div>
                )}
                {typeof t.rating === 'number' && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                    <StarRating value={t.rating} />
                  </div>
                )}
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
            )
          })}
        </div>
      </section>
    </>
  )
}
