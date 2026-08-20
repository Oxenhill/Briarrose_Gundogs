'use client'

import { useState, type FormEvent } from 'react'
import { PillButton } from '@/components/pill'

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('done')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p style={{ fontSize: 15.5 }}>
        Thanks for getting in touch — we&apos;ll reply as soon as we can.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
      <input name="name" required placeholder="Your name" className="field" aria-label="Name" />
      <input
        name="email"
        type="email"
        required
        placeholder="Email address"
        className="field"
        aria-label="Email address"
      />
      <input name="dogName" placeholder="Dog's name (optional)" className="field" aria-label="Dog's name" />
      <textarea
        name="message"
        required
        placeholder="Tell us a little about what you're looking for"
        className="field"
        rows={5}
        aria-label="Message"
        style={{ borderRadius: 18, resize: 'vertical' }}
      />
      <PillButton type="submit" solid disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </PillButton>
      {status === 'error' && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
          Something went wrong — please try again, or email us directly.
        </p>
      )}
    </form>
  )
}
