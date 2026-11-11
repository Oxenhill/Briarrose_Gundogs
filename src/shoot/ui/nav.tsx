import Link from 'next/link'
import { isAdmin, type Person } from '../auth'

type Tab = 'dates' | 'calendar' | 'people' | 'invite' | 'me'

const icons: Record<Tab, React.ReactNode> = {
  dates: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M16.5 14.5c2.6.2 4.4 2 5 4.5" /></svg>
  ),
  invite: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  ),
  me: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.3-6 8-6s7 2 8 6" /></svg>
  ),
}

export function Nav({ me, active }: { me: Person; active: Tab }) {
  const admin = isAdmin(me)
  const tabs: { tab: Tab; href: string; label: string }[] = [
    { tab: 'dates', href: '/shoot', label: 'Shoot days' },
    ...(admin
      ? [
          { tab: 'calendar' as Tab, href: '/shoot/calendar', label: 'Add dates' },
          { tab: 'people' as Tab, href: '/shoot/people', label: 'People' },
          { tab: 'invite' as Tab, href: '/shoot/invite', label: 'Invite' },
        ]
      : []),
    { tab: 'me', href: '/shoot/me', label: 'My details' },
  ]
  return (
    <nav className="s-nav" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.tab} href={t.href} aria-current={t.tab === active ? 'page' : undefined}>
          {icons[t.tab]}
          {t.label}
        </Link>
      ))}
    </nav>
  )
}
