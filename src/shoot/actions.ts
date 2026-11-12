'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { one, q, pool, ready } from './db'
import {
  MAX_PIN_TRIES,
  canMakeAdmin,
  canSetKeeper,
  checkPin,
  currentPerson,
  endSession,
  hashPin,
  hashToken,
  isAdmin,
  isKeeper,
  newToken,
  requireAdmin,
  requireMember,
  startSession,
  validPin,
  validSignInPin,
  type Person,
} from './auth'
import { parseDetails } from './details'
import { BASE, normaliseMobile, todayUK, type Role } from './util'

export type FormState = { error?: string; ok?: string; url?: string } | undefined

const refresh = () => revalidatePath(BASE, 'layout')

async function origin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') || h.get('host') || 'shoot.briarrosegundogs.co.uk'
  const proto = h.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

// ------------------------------------------------------------------ sign in / out

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  const mobile = normaliseMobile(String(fd.get('mobile') || ''))
  const pin = String(fd.get('pin') || '').trim()
  if (!mobile || !validSignInPin(pin)) return { error: 'Enter your mobile number and your 4-digit PIN.' }

  const p = await one<{ id: string; pin_hash: string; failed_pins: number; locked: boolean }>(
    'select id, pin_hash, failed_pins, locked from shoot_people where mobile = $1',
    [mobile],
  )
  if (!p) return { error: 'That mobile number or PIN isn’t right.' }
  if (p.locked) return { error: 'This account is locked after too many wrong PINs. Ask James or an admin to send you a reset link.' }

  if (!(await checkPin(pin, p.pin_hash))) {
    const tries = p.failed_pins + 1
    await q('update shoot_people set failed_pins = $2, locked = $3 where id = $1', [p.id, tries, tries >= MAX_PIN_TRIES])
    if (tries >= MAX_PIN_TRIES)
      return { error: 'Too many wrong PINs — this account is now locked. Ask James or an admin to send you a reset link.' }
    return { error: `That mobile number or PIN isn’t right. ${MAX_PIN_TRIES - tries} tries left.` }
  }

  await q('update shoot_people set failed_pins = 0, last_active_at = now() where id = $1', [p.id])
  await startSession(p.id)
  redirect(BASE)
}

export async function signOut() {
  await endSession()
  redirect(BASE)
}

// ------------------------------------------------------------------ joining

type LinkInfo =
  | { kind: 'invite' | 'owner' | 'admin'; tokenHash: string }
  | { kind: 'group'; needsApproval: boolean }

export async function lookupJoinToken(token: string): Promise<LinkInfo | null> {
  if (!token || token.length > 100) return null
  const link = await one<{ kind: string; token_hash: string }>(
    `select kind, token_hash from shoot_links
      where token_hash = $1 and expires_at > now()
        and ((kind in ('invite','owner') and used_at is null) or kind = 'admin')`,
    [hashToken(token)],
  )
  if (link) return { kind: link.kind as 'invite' | 'owner' | 'admin', tokenHash: link.token_hash }
  const s = await one<{ group_needs_approval: boolean }>('select group_needs_approval from shoot_settings where group_token = $1', [token])
  if (s) return { kind: 'group', needsApproval: s.group_needs_approval }
  return null
}

export async function joinTeam(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get('token') || '')
  const link = await lookupJoinToken(token)
  if (!link) return { error: 'This joining link has expired or been replaced. Ask James or an admin for a new one.' }

  const parsed = parseDetails(fd)
  if (!parsed.ok) return { error: parsed.error }
  const d = parsed.d

  const pin = String(fd.get('pin') || '').trim()
  const pin2 = String(fd.get('pin2') || '').trim()
  if (!validPin(pin)) return { error: 'Your PIN must be exactly 4 numbers.' }
  if (pin !== pin2) return { error: 'The two PINs don’t match.' }
  if (fd.get('privacy') !== 'on') return { error: 'Please tick to say you’ve read how your information is used.' }

  const exists = await one('select 1 from shoot_people where mobile = $1', [d.mobile])
  if (exists) return { error: 'That mobile number already has an account. Sign in instead, or ask an admin for a PIN reset link.' }

  const isOwner = link.kind === 'owner'
  const status = link.kind === 'group' && link.needsApproval ? 'pending' : 'active'

  await ready()
  const client = await pool().connect()
  let personId: string
  try {
    await client.query('begin')
    if (link.kind === 'invite' || link.kind === 'owner') {
      const used = await client.query('update shoot_links set used_at = now() where token_hash = $1 and used_at is null', [link.tokenHash])
      if (used.rowCount !== 1) {
        await client.query('rollback')
        return { error: 'This joining link has already been used. Ask for a new one.' }
      }
    }
    const res = await client.query(
      `insert into shoot_people (full_name, mobile, email, usual_team, can_do_other, role, is_owner, status, pin_hash,
         emergency_name, emergency_relationship, emergency_phone, is_under_18, guardian_name, guardian_phone,
         guardian_consent_at, first_aider, first_aid_expiry, first_aid_notes, first_aid_notes_consent_at, privacy_accepted_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20, now()) returning id`,
      [
        d.full_name, d.mobile, d.email, d.usual_team, d.can_do_other, isOwner || link.kind === 'admin' ? 'admin' : 'member', isOwner, status,
        await hashPin(pin), d.emergency_name, d.emergency_relationship, d.emergency_phone, d.is_under_18,
        d.guardian_name, d.guardian_phone, d.guardian_consent ? new Date() : null, d.first_aider, d.first_aid_expiry,
        d.first_aid_notes, d.first_aid_notes_consent ? new Date() : null,
      ],
    )
    personId = res.rows[0].id
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    throw e
  } finally {
    client.release()
  }

  await startSession(personId)
  redirect(BASE)
}

export async function resetPinWithLink(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get('token') || '')
  const pin = String(fd.get('pin') || '').trim()
  const pin2 = String(fd.get('pin2') || '').trim()
  if (!validPin(pin)) return { error: 'Your PIN must be exactly 4 numbers.' }
  if (pin !== pin2) return { error: 'The two PINs don’t match.' }

  const link = await one<{ person_id: string }>(
    "update shoot_links set used_at = now() where token_hash = $1 and kind = 'reset' and used_at is null and expires_at > now() returning person_id",
    [hashToken(token)],
  )
  if (!link) return { error: 'This reset link has expired or already been used. Ask James or an admin for a new one.' }
  await q('update shoot_people set pin_hash = $2, failed_pins = 0, locked = false where id = $1', [link.person_id, await hashPin(pin)])
  await q('delete from shoot_sessions where person_id = $1', [link.person_id])
  await startSession(link.person_id)
  redirect(BASE)
}

// ------------------------------------------------------------------ attendance

export async function setAnswer(fd: FormData): Promise<void> {
  const me = await requireMember()
  const dateId = String(fd.get('date_id') || '')
  const answer = String(fd.get('answer') || '')
  if (!['yes', 'maybe', 'no'].includes(answer)) return
  const date = await one<{ shoot_date: string; cancelled: boolean }>('select shoot_date, cancelled from shoot_dates where id = $1', [dateId])
  if (!date || date.cancelled || date.shoot_date < todayUK()) return

  const clamp = (v: FormDataEntryValue | null, max: number) => Math.max(0, Math.min(max, Number.parseInt(String(v ?? '0'), 10) || 0))
  const teamRaw = String(fd.get('team') || '')
  const team = teamRaw === 'beater' || teamRaw === 'picker' ? teamRaw : me.usual_team

  // A quick tap on Yes/Maybe/No keeps any plus-ones/dogs already given; the full form sends them all.
  const full = fd.get('full') === '1'
  if (full) {
    await q(
      `insert into shoot_attendance (person_id, date_id, answer, team, adults, children, plus_note, dogs, updated_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8, now())
       on conflict (person_id, date_id) do update set answer = $3, team = $4, adults = $5, children = $6, plus_note = $7, dogs = $8, updated_at = now()`,
      [me.id, dateId, answer, team, clamp(fd.get('adults'), 10), clamp(fd.get('children'), 10),
        String(fd.get('plus_note') || '').trim().slice(0, 120) || null, clamp(fd.get('dogs'), 20)],
    )
  } else {
    await q(
      `insert into shoot_attendance (person_id, date_id, answer, team, updated_at) values ($1,$2,$3,$4, now())
       on conflict (person_id, date_id) do update set answer = $3, updated_at = now()`,
      [me.id, dateId, answer, team],
    )
  }
  refresh()
}

// ------------------------------------------------------------------ dates (admins)

export async function toggleDate(iso: string): Promise<{ error?: string }> {
  const me = await requireAdmin()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return { error: 'Not a date.' }
  const existing = await one<{ id: string; cancelled: boolean; yes: number }>(
    `select d.id, d.cancelled, (select count(*)::int from shoot_attendance a where a.date_id = d.id and a.answer in ('yes','maybe')) as yes
       from shoot_dates d where d.shoot_date = $1`,
    [iso],
  )
  if (!existing) {
    if (iso < todayUK()) return { error: 'That date has already passed.' }
    await q('insert into shoot_dates (shoot_date, created_by) values ($1, $2)', [iso, me.id])
  } else if (existing.cancelled) {
    await q('update shoot_dates set cancelled = false where id = $1', [existing.id])
  } else if (existing.yes > 0) {
    // People have answered — keep it, marked cancelled, so they can see what happened.
    await q('update shoot_dates set cancelled = true where id = $1', [existing.id])
  } else {
    await q('delete from shoot_dates where id = $1', [existing.id])
  }
  refresh()
  return {}
}

export async function setDateNeeds(fd: FormData): Promise<void> {
  await requireAdmin()
  const n = (k: string) => Math.max(0, Math.min(200, Number.parseInt(String(fd.get(k) ?? ''), 10) || 0))
  await q('update shoot_dates set beaters_needed = $2, pickers_needed = $3 where id = $1', [String(fd.get('date_id')), n('beaters'), n('pickers')])
  refresh()
}

// ------------------------------------------------------------------ invites & links (admins)

export async function createInvite(): Promise<FormState> {
  const me = await requireAdmin()
  const token = newToken()
  await q("insert into shoot_links (token_hash, kind, created_by, expires_at) values ($1, 'invite', $2, now() + interval '14 days')", [
    hashToken(token),
    me.id,
  ])
  return { url: `${await origin()}${BASE}/join/${token}` }
}

/** One shared link that makes whoever joins with it an admin. Lasts 7 days; making a new one cancels the old. */
export async function createAdminInvite(): Promise<FormState> {
  const me = await requireAdmin()
  if (!canMakeAdmin(me)) return { error: 'Only James, Lewis or Oliver can make an admin link.' }
  const token = newToken()
  await q("delete from shoot_links where kind = 'admin'")
  await q("insert into shoot_links (token_hash, kind, created_by, expires_at) values ($1, 'admin', $2, now() + interval '7 days')", [
    hashToken(token),
    me.id,
  ])
  return { url: `${await origin()}${BASE}/join/${token}` }
}

export async function cancelAdminInvite(): Promise<void> {
  const me = await requireAdmin()
  if (!canMakeAdmin(me)) return
  await q("delete from shoot_links where kind = 'admin'")
  refresh()
}

export async function adminInviteStatus(): Promise<{ active: boolean; expires: string | null }> {
  await requireAdmin()
  const r = await one<{ expires_at: string }>("select expires_at from shoot_links where kind = 'admin' and expires_at > now()")
  return { active: !!r, expires: r ? new Date(r.expires_at).toISOString().slice(0, 10) : null }
}

export async function createResetLink(personId: string): Promise<FormState> {
  const me = await requireAdmin()
  const target = await one<Person>('select id, is_owner, role from shoot_people where id = $1', [personId])
  if (!target) return { error: 'Person not found.' }
  if ((target.is_owner || isKeeper(target)) && !me.is_owner && me.id !== target.id && !isKeeper(me))
    return { error: 'Only the keepers or Oliver can reset this account.' }
  const token = newToken()
  await q("delete from shoot_links where person_id = $1 and kind = 'reset' and used_at is null", [personId])
  await q(
    "insert into shoot_links (token_hash, kind, person_id, created_by, expires_at) values ($1, 'reset', $2, $3, now() + interval '7 days')",
    [hashToken(token), personId, me.id],
  )
  return { url: `${await origin()}${BASE}/reset/${token}` }
}

export async function getGroupLink(): Promise<{ url: string; needsApproval: boolean }> {
  await requireAdmin()
  let s = await one<{ group_token: string; group_needs_approval: boolean }>('select group_token, group_needs_approval from shoot_settings where id = 1')
  if (!s) {
    s = await one('insert into shoot_settings (id, group_token) values (1, $1) on conflict (id) do update set id = 1 returning group_token, group_needs_approval', [newToken()])
  }
  return { url: `${await origin()}${BASE}/join/${s!.group_token}`, needsApproval: s!.group_needs_approval }
}

export async function setGroupApproval(needs: boolean): Promise<void> {
  await requireAdmin()
  await getGroupLink()
  await q('update shoot_settings set group_needs_approval = $1 where id = 1', [needs])
  refresh()
}

export async function newGroupLink(): Promise<void> {
  await requireAdmin()
  await getGroupLink()
  await q('update shoot_settings set group_token = $1 where id = 1', [newToken()])
  refresh()
}

export async function approvePerson(id: string): Promise<void> {
  await requireAdmin()
  await q("update shoot_people set status = 'active' where id = $1", [id])
  refresh()
}

export async function declinePerson(id: string): Promise<void> {
  await requireAdmin()
  await q("delete from shoot_people where id = $1 and status = 'pending'", [id])
  refresh()
}

// ------------------------------------------------------------------ roles (admins)

export async function setRole(personId: string, role: Role): Promise<{ error?: string }> {
  const me = await requireAdmin()
  const target = await one<Person>('select id, role, is_owner from shoot_people where id = $1', [personId])
  if (!target) return { error: 'Person not found.' }
  if (!['keeper', 'underkeeper', 'admin', 'deputy', 'member'].includes(role)) return { error: 'Unknown role.' }

  const touchesKeeper = role === 'keeper' || role === 'underkeeper' || isKeeper(target)
  if (touchesKeeper && !canSetKeeper(me)) return { error: 'Only Oliver can change who is Keeper or Underkeeper.' }
  const touchesAdmin = role === 'admin' || target.role === 'admin'
  if (touchesAdmin && !canMakeAdmin(me)) return { error: 'Only James, Lewis or Oliver can make or remove admins.' }
  if (target.is_owner && !['admin', 'keeper', 'underkeeper'].includes(role))
    return { error: 'Oliver’s account must stay at admin level or above.' }

  if (role === 'keeper' || role === 'underkeeper') {
    // Only one of each: whoever held it before becomes an admin.
    await q("update shoot_people set role = 'admin' where role = $1 and id <> $2", [role, personId])
  }
  await q('update shoot_people set role = $2 where id = $1', [personId, role])
  refresh()
  return {}
}

export async function removePerson(personId: string): Promise<{ error?: string }> {
  const me = await requireAdmin()
  const target = await one<Person>('select id, role, is_owner from shoot_people where id = $1', [personId])
  if (!target) return {}
  if (target.is_owner) return { error: 'Oliver’s account can only be deleted by Oliver.' }
  if (isKeeper(target) && !me.is_owner) return { error: 'Only Oliver can remove a Keeper or Underkeeper.' }
  if (target.role === 'admin' && !canMakeAdmin(me)) return { error: 'Only James, Lewis or Oliver can remove an admin.' }
  await q('delete from shoot_people where id = $1', [personId])
  refresh()
  redirect(`${BASE}/people`)
}

// ------------------------------------------------------------------ my details

export async function updateMyDetails(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireMember()
  const parsed = parseDetails(fd)
  if (!parsed.ok) return { error: parsed.error }
  const d = parsed.d
  const clash = await one('select 1 from shoot_people where mobile = $1 and id <> $2', [d.mobile, me.id])
  if (clash) return { error: 'Another account already uses that mobile number.' }
  await q(
    `update shoot_people set full_name=$2, mobile=$3, email=$4, usual_team=$5, can_do_other=$6, emergency_name=$7,
       emergency_relationship=$8, emergency_phone=$9, is_under_18=$10, guardian_name=$11, guardian_phone=$12,
       guardian_consent_at = case when $10 then coalesce(guardian_consent_at, now()) else null end,
       first_aider=$13, first_aid_expiry=$14, first_aid_notes=$15,
       first_aid_notes_consent_at = case when $15::text is null then null else coalesce(first_aid_notes_consent_at, now()) end
     where id = $1`,
    [me.id, d.full_name, d.mobile, d.email, d.usual_team, d.can_do_other, d.emergency_name, d.emergency_relationship,
      d.emergency_phone, d.is_under_18, d.guardian_name, d.guardian_phone, d.first_aider, d.first_aid_expiry, d.first_aid_notes],
  )
  refresh()
  return { ok: 'Saved.' }
}

export async function changePin(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireMember()
  const current = String(fd.get('current') || '')
  const pin = String(fd.get('pin') || '').trim()
  const pin2 = String(fd.get('pin2') || '').trim()
  const row = await one<{ pin_hash: string }>('select pin_hash from shoot_people where id = $1', [me.id])
  if (!row || !(await checkPin(current, row.pin_hash))) return { error: 'Your current PIN isn’t right.' }
  if (!validPin(pin)) return { error: 'Your new PIN must be exactly 4 numbers.' }
  if (pin !== pin2) return { error: 'The two new PINs don’t match.' }
  await q('update shoot_people set pin_hash = $2 where id = $1', [me.id, await hashPin(pin)])
  return { ok: 'PIN changed.' }
}

export async function deleteMyAccount(_: FormState, fd: FormData): Promise<FormState> {
  const me = await currentPerson()
  if (!me) redirect(BASE)
  if (String(fd.get('confirm') || '').trim().toUpperCase() !== 'DELETE') return { error: 'Type DELETE in the box to confirm.' }
  if (isKeeper(me)) return { error: 'The Keeper and Underkeeper accounts can’t be deleted until Oliver hands the role to someone else.' }
  await endSession()
  await q('delete from shoot_people where id = $1', [me.id])
  redirect(`${BASE}?deleted=1`)
}

export async function amIAdmin(): Promise<boolean> {
  const me = await currentPerson()
  return !!me && me.status === 'active' && isAdmin(me)
}
