import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  description:
    'Powers the "Testimonials" page (/testimonials). One with "Feature on homepage" turned on also appears in the homepage quote band. Add these yourself (copied from Google, Facebook, Dog Smart, etc — credit the source below), or open "Private submission link" above to copy the link you can send clients privately so they can submit their own; submitted ones wait here for your approval before they go live.',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'clientName', title: 'Client name', type: 'string' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'dogName', title: 'Dog name (optional)', type: 'string' }),
    defineField({
      name: 'photo',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      description: 'Not currently shown on the site — reserved for future use.',
    }),
    defineField({
      name: 'source',
      title: 'Where this came from',
      type: 'string',
      options: {
        list: ['Google', 'Facebook', 'Dog Smart', 'Submitted via website', 'Direct / other'],
      },
      description:
        'Optional. If you\'re copying a review in from Google, Facebook, or Dog Smart, pick it here so the site can credit the source. Leave blank for a testimonial you\'re just adding yourself with no particular source.',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Link to the original (optional)',
      type: 'url',
      description: 'A link straight to the review on Google/Facebook/Dog Smart, if you have one — shown as a small link under the quote.',
    }),
    defineField({
      name: 'approved',
      title: 'Approved — show on site?',
      type: 'boolean',
      initialValue: true,
      description:
        'On by default for testimonials you add yourself. Testimonials submitted by clients through the private submission link come in switched OFF — check them over here and switch this on once you\'re happy to publish them.',
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
    select: { title: 'clientName', subtitle: 'quote', approved: 'approved' },
    prepare({ title, subtitle, approved }) {
      return { title, subtitle: approved === false ? `⏳ Awaiting approval — ${subtitle}` : subtitle }
    },
  },
})
