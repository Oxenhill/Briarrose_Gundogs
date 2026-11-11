import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canMakeAdmin, canSetKeeper, isKeeper, requireAdmin, type Person } from '@/shoot/auth'
import { getPerson } from '@/shoot/data'
import { RemoveButton, ResetLinkButton, RoleControl } from '@/shoot/ui/admin'
import { Nav } from '@/shoot/ui/nav'
import { ROLE_LABEL, TEAM_LABEL, firstAiderCurrent, prettyDate, prettyPhone, whatsappNumber, type Role } from '@/shoot/util'

function roleOptions(me: Person, target: Person): Role[] {
  if (canSetKeeper(me)) return ['keeper', 'underkeeper', 'admin', 'deputy', 'member']
  if (isKeeper(target) || target.is_owner) return []
  if (canMakeAdmin(me)) return ['admin', 'deputy', 'member']
  if (target.role === 'admin') return []
  return ['deputy', 'member']
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <li>
      <div className="s-grow">
        <div className="s-muted s-small">{label}</div>
        <div>{children}</div>
      </div>
    </li>
  )
}

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const p = await getPerson(id)
  if (!p) notFound()
  const options = roleOptions(me, p)
  const canRemove = p.id !== me.id && !p.is_owner && (!isKeeper(p) || me.is_owner) && (p.role !== 'admin' || canMakeAdmin(me))

  return (
    <main className="s-main">
      <p>
        <Link href="/shoot/people">‹ People</Link>
      </p>
      <h1>{p.full_name}</h1>
      <span className="s-badges">
        {p.role !== 'member' && <span className="s-badge">{ROLE_LABEL[p.role]}</span>}
        {p.is_owner && <span className="s-badge">System owner</span>}
        {firstAiderCurrent(p) && <span className="s-badge fa">First aider</span>}
        {p.is_under_18 && <span className="s-badge u18">Under 18</span>}
        {p.locked && <span className="s-badge u18">Locked — send a reset link</span>}
      </span>

      <div className="s-row" style={{ marginTop: 12 }}>
        <a className="s-btn s-grow" href={`tel:${p.mobile}`}>Call</a>
        <a className="s-btn wa s-grow" href={`https://wa.me/${whatsappNumber(p.mobile)}`} target="_blank" rel="noopener">WhatsApp</a>
      </div>

      <div className="s-card">
        <ul className="s-list">
          <Row label="Mobile">{prettyPhone(p.mobile)}</Row>
          {p.email && <Row label="Email"><a href={`mailto:${p.email}`}>{p.email}</a></Row>}
          <Row label="Team">
            {TEAM_LABEL[p.usual_team]}
            {p.can_do_other ? ' (can do both)' : ''}
          </Row>
          <Row label="Emergency contact">
            {p.emergency_name}
            {p.emergency_relationship ? ` (${p.emergency_relationship})` : ''} ·{' '}
            <a href={`tel:${p.emergency_phone.replace(/\s/g, '')}`}>{prettyPhone(p.emergency_phone)}</a>
          </Row>
          {p.is_under_18 && (
            <Row label="Parent or guardian">
              {p.guardian_name} · <a href={`tel:${(p.guardian_phone || '').replace(/\s/g, '')}`}>{prettyPhone(p.guardian_phone || '')}</a>
            </Row>
          )}
          <Row label="First aid">
            {p.first_aider && p.first_aid_expiry
              ? `${firstAiderCurrent(p) ? 'Trained first aider' : 'Certificate expired'} — runs out ${prettyDate(p.first_aid_expiry, { long: true })}`
              : 'Not a first aider'}
          </Row>
          {p.first_aid_notes && <Row label="First-aid notes">{p.first_aid_notes}</Row>}
        </ul>
      </div>

      {options.length > 0 && p.id !== me.id && (
        <div className="s-card">
          <RoleControl personId={p.id} role={p.role} options={options} />
          <p className="s-muted s-small">
            Deputies record the bag and post notices. Admins also add dates, invite people and see everyone’s details.
          </p>
        </div>
      )}

      <div className="s-card">
        <h2 style={{ marginTop: 0 }}>Forgotten PIN or locked out?</h2>
        <ResetLinkButton personId={p.id} name={p.full_name} />
      </div>

      {canRemove && <RemoveButton personId={p.id} name={p.full_name} />}
      <Nav me={me} active="people" />
    </main>
  )
}
