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
  const posts = await getPosts()
  return posts.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return buildMetadata({ title: post.title, description: post.excerpt, path: `/journal/${slug}` })
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, site] = await Promise.all([getPostBySlug(slug), getSiteSettings()])
  if (!post) notFound()

  const coverUrl = post.coverImage ? urlForImage(post.coverImage).width(1400).height(800).url() : null

  return (
    <>
      <PageHero
        eyebrow={post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Journal'}
        heading={post.title}
      />
      <section className="container" style={{ maxWidth: 760, paddingBottom: 100 }}>
        {coverUrl && (
          <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 48 }}>
            <Image src={coverUrl} alt={post.title} fill style={{ objectFit: 'cover' }} />
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
