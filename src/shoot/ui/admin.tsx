'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  approvePerson,
  cancelAdminInvite,
  createAdminInvite,
  createInvite,
  createResetLink,
  declinePerson,
  newGroupLink,
  removePerson,
  setGroupApproval,
  setRole,
} from '../actions'
import { ROLE_LABEL, TEAM_LABEL, firstAiderCurrent, prettyDate, prettyPhone, whatsappShare, type Role, type Team } from '../util'

function ShareLink({ url, message, label }: { url: string; message: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div>
      <div className="s-copy">{url}</div>
      <div className="s-row">
        <a className="s-btn wa s-grow" href={whatsappShare(`${message}\n${url}`)} target="_blank" rel="noopener">
          {label}
        </a>
        <button
          type="button"
          className="s-btn ghost"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
            } catch {}
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export function InvitePanel() {
  const [url, setUrl] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="s-card">
      <h2 style={{ marginTop: 0 }}>Invite one person</h2>
      <p className="s-muted">Makes a link for one person. It works once and lasts 14 days. They go straight in, no approval needed.</p>
      {url ? (
        <>
          <ShareLink url={url} label="Send by WhatsApp" message="Here’s your link to join the WGSC beating and picking-up team app:" />
          <button type="button" className="s-btn ghost full" style={{ marginTop: 10 }} onClick={() => setUrl(null)}>
            Invite someone else
          </button>
        </>
      ) : (
        <button type="button" className="s-btn full" disabled={pending} onClick={() => start(async () => setUrl((await createInvite())?.url || null))}>
          {pending ? 'Making link…' : 'Invite someone'}
        </button>
      )}
    </div>
  )
}

export function AdminInvitePanel({ active, expires }: { active: boolean; expires: string | null }) {
  const router = useRouter()
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  return (
    <div className="s-card">
      <h2 style={{ marginTop: 0 }}>Admin link</h2>
      <p className="s-muted">
        One link for your admins. Everyone who joins with it becomes an admin: they can add dates, invite people, record the bag and see everyone’s
        details. It lasts 7 days. Only send it to the people you want as admins.
      </p>
      {url ? (
        <ShareLink url={url} label="Send by WhatsApp" message="Here’s your link to join the WGSC team app as an admin:" />
      ) : (
        <>
          {active && <div className="s-alert">An admin link is active until {expires ? prettyDate(expires) : ''}. Making a new one stops the old one working.</div>}
          <button
            type="button"
            className="s-btn full"
            disabled={pending}
            onClick={() => start(async () => { const r = await createAdminInvite(); if (r?.error) setErr(r.error); else setUrl(r?.url || null) })}
          >
            {pending ? 'Making link…' : active ? 'Make a new admin link' : 'Make admin link'}
          </button>
        </>
      )}
      {(active || url) && (
        <button
          type="button"
          className="s-btn danger full"
          style={{ marginTop: 8 }}
          disabled={pending}
          onClick={() => confirm('Stop the admin link working?') && start(async () => { await cancelAdminInvite(); setUrl(null); router.refresh() })}
        >
          Stop the admin link
        </button>
      )}
      {err && <div className="s-alert error">{err}</div>}
      <p className="s-muted s-small">Someone already in the app? Go to People, tap their name and choose Admin instead.</p>
    </div>
  )
}

export function GroupLinkPanel({ url, needsApproval }: { url: string; needsApproval: boolean }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="s-card">
      <h2 style={{ marginTop: 0 }}>WhatsApp group link</h2>
      <p className="s-muted">One link for the whole group. Anyone with it can join.</p>
      <ShareLink url={url} label="Share to WhatsApp" message="Join the WGSC beating and picking-up team app — add your details and say which shoot days you can do:" />
      <label className="s-check" style={{ marginTop: 16 }}>
        <input
          type="checkbox"
          checked={needsApproval}
          disabled={pending}
          onChange={(e) => start(async () => { await setGroupApproval(e.target.checked); router.refresh() })}
        />
        <span>
          <strong>Needs approval</strong>
          <br />
          <span className="s-muted">{needsApproval ? 'On: new people wait until James or an admin approves them.' : 'Off: anyone with the link goes straight in.'}</span>
        </span>
      </label>
      <button
        type="button"
        className="s-btn danger full"
        disabled={pending}
        onClick={() => {
          if (confirm('Make a new group link? The old one will stop working straight away.')) start(async () => { await newGroupLink(); router.refresh() })
        }}
      >
        Make new link (stops the old one)
      </button>
    </div>
  )
}

export function ApproveButtons({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <div className="s-row">
      <button type="button" className="s-btn small" disabled={pending} onClick={() => start(async () => { await approvePerson(id); router.refresh() })}>Approve</button>
      <button
        type="button"
        className="s-btn danger small"
        disabled={pending}
        onClick={() => confirm('Decline and delete this sign-up?') && start(async () => { await declinePerson(id); router.refresh() })}
      >
        Decline
      </button>
    </div>
  )
}

export function ResetLinkButton({ personId, name }: { personId: string; name: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [pending, start] = useTransition()
  if (url) return <ShareLink url={url} label={`Send to ${name.split(' ')[0]} by WhatsApp`} message="Here’s a link to choose a new PIN for the WGSC team app:" />
  return (
    <>
      <button
        type="button"
        className="s-btn ghost full"
        disabled={pending}
        onClick={() => start(async () => { const r = await createResetLink(personId); if (r?.error) setErr(r.error); else setUrl(r?.url || null) })}
      >
        Make a PIN reset link
      </button>
      {err && <div className="s-alert error">{err}</div>}
    </>
  )
}

export function RoleControl({ personId, role, options }: { personId: string; role: Role; options: Role[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  return (
    <div className="s-field">
      <span>Role</span>
      <div className="s-tabs" style={{ flexWrap: 'wrap' }}>
        {options.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={r === role}
            disabled={pending}
            onClick={() =>
              r !== role &&
              start(async () => {
                setErr(null)
                const res = await setRole(personId, r)
                if (res.error) setErr(res.error)
                router.refresh()
              })
            }
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>
      {err && <div className="s-alert error">{err}</div>}
    </div>
  )
}

export function RemoveButton({ personId, name }: { personId: string; name: string }) {
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)
  return (
    <>
      <button
        type="button"
        className="s-btn danger full"
        disabled={pending}
        onClick={() =>
          confirm(`Remove ${name} and delete all their details? This can’t be undone.`) &&
          start(async () => { const r = await removePerson(personId); if (r?.error) setErr(r.error) })
        }
      >
        Remove from the team
      </button>
      {err && <div className="s-alert error">{err}</div>}
    </>
  )
}

export type PeopleRow = {
  id: string
  full_name: string
  mobile: string
  usual_team: Team
  can_do_other: boolean
  role: Role
  first_aider: boolean
  first_aid_expiry: string | null
  is_under_18: boolean
}

type Filter = 'beater' | 'picker' | 'both' | 'fa' | 'all'

export function PeopleList({ people }: { people: PeopleRow[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const list = useMemo(() => {
    const s = search.trim().toLowerCase()
    return people.filter((p) => {
      if (s && !p.full_name.toLowerCase().includes(s) && !p.mobile.includes(s.replace(/\s/g, ''))) return false
      if (filter === 'beater') return p.usual_team === 'beater' || p.can_do_other
      if (filter === 'picker') return p.usual_team === 'picker' || p.can_do_other
      if (filter === 'both') return p.can_do_other
      if (filter === 'fa') return firstAiderCurrent(p)
      return true
    })
  }, [people, filter, search])

  const tabs: [Filter, string][] = [
    ['all', `Everyone (${people.length})`],
    ['beater', 'Beaters'],
    ['picker', 'Pickers-up'],
    ['both', 'Can do both'],
    ['fa', 'First aiders'],
  ]

  return (
    <>
      <label className="s-field">
        <span className="sr-only" style={{ position: 'absolute', left: -9999 }}>Search</span>
        <input type="text" placeholder="Search by name or number" value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      <div className="s-tabs">
        {tabs.map(([f, label]) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>
      <div className="s-card">
        {list.length === 0 && <p className="s-muted">Nobody here yet.</p>}
        <ul className="s-list">
          {list.map((p) => (
            <li key={p.id}>
              <Link className="s-link" href={`/shoot/people/${p.id}`}>
                <div className="s-grow">
                  <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                  <div className="s-muted s-small">
                    {TEAM_LABEL[p.usual_team]}
                    {p.can_do_other ? ' · can do both' : ''} · {prettyPhone(p.mobile)}
                  </div>
                  <span className="s-badges">
                    {p.role !== 'member' && <span className="s-badge">{ROLE_LABEL[p.role]}</span>}
                    {firstAiderCurrent(p) && <span className="s-badge fa">First aider</span>}
                    {p.is_under_18 && <span className="s-badge u18">Under 18</span>}
                  </span>
                </div>
              </Link>
              <a className="s-btn ghost small" href={`tel:${p.mobile}`} aria-label={`Call ${p.full_name}`}>Call</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

