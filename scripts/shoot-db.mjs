// WGSC shoot app database tool.
//   node scripts/shoot-db.mjs migrate          — create/update tables
//   node scripts/shoot-db.mjs seed-dates       — load src/shoot/season-2026-27.json
//   node scripts/shoot-db.mjs owner-link <origin> — one-time link for Oliver's system-owner account
// Reads SHOOT_DATABASE_URL from the environment.
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { randomBytes, createHash } from 'node:crypto'

const url = process.env.SHOOT_DATABASE_URL
if (!url) throw new Error('Set SHOOT_DATABASE_URL')
const local = /localhost|127\.0\.0\.1/.test(url)
const client = new pg.Client({ connectionString: url, ssl: local ? undefined : { rejectUnauthorized: true } })
await client.connect()
const [cmd, arg] = process.argv.slice(2)
try {
  if (cmd === 'migrate') {
    await client.query(readFileSync(new URL('../src/shoot/schema.sql', import.meta.url), 'utf8'))
    await client.query(
      "insert into shoot_settings (id, group_token) values (1, $1) on conflict (id) do nothing",
      [randomBytes(24).toString('base64url')],
    )
    console.log('Schema up to date.')
  } else if (cmd === 'seed-dates') {
    const dates = JSON.parse(readFileSync(new URL('../src/shoot/season-2026-27.json', import.meta.url), 'utf8'))
    let n = 0
    for (const d of dates) {
      const r = await client.query('insert into shoot_dates (shoot_date) values ($1) on conflict (shoot_date) do nothing', [d])
      n += r.rowCount
    }
    console.log(`Added ${n} new dates (${dates.length} in the list).`)
  } else if (cmd === 'owner-link') {
    const token = randomBytes(24).toString('base64url')
    await client.query(
      "insert into shoot_links (token_hash, kind, expires_at) values ($1, 'owner', now() + interval '7 days')",
      [createHash('sha256').update(token).digest('hex')],
    )
    console.log(`${arg || 'https://shoot.briarrosegundogs.co.uk'}/shoot/join/${token}`)
  } else {
    console.log('Commands: migrate | seed-dates | owner-link <origin>')
  }
} finally {
  await client.end()
}
