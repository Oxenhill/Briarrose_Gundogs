import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPosts, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Journal',
    description: `Notes, updates and guides from ${site.businessName}.`,
    path: '/journal',
  })
}

function formatDate(iso: string | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function JournalPage() {
  const posts = await getPosts()

  return (
    <>
      <PageHero eyebrow="Journal" heading="Notes from the field" />
      <section className="container" style={{ paddingBottom: 120 }}>
        {posts.length === 0 ? (
          <div className="frame ph-texture" style={{ aspectRatio: '21/9' }}>
            <span className="tag">Journal posts will appear here once published in the CMS</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 48 }}>
            {posts.map((post) => {
              // Matches the 4:3 box below (was 1.6:1, which forced a second
              // crop in the browser on top of Sanity's own crop).
              const coverUrl = post.coverImage
                ? urlForImage(post.coverImage).width(900).height(675).url()
                : null
              return (
                <Link
                  key={post._id}
                  href={`/journal/${post.slug.current}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                    gap: 32,
                    textDecoration: 'none',
                    color: 'inherit',
                    alignItems: 'center',
                  }}
                >
                  {coverUrl ? (
                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                      <Image
                        src={coverUrl}
                        alt={post.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="280px"
                      />
                    </div>
                  ) : (
                    <div className="frame ph-texture" style={{ aspectRatio: '4/3' }} />
                  )}
                  <div>
                    {formatDate(post.publishedAt) && (
                      <span className="meta" style={{ display: 'block', marginBottom: 10 }}>
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                    <h3 style={{ fontSize: 26, marginBottom: 10 }}>{post.title}</h3>
                    <p style={{ color: 'var(--ink-soft)', fontSize: 15 }}>{post.excerpt}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
