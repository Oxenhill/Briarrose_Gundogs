import 'server-only'
import type { Pool } from 'pg'
import { randomBytes } from 'node:crypto'

/**
 * Self-setup, run once per server start the first time the database is used.
 * Lets the app set up its own Neon database on Vercel without anyone ever
 * needing to see or copy the connection string:
 *  - creates/updates the tables (every statement is idempotent)
 *  - creates the settings row with a random WhatsApp group-link token
 *  - loads the 2026/27 season dates if no dates exist yet
 *  - while no system owner exists, plants Oliver's one-time owner link.
 *    Only the SHA-256 hash is stored here; the link itself was given to Oliver
 *    directly. It stops working once used, or once any owner exists.
 */

const SCHEMA = "-- WGSC Shoot Team app — database schema.\n-- Lives in its own Neon database, completely separate from any Dog Smart data.\n-- Safe to run repeatedly (every statement is idempotent).\n\ncreate extension if not exists pgcrypto;\n\ncreate table if not exists shoot_people (\n  id uuid primary key default gen_random_uuid(),\n  full_name text not null,\n  mobile text not null unique,              -- normalised UK format, e.g. 07700900123\n  email text,\n  usual_team text not null check (usual_team in ('beater', 'picker')),\n  can_do_other boolean not null default false,\n  role text not null default 'member'\n    check (role in ('keeper', 'underkeeper', 'admin', 'deputy', 'member')),\n  is_owner boolean not null default false,  -- system owner: the only one who can change Keeper/Underkeeper\n  status text not null default 'active' check (status in ('pending', 'active')),\n  pin_hash text not null,\n  failed_pins int not null default 0,\n  locked boolean not null default false,\n  emergency_name text not null,\n  emergency_relationship text,\n  emergency_phone text not null,\n  is_under_18 boolean not null default false,\n  guardian_name text,\n  guardian_phone text,\n  guardian_consent_at timestamptz,\n  first_aider boolean not null default false,\n  first_aid_expiry date,\n  first_aid_notes text,\n  first_aid_notes_consent_at timestamptz,\n  privacy_accepted_at timestamptz not null,\n  created_at timestamptz not null default now(),\n  last_active_at timestamptz not null default now()\n);\n\ncreate table if not exists shoot_sessions (\n  token_hash text primary key,\n  person_id uuid not null references shoot_people(id) on delete cascade,\n  created_at timestamptz not null default now(),\n  expires_at timestamptz not null\n);\n\n-- One-time links: personal invites, PIN resets, and the system-owner bootstrap link.\ncreate table if not exists shoot_links (\n  token_hash text primary key,\n  kind text not null check (kind in ('invite', 'reset', 'owner')),\n  person_id uuid references shoot_people(id) on delete cascade,\n  created_by uuid references shoot_people(id) on delete set null,\n  created_at timestamptz not null default now(),\n  expires_at timestamptz not null,\n  used_at timestamptz\n);\n\ncreate table if not exists shoot_settings (\n  id int primary key default 1 check (id = 1),\n  group_token text not null,\n  group_needs_approval boolean not null default false\n);\n\ncreate table if not exists shoot_dates (\n  id uuid primary key default gen_random_uuid(),\n  shoot_date date not null unique,\n  beaters_needed int not null default 20,\n  pickers_needed int not null default 6,\n  cancelled boolean not null default false,\n  created_by uuid references shoot_people(id) on delete set null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists shoot_attendance (\n  person_id uuid not null references shoot_people(id) on delete cascade,\n  date_id uuid not null references shoot_dates(id) on delete cascade,\n  answer text not null check (answer in ('yes', 'maybe', 'no')),\n  team text not null check (team in ('beater', 'picker')),\n  adults int not null default 0 check (adults between 0 and 10),\n  children int not null default 0 check (children between 0 and 10),\n  plus_note text,\n  dogs int not null default 0 check (dogs between 0 and 20),\n  updated_at timestamptz not null default now(),\n  primary key (person_id, date_id)\n);\n\ncreate index if not exists shoot_attendance_date_idx on shoot_attendance(date_id);\ncreate index if not exists shoot_sessions_person_idx on shoot_sessions(person_id);\n\n-- ---------------------------------------------------------------- Phase 2: bag records\n\n-- Drives, set up by the keeper/admins. Retired drives keep their history.\ncreate table if not exists shoot_drives (\n  id uuid primary key default gen_random_uuid(),\n  name text not null,\n  sort_order int not null default 0,\n  active boolean not null default true,\n  created_at timestamptz not null default now()\n);\ncreate unique index if not exists shoot_drives_name_idx on shoot_drives (lower(name));\n\n-- How a day was recorded: drive by drive, or one whole-day total.\nalter table shoot_dates add column if not exists bag_mode text check (bag_mode in ('drives', 'total'));\nalter table shoot_dates add column if not exists bag_updated_by uuid references shoot_people(id) on delete set null;\nalter table shoot_dates add column if not exists bag_updated_at timestamptz;\n\n-- One row per drive done that day (drive_id set), or a single whole-day row (drive_id null).\ncreate table if not exists shoot_bag (\n  id uuid primary key default gen_random_uuid(),\n  date_id uuid not null references shoot_dates(id) on delete cascade,\n  drive_id uuid references shoot_drives(id) on delete restrict,\n  position int not null default 0,\n  shots int not null default 0 check (shots between 0 and 10000),\n  pheasant int not null default 0 check (pheasant between 0 and 5000),\n  partridge int not null default 0 check (partridge between 0 and 5000),\n  duck int not null default 0 check (duck between 0 and 5000),\n  pigeon int not null default 0 check (pigeon between 0 and 5000),\n  other int not null default 0 check (other between 0 and 5000),\n  other_note text\n);\ncreate unique index if not exists shoot_bag_drive_once_idx on shoot_bag (date_id, drive_id) where drive_id is not null;\ncreate unique index if not exists shoot_bag_total_once_idx on shoot_bag (date_id) where drive_id is null;\ncreate index if not exists shoot_bag_drive_idx on shoot_bag (drive_id);\n"

const SEASON_2026_27: string[] = [
  "2026-10-01", "2026-10-03", "2026-10-07", "2026-10-10", "2026-10-12", "2026-10-14", "2026-10-17",
  "2026-10-21", "2026-10-24", "2026-10-26", "2026-10-28", "2026-10-30", "2026-10-31",
  "2026-11-05", "2026-11-07", "2026-11-09", "2026-11-11", "2026-11-13", "2026-11-16", "2026-11-21",
  "2026-11-23", "2026-11-25", "2026-11-28",
  "2026-12-02", "2026-12-05", "2026-12-07", "2026-12-09", "2026-12-12", "2026-12-16", "2026-12-19",
  "2026-12-21", "2026-12-26", "2026-12-28", "2026-12-30",
  "2027-01-02", "2027-01-06", "2027-01-09", "2027-01-13", "2027-01-16", "2027-01-20", "2027-01-23",
  "2027-01-27", "2027-01-29", "2027-01-30"
]

const OWNER_LINK_HASH = 'e4b5103522712296c50eec33d7da568602c5a4c98d5756c86dc6b2b1860cc4d9'

export async function bootstrap(pool: Pool) {
  await pool.query(SCHEMA)
  await pool.query('insert into shoot_settings (id, group_token) values (1, $1) on conflict (id) do nothing', [
    randomBytes(24).toString('base64url'),
  ])
  const { rows: d } = await pool.query('select count(*)::int as n from shoot_dates')
  if (d[0].n === 0) {
    await pool.query('insert into shoot_dates (shoot_date) select unnest($1::date[]) on conflict do nothing', [SEASON_2026_27])
  }
  const { rows: o } = await pool.query('select count(*)::int as n from shoot_people where is_owner')
  if (o[0].n === 0) {
    await pool.query(
      "insert into shoot_links (token_hash, kind, expires_at) values ($1, 'owner', now() + interval '30 days') on conflict (token_hash) do nothing",
      [OWNER_LINK_HASH],
    )
  }
}
