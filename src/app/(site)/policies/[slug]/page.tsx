import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPolicyBySlug, getPolicies } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { Prose } from '@/components/prose'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const policies = await getPolicies()
  return policies.map((p) => ({ slug: p.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = await getPolicyBySlug(slug)
  if (!policy) return {}
  return buildMetadata({ title: policy.title, description: policy.title, path: `/policies/${slug}` })
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const policy = await getPolicyBySlug(slug)
  if (!policy) notFound()

  return (
    <>
      <PageHero
        eyebrow={policy.updatedAt ? `Updated ${new Date(policy.updatedAt).toLocaleDateString('en-GB')}` : undefined}
        heading={policy.title}
      />
      <section className="container" style={{ maxWidth: 720, paddingBottom: 100 }}>
        <Prose value={policy.body} />
      </section>
    </>
  )
}
