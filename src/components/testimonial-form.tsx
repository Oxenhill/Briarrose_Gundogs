'use client'

import { useState, type FormEvent } from 'react'
import { PillButton } from '@/components/pill'

/**
 * "Share your story" form at /testimonials/submit — a private, unlisted
 * page (not linked anywhere on the site; see the Studio's "Testimonials"
 * section for the link to copy and send out yourself). Submissions are
 * saved unapproved (see src/app/api/testimonials/route.ts) and only appear
 * on the site once approved in the Studio.
 */
export function TestimonialForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setErrorMessage(body?.error || '')
        throw new Error('failed')
      }
      setStatus('done')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <p style={{ fontSize: 15.5 }}>
        Thank you so much for taking the time to share this — it means a lot, and we&apos;ll add it to the
        site soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, maxWidth: 480, margin: '0 auto' }}>
      <input name="clientName" placeholder="Your name" className="field" aria-label="Your name" />
      <input name="dogName" placeholder="Your dog's name (optional)" className="field" aria-label="Dog's name" />
      <input name="location" placeholder="Where you're based (optional)" className="field" aria-label="Location" />
      <textarea
        name="quote"
        required
        placeholder="Tell us about your experience — what training you did, how it went, anything you'd want another owner to know"
        className="field"
        rows={6}
        aria-label="Your testimonial"
        style={{ borderRadius: 18, resize: 'vertical' }}
      />
      <PillButton type="submit" solid disabled={status === 'submitting'} style={{ justifySelf: 'start' }}>
        {status === 'submitting' ? 'Sending…' : 'Share your story'}
      </PillButton>
      {status === 'error' && (
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
          {errorMessage || 'Something went wrong — please try again, or email it to us directly.'}
        </p>
      )}
    </form>
  )
}
