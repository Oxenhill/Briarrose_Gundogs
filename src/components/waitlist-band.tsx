import { PillLink } from '@/components/pill'

const APP_ID = '69d40e08afc38fb1e943f2e7'
const BOOKING = 'https://booking.dogsmarttrainingbehaviour.co.uk'
const SLUG = 'beginners-gundog-group-class'
const WAITLIST_URL = `${BOOKING}/waitlist/${SLUG}?src=briarrose`
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Demand = { day: string; start_time: string; count: number }

/**
 * Live waitlist numbers from the booking app (counts per time only, never
 * who). Refreshed at most every 5 minutes; if the booking app can't be
 * reached the band still shows, just without the numbers.
 */
async function getDemand(): Promise<{ demand: Demand[]; minSize: number } | null> {
  try {
    const res = await fetch(`${BOOKING}/api/apps/${APP_ID}/functions/gcwGetOfferingPublic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
      body: JSON.stringify({ slug: SLUG }),
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.feature_enabled || !data?.offering) return null
    return { demand: Array.isArray(data.slot_demand) ? data.slot_demand : [], minSize: Number(data.offering.min_size) || 3 }
  } catch {
    return null
  }
}

const t12 = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`
}
const dogs = (n: number) => `${n} dog${n === 1 ? '' : 's'}`

/**
 * Beginners Gundog Group Class waitlist. The class only starts once enough
 * dogs can make the same time, so this is how beginners get into a group.
 */
export async function WaitlistBand() {
  const live = await getDemand()
  const demand = (live?.demand || [])
    .slice()
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start_time.localeCompare(b.start_time))
  const best = demand.reduce((m, d) => Math.max(m, d.count), 0)
  const minSize = live?.minSize || 3
  const byDay = DAYS.map((day) => [day, demand.filter((d) => d.day === day)] as const).filter(([, l]) => l.length)

  return (
    <section className="container ask-prompt" data-reveal="">
      <div className="ask-prompt-inner">
        <span className="eyebrow">New to gundog training?</span>
        <h2>Beginners Gundog Group Class</h2>
        <p>
          Eight beginner sessions in a group of 3–4 dogs, with the online gundog course included. Tell us every
          time you could make and we start the class as soon as enough dogs can make the same one. A £10 deposit
          holds your place and comes off the price, and you can withdraw for a full refund any time before you&rsquo;re
          invited.
        </p>
        {byDay.length > 0 && (
          <div className="waitlist-live">
            <p className="waitlist-live-lead">
              {best >= minSize
                ? `A class is ready to form.`
                : `${best >= 2 ? `The closest time needs ${dogs(minSize - best)} more.` : `Dogs are waiting at these times. A class starts once ${dogs(minSize)} can make the same one.`}`}
            </p>
            {byDay.map(([day, list]) => (
              <div key={day} className="waitlist-live-row">
                <span className="waitlist-live-day">{day}</span>
                {list.map((d) => (
                  <span key={d.start_time} className={`waitlist-live-chip${d.count === best && best >= 2 ? ' is-best' : ''}`}>
                    {t12(d.start_time)} · {d.count} waiting
                  </span>
                ))}
              </div>
            ))}
            <p className="waitlist-live-note">Live from our waitlist. Numbers show dogs waiting, never who.</p>
          </div>
        )}
        <PillLink href={WAITLIST_URL} solid external>
          Join the waitlist
        </PillLink>
      </div>
    </section>
  )
}
