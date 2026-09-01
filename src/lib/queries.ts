import { sanityFetch } from '@/sanity/lib/client'
import {
  fallbackClasses,
  fallbackCourses,
  fallbackDogs,
  fallbackEvents,
  fallbackFaqs,
  fallbackGallery,
  fallbackPolicies,
  fallbackPosts,
  fallbackSiteSettings,
  fallbackTestimonials,
  fallbackTrainerProfile,
  fallbackVideos,
} from '@/lib/fallback-content'

export function getSiteSettings() {
  return sanityFetch(`*[_type == "siteSettings"][0]`, {}, fallbackSiteSettings)
}

export function getTrainerProfile() {
  return sanityFetch(`*[_type == "trainerProfile"][0]`, {}, fallbackTrainerProfile)
}

// `location` is a reference on classItem, so it's dereferenced with `->`
// here rather than relying on the default `*` projection (which would
// otherwise return just `{_type: "reference", _ref: "..."}`).
const CLASS_ITEM_PROJECTION = `{..., location->{name, address, postcode, mapUrl, notes}}`

export function getClasses() {
  return sanityFetch(
    `*[_type == "classItem" && active != false] | order(order asc)${CLASS_ITEM_PROJECTION}`,
    {},
    fallbackClasses
  )
}

export function getClassBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "classItem" && slug.current == $slug][0]${CLASS_ITEM_PROJECTION}`,
    { slug },
    fallbackClasses.find((c) => c.slug.current === slug) ?? null
  )
}

export function getDogs() {
  return sanityFetch(`*[_type == "dog"] | order(order asc)`, {}, fallbackDogs)
}

export function getDogBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "dog" && slug.current == $slug][0]`,
    { slug },
    fallbackDogs.find((d) => d.slug.current === slug) ?? null
  )
}

// `approved != false` (rather than `approved == true`) so testimonials added
// before this field existed — which have no `approved` value at all — still
// show up; only an explicit `false` (client-submitted, not yet reviewed) is
// hidden.
export function getTestimonials() {
  return sanityFetch(
    `*[_type == "testimonial" && approved != false] | order(order asc)`,
    {},
    fallbackTestimonials
  )
}

export function getFeaturedTestimonial() {
  return sanityFetch(
    `*[_type == "testimonial" && featured == true && approved != false] | order(order asc)[0]`,
    {},
    fallbackTestimonials[0] ?? null
  )
}

export function getGallery() {
  return sanityFetch(`*[_type == "galleryItem"] | order(order asc)`, {}, fallbackGallery)
}

export function getVideos() {
  return sanityFetch(`*[_type == "video"] | order(order asc)`, {}, fallbackVideos)
}

export function getPosts() {
  return sanityFetch(`*[_type == "post"] | order(publishedAt desc)`, {}, fallbackPosts)
}

export function getPostBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "post" && slug.current == $slug][0]`,
    { slug },
    fallbackPosts.find((p) => p.slug.current === slug) ?? null
  )
}

export function getEvents() {
  return sanityFetch(`*[_type == "event"] | order(startDateTime asc)`, {}, fallbackEvents)
}

export function getFaqs() {
  return sanityFetch(`*[_type == "faqItem"] | order(order asc)`, {}, fallbackFaqs)
}

export function getPolicies() {
  return sanityFetch(`*[_type == "policy"]`, {}, fallbackPolicies)
}

export function getPolicyBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "policy" && slug.current == $slug][0]`,
    { slug },
    fallbackPolicies.find((p) => p.slug.current === slug) ?? null
  )
}

// Only one course lives on this site today (the gundog course), but this
// mirrors the same shape as every other collection here so a second course
// is just another Sanity document away, not a schema change.
export function getCourses() {
  return sanityFetch(
    `*[_type == "course" && published == true] | order(order asc)`,
    {},
    fallbackCourses
  )
}

// `pdfBlock.file` is a Sanity `file` field — unlike images (resolvable
// client-side from just the raw asset ref via urlForImage), a file's
// download URL only exists once the query itself dereferences the asset,
// so this explicit per-block projection is required (plain `*` would
// leave `file.asset` as just `{_ref}`, with no usable url).
const COURSE_DETAIL_PROJECTION = `{
  ...,
  modules[]{
    ...,
    lessons[]{
      ...,
      content[]{
        ...,
        _type == "pdfBlock" => {
          ...,
          "file": { "asset": file.asset->{url, originalFilename} }
        }
      }
    }
  }
}`

export function getCourseBySlug(slug: string) {
  return sanityFetch(
    `*[_type == "course" && slug.current == $slug && published == true][0]${COURSE_DETAIL_PROJECTION}`,
    { slug },
    fallbackCourses.find((c) => c.slug.current === slug) ?? null
  )
}

// Preview-only variants for /online-learning/preview (see that route) — the
// only difference is dropping `published == true`, so Oliver can see a
// course while he's still building it in Studio, before it's ready for
// real clients. Never used outside that Basic-Auth-gated route.
export function getCoursesPreview() {
  return sanityFetch(`*[_type == "course"] | order(order asc)`, {}, fallbackCourses, { revalidate: 0 })
}

export function getCourseBySlugPreview(slug: string) {
  return sanityFetch(
    `*[_type == "course" && slug.current == $slug][0]${COURSE_DETAIL_PROJECTION}`,
    { slug },
    fallbackCourses.find((c) => c.slug.current === slug) ?? null,
    { revalidate: 0 }
  )
}

// Whether reviewers (people signed in with the shared reviewer password, as
// opposed to Oliver's own Studio login) are currently allowed into the course
// preview — see siteSettings.coursePreviewReviewEnabled. Fetched separately
// from getSiteSettings() (which caches for 60s) with `revalidate: 0`, so
// flipping the toggle in Studio takes effect on the very next request rather
// than up to a minute later. Defaults to closed if Sanity isn't reachable or
// the field has never been set — fail closed, not open.
export function getCoursePreviewReviewEnabled() {
  return sanityFetch<boolean>(
    `*[_type == "siteSettings"][0].coursePreviewReviewEnabled`,
    {},
    false,
    { revalidate: 0 }
  )
}
