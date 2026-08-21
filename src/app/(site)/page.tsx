import type { Metadata } from 'next'
import { getSiteSettings, getClasses, getFeaturedTestimonial } from '@/lib/queries'
import { PillLink } from '@/components/pill'
import { SplitSection } from '@/components/split-section'
import { Marquee } from '@/components/marquee'
import { ClassRow } from '@/components/class-row'
import { JsonLd } from '@/components/json-ld'
import { buildMetadata } from '@/lib/seo'
import { urlForImage } from '@/sanity/lib/image'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings()
  return buildMetadata({ title: site.seoDefaultTitle, description: site.seoDefaultDescription, path: '/' })
}

export default async function HomePage() {
  const [site, classes, testimonial] = await Promise.all([
    getSiteSettings(),
    getClasses(),
    getFeaturedTestimonial(),
  ])

  // These panels stretch tall (the section is 82% of viewport height on
  // desktop) rather than being square, so a portrait-ish crop fits the
  // actual box far better than a square one, and the resolution is well
  // above typical on-screen size so retina screens don't upscale it.
  const philosophyImageUrl = site.philosophyImage
    ? urlForImage(site.philosophyImage).width(1000).height(1250).url()
    : null
  const ctaImageUrl = site.ctaImage ? urlForImage(site.ctaImage).width(1000).height(1250).url() : null

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="rule" />
          <span className="eyebrow">{site.heroEyebrow}</span>
          <h1>{site.heroHeadline}</h1>
          <p
            style={{
              color: 'var(--ink-soft)',
              maxWidth: '46ch',
              margin: '28px auto 40px',
              fontSize: 16,
            }}
          >
            {site.heroSubhead}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {site.bookingUrl && site.bookingUrl !== '#' ? (
              <PillLink href={site.bookingUrl} solid external>
                Book a Session
              </PillLink>
            ) : (
              <PillLink href="/contact" solid>
                Get in Touch
              </PillLink>
            )}
            <PillLink href="/classes">View Classes</PillLink>
          </div>
        </div>
      </section>

      <SplitSection
        eyebrow={site.philosophyEyebrow}
        heading={site.philosophyHeadline}
        body={site.philosophyBody}
        cta={
          <PillLink href="/about" style={{ marginTop: 4 }}>
            Meet the Trainer
          </PillLink>
        }
        {...(philosophyImageUrl
          ? { image: { src: philosophyImageUrl, alt: site.businessName } }
          : { markPanel: { src: '/brand/briarrose-logo.jpeg', alt: `${site.businessName} crest` } })}
      />

      <Marquee items={classes.map((c) => c.title)} />

      <section className="list-section">
        <div className="container">
          <div className="list-head" data-reveal="">
            <span className="eyebrow">{site.homeClassesEyebrow || 'Classes & Services'}</span>
            <h2>{site.homeClassesHeading || 'Training built around your dog'}</h2>
            <p>
              {site.homeClassesBody ||
                'Every class below is managed from the CMS — add, reorder, or retire one any time without touching code.'}
            </p>
          </div>
          <div>
            {classes.map((item, i) => (
              <ClassRow key={item._id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {testimonial && (
        <section className="quote-band" data-reveal="">
          <div className="container">
            <blockquote>&ldquo;{testimonial.quote}&rdquo;</blockquote>
            <cite>
              {testimonial.clientName}
              {testimonial.location ? ` · ${testimonial.location}` : ''}
              {testimonial.dogName ? ` · with ${testimonial.dogName}` : ''}
            </cite>
          </div>
        </section>
      )}

      <SplitSection
        reverse
        eyebrow={site.ctaEyebrow || 'Get Started'}
        heading={site.ctaHeadline}
        body={site.ctaBody}
        cta={
          site.bookingUrl && site.bookingUrl !== '#' ? (
            <PillLink href={site.bookingUrl} solid external>
              Book Now
            </PillLink>
          ) : (
            <PillLink href="/contact" solid>
              Contact Us
            </PillLink>
          )
        }
        {...(ctaImageUrl
          ? { image: { src: ctaImageUrl, alt: site.businessName } }
          : { placeholderTag: 'Photography placeholder' })}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: site.businessName,
          description: site.seoDefaultDescription,
        }}
      />
    </>
  )
}
