import { defineField, defineType } from 'sanity'

/**
 * Singleton document holding everything that would otherwise be hardcoded
 * text sprinkled through the site: hero copy, contact details, coverage
 * area, social links, and SEO/GEO defaults. Edit this once, it updates
 * everywhere it's used.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'businessName',
      title: 'Business name',
      type: 'string',
      initialValue: 'Briarrose Gundogs',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline (used in <title> and meta description fallback)',
      type: 'string',
      initialValue: 'Gundog training in Kent, done properly.',
    }),

    defineField({
      name: 'heroEyebrow',
      title: 'Homepage hero — small label above headline',
      type: 'string',
      initialValue: 'Sevenoaks & the Kent Weald',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Homepage hero — headline',
      type: 'string',
      initialValue: 'Gundog training, done properly.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Homepage hero — supporting line',
      type: 'text',
      rows: 3,
      initialValue:
        'Placeholder subhead — foundations built on trust and understanding, taking dogs from puppyhood through to steady, reliable work in the field.',
    }),

    defineField({
      name: 'philosophyEyebrow',
      title: 'Homepage philosophy section — label',
      type: 'string',
      initialValue: 'The Philosophy',
    }),
    defineField({
      name: 'philosophyHeadline',
      title: 'Homepage philosophy section — headline',
      type: 'string',
      initialValue: 'Every dog is different. So is every handler.',
    }),
    defineField({
      name: 'philosophyBody',
      title: 'Homepage philosophy section — body copy',
      type: 'text',
      rows: 4,
      initialValue:
        'Placeholder copy — training built around how each dog actually learns, not a one-size method.',
    }),

    defineField({
      name: 'ctaHeadline',
      title: 'Booking CTA band — headline',
      type: 'string',
      initialValue: "Let's get your dog field-ready.",
    }),
    defineField({
      name: 'ctaBody',
      title: 'Booking CTA band — supporting line',
      type: 'text',
      rows: 2,
      initialValue: 'Placeholder copy — booking happens on our main booking system; this links straight out.',
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking link-out URL (Dog Smart booking system)',
      type: 'url',
      description: 'Where "Book a Session" buttons across the site should point.',
    }),

    defineField({
      name: 'phone',
      title: 'Phone number (public)',
      type: 'string',
      initialValue: '07000 000000',
    }),
    defineField({
      name: 'email',
      title: 'Email address (public)',
      type: 'string',
      initialValue: 'placeholder@briarrosegundogs.co.uk',
    }),
    defineField({
      name: 'addressLocality',
      title: 'Town/locality',
      type: 'string',
      initialValue: 'Sevenoaks',
    }),
    defineField({
      name: 'addressRegion',
      title: 'County',
      type: 'string',
      initialValue: 'Kent',
    }),
    defineField({
      name: 'coverageArea',
      title: 'Coverage area description',
      type: 'string',
      initialValue: 'Covering Sevenoaks and the Kent Weald',
      description: 'Shown in the footer and used for local SEO copy.',
    }),
    defineField({
      name: 'travelRadiusMiles',
      title: 'Travel radius (miles)',
      type: 'number',
      description: 'Used for the geo "areaServed" radius in structured data. Leave blank until confirmed.',
    }),

    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {
                list: ['Instagram', 'Facebook', 'YouTube', 'TikTok', 'X'],
              },
            }),
            defineField({ name: 'url', type: 'url' }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'url' },
          },
        },
      ],
    }),

    defineField({
      name: 'newsletterHeadline',
      title: 'Newsletter signup — headline',
      type: 'string',
      initialValue: 'Stay in the loop',
    }),
    defineField({
      name: 'newsletterBody',
      title: 'Newsletter signup — supporting line',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'footerText',
      title: 'Footer small print',
      type: 'string',
      initialValue: '© Briarrose Gundogs',
    }),

    defineField({
      name: 'seoDefaultTitle',
      title: 'SEO — default page title',
      type: 'string',
    }),
    defineField({
      name: 'seoDefaultDescription',
      title: 'SEO — default meta description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'SEO — default social share image',
      type: 'image',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
