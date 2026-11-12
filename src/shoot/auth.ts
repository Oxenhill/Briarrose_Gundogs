import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { one, q } from './db'
import { BASE, type Role, type Team } from './util'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>

export const SESSION_COOKIE = 'wgsc_session'
const SESSION_DAYS = 180
export const MAX_PIN_TRIES = 5

export type Person = {
  id: string
  full_name: string
  mobile: string
  email: string | null
  usual_team: Team
  can_do_other: boolean
  role: Role
  is_owner: boolean
  status: 'pending' | 'active'
  locked: boolean
  emergency_name: string
  emergency_relationship: string | null
  emergency_phone: string
  is_under_18: boolean
  guardian_name: string | null
  guardian_phone: string | null
  first_aider: boolean
  first_aid_expiry: string | null
  first_aid_notes: string | null
  created_at: string
}

export const PERSON_COLS = `id, full_name, mobile, email, usual_team, can_do_other, role, is_owner, status, locked,
  emergency_name, emergency_relationship, emergency_phone, is_under_18, guardian_name, guardian_phone,
  first_aider, first_aid_expiry, first_aid_notes, created_at`

// ---------- permissions (always checked server-side, inside every action) ----------
export const isKeeper = (p: Person) => p.role === 'keeper' || p.role === 'underkeeper'
export const isAdmin = (p: Person) => p.is_owner || isKeeper(p) || p.role === 'admin'
export const isDeputy = (p: Person) => isAdmin(p) || p.role === 'deputy'
export const canMakeAdmin = (p: Person) => p.is_owner || isKeeper(p)
export const canSetKeeper = (p: Person) => p.is_owner

// ---------- PINs ----------
/** New PINs are 4 digits. */
export function validPin(pin: string) {
  return /^\d{4}$/.test(pin)
}

/** Sign-in also accepts the 6-digit PINs chosen before the switch to 4 digits. */
export function validSignInPin(pin: string) {
  return /^(\d{4}|\d{6})$/.test(pin)
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(pin, salt, 32)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

export async function checkPin(pin: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const hash = await scrypt(pin, Buffer.from(saltHex, 'hex'), 32)
  const expected = Buffer.from(hashHex, 'hex')
  return expected.length === hash.length && timingSafeEqual(expected, hash)
}

// ---------- tokens ----------
export function newToken(): string {
  return randomBytes(24).toString('base64url')
}
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ---------- sessions ----------
export async function startSession(personId: string) {
  const token = newToken()
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000)
  await q('insert into shoot_sessions (token_hash, person_id, expires_at) values ($1, $2, $3)', [
    hashToken(token),
    personId,
    expires,
  ])
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  })
}

export async function endSession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) await q('delete from shoot_sessions where token_hash = $1', [hashToken(token)])
  jar.delete(SESSION_COOKIE)
}

/** The signed-in person, or null. Pending (unapproved) people are returned too — callers decide. */
export async function currentPerson(): Promise<Person | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const p = await one<Person>(
    `select ${PERSON_COLS.split(',').map((c) => 'p.' + c.trim()).join(', ')}
       from shoot_sessions s join shoot_people p on p.id = s.person_id
      where s.token_hash = $1 and s.expires_at > now() and not p.locked`,
    [hashToken(token)],
  )
  if (p) {
    // Keeps the two-season inactivity clock honest; cheap and fire-and-forget.
    q("update shoot_people set last_active_at = now() where id = $1 and last_active_at < now() - interval '1 day'", [
      p.id,
    ]).catch(() => {})
  }
  return p
}

/** For pages and actions that need an approved member. */
export async function requireMember(): Promise<Person> {
  const p = await currentPerson()
  if (!p) redirect(BASE)
  if (p.status !== 'active') redirect(BASE)
  return p
}

export async function requireAdmin(): Promise<Person> {
  const p = await requireMember()
  if (!isAdmin(p)) redirect(BASE)
  return p
}
