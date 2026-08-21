import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only write client, used by the newsletter signup/unsubscribe API
 * routes to store and update `newsletterSignup` documents. Requires a
 * SANITY_API_WRITE_TOKEN environment variable — an "Editor" token created
 * at sanity.io/manage → this project → API → Tokens — which is deliberately
 * NOT prefixed with NEXT_PUBLIC_, so it's only ever readable on the server.
 *
 * Until that token is set, `sanityWriteConfigured` is false and callers
 * should skip writes entirely (the newsletter form still works, it just
 * won't be saved anywhere until this is configured).
 *
 * Never import this file from a 'use client' component.
 */
export const sanityWriteConfigured = Boolean(process.env.SANITY_API_WRITE_TOKEN)

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  perspective: 'published',
})
