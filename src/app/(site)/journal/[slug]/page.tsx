import { getLearningCentreJournal, learningCentreJournalEnabled } from '@/lib/learning-centre'
import { deliveredMetadata, DeliveredJournalArticle } from '@/components/delivered-journal'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getPostBySlug, getPosts, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { Prose } from '@/components/prose'
import { JsonLd } from '@/components/json-ld'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  if (learningCentreJournalEnabled()) return []
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const delivery = await getLearningCentreJournal()
  if (delivery) {
    const item = delivery.state.items.find((entry) => entry.route === `/journal/${slug}`)
    return item ? deliveredMetadata(item) : { title: 'Journal entry unavailable', robots: { index: false, follow: false } }
  }
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return buildMetadata({ title: post.title, description: post.excerpt, path: `/journal/${slug}` })
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const delivery = await getLearningCentreJournal()
  if (delivery) {
    if (delivery.status === 'unavailable') return <><PageHero eyebrow="Journal" heading="Journal temporarily unavailable" /><p className="container" role="status">Please try again shortly.</p></>
    const item = delivery.state.items.find((entry) => entry.route === `/journal/${slug}`)
    if (!item) notFound()
    return <DeliveredJournalArticle item={item} status={delivery.status} />
  }
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) notFound()

  const coverUrl = post.coverImage ? urlForImage(post.coverImage).width(1800).height(1013).url() : null

  return (
    <>
      <PageHero
        eyebrow={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Journal'}
        heading={post.title}
      />
      <section className="container" style={{ maxWidth: 760, paddingBottom: 100 }}>
        {coverUrl && (
          <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 48 }}>
            <Image
              src={coverUrl}
              alt={post.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 800px) 100vw, 760px"
              priority
            />
          </div>
        )}
        <Prose value={post.body} />
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          author: { '@type': 'Person', name: post.authorName },
          publisher: { '@type': 'Organization', name: site.businessName },
        }}
      />
    </>
  )
}
