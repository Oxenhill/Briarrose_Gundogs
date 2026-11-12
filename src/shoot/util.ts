// Small pure helpers shared by server and client code. No secrets, no DB.

export const CLUB_NAME = 'Westerham Game Shooting Club'
export const APP_NAME = 'WGSC Team'
export const BASE = '/shoot'

export type Team = 'beater' | 'picker'
export type Role = 'keeper' | 'underkeeper' | 'admin' | 'deputy' | 'member'
export type Answer = 'yes' | 'maybe' | 'no'

export const TEAM_LABEL: Record<Team, string> = { beater: 'Beater', picker: 'Picker-up' }
export const TEAMS_LABEL: Record<Team, string> = { beater: 'Beaters', picker: 'Pickers-up' }
export const ROLE_LABEL: Record<Role, string> = {
  keeper: 'Keeper',
  underkeeper: 'Underkeeper',
  admin: 'Admin',
  deputy: 'Deputy',
  member: 'Member',
}

/** UK mobile normalised to 07xxxxxxxxx. Returns null if it doesn't look like a UK number. */
export function normaliseMobile(raw: string): string | null {
  let d = (raw || '').replace(/[^\d+]/g, '')
  if (d.startsWith('+44')) d = '0' + d.slice(3)
  else if (d.startsWith('0044')) d = '0' + d.slice(4)
  else if (d.startsWith('44') && d.length === 12) d = '0' + d.slice(2)
  d = d.replace(/\D/g, '')
  if (!/^0\d{9,10}$/.test(d)) return null
  return d
}

export function prettyPhone(p: string): string {
  const d = (p || '').replace(/\D/g, '')
  if (d.length === 11) return `${d.slice(0, 5)} ${d.slice(5)}`
  return p
}

/** wa.me wants international format with no plus. */
export function whatsappNumber(p: string): string {
  const d = (p || '').replace(/\D/g, '')
  return d.startsWith('0') ? '44' + d.slice(1) : d
}

export function whatsappShare(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** "Oliver Ringrose" -> "Oliver R." — what other members see. */
export function shortName(full: string): string {
  const parts = (full || '').trim().split(/\s+/)
  if (parts.length < 2) return parts[0] || ''
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

/** Today's date in the UK as YYYY-MM-DD. */
export function todayUK(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date())
}

/** "Sat 6 Dec" (adds the year if it isn't this year). */
export function prettyDate(iso: string, opts: { long?: boolean } = {}): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12))
  const thisYear = Number(todayUK().slice(0, 4))
  return new Intl.DateTimeFormat('en-GB', {
    weekday: opts.long ? 'long' : 'short',
    day: 'numeric',
    month: opts.long ? 'long' : 'short',
    year: y !== thisYear || opts.long ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(dt)
}

export function firstAiderCurrent(p: { first_aider: boolean; first_aid_expiry: string | null }, onDate?: string): boolean {
  if (!p.first_aider || !p.first_aid_expiry) return false
  return p.first_aid_expiry >= (onDate || todayUK())
}
