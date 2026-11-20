import { PillLink } from '@/components/pill'

const WAITLIST_URL =
  'https://booking.dogsmarttrainingbehaviour.co.uk/waitlist/beginners-gundog-group-class?src=briarrose'

/**
 * Beginners Gundog Group Class waitlist. The class only starts once enough
 * dogs can make the same time, so this is how beginners get into a group.
 */
export function WaitlistBand() {
  return (
    <section className="container ask-prompt" data-reveal="">
      <div className="ask-prompt-inner">
        <span className="eyebrow">New to gundog training?</span>
        <h2>Beginners Gundog Group Class</h2>
        <p>
          Eight beginner sessions in a group of 3–4 dogs, with the online gundog course included. Tell us every
          time you could make and we start the class as soon as enough dogs can make the same one. A £10 deposit
          holds your place and comes off the price, and you can withdraw for a full refund any time before you&rsquo;re
          invited.
        </p>
        <PillLink href={WAITLIST_URL} solid external>
          Join the waitlist
        </PillLink>
      </div>
    </section>
  )
}
