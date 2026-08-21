/**
 * Central fallback/placeholder content.
 *
 * Every piece of copy on the site is meant to live in Sanity. Until real
 * content is entered (or if a query fails), pages fall back to the values
 * here — so there is exactly ONE place placeholder text lives, instead of
 * it being scattered through component files.
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
}[] = [
  {
    _id: 'placeholder-1',
    title: 'Puppy Foundations',
    slug: { current: 'puppy-foundations' },
    summary: 'Placeholder description of early gundog groundwork — recall, steadiness, and calm handling basics.',
    description: undefined,
    stageLabel: 'From 8 weeks',
    price: undefined,
    bookingUrl: undefined,
    location: null,
    image: null,
    order: 1,
    active: true,
  },
  {
    _id: 'placeholder-2',
    title: 'Gundog Obedience',
    slug: { current: 'gundog-obedience' },
    summary: 'Placeholder description covering steadiness, retrieving fundamentals, and field manners.',
    description: undefined,
    stageLabel: '6+ months',
    price: undefined,
    bookingUrl: undefined,
    location: null,
    image: null,
    order: 2,
    active: true,
  },
  {
    _id: 'placeholder-3',
    title: 'Retrieving & Steadiness',
    slug: { current: 'retrieving-and-steadiness' },
    summary: 'Placeholder description for dogs building on the basics towards reliable field work.',
    description: undefined,
    stageLabel: 'Intermediate',
    price: undefined,
    bookingUrl: undefined,
    location: null,
    image: null,
    order: 3,
    active: true,
  },
]

export const fallbackDogs: {
  _id: string
  name: string
  slug: { current: string }
  breed: string
  blurb: string
  photo: SanityImage
  gallery: SanityImage[] | undefined
  order: number
}[] = [
  {
    _id: 'placeholder-dog-1',
    name: '[Dog name]',
    slug: { current: 'dog-one' },
    breed: '[Breed]',
    blurb: 'Placeholder blurb — add a short profile for each of your dogs from the CMS.',
    photo: null,
    gallery: undefined,
    order: 1,
  },
]

export const fallbackTestimonials: {
  _id: string
  quote: string
  clientName: string
  location: string | undefined
  dogName: string | undefined
  photo: SanityImage
  source: string | undefined
  sourceUrl: string | undefined
  featured: boolean
  order: number
}[] = [
  {
    _id: 'placeholder-testimonial-1',
    quote: 'Placeholder testimonial — real client quotes will replace this once supplied, pulled straight from the CMS.',
    clientName: 'Client name',
    location: 'Location',
    dogName: undefined,
    photo: null,
    source: undefined,
    sourceUrl: undefined,
    featured: true,
    order: 1,
  },
]

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
}[] = [
  {
    _id: 'placeholder-faq-1',
    question: 'What age can I start training my puppy?',
    answer: 'Placeholder answer — replace with real FAQ content from the CMS.',
    order: 1,
  },
]

export const fallbackPolicies: {
  _id: string
  title: string
  slug: { current: string }
  body: unknown[]
  updatedAt: string | undefined
}[] = [
  {
    _id: 'placeholder-policy-1',
    title: 'Training Methods & Welfare',
    slug: { current: 'training-methods-and-welfare' },
    body: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Placeholder — outline your training methods and welfare policy here.' }],
      },
    ],
    updatedAt: undefined,
  },
  {
    _id: 'placeholder-policy-2',
    title: 'Terms & Conditions',
    slug: { current: 'terms-and-conditions' },
    body: [
      {
        _type: 'block',
        children: [{ _type: 'span', text: 'Placeholder — add your booking and cancellation terms here.' }],
      },
    ],
    updatedAt: undefined,
  },
]

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
