-- WGSC Shoot Team app — database schema.
-- Lives in its own Neon database, completely separate from any Dog Smart data.
-- Safe to run repeatedly (every statement is idempotent).

create extension if not exists pgcrypto;

create table if not exists shoot_people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  mobile text not null unique,              -- normalised UK format, e.g. 07700900123
  email text,
  usual_team text not null check (usual_team in ('beater', 'picker')),
  can_do_other boolean not null default false,
  role text not null default 'member'
    check (role in ('keeper', 'underkeeper', 'admin', 'deputy', 'member')),
  is_owner boolean not null default false,  -- system owner: the only one who can change Keeper/Underkeeper
  status text not null default 'active' check (status in ('pending', 'active')),
  pin_hash text not null,
  failed_pins int not null default 0,
  locked boolean not null default false,
  emergency_name text not null,
  emergency_relationship text,
  emergency_phone text not null,
  is_under_18 boolean not null default false,
  guardian_name text,
  guardian_phone text,
  guardian_consent_at timestamptz,
  first_aider boolean not null default false,
  first_aid_expiry date,
  first_aid_notes text,
  first_aid_notes_consent_at timestamptz,
  privacy_accepted_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_active_at timestamptz not null default now()
);

create table if not exists shoot_sessions (
  token_hash text primary key,
  person_id uuid not null references shoot_people(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- One-time links: personal invites, PIN resets, and the system-owner bootstrap link.
create table if not exists shoot_links (
  token_hash text primary key,
  kind text not null check (kind in ('invite', 'reset', 'owner')),
  person_id uuid references shoot_people(id) on delete cascade,
  created_by uuid references shoot_people(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists shoot_settings (
  id int primary key default 1 check (id = 1),
  group_token text not null,
  group_needs_approval boolean not null default false
);

create table if not exists shoot_dates (
  id uuid primary key default gen_random_uuid(),
  shoot_date date not null unique,
  beaters_needed int not null default 20,
  pickers_needed int not null default 6,
  cancelled boolean not null default false,
  created_by uuid references shoot_people(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists shoot_attendance (
  person_id uuid not null references shoot_people(id) on delete cascade,
  date_id uuid not null references shoot_dates(id) on delete cascade,
  answer text not null check (answer in ('yes', 'maybe', 'no')),
  team text not null check (team in ('beater', 'picker')),
  adults int not null default 0 check (adults between 0 and 10),
  children int not null default 0 check (children between 0 and 10),
  plus_note text,
  dogs int not null default 0 check (dogs between 0 and 20),
  updated_at timestamptz not null default now(),
  primary key (person_id, date_id)
);

create index if not exists shoot_attendance_date_idx on shoot_attendance(date_id);
create index if not exists shoot_sessions_person_idx on shoot_sessions(person_id);

-- ---------------------------------------------------------------- Phase 2: bag records

-- Drives, set up by the keeper/admins. Retired drives keep their history.
create table if not exists shoot_drives (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists shoot_drives_name_idx on shoot_drives (lower(name));

-- How a day was recorded: drive by drive, or one whole-day total.
alter table shoot_dates add column if not exists bag_mode text check (bag_mode in ('drives', 'total'));
alter table shoot_dates add column if not exists bag_updated_by uuid references shoot_people(id) on delete set null;
alter table shoot_dates add column if not exists bag_updated_at timestamptz;

-- One row per drive done that day (drive_id set), or a single whole-day row (drive_id null).
create table if not exists shoot_bag (
  id uuid primary key default gen_random_uuid(),
  date_id uuid not null references shoot_dates(id) on delete cascade,
  drive_id uuid references shoot_drives(id) on delete restrict,
  position int not null default 0,
  shots int not null default 0 check (shots between 0 and 10000),
  pheasant int not null default 0 check (pheasant between 0 and 5000),
  partridge int not null default 0 check (partridge between 0 and 5000),
  duck int not null default 0 check (duck between 0 and 5000),
  pigeon int not null default 0 check (pigeon between 0 and 5000),
  other int not null default 0 check (other between 0 and 5000),
  other_note text
);
create unique index if not exists shoot_bag_drive_once_idx on shoot_bag (date_id, drive_id) where drive_id is not null;
create unique index if not exists shoot_bag_total_once_idx on shoot_bag (date_id) where drive_id is null;
create index if not exists shoot_bag_drive_idx on shoot_bag (drive_id);
