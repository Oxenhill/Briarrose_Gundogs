'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { SiteSettings } from '@/lib/fallback-content'
import { urlForImage } from '@/sanity/lib/image'

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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Below 900px the desktop link rows (`.nav-row .side`) are hidden by CSS
  // and this panel is the only way to reach any page other than the
  // homepage — so it also handles the housekeeping a full-screen overlay
  // needs: locking background scroll while open, and closing on Escape or
  // on navigating away (the link click below).
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const half = Math.ceil(NAV_LINKS.length / 2)
  const leftLinks = NAV_LINKS.slice(0, half)
  const rightLinks = NAV_LINKS.slice(half)

  // Uses the "Logo" image from Site Settings if one has been uploaded in the
  // CMS; otherwise falls back to the default crest shipped with the site.
  const logoUrl = site.logo ? urlForImage(site.logo).width(480).height(600).url() : '/brand/briarrose-crest.png'
  const hasBooking = Boolean(site.bookingUrl && site.bookingUrl !== '#')

  return (
    <>
    <header className={`site-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-row">
        <nav className="side" aria-label="Primary, left">
          {leftLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="wordmark" onClick={() => setMenuOpen(false)}>
          <Image
            src={logoUrl}
            alt={`${site.businessName} — Gundog Training in Sevenoaks, Kent`}
            width={520}
            height={681}
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
          {hasBooking && (
            <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="pill">
              Book
            </a>
          )}
        </nav>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={`menu-toggle-bars${menuOpen ? ' open' : ''}`} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>
    </header>

    {/* Rendered as a sibling of <header>, not a child of it: `header.site-nav`
        sets `backdrop-filter`, which (like `filter`/`transform`) creates a
        containing block for `position: fixed` descendants — a fixed panel
        nested inside it would be pinned to the header's own small box
        instead of the viewport, clipping to header height instead of
        covering the screen. */}
    <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' open' : ''}`}>
      <nav aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </Link>
        ))}
      </nav>
      {hasBooking && (
        <a
          href={site.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pill solid"
          onClick={() => setMenuOpen(false)}
        >
          Book
        </a>
      )}
    </div>
    </>
  )
}
