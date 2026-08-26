/**
 * Converts a YouTube/Vimeo "share" link (the kind you copy from the Share
 * button, or the browser address bar) into the /embed/ URL format iframes
 * require. Regular watch/share pages send an X-Frame-Options header that
 * makes browsers refuse to load them in an iframe ("youtube.com refused to
 * connect") — only the /embed/ path is designed to be framed.
 *
 * Safe to call on a URL that's already in embed format; it's returned
 * unchanged. Anything unrecognised is also returned unchanged so non-
 * YouTube/Vimeo embeds keep working.
 */
export function toEmbedUrl(url: string): string {
  if (!url) return url

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    // youtu.be/VIDEO_ID
    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      if (id) return `https://www.youtube.com/embed/${id}${parsed.search}`
    }

    // youtube.com/watch?v=VIDEO_ID  (incl. m.youtube.com)
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v')
        if (id) {
          parsed.searchParams.delete('v')
          const rest = parsed.searchParams.toString()
          return `https://www.youtube.com/embed/${id}${rest ? `?${rest}` : ''}`
        }
      }
      // /shorts/VIDEO_ID
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2]
        if (id) return `https://www.youtube.com/embed/${id}`
      }
      // already /embed/VIDEO_ID — leave as-is
    }

    // vimeo.com/VIDEO_ID
    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`
    }

    return url
  } catch {
    return url
  }
}
