import { defineField, defineType } from 'sanity'

/**
 * Singleton for the About/Bio page — also powers the Person structured data.
 */
export default defineType({
  name: 'trainerProfile',
  title: 'About Page (Trainer Profile)',
  type: 'document',
  description: 'Powers the "About" page (/about) — your name, photo, bio and credentials.',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'jobTitle', title: 'Job title', type: 'string', initialValue: 'Gundog Trainer' }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description:
        'Shown alongside your bio on the About page, displayed as a tall portrait (roughly 4:5). Click the photo after uploading to drag the crop tool if it\'s cutting off something important.',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'credentials',
      title: 'Qualifications / credentials',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'photo' },
  },
})
