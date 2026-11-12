import Link from 'next/link'
import { currentPerson } from '@/shoot/auth'
import { CLUB_NAME } from '@/shoot/util'

export const metadata = { title: { absolute: 'Privacy — WGSC Team' } }

export default async function PrivacyPage() {
  const me = await currentPerson()
  const signedIn = !!me && me.status === 'active'
  return (
    <main className="s-main">
      <p>
        <Link href={signedIn ? '/shoot/me' : '/shoot'}>‹ Back</Link>
      </p>
      <div className="s-card s-prose">
        <h1>{CLUB_NAME} — Beating and Picking-up Team App: how we use your information</h1>

        <p><strong>Who looks after your information.</strong> This app is run by Oliver Ringrose, on behalf of {CLUB_NAME}, to organise the beating and picking-up teams. Oliver is responsible for the information in it. Contact: <a href="mailto:trainers@dogsmarttrainingbehaviour.co.uk">trainers@dogsmarttrainingbehaviour.co.uk</a>{signedIn && <> or <a href="tel:07725672320">07725 672320</a></>}.</p>

        <p><strong>What we hold.</strong> Your name, mobile number, email if you give it, which team you beat or pick up for, the dates you say you’re attending, any plus-ones and dogs you bring, your emergency contact, whether you’re a trained first aider and when your certificate expires, and any first-aid information you choose to add. If you’re under 18, we also hold your parent or guardian’s details.</p>

        <p><strong>Why we hold it.</strong> To plan shoot days, to know who is out on the day, and to contact the right person quickly if there’s an accident. We rely on the club’s legitimate interest in organising its volunteers safely. First-aid information is optional and only held with your consent, which you can withdraw by deleting it at any time.</p>

        <p><strong>Who can see it.</strong> Other members see your first name, surname initial, team and which dates you’re attending. Only the keeper, underkeeper and admins can see your phone number, emergency contact and first-aid information. On a shoot day, deputies and first aiders who are attending can see the emergency details of the people out that day. We never sell, share or use your information for anything else, including marketing, and it is kept apart from any other business records.</p>

        <p><strong>Where it’s kept.</strong> In a secure, password-protected database used only for this app. Your PIN is stored scrambled so nobody, including Oliver, can read it.</p>

        <p><strong>How long we keep it.</strong> Until you delete your account, which you can do yourself at any time under My details. If you haven’t used the app or answered any date for two full seasons, you’ll get a warning, and 30 days later your account and details are deleted automatically.</p>

        <p><strong>Your rights.</strong> You can see, correct or delete your information at any time in the app, or ask Oliver to do it for you. If you’re unhappy with how your information is handled, please contact Oliver first; you can also complain to the Information Commissioner’s Office at <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</p>

        <p><strong>Under 18s.</strong> A parent or guardian must be given as the emergency contact and must agree to these details being held.</p>
      </div>
    </main>
  )
}
