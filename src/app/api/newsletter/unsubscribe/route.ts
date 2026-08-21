import { writeClient, sanityWriteConfigured } from '@/sanity/lib/writeClient'

/**
 * Unsubscribe link target — the URL sent in every newsletter confirmation
 * email. GET (not POST) because it's meant to be clicked directly from an
 * email client, no form or JavaScript required.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')

  const page = (title: string, body: string) =>
    new Response(
      `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;text-align:center;padding:80px 20px;color:#2a2a2a;"><h1 style="font-size:22px;">${title}</h1><p>${body}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )

  if (!token) {
    return page('Missing unsubscribe link', 'This link is incomplete — please use the link from your email.')
  }

  if (!sanityWriteConfigured) {
    return page('Unsubscribe unavailable', "This isn't set up yet — please email us directly and we'll remove you.")
  }

  // Typed as `string` (not left as an inline literal) so @sanity/client's
  // typed-GROQ inference doesn't try to match it against generated query
  // types — this project doesn't run `sanity typegen`, so a literal here
  // would otherwise fail to typecheck against a hand-written params object.
  // Cast the params object: @sanity/client's typed-GROQ params type only
  // accepts params matching generated query types (this project doesn't
  // run `sanity typegen`), so a hand-written params object needs an `any`
  // escape hatch here — the query and params are correct at runtime either way.
  const findByToken: string = `*[_type == "newsletterSignup" && unsubscribeToken == $token][0]{_id}`
  const entry = (await writeClient.fetch(findByToken, { token } as any, {})) as { _id: string } | null

  if (!entry) {
    return page('Link no longer valid', "This unsubscribe link has already been used or isn't recognised.")
  }

  await writeClient
    .patch(entry._id)
    .set({ unsubscribed: true, unsubscribedAt: new Date().toISOString() })
    .commit()

  return page("You're unsubscribed", "You won't receive any more emails from Briarrose Gundogs. Sorry to see you go.")
}
