import { getSiteSettings } from '@/lib/queries'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { ScrollRevealInit } from '@/components/scroll-reveal-init'

/**
 * Layout for every public marketing page (everything except /studio and the
 * API/robots/sitemap routes, which sit outside this `(site)` route group).
 * Adds the sticky header, footer, scroll-reveal behaviour, and the
 * site-wide LocalBusiness structured data — none of which should wrap the
 * embedded Sanity Studio.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://briarrosegundogs.co.uk'

  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#business`,
    name: site.businessName,
    description: site.seoDefaultDescription,
    url: siteUrl,
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.addressLocality,
      addressRegion: site.addressRegion,
      addressCountry: 'GB',
    },
    areaServed: site.coverageArea,
    ...(site.travelRadiusMiles
      ? {
          geoRadius: `${site.travelRadiusMiles} mi`,
        }
      : {}),
    sameAs: (site.socialLinks || []).map((s) => s.url),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <ScrollRevealInit />
      <SiteNav site={site} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} />
    </>
  )
}
