import Link from 'next/link'
import type { ClassItem } from '@/lib/fallback-content'

/** One row in the dynamic classes/services list — sourced entirely from CMS class items. */
export function ClassRow({ item, index }: { item: ClassItem; index: number }) {
  return (
    <Link href={`/classes/${item.slug.current}`} className="class-row">
      <span className="idx">{String(index + 1).padStart(2, '0')}</span>
      <span>
        <h3>{item.title}</h3>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 4 }}>{item.summary}</p>
      </span>
      {item.stageLabel && <span className="meta">{item.stageLabel}</span>}
      <span className="go" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
