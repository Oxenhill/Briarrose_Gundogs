import 'server-only'
import { Pool, types } from 'pg'

// Keep Postgres DATE columns as plain 'YYYY-MM-DD' strings — never let them
// become JS Dates, which would shift by an hour around BST changes.
types.setTypeParser(1082, (v) => v)

const globalForPool = globalThis as unknown as { shootPool?: Pool }

function makePool() {
  const connectionString = process.env.SHOOT_DATABASE_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('SHOOT_DATABASE_URL is not set — the shoot app has no database to talk to.')
  }
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)
  return new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    ssl: isLocal ? undefined : { rejectUnauthorized: true },
  })
}

export function pool() {
  if (!globalForPool.shootPool) globalForPool.shootPool = makePool()
  return globalForPool.shootPool
}

export async function q<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await pool().query(text, params)
  return res.rows as T[]
}

export async function one<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T | null> {
  const rows = await q<T>(text, params)
  return rows[0] ?? null
}
