import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Event / Community',
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
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [{ title: 'Soonest first', name: 'startAsc', by: [{ field: 'startDateTime', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'startDateTime', media: 'image' },
  },
})
