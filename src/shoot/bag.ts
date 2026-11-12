import 'server-only'
import { one, q } from './db'

import { SPECIES, type Species } from './util'
export { SPECIES, SPECIES_LABEL, type Species } from './util'

export type Counts = { shots: number } & Record<Species, number>

export type Drive = { id: string; name: string; sort_order: number; active: boolean; times_done: number }

export type BagRow = Counts & {
  drive_id: string | null
  drive_name: string | null
  position: number
  other_note: string | null
}

export type DayBag = {
  mode: 'drives' | 'total' | null
  updated_by: string | null
  updated_at: string | null
  rows: BagRow[]
  totals: Counts
}

export const birds = (c: Partial<Counts>) => SPECIES.reduce((n, s) => n + (c[s] || 0), 0)

/** "4.2 shots per bird", or null when there were no birds. */
export function ratio(shots: number, b: number): string | null {
  if (!b) return null
  return (shots / b).toFixed(1)
}

export function emptyCounts(): Counts {
  return { shots: 0, pheasant: 0, partridge: 0, duck: 0, pigeon: 0, other: 0 }
}

export async function drives(includeRetired = true): Promise<Drive[]> {
  return q<Drive>(
    `select d.id, d.name, d.sort_order, d.active, count(b.id)::int as times_done
       from shoot_drives d left join shoot_bag b on b.drive_id = d.id
      ${includeRetired ? '' : 'where d.active'}
      group by d.id order by d.active desc, d.sort_order, lower(d.name)`,
  )
}

export async function dayBag(dateId: string): Promise<DayBag> {
  const head = await one<{ bag_mode: 'drives' | 'total' | null; full_name: string | null; bag_updated_at: string | null }>(
    `select d.bag_mode, p.full_name, d.bag_updated_at from shoot_dates d left join shoot_people p on p.id = d.bag_updated_by where d.id = $1`,
    [dateId],
  )
  const rows = await q<BagRow>(
    `select b.drive_id, dr.name as drive_name, b.position, b.shots, b.pheasant, b.partridge, b.duck, b.pigeon, b.other, b.other_note
       from shoot_bag b left join shoot_drives dr on dr.id = b.drive_id
      where b.date_id = $1 order by b.position, dr.sort_order`,
    [dateId],
  )
  const totals = emptyCounts()
  for (const r of rows) {
    totals.shots += r.shots
    for (const s of SPECIES) totals[s] += r[s]
  }
  return { mode: head?.bag_mode ?? null, updated_by: head?.full_name ?? null, updated_at: head?.bag_updated_at ?? null, rows, totals }
}

// ------------------------------------------------------------------ season stats

/** Seasons run August to July, labelled "2026/27". */
export function seasonOf(iso: string): string {
  const [y, m] = iso.split('-').map(Number)
  const start = m >= 8 ? y : y - 1
  return `${start}/${String((start + 1) % 100).padStart(2, '0')}`
}

export function seasonRange(label: string): [string, string] {
  const start = Number(label.slice(0, 4))
  return [`${start}-08-01`, `${start + 1}-07-31`]
}

export type DayStat = Counts & { date_id: string; shoot_date: string; mode: 'drives' | 'total'; drives_done: number }
export type DriveStat = Counts & { drive_id: string; name: string; active: boolean; times: number }

export async function seasonsWithData(): Promise<string[]> {
  const rows = await q<{ shoot_date: string }>('select shoot_date from shoot_dates order by shoot_date desc')
  return [...new Set(rows.map((r) => seasonOf(r.shoot_date)))]
}

const SUMS = `coalesce(sum(b.shots),0)::int as shots, coalesce(sum(b.pheasant),0)::int as pheasant,
  coalesce(sum(b.partridge),0)::int as partridge, coalesce(sum(b.duck),0)::int as duck,
  coalesce(sum(b.pigeon),0)::int as pigeon, coalesce(sum(b.other),0)::int as other`

export async function seasonDays(label: string): Promise<DayStat[]> {
  const [from, to] = seasonRange(label)
  return q<DayStat>(
    `select d.id as date_id, d.shoot_date, d.bag_mode as mode, count(b.drive_id)::int as drives_done, ${SUMS}
       from shoot_dates d join shoot_bag b on b.date_id = d.id
      where d.shoot_date between $1 and $2 and d.bag_mode is not null
      group by d.id order by d.shoot_date desc`,
    [from, to],
  )
}

export async function seasonDrives(label: string): Promise<DriveStat[]> {
  const [from, to] = seasonRange(label)
  return q<DriveStat>(
    `select dr.id as drive_id, dr.name, dr.active, count(b.id)::int as times, ${SUMS}
       from shoot_drives dr
       join shoot_bag b on b.drive_id = dr.id
       join shoot_dates d on d.id = b.date_id and d.shoot_date between $1 and $2
      group by dr.id order by dr.sort_order, lower(dr.name)`,
    [from, to],
  )
}
