import Image from 'next/image'
import { Prose } from '@/components/prose'
import { PillLink } from '@/components/pill'
import { urlForImage } from '@/sanity/lib/image'
import type { CourseContentBlock } from '@/lib/fallback-content'

/**
 * Renders one lesson's mixed content stream (video / text / PDF / external
 * video link / slide image), in the order an editor arranged them in
 * Sanity. Only ever called for lessons the visitor is actually allowed to
 * see (a free preview, or the course they're entitled to) — this
 * component itself does no access checking.
 */
export function LessonContent({ blocks }: { blocks?: CourseContentBlock[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {blocks.map((block, i) => {
        const key = block._key || String(i)

        if (block._type === 'videoBlock') {
          if (block.provider === 'cloudflare_stream' && block.cloudflareVideoId) {
            return (
              <div key={key} style={{ position: 'relative', paddingTop: '56.25%', border: '1px solid var(--line)' }}>
                <iframe
                  src={`https://iframe.cloudflarestream.com/${block.cloudflareVideoId}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  title={block.title || 'Lesson video'}
                />
              </div>
            )
          }
          if (block.provider === 'external_url' && block.externalUrl) {
            return (
              <video
                key={key}
                controls
                style={{ width: '100%' }}
                poster={block.posterImage ? urlForImage(block.posterImage).width(1200).url() : undefined}
              >
                <source src={block.externalUrl} />
              </video>
            )
          }
          return null
        }

        if (block._type === 'textBlock') {
          return <Prose key={key} value={block.content} />
        }

        if (block._type === 'pdfBlock') {
          const fileUrl = block.file?.asset?.url
          if (!fileUrl) return null
          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ position: 'relative', paddingTop: '129%', border: '1px solid var(--line)' }}>
                <iframe
                  src={`${fileUrl}${block.preventDownload ? '#toolbar=0' : ''}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  title={block.title || 'PDF'}
                />
              </div>
              {block.preventDownload ? null : (
                <PillLink href={fileUrl} external style={{ alignSelf: 'flex-start' }}>
                  Download: {block.title}
                </PillLink>
              )}
            </div>
          )
        }

        if (block._type === 'youtubeEmbedBlock') {
          return block.url ? (
            <PillLink key={key} href={block.url} external style={{ alignSelf: 'flex-start' }}>
              {block.title || 'Watch video'} ↗
            </PillLink>
          ) : null
        }

        if (block._type === 'imageSlideBlock') {
          const imgUrl = block.image ? urlForImage(block.image).width(1400).url() : null
          return imgUrl ? (
            <figure key={key} style={{ position: 'relative', aspectRatio: '16/10', border: '1px solid var(--line)' }}>
              <Image src={imgUrl} alt={block.caption || ''} fill sizes="(max-width: 760px) 100vw, 700px" style={{ objectFit: 'cover' }} />
              {block.caption ? (
                <figcaption style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-soft)' }}>{block.caption}</figcaption>
              ) : null}
            </figure>
          ) : null
        }

        return null
      })}
    </div>
  )
}
