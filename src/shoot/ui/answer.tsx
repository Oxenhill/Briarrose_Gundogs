'use client'

import { useState, useTransition } from 'react'
import { setAnswer } from '../actions'
import type { Answer, Team } from '../util'

function Stepper({ label, name, value, onChange, max }: { label: string; name: string; value: number; onChange: (n: number) => void; max: number }) {
  return (
    <div className="s-stepper">
      <span>{label}</span>
      <div className="s-stepbtns">
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
        <input type="hidden" name={name} value={value} />
      </div>
    </div>
  )
}

export function AnswerForm(props: {
  dateId: string
  answer: Answer | null
  team: Team
  adults: number
  kids: number
  dogs: number
  note: string | null
}) {
  const [answer, setA] = useState<Answer | null>(props.answer)
  const [team, setTeam] = useState<Team>(props.team)
  const [adults, setAdults] = useState(props.adults)
  const [children, setChildren] = useState(props.kids)
  const [dogs, setDogs] = useState(props.dogs)
  const [note, setNote] = useState(props.note || '')
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()

  function save(a: Answer) {
    setA(a)
    setSaved(false)
    const fd = new FormData()
    fd.set('date_id', props.dateId)
    fd.set('answer', a)
    fd.set('team', team)
    fd.set('adults', String(adults))
    fd.set('children', String(children))
    fd.set('dogs', String(dogs))
    fd.set('plus_note', note)
    fd.set('full', '1')
    start(async () => {
      await setAnswer(fd)
      setSaved(true)
    })
  }

  const coming = answer === 'yes' || answer === 'maybe'

  return (
    <div className="s-card">
      <h2 style={{ marginTop: 0 }}>Are you coming?</h2>
      <div className="s-answers">
        {(['yes', 'maybe', 'no'] as Answer[]).map((a) => (
          <button key={a} type="button" className={answer === a ? `on-${a}` : ''} onClick={() => save(a)} disabled={pending}>
            {a === 'yes' ? 'Yes' : a === 'maybe' ? 'Maybe' : 'No'}
          </button>
        ))}
      </div>

      {coming && (
        <>
          <div className="s-field">
            <span>Which team that day?</span>
            <div className="s-choice">
              {(['beater', 'picker'] as Team[]).map((t) => (
                <label key={t}>
                  <input type="radio" name="team" checked={team === t} onChange={() => setTeam(t)} />
                  {t === 'beater' ? 'Beating' : 'Picking up'}
                </label>
              ))}
            </div>
          </div>
          <div className="s-field">
            <span>Bringing anyone?</span>
            <Stepper label="Adults" name="adults" value={adults} onChange={setAdults} max={10} />
            <Stepper label="Children" name="children" value={children} onChange={setChildren} max={10} />
          </div>
          {adults + children > 0 && (
            <label className="s-field">
              <span>Who are they? (optional)</span>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="e.g. son, 14" />
            </label>
          )}
          <div className="s-field">
            <span>Dogs</span>
            <Stepper label="Dogs I’m bringing" name="dogs" value={dogs} onChange={setDogs} max={20} />
          </div>
          <button type="button" className="s-btn full" disabled={pending} onClick={() => save(answer!)}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </>
      )}
      {saved && !pending && <div className="s-alert ok" role="status">Saved.</div>}
    </div>
  )
}
