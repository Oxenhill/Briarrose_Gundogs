import Link from 'next/link'
import { currentPerson, isAdmin, isKeeper } from '@/shoot/auth'
import { pastDates, upcomingDates } from '@/shoot/data'
import { q } from '@/shoot/db'
import { SignInForm } from '@/shoot/ui/forms'
import { DateCard } from '@/shoot/ui/datecard'
import { Nav } from '@/shoot/ui/nav'
import { signOut } from '@/shoot/actions'

export default async function ShootHome({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const me = await currentPerson()
  const { deleted } = await searchParams

  if (!me) {
    return (
      <main className="s-main">
        {deleted && <div className="s-alert ok">Your account and details have been deleted.</div>}
        <SignInForm />
        <p className="s-muted s-small">
          <Link href="/shoot/privacy">How your information is used</Link>
        </p>
      </main>
    )
  }

  if (me.status !== 'active') {
    return (
      <main className="s-main">
        <div className="s-card">
          <h1>Nearly there, {me.full_name.split(' ')[0]}</h1>
          <p>Your details are saved. James or an admin needs to approve you before you can see the shoot days. Check back soon.</p>
          <form action={signOut}>
            <button className="s-btn ghost full">Sign out</button>
          </form>
        </div>
      </main>
    )
  }

  const admin = isAdmin(me)
  const [dates, past] = await Promise.all([upcomingDates(me.id), pastDates(me.id)])
  const pending = admin
    ? await q<{ n: number }>("select count(*)::int as n from shoot_people where status = 'pending'")
    : [{ n: 0 }]

  return (
    <main className="s-main">
      <h1>Shoot days</h1>
      {pending[0].n > 0 && (
        <Link href="/shoot/people" className="s-alert" style={{ display: 'block', textDecoration: 'none' }}>
          {pending[0].n} new sign-up{pending[0].n === 1 ? '' : 's'} waiting for approval ›
        </Link>
      )}
      {dates.length === 0 ? (
        <div className="s-card">
          <p>No shoot days added yet.</p>
          {admin && (
            <Link href="/shoot/calendar" className="s-btn full">
              Add shoot days
            </Link>
          )}
        </div>
      ) : (
        <>
          {!isKeeper(me) && <p className="s-muted">Tap Yes, Maybe or No for each day. You can change it any time.</p>}
          {dates.map((d) => (
            <DateCard key={d.id} d={d} admin={admin} canAnswer={!isKeeper(me)} />
          ))}
        </>
      )}
      {past.length > 0 && (
        <details className="s-card">
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Past shoot days ({past.length})</summary>
          <ul className="s-list">
            {past.map((d) => (
              <li key={d.id}>
                <Link className="s-link" href={`/shoot/date/${d.id}`}>
                  <span className="s-grow">{d.shoot_date.split('-').reverse().join('/')}</span>
                  <span className="s-muted s-small">{d.cancelled ? 'Cancelled' : `${d.beaters} beaters · ${d.pickers} pickers-up`}</span>
                </Link>
              </li>
            ))}
          </ul>
        </details>
      )}
      <Nav me={me} active="dates" />
    </main>
  )
}
