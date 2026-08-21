import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getClassBySlug, getClasses, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { JsonLd } from '@/components/json-ld'
import { Prose } from '@/components/prose'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const classes = await getClasses()
  return classes.map((c) => ({ slug: c.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const item = await getClassBySlug(slug)
  if (!item) return {}
  return buildMetadata({ title: item.title, description: item.summary, path: `/classes/${slug}` })
}

export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [item, site] = await Promise.all([getClassBySlug(slug), getSiteSettings()])

  if (!item) notFound()

  // Matches the 16:9 box below exactly (was 3:2, which forced a second,
  // uncoordinated crop in the browser on top of Sanity's own crop).
  const imageUrl = item.image ? urlForImage(item.image).width(2000).height(1125).url() : null

  // This class's own Dog Smart link, if set, otherwise the site-wide one.
  const bookingUrl = item.bookingUrl && item.bookingUrl !== '#' ? item.bookingUrl : site.bookingUrl

  return (
    <>
      <PageHero eyebrow={item.stageLabel || 'Class'} heading={item.title} body={item.summary} />

      <section className="container" style={{ paddingBottom: 100 }}>
        {imageUrl ? (
          <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 48 }}>
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
            />
          </div>
        ) : (
          <div className="frame ph-texture" style={{ aspectRatio: '16/9', marginBottom: 48 }}>
            <span className="tag">Photography placeholder</span>
          </div>
        )}

        {item.description && (
          <div style={{ maxWidth: 640, margin: '0 auto 40px' }}>
            <Prose value={item.description} />
          </div>
        )}

        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {item.price && (
            <p style={{ fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 28 }}>
              From {item.price}
            </p>
          )}
          {item.location && (
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 28 }}>
              {item.location.mapUrl ? (
                <a href={item.location.mapUrl} target="_blank" rel="noopener noreferrer">
                  {item.location.name}
                </a>
              ) : (
                item.location.name
              )}
              {item.location.address ? ` — ${item.location.address}` : ''}
              {item.location.notes ? (
                <>
                  <br />
                  {item.location.notes}
                </>
              ) : null}
            </p>
          )}
          {bookingUrl && bookingUrl !== '#' ? (
            <PillLink href={bookingUrl} solid external>
              Book This Class
            </PillLink>
          ) : (
            <PillLink href="/contact" solid>
              Enquire
            </PillLink>
          )}
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: item.title,
          description: item.summary,
          provider: {
            '@type': 'LocalBusiness',
            name: site.businessName,
          },
          areaServed: site.coverageArea,
          ...(item.location
            ? {
                location: {
                  '@type': 'Place',
                  name: item.location.name,
                  ...(item.location.address ? { address: item.location.address } : {}),
                },
              }
            : {}),
        }}
      />
    </>
  )
}
