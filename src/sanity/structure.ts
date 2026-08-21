import type { StructureResolver } from 'sanity/structure'
import { SubmissionLinkPane } from './components/SubmissionLinkPane'

// Pins the two singletons (Site Settings, Trainer Profile) to the top of
// the Studio sidebar as single editable documents rather than lists, and
// pins a static "private testimonial link" info pane inside Testimonials
// (see SubmissionLinkPane) so that link is always easy to find.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.listItem()
        .title('About Page (Trainer Profile)')
        .id('trainerProfile')
        .child(S.document().schemaType('trainerProfile').documentId('trainerProfile')),
      S.divider(),
      ...S.documentTypeListItems()
        .filter((item) => !['siteSettings', 'trainerProfile'].includes(item.getId() ?? ''))
        .map((item) =>
          item.getId() === 'testimonial'
            ? S.listItem()
                .title('Testimonials')
                .id('testimonial')
                .child(
                  S.list()
                    .title('Testimonials')
                    .items([
                      S.listItem()
                        .title('Private submission link')
                        .id('testimonial-submission-link')
                        .child(S.component(SubmissionLinkPane).title('Private submission link')),
                      S.divider(),
                      S.documentTypeListItem('testimonial').title('All Testimonials'),
                    ])
                )
            : item
        ),
    ])
