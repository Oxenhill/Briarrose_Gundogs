import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'galleryItem',
  title: 'Gallery Photos',
  type: 'document',
  description: 'Powers the "Gallery" page (/gallery) — one entry per photo.',
  fields: [
    defineField({ name: 'title', title: 'Title / caption (optional)', type: 'string' }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'For your own organisation when browsing this list in the CMS — not currently shown as filter tabs on the live gallery page.',
      options: {
        list: ['Training', 'Puppies', 'Working Days', 'Events', 'Behind the Scenes'],
      },
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'category', media: 'image' },
  },
})
