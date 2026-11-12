'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toggleDate } from '../actions'
import { prettyDate } from '../util'

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export function CalendarGrid({ dates, today }: { dates: { shoot_date: string; cancelled: boolean }[]; today: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [y0, m0] = today.split('-').map(Number)
  const [ym, setYm] = useState({ y: y0, m: m0 - 1 })
  const map = useMemo(() => new Map(dates.map((d) => [d.shoot_date, d.cancelled])), [dates])
  const count = dates.filter((d) => d.shoot_date >= today && !d.cancelled).length

  const first = new Date(Date.UTC(ym.y, ym.m, 1))
  const daysInMonth = new Date(Date.UTC(ym.y, ym.m + 1, 0)).getUTCDate()
  const lead = (first.getUTCDay() + 6) % 7 // Monday first
  const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(first)
  const inMonth = dates.filter((d) => d.shoot_date.startsWith(`${ym.y}-${pad(ym.m + 1)}`) && !d.cancelled).length

  function move(delta: number) {
    const m = ym.m + delta
    setYm({ y: ym.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }

  function tap(day: string) {
    setError(null)
    const state = map.get(day)
    if (state === false && !confirm(`Remove ${prettyDate(day, { long: true })}? If anyone has already said they’re coming it will show as cancelled.`)) return
    start(async () => {
      const r = await toggleDate(day)
      if (r.error) setError(r.error)
      router.refresh()
    })
  }

  return (
    <div className="s-card">
      <div className="s-row" style={{ marginBottom: 10 }}>
        <button type="button" className="s-btn ghost small" onClick={() => move(-1)} aria-label="Previous month">‹</button>
        <h2 className="s-grow" style={{ margin: 0, textAlign: 'center' }}>{monthName}</h2>
        <button type="button" className="s-btn ghost small" onClick={() => move(1)} aria-label="Next month">›</button>
      </div>
      <div className="s-cal" aria-busy={pending}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="dow">{d}</div>
        ))}
        {Array.from({ length: lead }).map((_, i) => <div key={`l${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = iso(ym.y, ym.m, i + 1)
          const st = map.get(day)
          const past = day < today
          const cls = [st === false ? 'on' : '', st === true ? 'cancelled' : '', past ? 'past' : '', day === today ? 'today' : ''].join(' ')
          return (
            <button
              key={day}
              type="button"
              className={cls}
              disabled={pending || (past && st === undefined)}
              onClick={() => !past && tap(day)}
              aria-pressed={st === false}
              aria-label={`${prettyDate(day, { long: true })}${st === false ? ', shoot day' : st === true ? ', cancelled' : ''}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      {error && <div className="s-alert error">{error}</div>}
      <p className="s-muted" style={{ marginTop: 12 }}>
        {inMonth} shoot day{inMonth === 1 ? '' : 's'} this month · {count} still to come this season.
      </p>
    </div>
  )
}
