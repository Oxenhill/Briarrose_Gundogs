import Link from 'next/link'
import { setAnswer } from '../actions'
import type { DateSummary } from '../data'
import { prettyDate, type Answer } from '../util'

export function Counts({ d, showNeeds }: { d: DateSummary; showNeeds: boolean }) {
  const short = (have: number, need: number) => showNeeds && have < need
  return (
    <div className="s-counts">
      <span className={`s-pill ${short(d.beaters, d.beaters_needed) ? 'short' : showNeeds ? 'good' : ''}`}>
        Beaters {d.beaters}
        {showNeeds ? `/${d.beaters_needed}` : ''}
        {d.beater_children ? ` (incl. ${d.beater_children} child${d.beater_children === 1 ? '' : 'ren'})` : ''}
      </span>
      <span className={`s-pill ${short(d.pickers, d.pickers_needed) ? 'short' : showNeeds ? 'good' : ''}`}>
        Pickers-up {d.pickers}
        {showNeeds ? `/${d.pickers_needed}` : ''}
        {d.picker_children ? ` (incl. ${d.picker_children} child${d.picker_children === 1 ? '' : 'ren'})` : ''}
      </span>
      <span className="s-pill">Dogs {d.dogs}</span>
      {showNeeds && (
        <span className={`s-pill ${d.first_aiders ? '' : 'warn'}`}>
          {d.first_aiders ? `First aiders ${d.first_aiders}` : 'No first aider yet'}
        </span>
      )}
      {d.maybes > 0 && <span className="s-pill">Maybe {d.maybes}</span>}
    </div>
  )
}

export function DateCard({ d, admin, canAnswer }: { d: DateSummary; admin: boolean; canAnswer: boolean }) {
  return (
    <div className={`s-card${d.cancelled ? ' cancelled' : ''}`}>
      <Link href={`/shoot/date/${d.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="s-row">
          <h3 className="s-grow">{prettyDate(d.shoot_date)}</h3>
          {d.cancelled ? <span className="s-pill short">Cancelled</span> : <span className="s-muted s-small">Details ›</span>}
        </div>
        {!d.cancelled && <Counts d={d} showNeeds={admin} />}
      </Link>
      {!d.cancelled && canAnswer && (
        <form action={setAnswer} className="s-answers">
          <input type="hidden" name="date_id" value={d.id} />
          {(['yes', 'maybe', 'no'] as Answer[]).map((a) => (
            <button key={a} name="answer" value={a} className={d.my_answer === a ? `on-${a}` : ''} aria-pressed={d.my_answer === a}>
              {a === 'yes' ? 'Yes' : a === 'maybe' ? 'Maybe' : 'No'}
            </button>
          ))}
        </form>
      )}
      {!d.cancelled && canAnswer && d.my_answer && d.my_answer !== 'no' && (d.my_adults + d.my_children + d.my_dogs > 0 || d.my_team) && (
        <p className="s-muted s-small" style={{ marginTop: 8 }}>
          You: {d.my_team === 'picker' ? 'picking up' : 'beating'}
          {d.my_adults + d.my_children > 0 ? ` · +${d.my_adults + d.my_children}` : ''}
          {d.my_dogs ? ` · ${d.my_dogs} dog${d.my_dogs === 1 ? '' : 's'}` : ''} ·{' '}
          <Link href={`/shoot/date/${d.id}`}>change</Link>
        </p>
      )}
    </div>
  )
}
