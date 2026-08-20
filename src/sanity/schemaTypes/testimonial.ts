import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  description: 'Powers the "Testimonials" page (/testimonials). One with "Feature on homepage" turned on also appears in the homepage quote band.',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'clientName', title: 'Client name', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'dogName', title: 'Dog name (optional)', type: 'string' }),
    defineField({
      name: 'photo',
      title: 'Photo (optional)',
      type: 'image',
      description: 'Not currently shown on the site — reserved for future use.',
    }),
    defineField({
      name: 'featured',
      title: 'Feature on homepage?',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on to show this quote in the pull-quote band on the homepage. Only one featured testimonial is shown at a time.',
    }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'clientName', subtitle: 'quote' },
  },
})
