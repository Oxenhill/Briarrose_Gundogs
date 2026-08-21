import type { Metadata } from 'next'
import { getClasses, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { ClassRow } from '@/components/class-row'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Classes & Services',
    description: `Gundog training classes and services from ${site.businessName}, sourced live from our class list.`,
    path: '/classes',
  })
}

export default async function ClassesPage() {
  const [classes, site] = await Promise.all([getClasses(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={site.classesPageEyebrow || 'Classes & Services'}
        heading={site.classesPageHeading || 'Training built around your dog'}
        body={
          site.classesPageBody ||
          'Every class here is managed from the CMS — add, reorder, price, or retire one any time without touching code.'
        }
      />
      <section className="list-section" style={{ paddingTop: 0 }}>
        <div className="container">
          {classes.map((item, i) => (
            <ClassRow key={item._id} item={item} index={i} />
          ))}
        </div>
      </section>
    </>
  )
}
