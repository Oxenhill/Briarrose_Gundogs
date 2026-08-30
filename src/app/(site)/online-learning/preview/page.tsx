import { getCoursesPreview } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'

/**
 * Admin-only preview of the course catalogue — shows every `course`
 * document regardless of its `published` flag, so Oliver can see what a
 * course looks like while he's still building it in Studio, without
 * needing a real Base44 login or a "free preview" lesson toggle.
 *
 * Gated by proxy.ts (same Basic Auth as /studio) via the matcher below —
 * never linked from anywhere public, and excluded from the sitemap/search
 * engines. See preview/[slug]/page.tsx for the course detail equivalent,
 * which is where the actual "view it as an entitled client" behaviour
 * lives (this page just lists what's there to preview).
 */
export const metadata = {
  title: 'Course preview (admin only)',
  robots: { index: false, follow: false },
}

export default async function OnlineLearningPreviewIndex() {
  const courses = await getCoursesPreview()

  return (
    <>
      <PageHero
        eyebrow="Admin preview — not a public page"
        heading="Course preview"
        body="Every course in Studio, published or not. Open one to see exactly what a fully-entitled client would see — real content unlocked, no logging in required."
      />

      <section className="container" style={{ paddingBottom: 100 }}>
        {courses.length === 0 ? (
          <p style={{ color: 'var(--ink-soft)', textAlign: 'center' }}>
            No course documents exist in Studio yet — create one and it&apos;ll show up here.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {courses.map((course) => {
              const imageUrl = course.coverImage ? urlForImage(course.coverImage).width(600).height(340).url() : null
              return (
                <PillLink key={course._id} href={`/online-learning/preview/${course.slug.current}`} style={{ display: 'block', textAlign: 'left', padding: 0, overflow: 'hidden' }}>
                  {imageUrl ? (
                    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                      <Image src={imageUrl} alt="" fill style={{ objectFit: 'cover' }} sizes="340px" />
                    </div>
                  ) : null}
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: course.published ? 'var(--brand)' : 'var(--ink-soft)' }}>
                      {course.published ? 'Published' : 'Draft — not visible to real clients yet'}
                    </p>
                    <h3 style={{ margin: '4px 0' }}>{course.title}</h3>
                    {course.summary ? <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{course.summary}</p> : null}
                  </div>
                </PillLink>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
