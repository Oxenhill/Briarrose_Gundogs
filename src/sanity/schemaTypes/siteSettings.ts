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
    {
      name: 'pageHeaders',
      title: 'Page Headers',
      // Every page that lists something (Classes, Dogs, Testimonials, etc)
      // has a small label + headline at the top — this tab is the ONE place
      // all of those live, one collapsible section per page, each titled
      // with the exact page it controls. If you're looking for text and
      // can't find it, it's very likely here.
    },
    { name: 'coursePreview', title: 'Course Preview Access' },
    { name: 'seo', title: 'Branding & SEO' },
  ],
  // One fieldset per page keeps this tab navigable even with ~10 pages'
  // worth of headers in it — each collapses to just its page name until
  // opened, and every field title below repeats that page name too, so
  // it's obvious which page a field controls whether the section is
  // collapsed or open.
  fieldsets: [
    { name: 'classesPage', title: 'Classes Page — the full /classes page', options: { collapsible: true, collapsed: true } },
    {
      name: 'homeClasses',
      title: 'Homepage teaser (optional override) — the short "Classes & Services" strip partway down the HOMEPAGE',
      description:
        'Leave every field in this section blank and the homepage strip automatically reuses whatever you set in "Classes Page" above — so in almost all cases you only need to edit that one, and this section is safe to ignore. Only fill these in if you specifically want the homepage strip to say something DIFFERENT from the full Classes page.',
      options: { collapsible: true, collapsed: true },
    },
    { name: 'dogsPage', title: 'Dogs Page (/dogs)', options: { collapsible: true, collapsed: true } },
    {
      name: 'testimonialsPage',
      title: 'Testimonials Page (/testimonials)',
      options: { collapsible: true, collapsed: true },
    },
    { name: 'galleryPage', title: 'Gallery Page (/gallery)', options: { collapsible: true, collapsed: true } },
    { name: 'videosPage', title: 'Video Hub Page (/videos)', options: { collapsible: true, collapsed: true } },
    { name: 'journalPage', title: 'Journal Page (/journal)', options: { collapsible: true, collapsed: true } },
    { name: 'onlineLearningPage', title: 'Online Learning Page (/online-learning)', options: { collapsible: true, collapsed: true } },
    { name: 'faqPage', title: 'FAQ Page (/faq)', options: { collapsible: true, collapsed: true } },
    { name: 'eventsPage', title: 'Events Page (/events)', options: { collapsible: true, collapsed: true } },
    { name: 'contactPage', title: 'Contact Page (/contact)', options: { collapsible: true, collapsed: true } },
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
      name: 'ctaEyebrow',
      title: 'Small label above the headline',
      type: 'string',
      group: 'cta',
      description: 'Shown above the headline in the banner near the bottom of the homepage.',
      initialValue: 'Get Started',
    }),
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
      name: 'enquiryNotificationEmail',
      title: 'Where enquiries are sent',
      type: 'string',
      group: 'contact',
      description:
        'The inbox that receives a copy of every submission from the Contact page enquiry form. Leave empty to use the Email address above instead.',
      initialValue: 'oliver@briarrosegundogs.co.uk',
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

    // --- Page Headers ---------------------------------------------------------
    // Every one of these controls the small-label + headline (+ optional
    // supporting line) at the very top of one specific page — the part that
    // was previously hardcoded in the site's code and impossible to find or
    // edit here. The homepage's "Classes & Services" teaser and the full
    // /classes page header used to look like two copies of the same thing —
    // easy to fill in one and expect the other to change. They're separate
    // fields, but the homepage teaser now automatically falls back to
    // whatever the Classes page fields say when left blank (see the code in
    // src/app/(site)/page.tsx), so editing "Classes page" below is enough
    // for both in the normal case.
    defineField({
      name: 'classesPageEyebrow',
      title: 'Classes page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'classesPage',
      description:
        'Shown at the very top of the full /classes page (what "View Classes" links to). Also used on the homepage teaser strip unless you set a different one below.',
      initialValue: 'Classes & Services',
    }),
    defineField({
      name: 'classesPageHeading',
      title: 'Classes page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'classesPage',
      initialValue: 'Training built around your dog',
    }),
    defineField({
      name: 'classesPageBody',
      title: 'Classes page — supporting line',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'classesPage',
      initialValue:
        'Every class here is managed from the CMS — add, reorder, price, or retire one any time without touching code.',
    }),

    defineField({
      name: 'homeClassesEyebrow',
      title: 'Homepage teaser — small label (optional override)',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'homeClasses',
      description: 'Leave blank to reuse the Classes page small label above.',
    }),
    defineField({
      name: 'homeClassesHeading',
      title: 'Homepage teaser — headline (optional override)',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'homeClasses',
      description: 'Leave blank to reuse the Classes page headline above.',
    }),
    defineField({
      name: 'homeClassesBody',
      title: 'Homepage teaser — supporting line (optional override)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'homeClasses',
      description: 'Leave blank to reuse the Classes page supporting line above.',
    }),

    defineField({
      name: 'dogsPageEyebrow',
      title: 'Dogs page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'dogsPage',
      description: 'Shown at the top of the /dogs page.',
      initialValue: 'Our Dogs',
    }),
    defineField({
      name: 'dogsPageHeading',
      title: 'Dogs page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'dogsPage',
      initialValue: 'The dogs behind the training',
    }),
    defineField({
      name: 'dogsPageBody',
      title: 'Dogs page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'dogsPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'testimonialsPageEyebrow',
      title: 'Testimonials page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'testimonialsPage',
      description: 'Shown at the top of the /testimonials page.',
      initialValue: 'Testimonials',
    }),
    defineField({
      name: 'testimonialsPageHeading',
      title: 'Testimonials page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'testimonialsPage',
      initialValue: 'What handlers say',
    }),
    defineField({
      name: 'testimonialsPageBody',
      title: 'Testimonials page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'testimonialsPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'galleryPageEyebrow',
      title: 'Gallery page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'galleryPage',
      description: 'Shown at the top of the /gallery page.',
      initialValue: 'Gallery',
    }),
    defineField({
      name: 'galleryPageHeading',
      title: 'Gallery page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'galleryPage',
      initialValue: 'Training, puppies & working days',
    }),
    defineField({
      name: 'galleryPageBody',
      title: 'Gallery page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'galleryPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'videosPageEyebrow',
      title: 'Video Hub page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'videosPage',
      description: 'Shown at the top of the /videos page.',
      initialValue: 'Video Hub',
    }),
    defineField({
      name: 'videosPageHeading',
      title: 'Video Hub page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'videosPage',
      initialValue: 'Watch the training in action',
    }),
    defineField({
      name: 'videosPageBody',
      title: 'Video Hub page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'videosPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'onlineLearningPageEyebrow',
      title: 'Online Learning page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'onlineLearningPage',
      description: 'Shown at the top of the /online-learning page.',
      initialValue: 'Online Learning',
    }),
    defineField({
      name: 'onlineLearningPageHeading',
      title: 'Online Learning page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'onlineLearningPage',
      initialValue: 'Gundog course material for clients',
    }),
    defineField({
      name: 'onlineLearningPageBody',
      title: 'Online Learning page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'onlineLearningPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'journalPageEyebrow',
      title: 'Journal page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'journalPage',
      description: 'Shown at the top of the /journal listing page (not on individual posts — those use their own title).',
      initialValue: 'Journal',
    }),
    defineField({
      name: 'journalPageHeading',
      title: 'Journal page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'journalPage',
      initialValue: 'Notes from the field',
    }),
    defineField({
      name: 'journalPageBody',
      title: 'Journal page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'journalPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'faqPageEyebrow',
      title: 'FAQ page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'faqPage',
      description: 'Shown at the top of the /faq page.',
      initialValue: 'FAQ',
    }),
    defineField({
      name: 'faqPageHeading',
      title: 'FAQ page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'faqPage',
      initialValue: 'Common questions',
    }),
    defineField({
      name: 'faqPageBody',
      title: 'FAQ page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'faqPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'eventsPageEyebrow',
      title: 'Events page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'eventsPage',
      description: 'Shown at the top of the /events page.',
      initialValue: 'Community',
    }),
    defineField({
      name: 'eventsPageHeading',
      title: 'Events page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'eventsPage',
      initialValue: 'Working days & events',
    }),
    defineField({
      name: 'eventsPageBody',
      title: 'Events page — supporting line (optional)',
      type: 'text',
      rows: 2,
      group: 'pageHeaders',
      fieldset: 'eventsPage',
      description: 'Leave empty for no supporting line under the headline (this is how the page looks today).',
    }),

    defineField({
      name: 'contactPageEyebrow',
      title: 'Contact page — small label',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'contactPage',
      description:
        'Shown at the top of the /contact page, above the enquiry form. (The line under the headline there is your Coverage area description, set under the Contact Details tab — not repeated here.)',
      initialValue: 'Get in Touch',
    }),
    defineField({
      name: 'contactPageHeading',
      title: 'Contact page — headline',
      type: 'string',
      group: 'pageHeaders',
      fieldset: 'contactPage',
      initialValue: "Let's talk about your dog",
    }),

    // --- Course Preview Access ----------------------------------------------
    // The one on/off switch for letting trusted reviewers into the course
    // preview (/online-learning/preview) with the shared reviewer login (set
    // up once as an environment variable, not here). This only affects
    // people signing in with that reviewer password — you (via the Studio
    // login) can always see the preview regardless of this switch. Flip it
    // off between review rounds; no redeploy needed, it takes effect on the
    // next request.
    defineField({
      name: 'coursePreviewReviewEnabled',
      title: 'Course preview open for reviewers',
      type: 'boolean',
      group: 'coursePreview',
      description:
        'Turn ON to let people with the reviewer password view the course preview. Turn OFF to shut it again once you have the feedback you need — you can still see the preview yourself either way.',
      initialValue: false,
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
