import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

// GEO: explicitly welcome AI/LLM crawlers alongside standard search bots,
// since this site wants to be cited by AI answer engines as well as
// ranked in traditional search.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
  'PerplexityBot',
  'CCBot',
  'Applebot-Extended',
  'Bytespider',
  'Meta-ExternalAgent',
]

// The private testimonial submission page (see the "Testimonials" section
// of the Studio for the link) isn't linked from anywhere on the site, but
// is disallowed here too as a second layer, in case it's ever discovered.
const DISALLOW = ['/studio', '/api', '/testimonials/submit']

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_CRAWLERS.map((agent) => ({
        userAgent: agent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
