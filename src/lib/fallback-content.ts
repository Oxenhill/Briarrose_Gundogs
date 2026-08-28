/**
 * Central fallback content.
 *
 * Every piece of copy on the site is meant to live in Sanity. If a query
 * fails (or Sanity isn't connected yet), pages fall back to the values here
 * — so there is exactly ONE place fallback text lives, instead of it being
 * scattered through component files.
 *
 * The site-wide settings fallback below stays populated with sensible
 * generic defaults (safe to show even if genuinely empty — e.g. "Classes &
 * Services" as a section label). The per-item collections further down
 * (classes, dogs, testimonials, FAQs, policies) are deliberately left EMPTY
 * rather than filled with sample entries: an empty list lets each page show
 * its proper "nothing here yet" state, whereas a named placeholder like a
 * "Client name" testimonial reads as real content if it were ever served to
 * a real visitor. See the comment above `fallbackClasses` below for more.
 *
 * Optional/nullable fields are given explicit union types (rather than
 * inferred from `null`/`undefined` literals) so the same type still fits
 * once real Sanity documents — with real numbers, strings, and image
 * refs — flow through the same query functions.
 */

/** Loose shape for a Sanity image field; passed straight to urlForImage(). */
export type SanityImage = {
  asset?: { _ref?: string; _type?: string; url?: string }
  [key: string]: unknown
} | null

export const fallbackSiteSettings = {
  businessName: 'Briarrose Gundogs',
  heroEyebrow: 'Sevenoaks & the Kent Weald',
  heroHeadline: 'Gundog training, done properly.',
  heroSubhead:
    'Placeholder subhead — foundations built on trust and understanding, taking dogs from puppyhood through to steady, reliable work in the field.',
  philosophyEyebrow: 'The Philosophy',
  philosophyHeadline: 'Every dog is different. So is every handler.',
  philosophyBody:
    'Placeholder copy — training built around how each dog actually learns, not a one-size method. Real photography of your dogs and grounds will replace this panel.',
  philosophyImage: null as SanityImage,
  ctaEyebrow: 'Get Started',
  ctaHeadline: "Let's get your dog field-ready.",
  ctaBody: 'Placeholder copy — booking happens on our main booking system; this links straight out.',
  ctaImage: null as SanityImage,
  bookingUrl: '#',
  phone: '07000 000000',
  email: 'placeholder@briarrosegundogs.co.uk',
  enquiryNotificationEmail: 'oliver@briarrosegundogs.co.uk',
  addressLocality: 'Sevenoaks',
  addressRegion: 'Kent',
  coverageArea: 'Covering Sevenoaks and the Kent Weald',
  travelRadiusMiles: undefined as number | undefined,
  socialLinks: [] as { platform: string; url: string }[],
  newsletterHeadline: 'Stay in the loop',
  newsletterBody: 'Placeholder — occasional updates on classes, working days and litters. No spam.',
  footerText: '© Briarrose Gundogs',
  seoDefaultTitle: 'Briarrose Gundogs — Gundog Training in Sevenoaks, Kent',
  seoDefaultDescription:
    'Gundog training and behaviour foundations in Sevenoaks, Kent — puppy foundations through to steady, reliable field work.',
  ogImage: null as SanityImage,
  logo: null as SanityImage,
  homeClassesEyebrow: 'Classes & Services',
  homeClassesHeading: 'Training built around your dog',
  homeClassesBody: 'Every class below is managed from the CMS — add, reorder, or retire one any time without touching code.',
  classesPageEyebrow: 'Classes & Services',
  classesPageHeading: 'Training built around your dog',
  classesPageBody:
    'Every class here is managed from the CMS — add, reorder, price, or retire one any time without touching code.',
  dogsPageEyebrow: 'Our Dogs',
  dogsPageHeading: 'The dogs behind the training',
  dogsPageBody: '',
  testimonialsPageEyebrow: 'Testimonials',
  testimonialsPageHeading: 'What handlers say',
  testimonialsPageBody: '',
  galleryPageEyebrow: 'Gallery',
  galleryPageHeading: 'Training, puppies & working days',
  galleryPageBody: '',
  videosPageEyebrow: 'Video Hub',
  videosPageHeading: 'Watch the training in action',
  videosPageBody: '',
  onlineLearningPageEyebrow: 'Online Learning',
  onlineLearningPageHeading: 'Gundog course material for clients',
  onlineLearningPageBody: '',
  journalPageEyebrow: 'Journal',
  journalPageHeading: 'Notes from the field',
  journalPageBody: '',
  faqPageEyebrow: 'FAQ',
  faqPageHeading: 'Common questions',
  faqPageBody: '',
  eventsPageEyebrow: 'Community',
  eventsPageHeading: 'Working days & events',
  eventsPageBody: '',
  contactPageEyebrow: 'Get in Touch',
  contactPageHeading: "Let's talk about your dog",
}

export const fallbackTrainerProfile = {
  name: '[Trainer name]',
  jobTitle: 'Gundog Trainer',
  photo: null as SanityImage,
  bio: [
    {
      _type: 'block',
      children: [
        {
          _type: 'span',
          text: 'Placeholder bio — add your training background, experience with gundogs, and what led you to start Briarrose Gundogs. This is managed from the CMS.',
        },
      ],
    },
  ] as unknown[],
  credentials: [] as string[],
}

/** Loose shape for a dereferenced `location` document, as returned by the classItem queries. */
export type ClassLocation = {
  name: string
  address: string | undefined
  postcode: string | undefined
  mapUrl: string | undefined
  notes: string | undefined
} | null

// `fallbackClasses`, `fallbackDogs`, `fallbackTestimonials`, `fallbackFaqs`
// and `fallbackPolicies` are intentionally EMPTY (below), not populated with
// sample copy like the site once had. A named, in-character "Client name"
// testimonial or a "[Dog name]" profile reads as real content, not an
// obvious placeholder — if a query for one of these ever legitimately comes
// back empty (nothing published yet, or a document removed), the calling
// page shows its normal "nothing here yet" empty state instead of quietly
// publishing invented copy under a real business's name. `fallbackSiteSettings`
// above stays populated, since generic labels like "Classes & Services" are
// safe defaults rather than content attributed to a person or business.
export const fallbackClasses: {
  _id: string
  title: string
  slug: { current: string }
  summary: string
  description: unknown[] | undefined
  stageLabel: string | undefined
  price: string | undefined
  bookingUrl: string | undefined
  location: ClassLocation
  image: SanityImage
  order: number
  active: boolean
}[] = []

export const fallbackDogs: {
  _id: string
  name: string
  slug: { current: string }
  breed: string
  blurb: string
  photo: SanityImage
  gallery: SanityImage[] | undefined
  order: number
}[] = []

export const fallbackTestimonials: {
  _id: string
  quote: string
  clientName: string
  location: string | undefined
  dogName: string | undefined
  rating: number | undefined
  photo: SanityImage
  source: string | undefined
  sourceUrl: string | undefined
  featured: boolean
  order: number
}[] = []

export const fallbackGallery: {
  _id: string
  title: string
  image: SanityImage
  category: string
  order: number
}[] = []

export const fallbackVideos: {
  _id: string
  title: string
  slug: { current: string }
  description: string
  embedUrl: string
  thumbnail: SanityImage
  publishedAt: string | undefined
  order: number
}[] = []

export const fallbackPosts: {
  _id: string
  title: string
  slug: { current: string }
  excerpt: string
  coverImage: SanityImage
  body: unknown[]
  publishedAt: string | undefined
  authorName: string
  tags: string[]
}[] = []

export const fallbackEvents: {
  _id: string
  title: string
  slug: { current: string }
  eventType: string
  description: string
  startDateTime: string | undefined
  endDateTime: string | undefined
  locationName: string
  locationAddress: string | undefined
  externalUrl: string | undefined
  image: SanityImage
}[] = []

export const fallbackFaqs: {
  _id: string
  question: string
  answer: string
  order: number
}[] = []


/**
 * Course content types (the single gundog course this site hosts). A
 * lesson's content is a mixed, ordered list of blocks (video / text / PDF
 * / external-video-link / slide image) rather than one video-plus-text
 * field, since the real course material mixes these freely within one
 * lesson.
 *
 * Access control (which logged-in clients can see this) is handled
 * separately in courseAccess.ts, driven by `entitlementKey` below — this
 * type only describes the course CONTENT.
 */
export type CourseVideoBlock = {
  _key: string
  _type: 'videoBlock'
  title: string | undefined
  provider: 'cloudflare_stream' | 'external_url' | undefined
  cloudflareVideoId: string | undefined
  externalUrl: string | undefined
  posterImage: SanityImage
}
export type CourseTextBlock = {
  _key: string
  _type: 'textBlock'
  content: unknown[] | undefined
}
export type CoursePdfBlock = {
  _key: string
  _type: 'pdfBlock'
  title: string
  // Dereferenced by COURSE_DETAIL_PROJECTION in queries.ts (a Sanity
  // `file` field's url isn't resolvable client-side the way an image's is).
  file: { asset?: { url?: string; originalFilename?: string } } | undefined
}
export type CourseYoutubeBlock = {
  _key: string
  _type: 'youtubeEmbedBlock'
  title: string | undefined
  url: string
}
export type CourseImageSlideBlock = {
  _key: string
  _type: 'imageSlideBlock'
  image: SanityImage
  caption: string | undefined
}
export type CourseContentBlock =
  | CourseVideoBlock
  | CourseTextBlock
  | CoursePdfBlock
  | CourseYoutubeBlock
  | CourseImageSlideBlock

export type CourseLesson = {
  _key: string
  title: string
  durationMinutes: number | undefined
  isFreePreview: boolean | undefined
  content: CourseContentBlock[] | undefined
}
export type CourseModule = {
  _key: string
  title: string
  summary: string | undefined
  lessons: CourseLesson[] | undefined
}

export const fallbackCourses: {
  _id: string
  title: string
  slug: { current: string }
  entitlementKey: string
  summary: string
  description: unknown[] | undefined
  coverImage: SanityImage
  price: string | undefined
  modules: CourseModule[] | undefined
  order: number
  published: boolean
}[] = []

export const fallbackPolicies: {
  _id: string
  title: string
  slug: { current: string }
  body: unknown[]
  updatedAt: string | undefined
}[] = []

export type SiteSettings = typeof fallbackSiteSettings
export type TrainerProfile = typeof fallbackTrainerProfile
export type ClassItem = (typeof fallbackClasses)[number]
export type DogProfile = (typeof fallbackDogs)[number]
export type Testimonial = (typeof fallbackTestimonials)[number]
export type GalleryItem = (typeof fallbackGallery)[number]
export type VideoItem = (typeof fallbackVideos)[number]
export type Post = (typeof fallbackPosts)[number]
export type EventItem = (typeof fallbackEvents)[number]
export type FaqItem = (typeof fallbackFaqs)[number]
export type Policy = (typeof fallbackPolicies)[number]
export type CourseItem = (typeof fallbackCourses)[number]
