import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video Hub',
  type: 'document',
  description: 'Powers the "Video Hub" page (/videos) — one entry per video.',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'embedUrl',
      title: 'Video URL (YouTube/Vimeo link)',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail image',
      type: 'image',
      description: 'Used for the video card and for VideoObject structured data.',
    }),
    defineField({ name: 'publishedAt', title: 'Published date', type: 'datetime' }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', media: 'thumbnail' },
  },
})
