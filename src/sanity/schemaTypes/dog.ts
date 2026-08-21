import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'dog',
  title: 'Dogs',
  type: 'document',
  description: 'Powers the "Our Dogs" page (/dogs) — create one entry per dog.',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      description: 'Auto-generated web address for this dog\'s page — click "Generate" if it\'s blank.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'breed', title: 'Breed', type: 'string' }),
    defineField({ name: 'blurb', title: 'Short blurb', type: 'text', rows: 4 }),
    defineField({
      name: 'photo',
      title: 'Main photo',
      type: 'image',
      options: { hotspot: true },
      description:
        'Shown on the "Our Dogs" grid and at the top of this dog\'s own page, displayed landscape (4:3). Click the photo after uploading to drag the crop tool if an edge gets cut off — useful for group photos. Any photo works, but a horizontal (landscape) shot fits best; a portrait photo will have its top and bottom trimmed.',
    }),
    defineField({
      name: 'gallery',
      title: 'Additional photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      description:
        'Extra photos shown below the main photo on this dog\'s individual page, displayed landscape (4:3) — same crop tool available on each one.',
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', subtitle: 'breed', media: 'photo' },
  },
})
