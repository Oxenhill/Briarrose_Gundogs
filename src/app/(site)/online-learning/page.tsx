import type { Metadata } from 'next'
import { getCourses, getSiteSettings } from '@/lib/queries'
import { getSessionClientId, getEntitledCourses, BASE44_PORTAL_URL } from '@/lib/courseAccess'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Online Learning',
    description: site.onlineLearningPageBody || `Gundog course material for ${site.businessName} clients.`,
    path: '/online-learning',
  })
}

export default async function OnlineLearningPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const [courses, site, clientId] = await Promise.all([getCourses(), getSiteSettings(), getSessionClientId()])

  // Entitlement is checked fresh on every visit — never cached, never
  // trusted from anything the browser sends.
  const entitledKeys = clientId ? await getEntitledCourses(clientId) : []
  const course = courses[0] ?? null
  const isEntitled = !!course && entitledKeys.includes(course.entitlementKey)

  return (
    <>
      <PageHero
        eyebrow={site.onlineLearningPageEyebrow || 'Online Learning'}
        heading={site.onlineLearningPageHeading || 'Gundog course material for clients'}
        body={site.onlineLearningPageBody}
      />

      <section className="container" style={{ paddingBottom: 100, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        {error ? (
          <p style={{ color: 'var(--ink-soft)', marginBottom: 32 }}>
            That course-platform link didn&apos;t work (it may have expired) — head back to your account home page
            on the booking portal and try &ldquo;My Courses&rdquo; again.
          </p>
        ) : null}

        {!course ? (
          <p style={{ color: 'var(--ink-soft)' }}>
            Course material is on its way — check back soon, or get in touch if you were expecting to see it already.
          </p>
        ) : clientId && isEntitled ? (
          <>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 28 }}>You have full access to {course.title}.</p>
            <PillLink href={`/online-learning/${course.slug.current}`} solid>
              Go To Your Course
            </PillLink>
          </>
        ) : clientId ? (
          <p style={{ color: 'var(--ink-soft)' }}>
            You&apos;re logged in, but your current package doesn&apos;t include {course.title} yet — get in touch if
            that doesn&apos;t look right.
          </p>
        ) : (
          <>
            <p style={{ color: 'var(--ink-soft)', marginBottom: 28 }}>
              {course.summary || 'Course material included with a gundog training package.'}
            </p>
            <PillLink href={BASE44_PORTAL_URL} solid external>
              Log In To Watch
            </PillLink>
          </>
        )}
      </section>
    </>
  )
}
