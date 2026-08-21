import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'newsletterSignup',
  title: 'Newsletter Signups',
  type: 'document',
  description:
    'Created automatically when someone signs up via the "Stay in the loop" footer form — you don\'t need to add these by hand. This is your list: everyone who has opted in, and whether they\'ve since unsubscribed. Every signup email includes an unsubscribe link, so this list stays accurate on its own.',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'subscribedAt', title: 'Subscribed at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'unsubscribed',
      title: 'Unsubscribed?',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
      description: 'Ticks itself when this person clicks the unsubscribe link in one of their emails.',
    }),
    defineField({ name: 'unsubscribedAt', title: 'Unsubscribed at', type: 'datetime', readOnly: true }),
    defineField({
      name: 'unsubscribeToken',
      title: 'Unsubscribe token',
      type: 'string',
      readOnly: true,
      hidden: true,
      description: 'Internal — the unguessable token used in this person\'s unsubscribe link. Not shown in the editor.',
    }),
  ],
  orderings: [{ title: 'Newest first', name: 'subscribedDesc', by: [{ field: 'subscribedAt', direction: 'desc' }] }],
  preview: {
    select: { title: 'email', unsubscribed: 'unsubscribed' },
    prepare({ title, unsubscribed }) {
      return { title, subtitle: unsubscribed ? 'Unsubscribed' : 'Subscribed' }
    },
  },
})
