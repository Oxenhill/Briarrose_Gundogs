import { requireAdmin } from '@/shoot/auth'
import { allDateIsos } from '@/shoot/data'
import { todayUK } from '@/shoot/util'
import { CalendarGrid } from '@/shoot/ui/calendar'
import { Nav } from '@/shoot/ui/nav'

export default async function CalendarPage() {
  const me = await requireAdmin()
  const dates = await allDateIsos()
  return (
    <main className="s-main">
      <h1>Add shoot days</h1>
      <p className="s-muted">Tap a day to make it a shoot day. Tap it again to take it off.</p>
      <CalendarGrid dates={dates} today={todayUK()} />
      <p className="s-muted s-small">
        Green = shoot day. Red and crossed out = cancelled (people had already said they were coming; tap to bring it back).
      </p>
      <a href="/shoot/drives" className="s-btn ghost full" style={{ marginTop: 8 }}>Set up drives</a>
      <Nav me={me} active="calendar" />
    </main>
  )
}
