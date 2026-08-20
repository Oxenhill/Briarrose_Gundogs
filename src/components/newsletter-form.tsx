'use client'

import { useState, type FormEvent } from 'react'
import { PillButton } from '@/components/pill'

export function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return <p style={{ fontSize: 14.5 }}>Thanks — you&apos;re on the list.</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: 10, maxWidth: 360, margin: '0 auto', flexWrap: 'wrap' }}
    >
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field"
        style={{ flex: 1, minWidth: 200 }}
        aria-label="Email address"
      />
      <PillButton type="submit" solid disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Sign up'}
      </PillButton>
      {status === 'error' && (
        <p style={{ width: '100%', fontSize: 12.5, color: 'var(--ink-soft)' }}>
          Something went wrong — please try again, or email us directly.
        </p>
      )}
    </form>
  )
}
