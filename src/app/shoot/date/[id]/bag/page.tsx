import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { isAdmin, isDeputy, requireMember } from '@/shoot/auth'
import { dayBag, drives } from '@/shoot/bag'
import { one } from '@/shoot/db'
import { BagRecorder } from '@/shoot/ui/bag'
import { Nav } from '@/shoot/ui/nav'
import { prettyDate, todayUK } from '@/shoot/util'

export default async function RecordBagPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireMember()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  if (!isDeputy(me)) redirect(`/shoot/date/${id}`)
  const date = await one<{ shoot_date: string; cancelled: boolean }>('select shoot_date, cancelled from shoot_dates where id = $1', [id])
  if (!date) notFound()
  const [bag, list] = await Promise.all([dayBag(id), drives(true)])
  const used = new Set(bag.rows.map((r) => r.drive_id).filter(Boolean))
  const options = list.filter((d) => d.active || used.has(d.id)).map((d) => ({ id: d.id, name: d.name }))
  const future = date.shoot_date > todayUK()

  return (
    <main className="s-main">
      <p>
        <Link href={`/shoot/date/${id}`}>‹ {prettyDate(date.shoot_date)}</Link>
      </p>
      <h1>Record the bag</h1>
      <p className="s-muted">{prettyDate(date.shoot_date, { long: true })}</p>
      {date.cancelled ? (
        <div className="s-alert error">This day was cancelled.</div>
      ) : future ? (
        <div className="s-alert">You can record the bag on the day or afterwards.</div>
      ) : (
        <BagRecorder
          dateId={id}
          dateLabel={prettyDate(date.shoot_date)}
          drives={options}
          initialMode={bag.mode}
          initialRows={bag.rows.map((r) => ({
            drive_id: r.drive_id, shots: r.shots, pheasant: r.pheasant, partridge: r.partridge, duck: r.duck,
            pigeon: r.pigeon, other: r.other, other_note: r.other_note,
          }))}
          isAdmin={isAdmin(me)}
        />
      )}
      <Nav me={me} active="dates" />
    </main>
  )
}
