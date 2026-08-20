import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getDogs, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({ title: 'Our Dogs', description: `Meet the dogs behind ${site.businessName}.`, path: '/dogs' })
}

export default async function DogsPage() {
  const dogs = await getDogs()

  return (
    <>
      <PageHero eyebrow="Our Dogs" heading="The dogs behind the training" />
      <section className="container" style={{ paddingBottom: 120 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 40,
          }}
        >
          {dogs.map((dog) => {
            const photoUrl = dog.photo ? urlForImage(dog.photo).width(600).height(600).url() : null
            return (
              <Link
                key={dog._id}
                href={`/dogs/${dog.slug.current}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {photoUrl ? (
                  <div style={{ position: 'relative', aspectRatio: '1/1', marginBottom: 20 }}>
                    <Image src={photoUrl} alt={dog.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="frame ph-texture" style={{ aspectRatio: '1/1', marginBottom: 20 }}>
                    <span className="tag">Photography placeholder</span>
                  </div>
                )}
                <h3 style={{ fontSize: 22, marginBottom: 6 }}>{dog.name}</h3>
                <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 4 }}>{dog.breed}</p>
                <p style={{ color: 'var(--ink-soft)', fontSize: 14.5 }}>{dog.blurb}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </>
  )
}
