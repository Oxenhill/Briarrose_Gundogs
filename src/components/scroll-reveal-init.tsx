'use client'

import { useEffect } from 'react'

/**
 * Fallback for browsers without `animation-timeline: view()` support.
 * globals.css already handles the native case via @supports; this only
 * does anything when that feature is absent, and does nothing if the
 * user prefers reduced motion.
 */
export function ScrollRevealInit() {
  useEffect(() => {
    const supportsNative =
      typeof CSS !== 'undefined' &&
      CSS.supports?.('animation-timeline: view()') &&
      CSS.supports?.('animation-range: entry')
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (supportsNative || prefersReduced) return

    const targets = document.querySelectorAll('[data-reveal]')
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15 }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
