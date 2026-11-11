import { redirect } from 'next/navigation'
import { currentPerson } from '@/shoot/auth'
import { lookupJoinToken } from '@/shoot/actions'
import { JoinForm } from '@/shoot/ui/forms'

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  if (await currentPerson()) redirect('/shoot')
  const { token } = await params
  const link = await lookupJoinToken(token)
  if (!link) {
    return (
      <main className="s-main">
        <div className="s-card">
          <h1>This link doesn’t work any more</h1>
          <p>It may have been used already, run out, or been replaced. Ask James or an admin for a new one.</p>
          <p>Already joined? <a href="/shoot">Sign in here</a>.</p>
        </div>
      </main>
    )
  }
  return (
    <main className="s-main">
      {link.kind === 'group' && link.needsApproval && (
        <div className="s-alert">After you join, James or an admin will approve you before you can see the shoot days.</div>
      )}
      <JoinForm token={token} kind={link.kind} />
    </main>
  )
}
