'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/fallback-content'

const NAV_LINKS = [
  { href: '/classes', label: 'Classes' },
  { href: '/dogs', label: 'Our Dogs' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
]



export function SiteNav({ site }: { site: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const half = Math.ceil(NAV_LINKS.length / 2)
  const leftLinks = NAV_LINKS.slice(0, half)
  const rightLinks = NAV_LINKS.slice(half)

  return (
    <header className={`site-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-row">
        <nav className="side" aria-label="Primary, left">
          {leftLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="wordmark">
          <Image
            src="/brand/briarrose-logo.jpeg"
            alt={`${site.businessName} — Gundog Training in Sevenoaks, Kent`}
            width={240}
            height={300}
            className="crest"
            priority
          />
        </Link>

        <nav className="side" aria-label="Primary, right">
          {rightLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {site.bookingUrl && site.bookingUrl !== '#' && (
            <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="pill">
              Book
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
