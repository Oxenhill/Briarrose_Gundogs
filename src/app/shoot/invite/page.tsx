import { requireAdmin } from '@/shoot/auth'
import { getGroupLink } from '@/shoot/actions'
import { GroupLinkPanel, InvitePanel } from '@/shoot/ui/admin'
import { Nav } from '@/shoot/ui/nav'

export default async function InvitePage() {
  const me = await requireAdmin()
  const group = await getGroupLink()
  return (
    <main className="s-main">
      <h1>Invite people</h1>
      <InvitePanel />
      <GroupLinkPanel url={group.url} needsApproval={group.needsApproval} />
      <Nav me={me} active="invite" />
    </main>
  )
}
