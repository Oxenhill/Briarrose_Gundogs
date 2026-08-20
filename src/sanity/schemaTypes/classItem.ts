import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'classItem',
  title: 'Class / Service',
  type: 'document',
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
      name: 'summary',
      title: 'Short summary (shown in the class list)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'description',
      title: 'Full description (shown on the class detail page)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'stageLabel',
      title: 'Stage / suitability label',
      type: 'string',
      description: 'E.g. "From 8 weeks", "Intermediate", "Ongoing" — shown next to the class name.',
    }),
    defineField({
      name: 'price',
      title: 'Price (optional)',
      type: 'string',
      description: 'Free text so you can show "£35/session", "POA", etc.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 0,
    }),
    defineField({
      name: 'active',
      title: 'Currently offered?',
      type: 'boolean',
      initialValue: true,
      description: 'Turn off to hide a class from the site without deleting it.',
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'stageLabel', media: 'image' },
  },
})
