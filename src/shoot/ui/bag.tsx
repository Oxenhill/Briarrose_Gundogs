'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addDrive, clearBag, moveDrive, renameDrive, restoreDrive, retireDrive, saveBag, type BagEntry } from '../bag-actions'
import { SPECIES, SPECIES_LABEL, type Species } from '../util'

// ------------------------------------------------------------------ counter: big – / + with a typeable number

function Counter({ label, value, onChange, max }: { label: string; value: number; onChange: (n: number) => void; max: number }) {
  return (
    <div className="s-stepper">
      <span>{label}</span>
      <div className="s-stepbtns">
        <button type="button" aria-label={`Less ${label}`} onClick={() => onChange(Math.max(0, value - 1))}>−</button>
        <input
          className="s-count"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={label}
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => onChange(Math.min(max, Number(e.target.value.replace(/\D/g, '')) || 0))}
        />
        <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  )
}

type Entry = BagEntry & { other_note: string }
const blank = (drive_id: string | null): Entry => ({ drive_id, shots: 0, pheasant: 0, partridge: 0, duck: 0, pigeon: 0, other: 0, other_note: '' })
const birdsOf = (e: Entry) => SPECIES.reduce((n, s) => n + e[s], 0)

function EntryCard({ title, e, onChange }: { title: string; e: Entry; onChange: (e: Entry) => void }) {
  const set = (k: keyof Entry, v: number | string) => onChange({ ...e, [k]: v })
  return (
    <div className="s-card">
      <div className="s-row">
        <h3 className="s-grow">{title}</h3>
        <span className="s-pill">{birdsOf(e)} birds</span>
      </div>
      <Counter label="Shots fired" value={e.shots} onChange={(v) => set('shots', v)} max={10000} />
      {SPECIES.map((s: Species) => (
        <Counter key={s} label={SPECIES_LABEL[s]} value={e[s]} onChange={(v) => set(s, v)} max={5000} />
      ))}
      {e.other > 0 && (
        <label className="s-field">
          <span>What was “other”?</span>
          <input type="text" value={e.other_note} maxLength={80} placeholder="e.g. 2 woodcock, 1 snipe" onChange={(ev) => set('other_note', ev.target.value)} />
        </label>
      )}
    </div>
  )
}

export function BagRecorder(props: {
  dateId: string
  dateLabel: string
  drives: { id: string; name: string }[]
  initialMode: 'drives' | 'total' | null
  initialRows: (BagEntry & { other_note: string | null })[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'drives' | 'total'>(props.initialMode || (props.drives.length ? 'drives' : 'total'))
  const fromRow = (r: BagEntry & { other_note: string | null }): Entry => ({ ...blank(r.drive_id), ...r, other_note: r.other_note || '' })
  const [byDrive, setByDrive] = useState<Record<string, Entry>>(() =>
    Object.fromEntries(props.initialRows.filter((r) => r.drive_id).map((r) => [r.drive_id!, fromRow(r)])),
  )
  const [total, setTotal] = useState<Entry>(() => {
    const t = props.initialRows.find((r) => !r.drive_id)
    return t ? fromRow(t) : blank(null)
  })

  const chosen = props.drives.filter((d) => byDrive[d.id])
  const toggle = (id: string) =>
    setByDrive((cur) => {
      const next = { ...cur }
      if (next[id]) {
        if (birdsOf(next[id]) + next[id].shots > 0 && !confirm('Take this drive off? Its numbers will be cleared.')) return cur
        delete next[id]
      } else next[id] = blank(id)
      return next
    })

  const entries: Entry[] = mode === 'total' ? [total] : chosen.map((d) => byDrive[d.id])
  const sum = entries.reduce(
    (a, e) => ({ shots: a.shots + e.shots, birds: a.birds + birdsOf(e) }),
    { shots: 0, birds: 0 },
  )

  function save() {
    setError(null)
    start(async () => {
      const r = await saveBag(props.dateId, mode, entries)
      if (r.error) setError(r.error)
      else router.push(`/shoot/date/${props.dateId}`)
    })
  }

  return (
    <>
      <div className="s-choice" role="radiogroup" aria-label="How to record">
        <label>
          <input type="radio" checked={mode === 'drives'} onChange={() => setMode('drives')} />
          Drive by drive
        </label>
        <label>
          <input type="radio" checked={mode === 'total'} onChange={() => setMode('total')} />
          Whole day total
        </label>
      </div>

      {mode === 'drives' && (
        <>
          {props.drives.length === 0 ? (
            <div className="s-alert">
              No drives have been set up yet.{' '}
              {props.isAdmin ? <Link href="/shoot/drives">Set up drives</Link> : 'Ask James or an admin to add them.'} Or use{' '}
              <strong>Whole day total</strong>.
            </div>
          ) : (
            <div className="s-card">
              <h3>Which drives were done?</h3>
              <p className="s-muted s-small">Tap each drive that was done today.</p>
              <div className="s-tabs" style={{ flexWrap: 'wrap', marginTop: 8 }}>
                {props.drives.map((d) => (
                  <button key={d.id} type="button" aria-pressed={!!byDrive[d.id]} onClick={() => toggle(d.id)}>
                    {byDrive[d.id] ? '✓ ' : ''}
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {chosen.map((d) => (
            <EntryCard key={d.id} title={d.name} e={byDrive[d.id]} onChange={(e) => setByDrive((cur) => ({ ...cur, [d.id]: e }))} />
          ))}
        </>
      )}

      {mode === 'total' && <EntryCard title={`Whole day — ${props.dateLabel}`} e={total} onChange={setTotal} />}

      <div className="s-card" style={{ position: 'sticky', bottom: 'calc(84px + env(safe-area-inset-bottom))', zIndex: 5 }}>
        <div className="s-row">
          <div className="s-grow">
            <strong>Day total:</strong> {sum.birds} birds · {sum.shots} shots
            {sum.birds > 0 && <span className="s-muted"> · {(sum.shots / sum.birds).toFixed(1)} shots per bird</span>}
          </div>
        </div>
        {error && <div className="s-alert error">{error}</div>}
        <button type="button" className="s-btn full" style={{ marginTop: 8 }} disabled={pending} onClick={save}>
          {pending ? 'Saving…' : 'Save the bag'}
        </button>
      </div>

      {props.initialMode && (
        <button
          type="button"
          className="s-btn danger full"
          disabled={pending}
          onClick={() =>
            confirm('Delete the whole bag record for this day?') &&
            start(async () => {
              await clearBag(props.dateId)
              router.push(`/shoot/date/${props.dateId}`)
            })
          }
        >
          Delete this day’s record
        </button>
      )}
    </>
  )
}

// ------------------------------------------------------------------ drive set-up

type DriveRow = { id: string; name: string; active: boolean; times_done: number }

export function DriveManager({ drives }: { drives: DriveRow[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const active = drives.filter((d) => d.active)
  const retired = drives.filter((d) => !d.active)

  const run = (fn: () => Promise<{ error?: string } | void>) =>
    start(async () => {
      setError(null)
      const r = await fn()
      if (r && r.error) setError(r.error)
      router.refresh()
    })

  return (
    <>
      <form
        className="s-card"
        onSubmit={(e) => {
          e.preventDefault()
          run(async () => {
            const r = await addDrive(name)
            if (!r.error) setName('')
            return r
          })
        }}
      >
        <label className="s-field" style={{ marginTop: 0 }}>
          <span>Add a drive</span>
          <input type="text" value={name} maxLength={60} placeholder="e.g. Long Wood" onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="s-btn full" disabled={pending || !name.trim()}>Add drive</button>
      </form>
      {error && <div className="s-alert error">{error}</div>}

      <h2>Drives ({active.length})</h2>
      <div className="s-card">
        {active.length === 0 && <p className="s-muted">No drives yet. Add them above, in the order they’re usually done.</p>}
        <ul className="s-list">
          {active.map((d, i) => (
            <li key={d.id} style={{ flexWrap: 'wrap' }}>
              {editing === d.id ? (
                <form
                  className="s-row s-grow"
                  onSubmit={(e) => {
                    e.preventDefault()
                    run(async () => {
                      const r = await renameDrive(d.id, editName)
                      if (!r.error) setEditing(null)
                      return r
                    })
                  }}
                >
                  <input className="s-input s-grow" value={editName} maxLength={60} onChange={(e) => setEditName(e.target.value)} autoFocus />
                  <button className="s-btn small" disabled={pending}>Save</button>
                  <button type="button" className="s-btn ghost small" onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div className="s-grow">
                    <div style={{ fontWeight: 600 }}>{d.name}</div>
                    <div className="s-muted s-small">{d.times_done ? `Done ${d.times_done} time${d.times_done === 1 ? '' : 's'}` : 'Not recorded yet'}</div>
                  </div>
                  <button type="button" className="s-btn ghost small" aria-label={`Move ${d.name} up`} disabled={pending || i === 0} onClick={() => run(() => moveDrive(d.id, -1))}>↑</button>
                  <button type="button" className="s-btn ghost small" aria-label={`Move ${d.name} down`} disabled={pending || i === active.length - 1} onClick={() => run(() => moveDrive(d.id, 1))}>↓</button>
                  <button type="button" className="s-btn ghost small" onClick={() => { setEditing(d.id); setEditName(d.name) }}>Rename</button>
                  <button
                    type="button"
                    className="s-btn danger small"
                    disabled={pending}
                    onClick={() =>
                      confirm(d.times_done ? `Retire ${d.name}? Its past figures are kept and it can be brought back.` : `Delete ${d.name}?`) &&
                      run(() => retireDrive(d.id))
                    }
                  >
                    {d.times_done ? 'Retire' : 'Delete'}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {retired.length > 0 && (
        <details className="s-card">
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Retired drives ({retired.length})</summary>
          <ul className="s-list">
            {retired.map((d) => (
              <li key={d.id}>
                <div className="s-grow">{d.name}</div>
                <button type="button" className="s-btn ghost small" disabled={pending} onClick={() => run(() => restoreDrive(d.id))}>Bring back</button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
