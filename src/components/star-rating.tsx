/**
 * Shared star icon + read-only star display, used on the Testimonials page
 * (per-quote rating, and the averaged rating summary at the top) and the
 * homepage's featured-quote band. The submission form's clickable rating
 * picker (testimonial-form.tsx) renders its own interactive buttons but
 * reuses this same `StarIcon` so the filled/outline shape matches exactly.
 */

export function StarIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.6l-6.1 3.4 1.5-6.8L2.2 9.5l6.9-.7L12 2.5z" />
    </svg>
  )
}

/** Read-only row of stars for a given rating (rounded to the nearest whole star). */
export function StarRating({ value, size = 16, max = 5 }: { value: number; size?: number; max?: number }) {
  const rounded = Math.round(value)
  return (
    <span
      style={{ display: 'inline-flex', gap: 2 }}
      role="img"
      aria-label={`${value % 1 === 0 ? value : value.toFixed(1)} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <StarIcon key={i} filled={i < rounded} size={size} />
      ))}
    </span>
  )
}
