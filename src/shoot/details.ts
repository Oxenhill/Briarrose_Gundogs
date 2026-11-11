import { normaliseMobile, type Team } from './util'

export type Details = {
  full_name: string
  mobile: string
  email: string | null
  usual_team: Team
  can_do_other: boolean
  emergency_name: string
  emergency_relationship: string | null
  emergency_phone: string
  is_under_18: boolean
  guardian_name: string | null
  guardian_phone: string | null
  guardian_consent: boolean
  first_aider: boolean
  first_aid_expiry: string | null
  first_aid_notes: string | null
  first_aid_notes_consent: boolean
}

const s = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()
const b = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true'

/** Reads and checks the "your details" fields shared by the join form and My details. */
export function parseDetails(fd: FormData): { ok: true; d: Details } | { ok: false; error: string } {
  const full_name = s(fd, 'full_name').replace(/\s+/g, ' ')
  if (full_name.length < 2 || !full_name.includes(' ')) return { ok: false, error: 'Please enter your first name and surname.' }
  if (full_name.length > 80) return { ok: false, error: 'That name is too long.' }

  const mobile = normaliseMobile(s(fd, 'mobile'))
  if (!mobile) return { ok: false, error: 'Please enter a UK mobile number, e.g. 07700 900123.' }

  const emailRaw = s(fd, 'email')
  if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) return { ok: false, error: 'That email address doesn’t look right.' }

  const team = s(fd, 'usual_team')
  if (team !== 'beater' && team !== 'picker') return { ok: false, error: 'Please choose your usual team.' }

  const emergency_name = s(fd, 'emergency_name')
  const emergency_phone = normaliseMobile(s(fd, 'emergency_phone')) || s(fd, 'emergency_phone').replace(/[^\d ]/g, '')
  if (!emergency_name) return { ok: false, error: 'Please add an emergency contact name.' }
  if (emergency_phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Please add a phone number for your emergency contact.' }

  const is_under_18 = b(fd, 'is_under_18')
  const guardian_name = s(fd, 'guardian_name') || null
  const guardian_phone = s(fd, 'guardian_phone') ? normaliseMobile(s(fd, 'guardian_phone')) || s(fd, 'guardian_phone') : null
  const guardian_consent = b(fd, 'guardian_consent')
  if (is_under_18) {
    if (!guardian_name || !guardian_phone) return { ok: false, error: 'Under 18s need a parent or guardian’s name and phone number.' }
    if (!guardian_consent) return { ok: false, error: 'A parent or guardian needs to tick to agree to these details being held.' }
  }

  const first_aider = b(fd, 'first_aider')
  const first_aid_expiry = s(fd, 'first_aid_expiry') || null
  if (first_aider && !first_aid_expiry) return { ok: false, error: 'Please add the date your first-aid certificate runs out.' }
  if (first_aid_expiry && !/^\d{4}-\d{2}-\d{2}$/.test(first_aid_expiry)) return { ok: false, error: 'That certificate date doesn’t look right.' }

  const first_aid_notes = s(fd, 'first_aid_notes').slice(0, 500) || null
  const first_aid_notes_consent = b(fd, 'first_aid_notes_consent')
  if (first_aid_notes && !first_aid_notes_consent)
    return { ok: false, error: 'Please tick to agree before adding first-aid information, or leave that box empty.' }

  return {
    ok: true,
    d: {
      full_name,
      mobile,
      email: emailRaw || null,
      usual_team: team,
      can_do_other: b(fd, 'can_do_other'),
      emergency_name: emergency_name.slice(0, 80),
      emergency_relationship: s(fd, 'emergency_relationship').slice(0, 40) || null,
      emergency_phone,
      is_under_18,
      guardian_name: is_under_18 ? guardian_name : null,
      guardian_phone: is_under_18 ? guardian_phone : null,
      guardian_consent: is_under_18 && guardian_consent,
      first_aider,
      first_aid_expiry: first_aider ? first_aid_expiry : null,
      first_aid_notes,
      first_aid_notes_consent: !!first_aid_notes && first_aid_notes_consent,
    },
  }
}
