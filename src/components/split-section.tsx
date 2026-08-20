import type { ReactNode } from 'react'
import Image from 'next/image'

type SplitSectionProps = {
  eyebrow?: string
  heading: string
  body?: string
  cta?: ReactNode
  reverse?: boolean
  reveal?: boolean
  /** Either a photo image, or omit for a soft placeholder texture panel. */
  image?: { src: string; alt: string } | null
  placeholderTag?: string
  /** Use the uncropped brand-mark treatment instead of a cover photo. */
  markPanel?: { src: string; alt: string }
}

/**
 * The editorial alternating split layout used throughout the site:
 * one half copy, one half image/texture/brand-mark.
 */
export function SplitSection({
  eyebrow,
  heading,
  body,
  cta,
  reverse,
  reveal = true,
  image,
  placeholderTag,
  markPanel,
}: SplitSectionProps) {
  return (
    <section className={`split${reverse ? ' reverse' : ''}`} {...(reveal ? { 'data-reveal': '' } : {})}>
      <div className="copy">
        <div className="copy-inner">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{heading}</h2>
          {body && <p>{body}</p>}
          {cta}
        </div>
      </div>

      {markPanel ? (
        <div className="frame mark-panel">
          <Image src={markPanel.src} alt={markPanel.alt} width={340} height={340} />
        </div>
      ) : image ? (
        <div className="frame" style={{ position: 'relative' }}>
          <Image src={image.src} alt={image.alt} fill style={{ objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="frame ph-texture">
          <span className="tag">{placeholderTag ?? 'Photography placeholder'}</span>
        </div>
      )}
    </section>
  )
}
