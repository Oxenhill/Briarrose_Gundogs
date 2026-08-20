/**
 * Renders a <script type="application/ld+json"> block. Use one per
 * structured-data type on a page (LocalBusiness lives site-wide in the
 * root layout; Service/Person/Article/VideoObject/FAQPage get added on
 * the pages they describe).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
