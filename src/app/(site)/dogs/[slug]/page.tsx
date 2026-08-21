import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getDogBySlug, getDogs } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const dogs = await getDogs()
  return dogs.map((d) => ({ slug: d.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const dog = await getDogBySlug(slug)
  if (!dog) return {}
  return buildMetadata({ title: dog.name, description: dog.blurb, path: `/dogs/${slug}` })
}

export default async function DogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const dog = await getDogBySlug(slug)
  if (!dog) notFound()

  // Requested at the same 4:3 ratio as the box it's displayed in below —
  // asking Sanity for a differently-shaped crop than the CSS box means the
  // browser has to crop it AGAIN to fit, on top of Sanity's own crop, which
  // is what caused photos to appear over-zoomed/cropped oddly.
  const photoUrl = dog.photo ? urlForImage(dog.photo).width(2000).height(1500).url() : null
  const gallery = (dog.gallery ?? []).filter((img): img is NonNullable<typeof img> => Boolean(img))

  return (
    <>
      <PageHero eyebrow={dog.breed} heading={dog.name} body={dog.blurb} />
      <section className="container" style={{ paddingBottom: 100 }}>
        {photoUrl ? (
          <div style={{ position: 'relative', aspectRatio: '4/3', marginBottom: gallery.length ? 32 : 0 }}>
            <Image
              src={photoUrl}
              alt={dog.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
            />
          </div>
        ) : (
          <div className="frame ph-texture" style={{ aspectRatio: '4/3' }}>
            <span className="tag">Photography placeholder</span>
          </div>
        )}
        {gallery.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {gallery.map((img, i) => {
              // 4:3, same reasoning as the main photo above and the "Our
              // Dogs" grid — avoids cropping group/landscape shots to a
              // square.
              const url = urlForImage(img).width(1000).height(750).url()
              return (
                <div key={i} style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <Image
                    src={url}
                    alt={`${dog.name} — photo ${i + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
