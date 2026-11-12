'use client'

import { startTransition, useActionState, useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import Link from 'next/link'
import {
  changePin,
  deleteMyAccount,
  joinTeam,
  resetPinWithLink,
  signIn,
  updateMyDetails,
  type FormState,
} from '../actions'
import type { Team } from '../util'

// Submit without React's automatic form reset, so a mistake never wipes what someone has typed.
const keep = (action: (fd: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const fd = new FormData(e.currentTarget)
  startTransition(() => action(fd))
}

function Msg({ state }: { state: FormState }) {
  if (state?.error) return <div className="s-alert error" role="alert">{state.error}</div>
  if (state?.ok) return <div className="s-alert ok" role="status">{state.ok}</div>
  return null
}

function PinFields({ label = 'Choose a 4-digit PIN' }: { label?: string }) {
  return (
    <>
      <label className="s-field">
        <span>{label}</span>
        <input type="password" name="pin" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="new-password" required className="s-pin" />
        <small>Four numbers you’ll remember. Don’t use your bank card PIN.</small>
      </label>
      <label className="s-field">
        <span>Type the PIN again</span>
        <input type="password" name="pin2" inputMode="numeric" pattern="\d{4}" maxLength={4} autoComplete="new-password" required className="s-pin" />
      </label>
    </>
  )
}

// ------------------------------------------------------------------ sign in

export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, undefined)
  return (
    <form onSubmit={keep(action)} className="s-card">
      <h1>Sign in</h1>
      <label className="s-field">
        <span>Your mobile number</span>
        <input type="tel" name="mobile" inputMode="tel" autoComplete="tel" required placeholder="07700 900123" />
      </label>
      <label className="s-field">
        <span>Your 4-digit PIN</span>
        <input type="password" name="pin" inputMode="numeric" pattern="\d{4}|\d{6}" maxLength={6} autoComplete="current-password" required className="s-pin" />
      </label>
      <Msg state={state} />
      <button className="s-btn full" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
      <p className="s-muted" style={{ marginTop: 14 }}>
        New to the team? Use the joining link from the WhatsApp group or from James. Forgotten your PIN? Ask James or an admin for a reset link.
      </p>
    </form>
  )
}

// ------------------------------------------------------------------ your details (join + edit)

export type DetailsDefaults = Partial<{
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
  first_aider: boolean
  first_aid_expiry: string | null
  first_aid_notes: string | null
}>

function DetailsFields({ d = {} }: { d?: DetailsDefaults }) {
  const [u18, setU18] = useState(!!d.is_under_18)
  const [fa, setFa] = useState(!!d.first_aider)
  const [notes, setNotes] = useState(d.first_aid_notes || '')
  return (
    <>
      <h2>About you</h2>
      <label className="s-field">
        <span>Full name</span>
        <input type="text" name="full_name" autoComplete="name" required defaultValue={d.full_name} />
        <small>Other members see your first name and surname initial.</small>
      </label>
      <label className="s-field">
        <span>Mobile number</span>
        <input type="tel" name="mobile" inputMode="tel" autoComplete="tel" required defaultValue={d.mobile} />
        <small>You’ll sign in with this. Only James and admins can see it.</small>
      </label>
      <label className="s-field">
        <span>Email (optional)</span>
        <input type="email" name="email" autoComplete="email" defaultValue={d.email || ''} />
      </label>

      <div className="s-field">
        <span>Your usual team</span>
        <div className="s-choice">
          <label><input type="radio" name="usual_team" value="beater" defaultChecked={d.usual_team !== 'picker'} />Beater</label>
          <label><input type="radio" name="usual_team" value="picker" defaultChecked={d.usual_team === 'picker'} />Picker-up</label>
        </div>
      </div>
      <label className="s-check">
        <input type="checkbox" name="can_do_other" defaultChecked={d.can_do_other} />
        <span>I can do the other team too if James is short</span>
      </label>

      <h2>Emergency contact</h2>
      <label className="s-check">
        <input type="checkbox" name="is_under_18" checked={u18} onChange={(e) => setU18(e.target.checked)} />
        <span>I’m under 18</span>
      </label>
      {u18 && (
        <div className="s-alert">
          <strong>Parent or guardian</strong>
          <ContactPick nameField="guardian_name" phoneField="guardian_phone" />
          <label className="s-field">
            <span>Their name</span>
            <input type="text" name="guardian_name" defaultValue={d.guardian_name || ''} required />
          </label>
          <label className="s-field">
            <span>Their phone number</span>
            <input type="tel" name="guardian_phone" inputMode="tel" defaultValue={d.guardian_phone || ''} required />
          </label>
          <label className="s-check">
            <input type="checkbox" name="guardian_consent" defaultChecked={!!d.is_under_18} required />
            <span>I am the parent or guardian and I agree to these details being held, as explained in the privacy notice.</span>
          </label>
        </div>
      )}
      <ContactPick nameField="emergency_name" phoneField="emergency_phone" />
      <label className="s-field">
        <span>{u18 ? 'Emergency contact (usually the parent or guardian)' : 'Emergency contact name'}</span>
        <input type="text" name="emergency_name" required defaultValue={d.emergency_name} />
      </label>
      <label className="s-field">
        <span>How they’re related to you (optional)</span>
        <input type="text" name="emergency_relationship" placeholder="e.g. wife, son, friend" defaultValue={d.emergency_relationship || ''} />
      </label>
      <label className="s-field">
        <span>Their phone number</span>
        <input type="tel" name="emergency_phone" inputMode="tel" required defaultValue={d.emergency_phone} />
      </label>

      <h2>First aid</h2>
      <label className="s-check">
        <input type="checkbox" name="first_aider" checked={fa} onChange={(e) => setFa(e.target.checked)} />
        <span>I’m a trained first aider</span>
      </label>
      {fa && (
        <label className="s-field">
          <span>Date my first-aid certificate runs out</span>
          <input type="date" name="first_aid_expiry" required defaultValue={d.first_aid_expiry || ''} />
        </label>
      )}
      <label className="s-field">
        <span>Anything first aiders should know about you (optional)</span>
        <textarea name="first_aid_notes" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. allergic to bee stings, carries an EpiPen" />
        <small>Only James, Lewis, admins, and deputies and first aiders on the day can see this.</small>
      </label>
      {notes.trim() && (
        <label className="s-check">
          <input type="checkbox" name="first_aid_notes_consent" defaultChecked={!!d.first_aid_notes} required />
          <span>I agree to this information being held so people can help me in an emergency. I can delete it at any time.</span>
        </label>
      )}
    </>
  )
}

// ------------------------------------------------------------------ pick from phone contacts

type PickedContact = { name?: string[]; tel?: string[] }
type ContactsNav = Navigator & { contacts?: { select: (props: string[], opts: { multiple: boolean }) => Promise<PickedContact[]> } }

function bestNumber(tels: string[] = []): string {
  const clean = tels.map((t) => t.trim()).filter(Boolean)
  return clean.find((t) => /^(\+44\s?7|07)/.test(t.replace(/[\s()-]/g, ''))) || clean[0] || ''
}

/**
 * "Choose from my contacts" — uses the phone's own contact picker. Works on Android (Chrome);
 * iPhones don't allow websites to open contacts, so the button simply doesn't appear there.
 */
function ContactPick({ nameField, phoneField }: { nameField: string; phoneField: string }) {
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setSupported(!!(navigator as ContactsNav).contacts && 'ContactsManager' in window))
    return () => cancelAnimationFrame(raf)
  }, [])
  if (!supported) return null

  async function pick(e: MouseEvent<HTMLButtonElement>) {
    const form = e.currentTarget.form
    try {
      const [c] = (await (navigator as ContactsNav).contacts!.select(['name', 'tel'], { multiple: false })) || []
      if (!c || !form) return
      const name = form.elements.namedItem(nameField) as HTMLInputElement | null
      const phone = form.elements.namedItem(phoneField) as HTMLInputElement | null
      if (name && c.name?.[0]) name.value = c.name[0]
      if (phone) phone.value = bestNumber(c.tel)
    } catch {
      // Cancelled or not allowed — nothing to do.
    }
  }

  return (
    <button type="button" className="s-btn ghost full" onClick={pick} style={{ marginTop: 8 }}>
      Choose from my contacts
    </button>
  )
}

export function JoinForm({ token, kind }: { token: string; kind: 'invite' | 'owner' | 'group' | 'admin' }) {
  const [state, action, pending] = useActionState(joinTeam, undefined)
  return (
    <form onSubmit={keep(action)}>
      <input type="hidden" name="token" value={token} />
      <div className="s-card">
        <h1>{kind === 'owner' ? 'Set up your account' : kind === 'admin' ? 'Join as an admin' : 'Join the team'}</h1>
        <p className="s-muted">Takes about two minutes. You only do this once.</p>
        <DetailsFields />
        <h2>Your PIN</h2>
        <PinFields />
        <label className="s-check">
          <input type="checkbox" name="privacy" required />
          <span>
            I’ve read <Link href="/shoot/privacy" target="_blank">how my information is used</Link>.
          </span>
        </label>
        <Msg state={state} />
        <button className="s-btn full" disabled={pending}>{pending ? 'Joining…' : 'Join'}</button>
      </div>
    </form>
  )
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPinWithLink, undefined)
  return (
    <form onSubmit={keep(action)} className="s-card">
      <input type="hidden" name="token" value={token} />
      <h1>Choose a new PIN</h1>
      <PinFields label="New 4-digit PIN" />
      <Msg state={state} />
      <button className="s-btn full" disabled={pending}>{pending ? 'Saving…' : 'Save and sign in'}</button>
    </form>
  )
}

export function MyDetailsForm({ d }: { d: DetailsDefaults }) {
  const [state, action, pending] = useActionState(updateMyDetails, undefined)
  return (
    <form onSubmit={keep(action)} className="s-card">
      <DetailsFields d={d} />
      <Msg state={state} />
      <button className="s-btn full" disabled={pending}>{pending ? 'Saving…' : 'Save my details'}</button>
    </form>
  )
}

export function ChangePinForm() {
  const [state, action, pending] = useActionState(changePin, undefined)
  return (
    <form onSubmit={keep(action)} className="s-card">
      <h2 style={{ marginTop: 0 }}>Change my PIN</h2>
      <label className="s-field">
        <span>Current PIN</span>
        <input type="password" name="current" inputMode="numeric" maxLength={6} autoComplete="current-password" required className="s-pin" />
      </label>
      <PinFields label="New 4-digit PIN" />
      <Msg state={state} />
      <button className="s-btn ghost full" disabled={pending}>Change PIN</button>
    </form>
  )
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteMyAccount, undefined)
  const [open, setOpen] = useState(false)
  if (!open)
    return (
      <button type="button" className="s-btn danger full" onClick={() => setOpen(true)}>
        Delete my account
      </button>
    )
  return (
    <form onSubmit={keep(action)} className="s-card">
      <h2 style={{ marginTop: 0 }}>Delete my account</h2>
      <p>This removes your details and all your shoot-day answers straight away. It can’t be undone.</p>
      <label className="s-field">
        <span>Type DELETE to confirm</span>
        <input type="text" name="confirm" autoCapitalize="characters" autoComplete="off" />
      </label>
      <Msg state={state} />
      <div className="s-row">
        <button type="button" className="s-btn ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button className="s-btn danger s-grow" disabled={pending}>Delete everything</button>
      </div>
    </form>
  )
}
