import { type SchemaTypeDefinition } from 'sanity'

import siteSettings from './siteSettings'
import trainerProfile from './trainerProfile'
import classItem from './classItem'
import location from './location'
import dog from './dog'
import testimonial from './testimonial'
import galleryItem from './galleryItem'
import video from './video'
import post from './post'
import event from './event'
import policy from './policy'
import faqItem from './faqItem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettings,
    trainerProfile,
    classItem,
    location,
    dog,
    testimonial,
    galleryItem,
    video,
    post,
    event,
    policy,
    faqItem,
  ],
}
