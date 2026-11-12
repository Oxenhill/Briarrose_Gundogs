import Link from 'next/link'
import { requireAdmin } from '@/shoot/auth'
import { drives } from '@/shoot/bag'
import { DriveManager } from '@/shoot/ui/bag'
import { Nav } from '@/shoot/ui/nav'

export default async function DrivesPage() {
  const me = await requireAdmin()
  const list = await drives(true)
  return (
    <main className="s-main">
      <p>
        <Link href="/shoot/calendar">‹ Add dates</Link>
      </p>
      <h1>Drives</h1>
      <p className="s-muted">Set these up once. Put them in the order they’re usually done — that’s the order they appear when recording the bag.</p>
      <DriveManager drives={list.map((d) => ({ id: d.id, name: d.name, active: d.active, times_done: d.times_done }))} />
      <Nav me={me} active="calendar" />
    </main>
  )
}
