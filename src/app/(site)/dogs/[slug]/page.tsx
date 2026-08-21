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

  const photoUrl = dog.photo ? urlForImage(dog.photo).width(1200).height(1200).url() : null
  const gallery = (dog.gallery ?? []).filter((img): img is NonNullable<typeof img> => Boolean(img))

  return (
    <>
      <PageHero eyebrow={dog.breed} heading={dog.name} body={dog.blurb} />
      <section className="container" style={{ paddingBottom: 100 }}>
        {photoUrl ? (
          <div style={{ position: 'relative', aspectRatio: '4/3', marginBottom: gallery.length ? 32 : 0 }}>
            <Image src={photoUrl} alt={dog.name} fill style={{ objectFit: 'cover' }} />
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
              const url = urlForImage(img).width(600).height(600).url()
              return (
                <div key={i} style={{ position: 'relative', aspectRatio: '1/1' }}>
                  <Image src={url} alt={`${dog.name} — photo ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
