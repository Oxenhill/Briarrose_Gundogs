import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getCourseBySlugPreview, getCoursesPreview } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { Prose } from '@/components/prose'
import { LessonContent } from '@/components/lesson-content'
import { CourseNav } from '@/components/course-nav'
import { LessonProgressControls } from '@/components/lesson-progress-controls'
import { urlForImage } from '@/sanity/lib/image'

/**
 * Admin-only mirror of ../[slug]/page.tsx: renders a course exactly as a
 * fully-entitled client would see it — every module open, every lesson's
 * real content showing — without needing a real Base44 login, a "free
 * preview" toggle on every lesson, or the course being published yet.
 *
 * Gated by proxy.ts (same Basic Auth as /studio). isEntitled is hardcoded
 * true here ONLY — this file has no bearing on the real entitlement check
 * in ../[slug]/page.tsx, which still asks Base44 fresh on every visit.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlugPreview(slug)
  if (!course) return {}
  return { title: `Preview: ${course.title}`, robots: { index: false, follow: false } }
}

export async function generateStaticParams() {
  // Not statically generated — this route only ever runs behind Basic
  // Auth, on demand. Returning [] keeps it out of the build's static
  // param set so an unpublished/draft course can still be previewed.
  return []
}

export default async function CoursePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const course = await getCourseBySlugPreview(slug)
  if (!course) notFound()

  const imageUrl = course.coverImage ? urlForImage(course.coverImage).width(2000).height(1125).url() : null

  const navModules = (course.modules || []).map((mod) => ({
    key: mod._key,
    title: mod.title,
    lessons: (mod.lessons || []).map((lessonItem) => ({ key: lessonItem._key, title: lessonItem.title, locked: false })),
  }))

  return (
    <>
      <div style={{ background: '#111', color: '#fff', padding: '10px 24px', textAlign: 'center', fontSize: 14 }}>
        Preview mode — this is what a fully-entitled client sees. Not a public page.
        {course.published === false ? ' This course is still a draft.' : ''}
      </div>

      <PageHero eyebrow="Online Learning" heading={course.title} body={course.summary} />

      <section className="container" style={{ paddingBottom: 100 }}>
        {imageUrl ? (
          <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 48 }}>
            <Image src={imageUrl} alt={course.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 900px) 100vw, 1200px" priority />
          </div>
        ) : null}

        <div className="course-layout">
          <div className="course-main">
            {course.description ? <Prose value={course.description} /> : null}

            {course.modules && course.modules.length > 0 ? (
              <div style={{ marginTop: 32 }}>
                <h2 style={{ marginBottom: 24 }}>Course content</h2>
                {course.modules.map((mod) => (
                  <details key={mod._key} id={`module-${mod._key}`} open style={{ marginBottom: 20, borderTop: '1px solid var(--line)', paddingTop: 20, scrollMarginTop: 20 }}>
                    <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 20 }}>
                      {mod.title}
                      {mod.lessons ? ` (${mod.lessons.length} lesson${mod.lessons.length === 1 ? '' : 's'})` : ''}
                    </summary>
                    <div style={{ marginTop: 20 }}>
                      {mod.summary ? <p style={{ color: 'var(--ink-soft)', marginBottom: 20 }}>{mod.summary}</p> : null}
                      {(mod.lessons || []).map((lessonItem, lessonIndex) => (
                        <div key={lessonItem._key} id={`lesson-${lessonItem._key}`} className="lesson-block" style={{ scrollMarginTop: 20 }}>
                          <p className="lesson-heading">
                            <span className="lesson-number">Lesson {lessonIndex + 1}</span>
                            {lessonItem.title}
                            {lessonItem.durationMinutes ? ` — ${lessonItem.durationMinutes} min` : ''}
                            {lessonItem.isFreePreview ? ' (free preview)' : ''}
                          </p>
                          <LessonContent blocks={lessonItem.content} />
                          <LessonProgressControls courseSlug={`preview-${slug}`} lessonKey={lessonItem._key} />
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--ink-soft)', marginTop: 32 }}>No modules added yet.</p>
            )}

            <div style={{ marginTop: 40, textAlign: 'center' }}>
              <p style={{ color: 'var(--ink-soft)' }}>
                (In real life, a client only sees this once entitled — see{' '}
                <a href={`/online-learning/${course.slug.current}`}>the real page</a> for what a logged-out or
                not-yet-entitled visitor sees instead.)
              </p>
            </div>
          </div>

          <CourseNav courseSlug={`preview-${slug}`} modules={navModules} />
        </div>
      </section>
    </>
  )
}
