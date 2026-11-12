import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isAdmin, isDeputy, isKeeper, requireMember } from '@/shoot/auth'
import { dayBag } from '@/shoot/bag'
import { BagSummary } from '@/shoot/ui/bagsummary'
import { attendees, dateSummary, whoCanIAsk, type Attendee, type AskPerson } from '@/shoot/data'
import { setDateNeeds } from '@/shoot/actions'
import { AnswerForm } from '@/shoot/ui/answer'
import { Counts } from '@/shoot/ui/datecard'
import { Nav } from '@/shoot/ui/nav'
import {
  TEAMS_LABEL,
  firstAiderCurrent,
  prettyDate,
  shortName,
  todayUK,
  whatsappNumber,
  type Team,
} from '@/shoot/util'

function PersonLine({ a, admin, date }: { a: Attendee; admin: boolean; date: string }) {
  const plus = a.adults + a.children
  return (
    <li>
      <div className="s-grow">
        <div style={{ fontWeight: 600 }}>
          {admin ? (
            <Link href={`/shoot/people/${a.person_id}`}>{a.full_name}</Link>
          ) : (
            shortName(a.full_name)
          )}
        </div>
        <div className="s-muted s-small">
          {plus > 0 &&
            `+${a.adults ? `${a.adults} adult${a.adults === 1 ? '' : 's'}` : ''}${a.adults && a.children ? ', ' : ''}${
              a.children ? `${a.children} child${a.children === 1 ? '' : 'ren'}` : ''
            }${a.plus_note ? ` (${a.plus_note})` : ''}`}
          {plus > 0 && a.dogs > 0 && ' · '}
          {a.dogs > 0 && `${a.dogs} dog${a.dogs === 1 ? '' : 's'}`}
        </div>
        <span className="s-badges">
          {firstAiderCurrent(a, date) && <span className="s-badge fa">First aider</span>}
          {admin && a.is_under_18 && <span className="s-badge u18">Under 18</span>}
        </span>
      </div>
      {admin && (
        <a className="s-btn ghost small" href={`tel:${a.mobile}`}>
          Call
        </a>
      )}
    </li>
  )
}

function AskList({ team, people, date, short }: { team: Team; people: AskPerson[]; date: string; short: boolean }) {
  const list = people.filter((p) => p.usual_team === team || p.can_do_other)
  if (!list.length) return <p className="s-muted">Nobody else to ask for {TEAMS_LABEL[team].toLowerCase()}.</p>
  const msg = (name: string) =>
    `Hi ${name.split(' ')[0]}, we’re ${short ? 'short of' : 'looking for more'} ${TEAMS_LABEL[team].toLowerCase()} on ${prettyDate(date, {
      long: true,
    })}. Can you make it? If so, please tap Yes in the WGSC Team app.`
  return (
    <ul className="s-list">
      {list.map((p) => (
        <li key={p.id}>
          <div className="s-grow">
            <div style={{ fontWeight: 600 }}>{p.full_name}</div>
            <div className="s-muted s-small">
              {p.answer === 'no' ? 'Said no' : 'No reply yet'}
              {p.usual_team !== team ? ' · usually the other team' : ''}
            </div>
          </div>
          <a className="s-btn ghost small" href={`tel:${p.mobile}`}>Call</a>
          <a className="s-btn wa small" href={`https://wa.me/${whatsappNumber(p.mobile)}?text=${encodeURIComponent(msg(p.full_name))}`} target="_blank" rel="noopener">
            WhatsApp
          </a>
        </li>
      ))}
    </ul>
  )
}

export default async function DatePage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const d = await dateSummary(me.id, id)
  if (!d) notFound()
  const admin = isAdmin(me)
  const [people, ask, bag] = await Promise.all([attendees(id), admin && !d.cancelled ? whoCanIAsk(id) : Promise.resolve([]), dayBag(id)])
  const isPast = d.shoot_date < todayUK()
  const yes = people.filter((p) => p.answer === 'yes')
  const maybe = people.filter((p) => p.answer === 'maybe')

  return (
    <main className="s-main">
      <p>
        <Link href="/shoot">‹ All shoot days</Link>
      </p>
      <h1>{prettyDate(d.shoot_date, { long: true })}</h1>
      {d.cancelled && <div className="s-alert error">This shoot day has been cancelled.</div>}
      {!d.cancelled && <Counts d={d} showNeeds={admin && !isPast} />}

      {!d.cancelled && (d.shoot_date <= todayUK() || bag.mode) && (
        <BagSummary bag={bag} dateId={d.id} canRecord={isDeputy(me)} canRecordNow={d.shoot_date <= todayUK()} />
      )}

      {!d.cancelled && !isPast && !isKeeper(me) && (
        <AnswerForm
          dateId={d.id}
          answer={d.my_answer}
          team={d.my_team || me.usual_team}
          adults={d.my_adults}
          kids={d.my_children}
          dogs={d.my_dogs}
          note={d.my_note}
        />
      )}

      {(['beater', 'picker'] as Team[]).map((t) => {
        const list = yes.filter((p) => p.team === t)
        return (
          <section key={t}>
            <h2>
              {TEAMS_LABEL[t]} coming ({list.length} {list.length === 1 ? 'person' : 'people'})
            </h2>
            <div className="s-card">
              {list.length ? (
                <ul className="s-list">
                  {list.map((a) => (
                    <PersonLine key={a.person_id} a={a} admin={admin} date={d.shoot_date} />
                  ))}
                </ul>
              ) : (
                <p className="s-muted">Nobody yet.</p>
              )}
            </div>
          </section>
        )
      })}

      {maybe.length > 0 && (
        <section>
          <h2>Maybe ({maybe.length})</h2>
          <div className="s-card">
            <ul className="s-list">
              {maybe.map((a) => (
                <PersonLine key={a.person_id} a={a} admin={admin} date={d.shoot_date} />
              ))}
            </ul>
          </div>
        </section>
      )}

      {admin && !d.cancelled && !isPast && (
        <>
          <h2>Who can I ask?</h2>
          {(['beater', 'picker'] as Team[]).map((t) => (
            <details key={t} className="s-card" open={t === 'beater' ? d.beaters < d.beaters_needed : d.pickers < d.pickers_needed}>
              <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                For {TEAMS_LABEL[t].toLowerCase()}
                {(t === 'beater' ? d.beaters < d.beaters_needed : d.pickers < d.pickers_needed) ? ' — short' : ''}
              </summary>
              <AskList team={t} people={ask} date={d.shoot_date} short={t === 'beater' ? d.beaters < d.beaters_needed : d.pickers < d.pickers_needed} />
            </details>
          ))}

          <h2>How many do you need?</h2>
          <form action={setDateNeeds} className="s-card">
            <input type="hidden" name="date_id" value={d.id} />
            <div className="s-row">
              <label className="s-field s-grow">
                <span>Beaters</span>
                <input type="number" name="beaters" min={0} max={200} defaultValue={d.beaters_needed} inputMode="numeric" />
              </label>
              <label className="s-field s-grow">
                <span>Pickers-up</span>
                <input type="number" name="pickers" min={0} max={200} defaultValue={d.pickers_needed} inputMode="numeric" />
              </label>
            </div>
            <button className="s-btn ghost full">Save numbers</button>
          </form>
        </>
      )}
      <Nav me={me} active="dates" />
    </main>
  )
}
