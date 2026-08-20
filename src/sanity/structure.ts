import type { StructureResolver } from 'sanity/structure'

// Pins the two singletons (Site Settings, Trainer Profile) to the top of
// the Studio sidebar as single editable documents rather than lists.
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
      ...S.documentTypeListItems().filter(
        (item) => !['siteSettings', 'trainerProfile'].includes(item.getId() ?? '')
      ),
    ])
