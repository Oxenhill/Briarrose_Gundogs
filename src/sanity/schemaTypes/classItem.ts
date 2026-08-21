import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'classItem',
  title: 'Classes & Services',
  type: 'document',
  description: 'Powers the "Classes" page (/classes), the homepage class list, and the scrolling marquee — one entry per class or service.',
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
      description:
        'Shown exactly as typed on this class\'s page, preceded by "From ". E.g. entering "£35" shows "From £35"; entering "POA" shows "From POA" — so include your own currency symbol or wording.',
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking link (optional — overrides the global link)',
      type: 'url',
      description:
        'This class\'s own Dog Smart share link, if it has one. Powers the "Book This Class" button on this class\'s page. Leave empty to use the site-wide booking link instead (Site Settings → General → Booking link).',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'location' }],
      description:
        'Which venue this class runs at. Shown on this class\'s own page. Add or edit venues under the "Locations" section in the sidebar.',
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description:
        'Shown at the top of this class\'s own page (not on the summary list on /classes or the homepage), displayed wide (16:9). A horizontal (landscape) photo fits best. Click the photo after uploading to drag the crop tool if it\'s cutting off something important.',
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
    select: { title: 'title', stageLabel: 'stageLabel', locationName: 'location.name', media: 'image' },
    prepare({ title, stageLabel, locationName, media }) {
      return {
        title,
        subtitle: [stageLabel, locationName].filter(Boolean).join(' · '),
        media,
      }
    },
  },
})
