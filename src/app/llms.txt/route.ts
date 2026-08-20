import { getSiteSettings, getClasses, getDogs, getFaqs, getPosts, getTrainerProfile } from '@/lib/queries'
import { siteUrl } from '@/lib/seo'

/**
 * llms.txt — a machine-readable summary for AI answer engines (GEO),
 * following the emerging llms.txt convention. Generated live from the
 * same CMS data as the site, so it never drifts out of date.
 */
export async function GET() {
  const base = siteUrl()
  const [site, trainer, classes, dogs, faqs, posts] = await Promise.all([
    getSiteSettings(),
    getTrainerProfile(),
    getClasses(),
    getDogs(),
    getFaqs(),
    getPosts(),
  ])

  const lines: string[] = []
  lines.push(`# ${site.businessName}`)
  lines.push('')
  lines.push(`> ${site.seoDefaultDescription}`)
  lines.push('')
  lines.push(site.philosophyBody)
  lines.push('')
  lines.push(`Based in ${site.addressLocality}, ${site.addressRegion}. ${site.coverageArea}.`)
  lines.push('')

  lines.push('## Trainer')
  lines.push(`- ${trainer.name}, ${trainer.jobTitle} — ${base}/about`)
  lines.push('')

  lines.push('## Classes & Services')
  for (const c of classes) {
    lines.push(`- [${c.title}](${base}/classes/${c.slug.current}): ${c.summary}`)
  }
  lines.push('')

  if (dogs.length > 0) {
    lines.push('## Dogs')
    for (const d of dogs) {
      lines.push(`- [${d.name}](${base}/dogs/${d.slug.current}) — ${d.breed}`)
    }
    lines.push('')
  }

  if (faqs.length > 0) {
    lines.push('## Frequently Asked Questions')
    for (const f of faqs) {
      lines.push(`- Q: ${f.question}`)
      lines.push(`  A: ${f.answer}`)
    }
    lines.push('')
  }

  if (posts.length > 0) {
    lines.push('## Journal')
    for (const p of posts) {
      lines.push(`- [${p.title}](${base}/journal/${p.slug.current}): ${p.excerpt}`)
    }
    lines.push('')
  }

  lines.push('## Pages')
  lines.push(`- Classes & Services: ${base}/classes`)
  lines.push(`- Our Dogs: ${base}/dogs`)
  lines.push(`- About: ${base}/about`)
  lines.push(`- Gallery: ${base}/gallery`)
  lines.push(`- Video Hub: ${base}/videos`)
  lines.push(`- Journal: ${base}/journal`)
  lines.push(`- Testimonials: ${base}/testimonials`)
  lines.push(`- Events: ${base}/events`)
  lines.push(`- FAQ: ${base}/faq`)
  lines.push(`- Contact: ${base}/contact`)

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
