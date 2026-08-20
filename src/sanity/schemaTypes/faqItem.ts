import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'faqItem',
  title: 'FAQs',
  type: 'document',
  description: 'Powers the "FAQ" page (/faq), plus the structured data that can surface these questions directly in Google search results.',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'order', title: 'Display order', type: 'number', initialValue: 0 }),
  ],
  orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'question' },
  },
})
