import type { Metadata } from 'next'
import { getFaqs, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { JsonLd } from '@/components/json-ld'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'FAQ',
    description: `Common questions about training with ${site.businessName}.`,
    path: '/faq',
  })
}

export default async function FaqPage() {
  const [faqs, site] = await Promise.all([getFaqs(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={site.faqPageEyebrow || 'FAQ'}
        heading={site.faqPageHeading || 'Common questions'}
        body={site.faqPageBody}
      />
      <section className="container" style={{ paddingBottom: 120, maxWidth: 760 }}>
        {faqs.length === 0 ? (
          <div className="frame ph-texture" style={{ aspectRatio: '21/9' }}>
            <span className="tag">Questions will appear here once added in the CMS</span>
          </div>
        ) : (
          <div>
            {faqs.map((faq) => (
              <details key={faq._id} style={{ borderTop: '1px solid var(--line)', padding: '22px 0' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    fontSize: 19,
                    fontWeight: 500,
                  }}
                >
                  {faq.question}
                </summary>
                <p style={{ color: 'var(--ink-soft)', marginTop: 14, fontSize: 15 }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        )}
      </section>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }}
      />
    </>
  )
}
