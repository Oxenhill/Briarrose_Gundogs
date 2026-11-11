import { ResetForm } from '@/shoot/ui/forms'

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return (
    <main className="s-main">
      <ResetForm token={token} />
    </main>
  )
}
