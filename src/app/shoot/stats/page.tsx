import Link from 'next/link'
import { isAdmin, requireMember } from '@/shoot/auth'
import { birds, ratio, seasonDays, seasonDrives, seasonOf, seasonsWithData } from '@/shoot/bag'
import { Nav } from '@/shoot/ui/nav'
import { SPECIES, SPECIES_LABEL, prettyDate, todayUK } from '@/shoot/util'

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const me = await requireMember()
  const seasons = await seasonsWithData()
  const current = seasonOf(todayUK())
  const { season: asked } = await searchParams
  const season = asked && /^\d{4}\/\d{2}$/.test(asked) ? asked : current
  if (!seasons.includes(current)) seasons.unshift(current)
  const [days, drives] = await Promise.all([seasonDays(season), seasonDrives(season)])

  const t = days.reduce(
    (a, d) => {
      a.shots += d.shots
      for (const s of SPECIES) a[s] += d[s]
      return a
    },
    { shots: 0, pheasant: 0, partridge: 0, duck: 0, pigeon: 0, other: 0 },
  )
  const total = birds(t)
  const driveRows = drives
    .map((d) => ({ ...d, b: birds(d) }))
    .sort((a, b) => b.b / b.times - a.b / a.times)

  return (
    <main className="s-main">
      <h1>Season stats</h1>
      {seasons.length > 1 && (
        <div className="s-tabs" style={{ marginTop: 10 }}>
          {seasons.map((s) => (
            <Link key={s} href={`/shoot/stats?season=${encodeURIComponent(s)}`} className="s-btn ghost small" aria-current={s === season ? 'page' : undefined}
              style={s === season ? { background: 'var(--g)', color: '#fff' } : undefined}>
              {s}
            </Link>
          ))}
        </div>
      )}

      <h2>{season} season</h2>
      {days.length === 0 ? (
        <div className="s-card">
          <p className="s-muted">No bag recorded yet this season.</p>
        </div>
      ) : (
        <>
          <div className="s-big">
            <div><strong>{days.length}</strong><span>days recorded</span></div>
            <div><strong>{total}</strong><span>birds</span></div>
            <div><strong>{ratio(t.shots, total) ?? '–'}</strong><span>shots per bird</span></div>
          </div>
          <div className="s-card">
            <table className="s-table">
              <tbody>
                {SPECIES.map((s) => (
                  <tr key={s}><td>{SPECIES_LABEL[s]}</td><td><strong>{t[s]}</strong></td></tr>
                ))}
                <tr><td>Shots fired</td><td><strong>{t.shots}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <h2>How the drives are doing</h2>
          {driveRows.length === 0 ? (
            <div className="s-card"><p className="s-muted">No days recorded drive by drive yet.</p></div>
          ) : (
            <div className="s-card s-scroll">
              <p className="s-muted s-small" style={{ marginTop: 0 }}>Best average bag first. Days recorded only as a whole-day total aren’t included here.</p>
              <table className="s-table">
                <thead>
                  <tr><th>Drive</th><th>Done</th><th>Avg birds</th><th>Avg shots</th><th>Shots / bird</th><th>Total birds</th></tr>
                </thead>
                <tbody>
                  {driveRows.map((d) => (
                    <tr key={d.drive_id}>
                      <td>{d.name}{!d.active && <span className="s-muted s-small"> (retired)</span>}</td>
                      <td>{d.times}</td>
                      <td><strong>{(d.b / d.times).toFixed(1)}</strong></td>
                      <td>{(d.shots / d.times).toFixed(1)}</td>
                      <td>{ratio(d.shots, d.b) ?? '–'}</td>
                      <td>{d.b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h2>Day by day</h2>
          <div className="s-card s-scroll">
            <table className="s-table">
              <thead>
                <tr><th>Day</th><th>Shots</th><th>Birds</th><th>Shots / bird</th></tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.date_id}>
                    <td>
                      <Link href={`/shoot/date/${d.date_id}`}>{prettyDate(d.shoot_date)}</Link>
                      <div className="s-muted s-small">{d.mode === 'drives' ? `${d.drives_done} drive${d.drives_done === 1 ? '' : 's'}` : 'Whole day'}</div>
                    </td>
                    <td>{d.shots}</td>
                    <td><strong>{birds(d)}</strong></td>
                    <td>{ratio(d.shots, birds(d)) ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {isAdmin(me) && (
        <p className="s-small" style={{ marginTop: 16 }}>
          <Link href="/shoot/drives">Set up drives ›</Link>
        </p>
      )}
      <Nav me={me} active="stats" />
    </main>
  )
}
