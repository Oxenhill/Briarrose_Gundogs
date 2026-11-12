import Link from 'next/link'
import { requireMember } from '@/shoot/auth'
import { signOut } from '@/shoot/actions'
import { ChangePinForm, DeleteAccountForm, MyDetailsForm } from '@/shoot/ui/forms'
import { Nav } from '@/shoot/ui/nav'
import { ROLE_LABEL } from '@/shoot/util'

export default async function MePage() {
  const me = await requireMember()
  return (
    <main className="s-main">
      <h1>My details</h1>
      <span className="s-badges">
        <span className="s-badge">{ROLE_LABEL[me.role]}</span>
        {me.is_owner && <span className="s-badge">System owner</span>}
      </span>
      <MyDetailsForm
        d={{
          full_name: me.full_name,
          mobile: me.mobile,
          email: me.email,
          usual_team: me.usual_team,
          can_do_other: me.can_do_other,
          emergency_name: me.emergency_name,
          emergency_relationship: me.emergency_relationship,
          emergency_phone: me.emergency_phone,
          is_under_18: me.is_under_18,
          guardian_name: me.guardian_name,
          guardian_phone: me.guardian_phone,
          first_aider: me.first_aider,
          first_aid_expiry: me.first_aid_expiry,
          first_aid_notes: me.first_aid_notes,
        }}
      />
      <ChangePinForm />
      <form action={signOut}>
        <button className="s-btn ghost full">Sign out of this phone</button>
      </form>
      <div className="s-gap" />
      <DeleteAccountForm />
      <p className="s-muted s-small" style={{ marginTop: 16 }}>
        <Link href="/shoot/privacy">How your information is used</Link>
      </p>
      <Nav me={me} active="me" />
    </main>
  )
}
