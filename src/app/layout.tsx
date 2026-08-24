import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import { getSiteSettings } from '@/lib/queries'
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
  const ogImage = ogSource ? urlForImage(ogSource).width(1200).height(630).url() : `${siteUrl}/brand/briarrose-og.png`

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

/**
 * The true root layout — deliberately minimal. It only sets up <html>/<body>,
 * fonts, and site-wide metadata defaults.
 *
 * The public site's header/footer chrome (SiteNav, SiteFooter, the
 * LocalBusiness structured data, scroll-reveal init) lives in
 * `(site)/layout.tsx` instead of here, so that `/studio` — which is NOT
 * inside the `(site)` route group — renders with nothing else around it.
 * The embedded Sanity Studio expects to own the full browser viewport and
 * manage its own internal scrolling; nesting it inside the marketing site's
 * sticky header/footer squeezes it into a fraction of the screen and breaks
 * its scrolling, which is exactly the bug this split fixes.
 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
