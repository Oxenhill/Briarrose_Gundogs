import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PageHero } from './page-hero'
import { JsonLd } from './json-ld'
import type { BrandDeliveryItem } from '@/lib/learning-centre-v1/brandDeliveryV1'
import type { DestinationRead } from '@/lib/learning-centre-v1/deliveryClient'

export function deliveredMetadata(item: BrandDeliveryItem): Metadata {
  return {
    title: item.seo.title, description: item.seo.description,
    alternates: { canonical: item.canonical.url },
    openGraph: { title: item.seo.title, description: item.seo.description, url: item.canonical.url,
      type: 'article', publishedTime: item.publishedAt,
      ...(item.seo.imageUrl ? { images: [{ url: item.seo.imageUrl }] } : {}) },
    twitter: { card: item.seo.imageUrl ? 'summary_large_image' : 'summary',
      title: item.seo.title, description: item.seo.description,
      ...(item.seo.imageUrl ? { images: [item.seo.imageUrl] } : {}) },
  }
}
function DeliveryStatus({ status }: { status: DestinationRead['status'] }) {
  if (status === 'fresh') return null
  return <p role="status">{status === 'stale' ? 'Showing the last verified journal copy while updates are temporarily unavailable.' : 'The journal is temporarily unavailable. Please try again shortly.'}</p>
}
export function DeliveredJournalIndex({ delivery }: { delivery: DestinationRead }) {
  return <>
    <PageHero eyebrow="Journal" heading="Notes from the field" />
    <section className="container" style={{ maxWidth: 900, paddingBottom: 100 }}>
      <DeliveryStatus status={delivery.status} />
      {delivery.status !== 'unavailable' && delivery.state.items.length === 0 ? <p>New journal entries will appear here when published.</p> : null}
      <div style={{ display: 'grid', gap: 32 }}>
        {[...delivery.state.items].sort((a,b) => b.publishedAt.localeCompare(a.publishedAt) || a.route.localeCompare(b.route)).map((item) => <article key={item.publicationRecordId} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 28, overflowWrap: 'anywhere' }}>
          <p className="meta"><time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
          <h2><Link href={item.route}>{item.title}</Link></h2>
          <p>{item.summary}</p>
          <p className="meta">Written by {item.presentation.author.displayName}</p>
        </article>)}
      </div>
    </section>
  </>
}
export function DeliveredJournalArticle({ item, status }: { item: BrandDeliveryItem; status: DestinationRead['status'] }) {
  const author = item.presentation.author
  return <>
    <PageHero eyebrow="Journal" heading={item.title} />
    <article className="container delivered-journal" style={{ maxWidth: 760, paddingBottom: 100, overflowWrap: 'anywhere' }}>
      <DeliveryStatus status={status} />
      <p className="meta">Written by {author.displayName} · <time dateTime={item.publishedAt}>{new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
      <p>{item.summary}</p>
      {item.bodyMarkdown ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h1: ({ children }) => <h2>{children}</h2>,
        // Published Markdown may reference external media; preserve its approved alt text.
        // eslint-disable-next-line @next/next/no-img-element
        img: ({ src, alt, title }) => <img src={src} title={title} alt={alt ?? ''} loading="lazy" decoding="async" style={{ maxWidth: '100%', height: 'auto' }} />,
      }}>{item.bodyMarkdown}</ReactMarkdown> : null}
      {item.mode !== 'canonical_full' ? <p><a href={item.canonical.url}>Read the original article</a></p> : null}
      {item.citations.length ? <section aria-labelledby="delivered-references"><h2 id="delivered-references">References</h2><ul>{item.citations.map((citation) => <li key={citation.citationId}>{citation.url ? <a href={citation.url}>{citation.label}</a> : citation.label}</li>)}</ul></section> : null}
      {item.presentation.cta ? <p><a className="btn" href={item.presentation.cta.href}>{item.presentation.cta.label}</a></p> : null}
      <p><Link href="/journal">Back to the journal</Link></p>
    </article>
    <JsonLd data={{ '@context':'https://schema.org', '@type':'BlogPosting', headline:item.title,
      description:item.seo.description, url:item.canonical.url, mainEntityOfPage:item.canonical.url,
      datePublished:item.publishedAt, author:{ '@type':author.profileId.startsWith('organization:') ? 'Organization' : 'Person', name:author.displayName,
        ...(author.profileUrl ? { url:author.profileUrl } : {}) },
      publisher:{ '@type':'Organization', name:'Briarrose Gundogs', url:'https://briarrosegundogs.co.uk' },
      ...(item.seo.imageUrl ? { image:item.seo.imageUrl } : {}),
    }} />
  </>
}
