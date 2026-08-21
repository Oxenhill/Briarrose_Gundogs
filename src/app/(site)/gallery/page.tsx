import type { Metadata } from 'next'
import Image from 'next/image'
import { getGallery, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Gallery',
    description: `Photos from training, working days and events at ${site.businessName}.`,
    path: '/gallery',
  })
}

export default async function GalleryPage() {
  const items = await getGallery()

  return (
    <>
      <PageHero eyebrow="Gallery" heading="Training, puppies & working days" />
      <section className="container" style={{ paddingBottom: 120 }}>
        {items.length === 0 ? (
          <div className="frame ph-texture" style={{ aspectRatio: '21/9' }}>
            <span className="tag">Gallery photos will appear here once added in the CMS</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {items.map((item) => {
              const url = item.image ? urlForImage(item.image).width(1100).height(1100).url() : null
              return (
                <figure key={item._id} style={{ margin: 0 }}>
                  {url ? (
                    <div style={{ position: 'relative', aspectRatio: '1/1' }}>
                      <Image
                        src={url}
                        alt={item.title || ''}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="frame ph-texture" style={{ aspectRatio: '1/1' }} />
                  )}
                  {item.title && (
                    <figcaption style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 8 }}>
                      {item.title}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
