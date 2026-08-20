import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { getSiteSettings } from '@/lib/queries'
import { SiteNav } from '@/components/site-nav'
import { SiteFooter } from '@/components/site-footer'
import { ScrollRevealInit } from '@/components/scroll-reveal-init'
import { urlForImage } from '@/sanity/lib/image'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://briarrosegundogs.co.uk'
  const ogSource = site.ogImage || site.logo
  const ogImage = ogSource ? urlForImage(ogSource).width(1200).height(630).url() : '/brand/briarrose-logo.jpeg'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: site.seoDefaultTitle,
      template: `%s — ${site.businessName}`,
    },
    description: site.seoDefaultDescription,
    openGraph: {
      title: site.seoDefaultTitle,
      description: site.seoDefaultDescription,
      siteName: site.businessName,
      type: 'website',
      locale: 'en_GB',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.seoDefaultTitle,
      description: site.seoDefaultDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: '/',
    },
  }
}

export default async function RootLayout({ children }: LayoutProps<'/'>) {
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
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <ScrollRevealInit />
        <SiteNav site={site} />
        <main className="flex-1">{children}</main>
        <SiteFooter site={site} />
      </body>
    </html>
  )
}
