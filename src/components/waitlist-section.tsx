import { PillLink } from '@/components/pill'
import { fallbackSiteSettings, type SiteSettings } from '@/lib/fallback-content'

/** Uses the Site Settings value when filled in, otherwise the launch default. */
function pick<T>(value: T | null | undefined, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  if (Array.isArray(value) && value.length === 0) return fallback
  return value
}

/**
 * "Group classes, built around you" — explains the group class waitlist and
 * links straight out to the Dog Smart booking app, where the live times,
 * prices and full terms are shown. Prices and times are deliberately NOT
 * copied here, because they change per class and the app is the source.
 *
 * Every piece of wording is editable in the Studio under
 * Site Settings → Group Class Waitlist.
 */
export function WaitlistSection({ site, compact = false }: { site: SiteSettings; compact?: boolean }) {
  const d = fallbackSiteSettings
  if (site.waitlistShow === false) return null

  const steps = pick(site.waitlistSteps, d.waitlistSteps) ?? []
  const depositPoints = pick(site.waitlistDepositPoints, d.waitlistDepositPoints) ?? []
  const primaryUrl = pick(site.waitlistPrimaryUrl, d.waitlistPrimaryUrl)
  const secondaryUrl = pick(site.waitlistSecondaryUrl, d.waitlistSecondaryUrl)

  return (
    <section
      className={`waitlist${compact ? ' waitlist--compact' : ''}`}
      aria-labelledby="waitlist-heading"
      data-reveal=""
    >
      <div className="container">
        <div className="waitlist-head">
          <span className="eyebrow">{pick(site.waitlistEyebrow, d.waitlistEyebrow)}</span>
          <h2 id="waitlist-heading">{pick(site.waitlistHeading, d.waitlistHeading)}</h2>
          <p>{pick(site.waitlistBody, d.waitlistBody)}</p>
        </div>

        <div className="waitlist-grid">
          <ol className="waitlist-steps">
            {steps.map((step, i) => (
              <li key={i}>
                <span className="idx" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="waitlist-deposit">
            <h3>{pick(site.waitlistDepositHeading, d.waitlistDepositHeading)}</h3>
            <ul>
              {depositPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="waitlist-actions">
          {primaryUrl && (
            <PillLink href={primaryUrl} solid>
              {pick(site.waitlistPrimaryLabel, d.waitlistPrimaryLabel)}
            </PillLink>
          )}
          {secondaryUrl && (
            <PillLink href={secondaryUrl}>{pick(site.waitlistSecondaryLabel, d.waitlistSecondaryLabel)}</PillLink>
          )}
        </div>
        <p className="waitlist-note">{pick(site.waitlistNote, d.waitlistNote)}</p>
      </div>
    </section>
  )
}
