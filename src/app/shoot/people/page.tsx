import { requireAdmin } from '@/shoot/auth'
import { allPeople } from '@/shoot/data'
import { ApproveButtons, PeopleList } from '@/shoot/ui/admin'
import { Nav } from '@/shoot/ui/nav'
import { TEAM_LABEL, prettyPhone } from '@/shoot/util'

export default async function PeoplePage() {
  const me = await requireAdmin()
  const everyone = await allPeople()
  const waiting = everyone.filter((p) => p.status === 'pending')
  const active = everyone.filter((p) => p.status === 'active')
  return (
    <main className="s-main">
      <h1>People</h1>
      {waiting.length > 0 && (
        <>
          <h2>Waiting for approval</h2>
          <div className="s-card">
            <ul className="s-list">
              {waiting.map((p) => (
                <li key={p.id} style={{ flexWrap: 'wrap' }}>
                  <div className="s-grow">
                    <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                    <div className="s-muted s-small">
                      {TEAM_LABEL[p.usual_team]} · {prettyPhone(p.mobile)}
                    </div>
                  </div>
                  <ApproveButtons id={p.id} />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <PeopleList
        people={active.map((p) => ({
          id: p.id,
          full_name: p.full_name,
          mobile: p.mobile,
          usual_team: p.usual_team,
          can_do_other: p.can_do_other,
          role: p.role,
          first_aider: p.first_aider,
          first_aid_expiry: p.first_aid_expiry,
          is_under_18: p.is_under_18,
        }))}
      />
      <Nav me={me} active="people" />
    </main>
  )
}
