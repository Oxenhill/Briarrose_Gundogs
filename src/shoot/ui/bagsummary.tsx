import Link from 'next/link'
import { birds, ratio, type DayBag } from '../bag'
import { SPECIES, SPECIES_LABEL } from '../util'

/** Read-only bag for a day: totals, then the drive-by-drive breakdown. Everyone can see this. */
export function BagSummary({ bag, dateId, canRecord, canRecordNow }: { bag: DayBag; dateId: string; canRecord: boolean; canRecordNow: boolean }) {
  const total = birds(bag.totals)
  return (
    <section>
      <h2>The bag</h2>
      {!bag.mode ? (
        <div className="s-card">
          <p className="s-muted">Not recorded yet.</p>
          {canRecord && canRecordNow && (
            <Link href={`/shoot/date/${dateId}/bag`} className="s-btn full">Record the bag</Link>
          )}
        </div>
      ) : (
        <div className="s-card">
          <div className="s-big">
            <div><strong>{total}</strong><span>birds</span></div>
            <div><strong>{bag.totals.shots}</strong><span>shots</span></div>
            <div><strong>{ratio(bag.totals.shots, total) ?? '–'}</strong><span>shots per bird</span></div>
          </div>
          <p className="s-small" style={{ marginTop: 10 }}>
            {SPECIES.filter((s) => bag.totals[s] > 0).map((s) => `${SPECIES_LABEL[s]} ${bag.totals[s]}`).join(' · ') || 'No birds'}
          </p>
          {bag.mode === 'drives' && (
            <div className="s-scroll">
              <table className="s-table">
                <thead>
                  <tr><th>Drive</th><th>Shots</th><th>Birds</th>{SPECIES.map((s) => <th key={s}>{SPECIES_LABEL[s].slice(0, 4)}</th>)}</tr>
                </thead>
                <tbody>
                  {bag.rows.map((r) => (
                    <tr key={r.drive_id}>
                      <td>{r.drive_name}{r.other_note ? <div className="s-muted s-small">{r.other_note}</div> : null}</td>
                      <td>{r.shots}</td>
                      <td><strong>{birds(r)}</strong></td>
                      {SPECIES.map((s) => <td key={s}>{r[s] || ''}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {bag.mode === 'total' && <p className="s-muted s-small">Recorded as a whole-day total.{bag.rows[0]?.other_note ? ` Other: ${bag.rows[0].other_note}.` : ''}</p>}
          {bag.updated_by && <p className="s-muted s-small">Recorded by {bag.updated_by}.</p>}
          {canRecord && (
            <Link href={`/shoot/date/${dateId}/bag`} className="s-btn ghost full" style={{ marginTop: 8 }}>Edit the bag</Link>
          )}
        </div>
      )}
    </section>
  )
}
