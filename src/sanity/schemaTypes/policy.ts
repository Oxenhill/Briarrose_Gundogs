import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'policy',
  title: 'Policy Page',
  type: 'document',
  description: 'Training methods & welfare, Terms & Conditions, Privacy, etc.',
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
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({ name: 'updatedAt', title: 'Last updated', type: 'date' }),
  ],
  preview: {
    select: { title: 'title' },
  },
})
