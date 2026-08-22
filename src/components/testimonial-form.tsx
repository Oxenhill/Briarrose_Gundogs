'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { PillButton } from '@/components/pill'
import { StarIcon } from '@/components/star-rating'

const MAX_PHOTO_BYTES = 4 * 1024 * 1024

/** Clickable 1-5 star picker. Stores its value in a hidden "rating" input so it rides along with the rest of the form's FormData with no extra wiring. */
function RatingPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 8 }}>
        How would you rate your experience? (optional)
      </p>
      <div style={{ display: 'flex', gap: 4 }} onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n === value ? 0 : n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            aria-pressed={value === n}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 3,
              color: shown >= n ? 'var(--deep)' : 'var(--line)',
            }}
          >
            <StarIcon filled={shown >= n} size={22} />
          </button>
        ))}
      </div>
      <input type="hidden" name="rating" value={value || ''} />
    </div>
  )
}

/**
 * "Share your story" form at /testimonials/submit — a private, unlisted
 * page (not linked anywhere on the site; see the Studio's "Testimonials"
 * section for the link to copy and send out yourself). Submissions are
 * saved unapproved (see src/app/api/testimonials/route.ts) and only appear
 * on the site once approved in the Studio.
 *
 * Sent as multipart form data (not JSON) so the optional photo upload can
 * ride along with the text fields — see the matching change in the API
 * route.
 */
export function TestimonialForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState('')

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPhotoError('')
    if (!file) {
      setPhotoPreview(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file.')
      e.target.value = ''
      setPhotoPreview(null)
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('That photo is a bit large — please choose one under 4MB.')
      e.target.value = ''
      setPhotoPreview(null)
      return
    }
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      const res = await fetch('/api/testimonials', { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        setErrorMessage(body?.error || '')
        throw new Error('failed')
      }
      setStatus('done')
      form.reset()
      setRating(0)
      setPhotoPreview(null)
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

      <RatingPicker value={rating} onChange={setRating} />

      <div>
        <label
          htmlFor="testimonial-photo"
          style={{ fontSize: 12.5, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}
        >
          A photo of your dog (optional)
        </label>
        <input
          id="testimonial-photo"
          type="file"
          name="photo"
          accept="image/*"
          onChange={handlePhotoChange}
          className="field"
          style={{ padding: 10 }}
        />
        {photoError && <p style={{ fontSize: 12, color: '#b3382c', marginTop: 8 }}>{photoError}</p>}
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element -- transient local blob: preview, not a remote image
          <img
            src={photoPreview}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: '50%', objectFit: 'cover', marginTop: 12 }}
          />
        )}
      </div>

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
