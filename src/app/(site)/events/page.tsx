import type { Metadata } from 'next'
import { getEvents, getSiteSettings } from '@/lib/queries'
import { PageHero } from '@/components/page-hero'
import { PillLink } from '@/components/pill'
import { JsonLd } from '@/components/json-ld'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({
    title: 'Events',
    description: `Working days, meet-ups and community events from ${site.businessName}.`,
    path: '/events',
  })
}

function formatDateTime(iso: string | undefined) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function EventsPage() {
  const [events, site] = await Promise.all([getEvents(), getSiteSettings()])

  return (
    <>
      <PageHero
        eyebrow={site.eventsPageEyebrow || 'Community'}
        heading={site.eventsPageHeading || 'Working days & events'}
        body={site.eventsPageBody}
      />
      <section className="container" style={{ paddingBottom: 120 }}>
        {events.length === 0 ? (
          <div className="frame ph-texture" style={{ aspectRatio: '21/9' }}>
            <span className="tag">Upcoming events will appear here once added in the CMS</span>
          </div>
        ) : (
          <div>
            {events.map((event) => (
              <div key={event._id} className="class-row" style={{ gridTemplateColumns: '1fr auto' }}>
                <span>
                  <span className="meta" style={{ display: 'block', marginBottom: 6 }}>
                    {event.eventType} {formatDateTime(event.startDateTime) ? `· ${formatDateTime(event.startDateTime)}` : ''}
                  </span>
                  <h3>{event.title}</h3>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 6 }}>{event.description}</p>
                  {event.locationName && (
                    <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 6 }}>{event.locationName}</p>
                  )}
                </span>
                {event.externalUrl && (
                  <PillLink href={event.externalUrl} external>
                    Details
                  </PillLink>
                )}
                <JsonLd
                  data={{
                    '@context': 'https://schema.org',
                    '@type': 'Event',
                    name: event.title,
                    description: event.description,
                    startDate: event.startDateTime,
                    endDate: event.endDateTime,
                    location: {
                      '@type': 'Place',
                      name: event.locationName,
                      address: event.locationAddress,
                    },
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
