import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Journal Posts',
  type: 'document',
  description: 'Powers the "Journal" page (/journal) — called "Blog" in some places behind the scenes, but shown to visitors as "Journal".',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'excerpt', title: 'Excerpt (used in listings and meta description)', type: 'text', rows: 3 }),
    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'image',
      options: { hotspot: true },
      description: 'Shown on the Journal listing page and at the top of this post\'s own page.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({ name: 'authorName', title: 'Author name', type: 'string', initialValue: 'Briarrose Gundogs' }),
    defineField({ name: 'publishedAt', title: 'Published date', type: 'datetime' }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt', media: 'coverImage' },
  },
})
