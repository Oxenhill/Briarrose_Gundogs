import type { Metadata } from 'next'
import { getVideos, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { JsonLd } from '@/components/json-ld'
import { urlForImage } from '@/sanity/lib/image'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Video Hub',
    description: `Training clips and walkthroughs from ${site.businessName}.`,
    path: '/videos',
  })
}

export default async function VideosPage() {
  const [videos, site] = await Promise.all([getVideos(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={site.videosPageEyebrow || 'Video Hub'}
        heading={site.videosPageHeading || 'Watch the training in action'}
        body={site.videosPageBody}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        {videos.length === 0 ? (
          <div className="frame ph-texture" style={{ aspectRatio: '21/9' }}>
            <span className="tag">Videos will appear here once added in the CMS</span>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 40,
            }}
          >
            {videos.map((video) => (
              <div key={video._id}>
                <div style={{ position: 'relative', aspectRatio: '16/9', marginBottom: 16 }}>
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 6 }}>{video.title}</h3>
                {video.description && (
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14.5 }}>{video.description}</p>
                )}
                <JsonLd
                  data={{
                    '@context': 'https://schema.org',
                    '@type': 'VideoObject',
                    name: video.title,
                    description: video.description,
                    thumbnailUrl: video.thumbnail ? urlForImage(video.thumbnail).width(800).url() : undefined,
                    uploadDate: video.publishedAt,
                    embedUrl: video.embedUrl,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
