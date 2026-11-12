import { canMakeAdmin, requireAdmin } from '@/shoot/auth'
import { adminInviteStatus, getGroupLink } from '@/shoot/actions'
import { AdminInvitePanel, GroupLinkPanel, InvitePanel } from '@/shoot/ui/admin'
import { Nav } from '@/shoot/ui/nav'

export default async function InvitePage() {
  const me = await requireAdmin()
  const group = await getGroupLink()
  const adminLink = canMakeAdmin(me) ? await adminInviteStatus() : null
  return (
    <main className="s-main">
      <h1>Invite people</h1>
      <InvitePanel />
      <GroupLinkPanel url={group.url} needsApproval={group.needsApproval} />
      {adminLink && <AdminInvitePanel active={adminLink.active} expires={adminLink.expires} />}
      <Nav me={me} active="invite" />
    </main>
  )
}
