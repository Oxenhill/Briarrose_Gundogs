import type { Metadata } from 'next'

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://briarrosegundogs.co.uk'
}

/**
 * Builds consistent per-page metadata (canonical, OpenGraph, Twitter card)
 * from a title/description/path. Used by every page's generateMetadata so
 * canonical URLs and social previews stay uniform without repeating
 * boilerplate on each route.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string
  description: string
  path: string
  image?: string
}): Metadata {
  const url = `${siteUrl()}${path}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}
