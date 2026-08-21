import { createImageUrlBuilder } from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url'
import { dataset, projectId } from '../env'

const imageBuilder = createImageUrlBuilder({ projectId, dataset })

export function urlForImage(source: SanityImageSource) {
  // Quality 90 rather than Sanity's own lower default — meaningfully sharper,
  // especially for the handful of places (social-share previews, structured
  // data) where this URL is used directly rather than re-processed by
  // next/image.
  return imageBuilder.image(source).quality(90).auto('format')
}
