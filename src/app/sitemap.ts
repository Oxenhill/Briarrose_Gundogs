import type { MetadataRoute } from 'next'
import { getClasses, getDogs, getPosts, getPolicies } from '@/lib/queries'
import { siteUrl } from '@/lib/seo'

const STATIC_ROUTES = [
  '',
  '/classes',
  '/dogs',
  '/about',
  '/gallery',
  '/journal',
  '/videos',
  '/testimonials',
  '/events',
  '/faq',
  '/contact',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [classes, dogs, posts, policies] = await Promise.all([
    getClasses(),
    getDogs(),
    getPosts(),
    getPolicies(),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))

  const classEntries: MetadataRoute.Sitemap = classes.map((c) => ({
    url: `${base}/classes/${c.slug.current}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const dogEntries: MetadataRoute.Sitemap = dogs.map((d) => ({
    url: `${base}/dogs/${d.slug.current}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${base}/journal/${p.slug.current}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  const policyEntries: MetadataRoute.Sitemap = policies.map((p) => ({
    url: `${base}/policies/${p.slug.current}`,
    changeFrequency: 'yearly',
    priority: 0.3,
  }))

  return [...staticEntries, ...classEntries, ...dogEntries, ...postEntries, ...policyEntries]
}
