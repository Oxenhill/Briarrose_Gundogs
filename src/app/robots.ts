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

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/api'],
      },
      ...AI_CRAWLERS.map((agent) => ({
        userAgent: agent,
        allow: '/',
        disallow: ['/studio', '/api'],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
