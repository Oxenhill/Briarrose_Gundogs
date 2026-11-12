'use server'

import { revalidatePath } from 'next/cache'
import { one, pool, q, ready } from './db'
import { isDeputy, requireAdmin, requireMember } from './auth'
import { SPECIES, todayUK } from './util'

const refresh = () => revalidatePath('/shoot', 'layout')

// ------------------------------------------------------------------ drives (keeper / admins)

export async function addDrive(name: string): Promise<{ error?: string }> {
  await requireAdmin()
  const clean = name.trim().replace(/\s+/g, ' ').slice(0, 60)
  if (!clean) return { error: 'Type a name for the drive.' }
  const exists = await one<{ active: boolean }>('select active from shoot_drives where lower(name) = lower($1)', [clean])
  if (exists) return { error: exists.active ? 'There’s already a drive with that name.' : 'That drive is retired — bring it back from the retired list instead.' }
  await q('insert into shoot_drives (name, sort_order) values ($1, coalesce((select max(sort_order) + 1 from shoot_drives), 0))', [clean])
  refresh()
  return {}
}

export async function renameDrive(id: string, name: string): Promise<{ error?: string }> {
  await requireAdmin()
  const clean = name.trim().replace(/\s+/g, ' ').slice(0, 60)
  if (!clean) return { error: 'The name can’t be empty.' }
  const clash = await one('select 1 from shoot_drives where lower(name) = lower($1) and id <> $2', [clean, id])
  if (clash) return { error: 'There’s already a drive with that name.' }
  await q('update shoot_drives set name = $2 where id = $1', [id, clean])
  refresh()
  return {}
}

export async function moveDrive(id: string, dir: -1 | 1): Promise<void> {
  await requireAdmin()
  const list = await q<{ id: string }>('select id from shoot_drives where active order by sort_order, lower(name)')
  const i = list.findIndex((d) => d.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
  await ready()
  const client = await pool().connect()
  try {
    await client.query('begin')
    for (let k = 0; k < list.length; k++) await client.query('update shoot_drives set sort_order = $2 where id = $1', [list[k].id, k])
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    throw e
  } finally {
    client.release()
  }
  refresh()
}

/** Never-used drives are deleted outright; used ones are retired so their history stays. */
export async function retireDrive(id: string): Promise<void> {
  await requireAdmin()
  const used = await one<{ n: number }>('select count(*)::int as n from shoot_bag where drive_id = $1', [id])
  if (used && used.n > 0) await q('update shoot_drives set active = false where id = $1', [id])
  else await q('delete from shoot_drives where id = $1', [id])
  refresh()
}

export async function restoreDrive(id: string): Promise<void> {
  await requireAdmin()
  await q('update shoot_drives set active = true, sort_order = coalesce((select max(sort_order) + 1 from shoot_drives where active), 0) where id = $1', [id])
  refresh()
}

// ------------------------------------------------------------------ recording a day (keeper / admins / deputies)

export type BagEntry = {
  drive_id: string | null
  shots: number
  pheasant: number
  partridge: number
  duck: number
  pigeon: number
  other: number
  other_note?: string | null
}

const n = (v: unknown, max: number) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)))

export async function saveBag(dateId: string, mode: 'drives' | 'total', entries: BagEntry[]): Promise<{ error?: string }> {
  const me = await requireMember()
  if (!isDeputy(me)) return { error: 'Only the keepers, admins and deputies can record the bag.' }
  const date = await one<{ shoot_date: string; cancelled: boolean }>('select shoot_date, cancelled from shoot_dates where id = $1', [dateId])
  if (!date) return { error: 'Shoot day not found.' }
  if (date.cancelled) return { error: 'This day was cancelled.' }
  if (date.shoot_date > todayUK()) return { error: 'You can record the bag on the day or afterwards.' }
  if (mode !== 'drives' && mode !== 'total') return { error: 'Unknown way of recording.' }

  let rows = entries
  if (mode === 'total') rows = entries.slice(0, 1).map((e) => ({ ...e, drive_id: null }))
  else {
    rows = entries.filter((e) => e.drive_id)
    if (!rows.length) return { error: 'Tap the drives that were done first.' }
    const ids = rows.map((r) => r.drive_id)
    if (new Set(ids).size !== ids.length) return { error: 'A drive can only appear once in a day.' }
    const known = await q<{ id: string }>('select id from shoot_drives where id = any($1::uuid[])', [ids])
    if (known.length !== ids.length) return { error: 'One of those drives no longer exists. Reload and try again.' }
  }
  if (!rows.length) return { error: 'Nothing to save.' }

  await ready()
  const client = await pool().connect()
  try {
    await client.query('begin')
    await client.query('delete from shoot_bag where date_id = $1', [dateId])
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      await client.query(
        `insert into shoot_bag (date_id, drive_id, position, shots, ${SPECIES.join(', ')}, other_note)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [dateId, r.drive_id, i, n(r.shots, 10000), ...SPECIES.map((s) => n(r[s], 5000)),
          n(r.other, 5000) > 0 ? String(r.other_note || '').trim().slice(0, 80) || null : null],
      )
    }
    await client.query('update shoot_dates set bag_mode = $2, bag_updated_by = $3, bag_updated_at = now() where id = $1', [dateId, mode, me.id])
    await client.query('commit')
  } catch (e) {
    await client.query('rollback').catch(() => {})
    throw e
  } finally {
    client.release()
  }
  refresh()
  return {}
}

export async function clearBag(dateId: string): Promise<void> {
  const me = await requireMember()
  if (!isDeputy(me)) return
  await q('delete from shoot_bag where date_id = $1', [dateId])
  await q('update shoot_dates set bag_mode = null, bag_updated_by = null, bag_updated_at = null where id = $1', [dateId])
  refresh()
}
