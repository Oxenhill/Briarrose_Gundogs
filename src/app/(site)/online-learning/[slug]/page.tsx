import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getCourseBySlug, getCourses } from '@/lib/queries'
import { getSessionClientId, getEntitledCourses, BASE44_PORTAL_URL } from '@/lib/courseAccess'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { Prose } from '@/components/prose'
import { LessonContent } from '@/components/lesson-content'
import { CourseNav } from '@/components/course-nav'
import { LessonProgressControls } from '@/components/lesson-progress-controls'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const courses = await getCourses()
  return courses.map((c) => ({ slug: c.slug.current }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return {}
  return buildMetadata({
    title: course.title,
    description: course.summary || `${course.title} — course material for clients.`,
    path: `/online-learning/${slug}`,
  })
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  // Entitlement is checked fresh on every visit — never cached, never
  // trusted from anything the browser sends. A lesson only ever renders
  // its real content (video/text/PDF/etc.) once this comes back true, or
  // if the lesson itself is marked as a free preview.
  const clientId = await getSessionClientId()
  const entitledKeys = clientId ? await getEntitledCourses(clientId) : []
  const isEntitled = entitledKeys.includes(course.entitlementKey)

  const imageUrl = course.coverImage ? urlForImage(course.coverImage).width(2000).height(1125).url() : null

  const navModules = (course.modules || []).map((mod) => ({
    key: mod._key,
    title: mod.title,
    lessons: (mod.lessons || []).map((lessonItem) => ({
      key: lessonItem._key,
      title: lessonItem.title,
      locked: !(lessonItem.isFreePreview || isEntitled),
    })),
  }))

  return (
    <>
      <PageHero eyebrow="Online Learning" heading={course.title} body={course.summary} />
      <CourseNav courseSlug={slug} modules={navModules} />

      <section className="container" style={{ paddingBottom: 100 }}>
        {imageUrl ? (
          <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 48 }}>
            <Image
              src={imageUrl}
              alt={course.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 900px) 100vw, 1200px"
              priority
            />
          </div>
        ) : null}

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {course.description ? <Prose value={course.description} /> : null}

          {course.modules && course.modules.length > 0 ? (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ marginBottom: 24 }}>Course content</h2>
              {course.modules.map((mod) => (
                <details key={mod._key} id={`module-${mod._key}`} open={isEntitled} style={{ marginBottom: 20, borderTop: '1px solid var(--line)', paddingTop: 20, scrollMarginTop: 20 }}>
                  <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 20 }}>
                    {mod.title}
                    {mod.lessons ? ` (${mod.lessons.length} lesson${mod.lessons.length === 1 ? '' : 's'})` : ''}
                  </summary>
                  <div style={{ marginTop: 20 }}>
                    {mod.summary ? <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>{mod.summary}</p> : null}
                    {(mod.lessons || []).map((lessonItem) => {
                      const unlocked = !!lessonItem.isFreePreview || isEntitled
                      return (
                        <div key={lessonItem._key} id={`lesson-${lessonItem._key}`} style={{ marginBottom: 28, scrollMarginTop: 20 }}>
                          <p style={{ fontWeight: 600, marginBottom: unlocked ? 12 : 0 }}>
                            {lessonItem.title}
                            {lessonItem.durationMinutes ? ` — ${lessonItem.durationMinutes} min` : ''}
                            {lessonItem.isFreePreview ? ' (free preview)' : ''}
                          </p>
                          {unlocked ? (
                            <>
                              <LessonContent blocks={lessonItem.content} />
                              <LessonProgressControls courseSlug={slug} lessonKey={lessonItem._key} />
                            </>
                          ) : (
                            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                              {clientId
                                ? "Included with a gundog training package — get in touch if that doesn't look right."
                                : 'Log in from your account home page to watch this lesson.'}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </details>
              ))}
            </div>
          ) : null}

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            {isEntitled ? (
              <p style={{ color: 'var(--ink-soft)' }}>You have full access to this course.</p>
            ) : clientId ? (
              <PillLink href="/contact" solid>
                Ask About This Course
              </PillLink>
            ) : (
              <>
                <PillLink href={BASE44_PORTAL_URL} solid external>
                  Log In To Watch
                </PillLink>
                <div style={{ marginTop: 12 }}>
                  <PillLink href="/contact">Ask About This Course</PillLink>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
