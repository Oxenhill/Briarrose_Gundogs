import { defineField, defineType, defineArrayMember } from 'sanity'

/**
 * Powers the "Online Learning" area — the client-only gundog course that
 * replaces the Teachable course. This site hosts exactly one course (the
 * gundog course lives here exclusively; Dog Smart Training & Behaviour's
 * three courses live on that site instead), but this is still modelled as
 * a document type rather than a singleton, so a second course is just
 * another document away if that ever changes.
 *
 * A course is made of modules, and each module is made of lessons. A
 * lesson's content is a mixed, ordered list of blocks (video / text / PDF
 * / external-video-link / slide image) rather than a single video-plus-text
 * field, since the real course content (50+ videos, on this course alone)
 * mixes these freely within one lesson.
 *
 * Access control (who has paid for what) is handled separately in the
 * application layer, driven by `entitlementKey` below — this schema only
 * holds the course CONTENT.
 */

const videoBlock = defineArrayMember({
  type: 'object',
  name: 'videoBlock',
  title: 'Video',
  fields: [
    defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
    defineField({
      name: 'provider',
      title: 'Video source',
      type: 'string',
      options: {
        list: [
          { title: 'Cloudflare Stream', value: 'cloudflare_stream' },
          { title: 'External URL (e.g. a direct link during migration)', value: 'external_url' },
        ],
        layout: 'radio',
      },
      initialValue: 'cloudflare_stream',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cloudflareVideoId',
      title: 'Cloudflare Stream video ID',
      type: 'string',
      description: 'The video UID from the Cloudflare Stream dashboard, once uploaded there.',
      hidden: ({ parent }) => parent?.provider !== 'cloudflare_stream',
    }),
    defineField({
      name: 'externalUrl',
      title: 'External video URL',
      type: 'url',
      description: 'A direct video URL to use temporarily during migration, before it has a Cloudflare Stream home.',
      hidden: ({ parent }) => parent?.provider !== 'external_url',
    }),
    defineField({
      name: 'posterImage',
      title: 'Poster image (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'provider' },
    prepare: ({ title, subtitle }) => ({ title: title || 'Video', subtitle }),
  },
})

const textBlock = defineArrayMember({
  type: 'object',
  name: 'textBlock',
  title: 'Text',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const firstText = content?.[0]?.children?.map((c: { text?: string }) => c.text).join('') || 'Text block'
      return { title: firstText.slice(0, 60) }
    },
  },
})

const pdfBlock = defineArrayMember({
  type: 'object',
  name: 'pdfBlock',
  title: 'PDF download',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'file',
      title: 'PDF file',
      type: 'file',
      options: { accept: 'application/pdf' },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: title || 'PDF download' }),
  },
})

const youtubeEmbedBlock = defineArrayMember({
  type: 'object',
  name: 'youtubeEmbedBlock',
  title: 'YouTube / external video link',
  fields: [
    defineField({ name: 'title', title: 'Title (optional)', type: 'string' }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
      description: "For linking to someone else's video (credit their material) — not for hosting your own course video, use the Video block for that.",
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'url' },
    prepare: ({ title, subtitle }) => ({ title: title || 'External video link', subtitle }),
  },
})

const imageSlideBlock = defineArrayMember({
  type: 'object',
  name: 'imageSlideBlock',
  title: 'Slide image',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'caption', title: 'Caption (optional)', type: 'string' }),
  ],
  preview: {
    select: { media: 'image', title: 'caption' },
    prepare: ({ media, title }) => ({ title: title || 'Slide', media }),
  },
})

const lesson = defineArrayMember({
  type: 'object',
  name: 'lesson',
  title: 'Lesson',
  fields: [
    defineField({ name: 'title', title: 'Lesson title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'durationMinutes', title: 'Duration (minutes, optional)', type: 'number' }),
    defineField({
      name: 'isFreePreview',
      title: 'Free preview lesson?',
      type: 'boolean',
      initialValue: false,
      description: "Turn on to let anyone view this lesson's content without being logged in or entitled — useful for a taster lesson.",
    }),
    defineField({
      name: 'content',
      title: 'Lesson content',
      type: 'array',
      of: [videoBlock, textBlock, pdfBlock, youtubeEmbedBlock, imageSlideBlock],
      description: 'Mix and match, in any order — a lesson can have a video, some text, a PDF handout and slide images all in the same lesson.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'durationMinutes' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `${subtitle} min` : undefined }
    },
  },
})

const module_ = defineArrayMember({
  type: 'object',
  name: 'module',
  title: 'Module',
  fields: [
    defineField({ name: 'title', title: 'Module title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', title: 'Module summary (optional)', type: 'text', rows: 2 }),
    defineField({ name: 'lessons', title: 'Lessons', type: 'array', of: [lesson] }),
  ],
  preview: {
    select: { title: 'title', lessons: 'lessons' },
    prepare({ title, lessons }) {
      return { title, subtitle: `${(lessons ?? []).length} lesson(s)` }
    },
  },
})

export default defineType({
  name: 'course',
  title: 'Online Learning (Gundog Course)',
  type: 'document',
  description: 'Powers the "Online Learning" area — the gundog course video/text material included with training packages.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'entitlementKey',
      title: 'Entitlement key (links to the booking system)',
      type: 'string',
      options: {
        list: [{ title: 'Gundog Training', value: 'gundog_course' }],
      },
      initialValue: 'gundog_course',
      description: 'Which package/session-type entitlement flag in the booking system unlocks this course for a logged-in client. This site only ever offers the gundog course, so there is one option — must match exactly what the booking system uses.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'summary', title: 'Short summary (used in listings)', type: 'text', rows: 3 }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Full description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'price',
      title: 'Price (e.g. "£49") — optional, only relevant if this course is ever sold standalone',
      type: 'string',
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [module_],
    }),
    defineField({
      name: 'published',
      title: 'Published — visible on the site?',
      type: 'boolean',
      initialValue: false,
      description: "Keep off while you're still building the course; switch on when it's ready for clients.",
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', media: 'coverImage', published: 'published' },
    prepare({ title, media, published }) {
      return { title, subtitle: published === false ? 'Draft' : 'Published', media }
    },
  },
})
