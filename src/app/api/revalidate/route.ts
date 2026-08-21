import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * Sanity webhook target: revalidates the site the moment content is
 * published, instead of waiting on the 60-second time-based revalidation
 * every page already has. Time-based revalidation is a safety net; this
 * is what makes a Studio publish show up on the live site within a few
 * seconds, reliably.
 *
 * Set up once at sanity.io/manage → this project → API → Webhooks:
 *   URL: https://briarrosegundogs.co.uk/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 *   Dataset: production · Trigger on: Create, Update, Delete
 *   HTTP method: POST
 *
 * The `secret` query param must match the SANITY_REVALIDATE_SECRET
 * environment variable here, so random requests to this URL can't trigger
 * a rebuild storm. It isn't a page password — it's a shared value between
 * this endpoint and the webhook, and doesn't need to be kept as secret as
 * an account credential, just unguessable.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get('secret')

  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { revalidated: false, message: 'SANITY_REVALIDATE_SECRET is not set on the server.' },
      { status: 503 }
    )
  }

  if (secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json({ revalidated: false, message: 'Invalid secret.' }, { status: 401 })
  }

  // Revalidates everything under the root layout — simplest correct option
  // for a site this size, and avoids maintaining a document-type-to-path
  // map that would need updating every time a new page type is added.
  revalidatePath('/', 'layout')

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
