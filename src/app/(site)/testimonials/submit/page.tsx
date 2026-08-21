import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { TestimonialForm } from '@/components/testimonial-form'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return {
    ...buildMetadata({
      title: 'Share Your Story',
      description: `Trained with ${site.businessName}? Share your experience.`,
      path: '/testimonials/submit',
    }),
    // Private page — not linked from anywhere on the site (see the "Testimonials"
    // section of the Studio for the link to hand out yourself). Kept out of
    // search results so it isn't found by anyone who wasn't sent the link.
    robots: { index: false, follow: false },
  }
}

export default async function SubmitTestimonialPage() {
  const site = await getSiteSettings()

  return (
    <>
      <PageHero
        eyebrow="Share Your Story"
        heading="Trained with us? We'd love to hear how it went"
        body={`A few sentences is plenty. ${site.businessName} reviews every submission before it goes on the site.`}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        <TestimonialForm />
      </section>
    </>
  )
}
