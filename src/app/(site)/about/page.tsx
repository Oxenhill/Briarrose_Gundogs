import type { Metadata } from 'next'
import Image from 'next/image'
import { getTrainerProfile, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { Prose } from '@/components/prose'
import { JsonLd } from '@/components/json-ld'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const trainer = await getTrainerProfile()
  return buildMetadata({
    title: 'About',
    description: `Meet ${trainer.name}, ${trainer.jobTitle}.`,
    path: '/about',
  })
}

export default async function AboutPage() {
  const [trainer, site] = await Promise.all([getTrainerProfile(), getSiteSettings()])
  const photoUrl = trainer.photo ? urlForImage(trainer.photo).width(900).height(1100).url() : null

  return (
    <>
      <PageHero eyebrow={trainer.jobTitle} heading={trainer.name} />

      <section className="container" style={{ paddingBottom: 120 }}>
        <div
          className="about-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: 64,
            alignItems: 'start',
          }}
        >
          {photoUrl ? (
            <div style={{ position: 'relative', aspectRatio: '4/5' }}>
              <Image src={photoUrl} alt={trainer.name} fill style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="frame ph-texture" style={{ aspectRatio: '4/5' }}>
              <span className="tag">Photography placeholder</span>
            </div>
          )}

          <div>
            <Prose value={trainer.bio} />
            {trainer.credentials && trainer.credentials.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h4
                  style={{
                    fontSize: 11.5,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--ink-soft)',
                    marginBottom: 16,
                  }}
                >
                  Credentials
                </h4>
                <ul style={{ paddingLeft: 20, color: 'var(--ink-soft)' }}>
                  {trainer.credentials.map((c, i) => (
                    <li key={i} style={{ marginBottom: 8 }}>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: trainer.name,
          jobTitle: trainer.jobTitle,
          worksFor: {
            '@type': 'LocalBusiness',
            name: site.businessName,
          },
        }}
      />
    </>
  )
}
