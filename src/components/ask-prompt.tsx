import { PillLink } from '@/components/pill'
import { ASK_URL } from '@/lib/ask'

/**
 * A quiet band pointing to the Ask page. Used on key pages so a question
 * always has somewhere to go without hunting for contact details.
 */
export function AskPrompt({
  heading = 'Got a question?',
  body = "Ask about gundog one-to-ones, packages, the Development Club or the Sunday groups and you'll get an answer straight away. Anything that needs Oliver goes straight to him.",
  label = 'Ask a question',
}: {
  heading?: string
  body?: string
  label?: string
}) {
  return (
    <section className="container ask-prompt" data-reveal="">
      <div className="ask-prompt-inner">
        <h2>{heading}</h2>
        <p>{body}</p>
        <PillLink href={ASK_URL} solid external>
          {label}
        </PillLink>
      </div>
    </section>
  )
}
