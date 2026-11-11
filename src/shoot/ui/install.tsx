'use client'

import { useEffect, useState } from 'react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function ServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/shoot/sw.js', { scope: '/shoot' }).catch(() => {})
    }
  }, [])
  return null
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function platform(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

/** Big, obvious install button. Android gets the real prompt; iPhone gets picture steps. */
export function InstallButton() {
  const [show, setShow] = useState(false)
  const [plat, setPlat] = useState<'ios' | 'android' | 'other'>('other')
  const [prompt, setPrompt] = useState<BIPEvent | null>(null)
  const [help, setHelp] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    const p = platform()
    const raf = requestAnimationFrame(() => {
      setPlat(p)
      if (p !== 'other') setShow(true)
    })
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BIPEvent)
      setShow(true)
    }
    const onInstalled = () => setShow(false)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!show) return null

  async function click() {
    if (prompt) {
      await prompt.prompt()
      const choice = await prompt.userChoice
      if (choice.outcome === 'accepted') setShow(false)
      setPrompt(null)
    } else {
      setHelp(true)
    }
  }

  return (
    <>
      <button type="button" className="s-btn" onClick={click}>
        {plat === 'ios' ? 'Add to home screen' : 'Install app'}
      </button>
      {help && <InstallHelp plat={plat} onClose={() => setHelp(false)} />}
    </>
  )
}

function ShareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d6ef5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Share button" style={{ verticalAlign: 'middle' }}>
      <path d="M12 3v12" />
      <path d="M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  )
}

function PlusBoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" aria-label="Add to Home Screen" style={{ verticalAlign: 'middle' }}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#333" aria-label="Menu" style={{ verticalAlign: 'middle' }}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  )
}

function InstallHelp({ plat, onClose }: { plat: 'ios' | 'android' | 'other'; onClose: () => void }) {
  return (
    <div className="s-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0 }}>Put the app on your home screen</h2>
        {plat === 'ios' ? (
          <ol>
            <li>
              Tap the <strong>Share</strong> button <ShareIcon /> at the bottom of Safari (or top right on an iPad).
            </li>
            <li>
              Scroll down and tap <strong>Add to Home Screen</strong> <PlusBoxIcon />.
            </li>
            <li>
              Tap <strong>Add</strong>. The WGSC Team icon appears on your home screen.
            </li>
          </ol>
        ) : (
          <ol>
            <li>
              Tap the <strong>menu</strong> <DotsIcon /> at the top right of Chrome.
            </li>
            <li>
              Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </li>
            <li>
              Tap <strong>Install</strong>. The WGSC Team icon appears on your home screen.
            </li>
          </ol>
        )}
        <p className="s-muted">If you’re using an iPhone, this only works in Safari.</p>
        <button type="button" className="s-btn full" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  )
}
