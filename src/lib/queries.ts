import { sanityFetch } from '@/sanity/lib/client'
import {
  fallbackClasses,
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
