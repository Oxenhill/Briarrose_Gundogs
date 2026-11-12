import 'server-only'
import { connection } from 'next/server'
import { createDestinationReader } from './learning-centre-v1/deliveryClient'

export function learningCentreJournalEnabled() {
  return process.env.LEARNING_CENTRE_JOURNAL_ENABLED === 'true'
}
const reader = createDestinationReader({
  token: process.env.LEARNING_CENTRE_DELIVERY_TOKEN ?? '',
  policy: {
    destination: 'briarrose_site',
    origin: 'https://briarrosegundogs.co.uk',
    articlePathPrefix: '/journal',
    canonicalOrigins: {
      learning_centre: 'https://learn.dogsmarttrainingbehaviour.co.uk',
      dog_smart_site: 'https://www.dogsmarttrainingbehaviour.co.uk',
      briarrose_site: 'https://briarrosegundogs.co.uk',
    },
  },
})

/** Activation is explicit. Once activated the journal has one publication authority;
 * a withdrawn item must never fall back to an older Sanity or sample post at the same slug. */
export async function getLearningCentreJournal() {
  if (!learningCentreJournalEnabled()) return null
  await connection()
  return reader()
}
