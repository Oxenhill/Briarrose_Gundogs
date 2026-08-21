import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'location',
  title: 'Locations',
  type: 'document',
  description:
    'Training venues. Create one entry per physical location, then pick it on any Classes & Services entry that runs there — edit the address or map link once here and it updates on every class at that venue.',
  fields: [
    defineField({
      name: 'name',
      title: 'Location name',
      type: 'string',
      description: 'E.g. "Sevenoaks Showground". Shown on the class detail page for any class held here.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
      description: 'Full postal address, shown under the location name on the class detail page.',
    }),
    defineField({
      name: 'postcode',
      title: 'Postcode',
      type: 'string',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps link',
      type: 'url',
      description:
        'Optional — paste a Google Maps share link for this venue. If set, the location name on the class page becomes a clickable link that opens the map.',
    }),
    defineField({
      name: 'notes',
      title: 'Notes (optional)',
      type: 'text',
      rows: 2,
      description: 'Optional — parking, access, or meeting-point notes shown under the address on the class page.',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'address' },
  },
})
