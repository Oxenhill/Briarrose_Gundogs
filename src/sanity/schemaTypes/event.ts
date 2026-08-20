import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Events',
  type: 'document',
  description: 'Powers the "Events" page (/events) — working days, club meets and community events.',
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
      name: 'eventType',
      title: 'Type',
      type: 'string',
      options: { list: ['Working Test', 'Club Meet', 'Training Day', 'Other'] },
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({ name: 'startDateTime', title: 'Start date & time', type: 'datetime' }),
    defineField({ name: 'endDateTime', title: 'End date & time', type: 'datetime' }),
    defineField({ name: 'locationName', title: 'Location name', type: 'string' }),
    defineField({ name: 'locationAddress', title: 'Location address', type: 'string' }),
    defineField({ name: 'externalUrl', title: 'More info / booking link', type: 'url' }),
    defineField({
      name: 'image',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      description: 'Not currently shown on the Events page — reserved for future use.',
    }),
  ],
  orderings: [{ title: 'Soonest first', name: 'startAsc', by: [{ field: 'startDateTime', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'startDateTime', media: 'image' },
  },
})
