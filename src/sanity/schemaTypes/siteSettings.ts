import { defineField, defineType } from 'sanity'

/**
 * Singleton document holding everything that would otherwise be hardcoded
 * text sprinkled through the site: hero copy, contact details, coverage
 * area, social links, and SEO/GEO defaults. Edit this once, it updates
 * everywhere it's used.
 *
 * Fields are split into tabs (see `groups` below) purely to make this large
 * document easier to navigate — e.g. your phone number and email live under
 * the "Contact Details" tab, not mixed in with homepage copy.
 */
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'hero', title: 'Homepage: Hero' },
    { name: 'philosophy', title: 'Homepage: Philosophy' },
    { name: 'cta', title: 'Homepage: Booking Banner' },
    { name: 'contact', title: 'Contact Details' },
    { name: 'social', title: 'Social Links' },
    { name: 'newsletter', title: 'Newsletter & Footer' },
    { name: 'seo', title: 'Branding & SEO' },
  ],
  fields: [
    defineField({
      name: 'businessName',
      title: 'Business name',
      type: 'string',
      group: 'general',
      initialValue: 'Briarrose Gundogs',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bookingUrl',
      title: 'Booking link (Dog Smart booking system)',
      type: 'url',
      group: 'general',
      description: 'Every "Book" / "Book a Session" button across the site links here.',
    }),

    // --- Homepage: Hero ---------------------------------------------------
    defineField({
      name: 'heroEyebrow',
      title: 'Small label above the headline',
      type: 'string',
      group: 'hero',
      description: 'E.g. "Sevenoaks & the Kent Weald". Shown at the very top of the homepage.',
      initialValue: 'Sevenoaks & the Kent Weald',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Headline',
      type: 'string',
      group: 'hero',
      description: 'The large opening line of the homepage.',
      initialValue: 'Gundog training, done properly.',
    }),
    defineField({
      name: 'heroSubhead',
      title: 'Supporting line',
      type: 'text',
      rows: 3,
      group: 'hero',
      description: 'A sentence or two under the headline.',
      initialValue:
        'Placeholder subhead — foundations built on trust and understanding, taking dogs from puppyhood through to steady, reliable work in the field.',
    }),

    // --- Homepage: Philosophy ----------------------------------------------
    defineField({
      name: 'philosophyEyebrow',
      title: 'Small label above the heading',
      type: 'string',
      group: 'philosophy',
      description: 'E.g. "The Philosophy". Shown above the heading in this section.',
      initialValue: 'The Philosophy',
    }),
    defineField({
      name: 'philosophyHeadline',
      title: 'Heading',
      type: 'string',
      group: 'philosophy',
      initialValue: 'Every dog is different. So is every handler.',
    }),
    defineField({
      name: 'philosophyBody',
      title: 'Body copy',
      type: 'text',
      rows: 4,
      group: 'philosophy',
      initialValue:
        'Placeholder copy — training built around how each dog actually learns, not a one-size method.',
    }),
    defineField({
      name: 'philosophyImage',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      group: 'philosophy',
      description:
        'A real photo (of you, your dogs, or your grounds) for this homepage section, displayed as a tall portrait panel (roughly 4:5). If left empty, the logo mark is shown here instead. Click the photo after uploading to drag the crop tool if it\'s cutting off something important.',
    }),

    // --- Homepage: Booking banner -------------------------------------------
    defineField({
      name: 'ctaHeadline',
      title: 'Headline',
      type: 'string',
      group: 'cta',
      description: 'Shown in the banner near the bottom of the homepage, just above the footer.',
      initialValue: "Let's get your dog field-ready.",
    }),
    defineField({
      name: 'ctaBody',
      title: 'Supporting line',
      type: 'text',
      rows: 2,
      group: 'cta',
      initialValue: 'Placeholder copy — booking happens on our main booking system; this links straight out.',
    }),
    defineField({
      name: 'ctaImage',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
      group: 'cta',
      description:
        'A photo for this banner, displayed as a tall portrait panel (roughly 4:5). If left empty, a soft placeholder panel is shown instead — add a photo here to replace it. Click the photo after uploading to drag the crop tool if it\'s cutting off something important.',
    }),

    // --- Contact details -----------------------------------------------------
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      group: 'contact',
      description: 'Shown on the Contact page, the footer, and used in search engine listings.',
      initialValue: '07000 000000',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      group: 'contact',
      description: 'Shown on the Contact page, the footer, and used in search engine listings.',
      initialValue: 'placeholder@briarrosegundogs.co.uk',
    }),
    defineField({
      name: 'addressLocality',
      title: 'Town / locality',
      type: 'string',
      group: 'contact',
      initialValue: 'Sevenoaks',
    }),
    defineField({
      name: 'addressRegion',
      title: 'County',
      type: 'string',
      group: 'contact',
      initialValue: 'Kent',
    }),
    defineField({
      name: 'coverageArea',
      title: 'Coverage area description',
      type: 'string',
      group: 'contact',
      initialValue: 'Covering Sevenoaks and the Kent Weald',
      description: 'A short phrase shown in the footer and on the Contact page, e.g. "Covering Sevenoaks and the Kent Weald".',
    }),
    defineField({
      name: 'travelRadiusMiles',
      title: 'Travel radius (miles)',
      type: 'number',
      group: 'contact',
      description: 'Optional. Shown on the Contact page and used for local search listings. Leave blank until confirmed.',
    }),

    // --- Social -----------------------------------------------------------
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      group: 'social',
      description: 'Shown in the footer and on the Contact page. Add one entry per platform you use.',
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

    // --- Newsletter & footer -----------------------------------------------
    defineField({
      name: 'newsletterHeadline',
      title: 'Newsletter signup — headline',
      type: 'string',
      group: 'newsletter',
      description: 'Shown above the email signup form in the footer of every page.',
      initialValue: 'Stay in the loop',
    }),
    defineField({
      name: 'newsletterBody',
      title: 'Newsletter signup — supporting line',
      type: 'text',
      rows: 2,
      group: 'newsletter',
    }),
    defineField({
      name: 'footerText',
      title: 'Footer small print',
      type: 'string',
      group: 'newsletter',
      description: 'Shown bottom-left of the footer on every page, e.g. a copyright line.',
      initialValue: '© Briarrose Gundogs',
    }),

    // --- Branding & SEO -----------------------------------------------------
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      group: 'seo',
      description:
        'Shown in the site header/navigation menu on every page, displayed as a tall portrait shape (roughly 4:5). Upload the full logo, including any wordmark text — it is shown large, not as a small badge. Also used as the default social-share image if no separate one is set below. Click the photo after uploading to drag the crop tool if it needs adjusting.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Default social-share image',
      type: 'image',
      options: { hotspot: true },
      group: 'seo',
      description:
        'The preview image shown when a page is shared on Facebook, X, WhatsApp, etc. — used only for pages that don\'t have their own photo. Falls back to the Logo above if left empty. Displayed landscape — recommended size: 1200×630px.',
    }),
    defineField({
      name: 'seoDefaultTitle',
      title: 'Default page title',
      type: 'string',
      group: 'seo',
      description: 'Used in the browser tab and search results for the homepage, and as a fallback for any page.',
    }),
    defineField({
      name: 'seoDefaultDescription',
      title: 'Default meta description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The summary shown under your link in Google search results, if a page doesn\'t have its own.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
