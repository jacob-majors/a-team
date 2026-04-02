-- ================================================================
-- A-Team: Initial Schema Migration
-- Run this in Supabase → SQL Editor → New Query
-- ================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────
create type user_role    as enum ('admin', 'coach', 'athlete', 'parent');
create type event_type   as enum ('practice', 'race', 'meeting');
create type rsvp_status  as enum ('yes', 'no', 'maybe');
create type channel_type as enum ('public', 'coaches', 'admin');

-- ── Users ────────────────────────────────────────────────────────
create table users (
  id          text primary key default gen_random_uuid()::text,
  clerk_id    text not null unique,
  name        text not null,
  email       text not null unique,
  role        user_role not null default 'athlete',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── Events ───────────────────────────────────────────────────────
create table events (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  type        event_type not null default 'practice',
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  location    text,
  created_by  text not null references users(id),
  created_at  timestamptz not null default now()
);

-- ── RSVPs ────────────────────────────────────────────────────────
create table rsvps (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references events(id) on delete cascade,
  user_id     text not null references users(id) on delete cascade,
  status      rsvp_status not null default 'yes',
  created_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ── Ride Groups ───────────────────────────────────────────────────
create table ride_groups (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references events(id) on delete cascade,
  name        text not null,
  start_time  text,
  created_at  timestamptz not null default now()
);

create table ride_group_members (
  id             text primary key default gen_random_uuid()::text,
  ride_group_id  text not null references ride_groups(id) on delete cascade,
  user_id        text not null references users(id) on delete cascade,
  unique (ride_group_id, user_id)
);

-- ── Roster Profiles ───────────────────────────────────────────────
create table roster_profiles (
  id               text primary key default gen_random_uuid()::text,
  user_id          text not null unique references users(id) on delete cascade,
  dues_paid        boolean not null default false,
  dues_amount      integer,
  pit_zone_status  text,
  notes            text,
  phone            text,
  grade            text,
  updated_at       timestamptz not null default now()
);

-- ── Chat Channels ─────────────────────────────────────────────────
create table chat_channels (
  id          text primary key default gen_random_uuid()::text,
  name        text not null unique,
  description text,
  type        channel_type not null default 'public',
  created_at  timestamptz not null default now()
);

-- Seed default channels
insert into chat_channels (id, name, description, type) values
  (gen_random_uuid()::text, 'all-team', 'Everyone',              'public'),
  (gen_random_uuid()::text, 'coaches',  'Coaches & admins only', 'coaches'),
  (gen_random_uuid()::text, 'riders',   'Athletes',              'public'),
  (gen_random_uuid()::text, 'parents',  'Parent communication',  'public');

-- ── Chat Messages ─────────────────────────────────────────────────
create table chat_messages (
  id          text primary key default gen_random_uuid()::text,
  channel_id  text not null references chat_channels(id) on delete cascade,
  user_id     text not null references users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ── Announcements ─────────────────────────────────────────────────
create table announcements (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  body        text not null,
  created_by  text not null references users(id),
  created_at  timestamptz not null default now()
);

create table announcement_dismissals (
  id               text primary key default gen_random_uuid()::text,
  announcement_id  text not null references announcements(id) on delete cascade,
  user_id          text not null references users(id) on delete cascade,
  dismissed_at     timestamptz not null default now(),
  unique (announcement_id, user_id)
);

-- ── Documents ─────────────────────────────────────────────────────
create table documents (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  description  text,
  url          text not null,
  category     text,
  uploaded_by  text not null references users(id),
  created_at   timestamptz not null default now()
);

-- ── Volunteer Slots ───────────────────────────────────────────────
create table volunteer_slots (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references events(id) on delete cascade,
  name        text not null,
  capacity    integer not null default 1,
  created_at  timestamptz not null default now()
);

create table volunteer_signups (
  id          text primary key default gen_random_uuid()::text,
  slot_id     text not null references volunteer_slots(id) on delete cascade,
  user_id     text not null references users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (slot_id, user_id)
);

-- ── Media Albums ──────────────────────────────────────────────────
create table media_albums (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  description text,
  event_id    text references events(id) on delete set null,
  created_by  text not null references users(id),
  created_at  timestamptz not null default now()
);

create table media_items (
  id             text primary key default gen_random_uuid()::text,
  album_id       text not null references media_albums(id) on delete cascade,
  url            text not null,
  thumbnail_url  text,
  caption        text,
  uploaded_by    text not null references users(id),
  created_at     timestamptz not null default now()
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================
-- NOTE: All server-side tRPC calls use the DATABASE_URL (postgres
-- connection) which bypasses RLS entirely. These policies protect
-- against direct Supabase client access only.
-- ================================================================

alter table users                   enable row level security;
alter table events                  enable row level security;
alter table rsvps                   enable row level security;
alter table ride_groups             enable row level security;
alter table ride_group_members      enable row level security;
alter table roster_profiles         enable row level security;
alter table chat_channels           enable row level security;
alter table chat_messages           enable row level security;
alter table announcements           enable row level security;
alter table announcement_dismissals enable row level security;
alter table documents               enable row level security;
alter table volunteer_slots         enable row level security;
alter table volunteer_signups       enable row level security;
alter table media_albums            enable row level security;
alter table media_items             enable row level security;

-- ── Helper: get current Clerk user's DB row ───────────────────────
-- auth.uid() returns the `sub` claim from the JWT.
-- We store Clerk's user ID as clerk_id in our users table.
-- When Clerk is configured (JWT template below), auth.uid() = clerk_id.

create or replace function get_my_db_id()
returns text
language sql stable security definer
as $$
  select id from users where clerk_id = auth.uid()::text
$$;

create or replace function get_my_role()
returns user_role
language sql stable security definer
as $$
  select role from users where clerk_id = auth.uid()::text
$$;

-- ── users ─────────────────────────────────────────────────────────
create policy "users_select" on users for select using (true);
create policy "users_insert" on users for insert with check (true);
create policy "users_update" on users for update using (
  clerk_id = auth.uid()::text or get_my_role() = 'admin'
);

-- ── events ────────────────────────────────────────────────────────
create policy "events_select" on events for select using (true);
create policy "events_insert" on events for insert with check (get_my_role() in ('admin','coach'));
create policy "events_update" on events for update using (get_my_role() in ('admin','coach'));
create policy "events_delete" on events for delete using (get_my_role() in ('admin','coach'));

-- ── rsvps ─────────────────────────────────────────────────────────
create policy "rsvps_select" on rsvps for select using (
  user_id = get_my_db_id() or get_my_role() in ('admin','coach')
);
create policy "rsvps_insert" on rsvps for insert with check (user_id = get_my_db_id());
create policy "rsvps_update" on rsvps for update using (user_id = get_my_db_id());

-- ── ride groups ───────────────────────────────────────────────────
create policy "ride_groups_select" on ride_groups for select using (true);
create policy "ride_groups_insert" on ride_groups for insert with check (get_my_role() in ('admin','coach'));
create policy "ride_group_members_select" on ride_group_members for select using (true);
create policy "ride_group_members_insert" on ride_group_members for insert with check (get_my_role() in ('admin','coach'));

-- ── roster profiles ───────────────────────────────────────────────
create policy "roster_select" on roster_profiles for select using (
  user_id = get_my_db_id() or get_my_role() in ('admin','coach')
);
create policy "roster_insert" on roster_profiles for insert with check (get_my_role() in ('admin','coach'));
create policy "roster_update" on roster_profiles for update using (get_my_role() in ('admin','coach'));

-- ── chat channels ─────────────────────────────────────────────────
create policy "chat_channels_select" on chat_channels for select using (
  type = 'public'
  or (type = 'coaches' and get_my_role() in ('admin','coach'))
  or (type = 'admin'   and get_my_role() = 'admin')
);
create policy "chat_channels_insert" on chat_channels for insert with check (get_my_role() in ('admin','coach'));

-- ── chat messages ─────────────────────────────────────────────────
create policy "chat_messages_select" on chat_messages for select using (true);
create policy "chat_messages_insert" on chat_messages for insert with check (user_id = get_my_db_id());

-- ── announcements ─────────────────────────────────────────────────
create policy "ann_select"  on announcements for select using (true);
create policy "ann_insert"  on announcements for insert with check (get_my_role() in ('admin','coach'));
create policy "ann_delete"  on announcements for delete using (get_my_role() in ('admin','coach'));

create policy "ann_dismiss_select" on announcement_dismissals for select using (user_id = get_my_db_id());
create policy "ann_dismiss_insert" on announcement_dismissals for insert with check (user_id = get_my_db_id());

-- ── documents ─────────────────────────────────────────────────────
create policy "docs_select" on documents for select using (true);
create policy "docs_insert" on documents for insert with check (get_my_role() in ('admin','coach'));
create policy "docs_delete" on documents for delete using (get_my_role() in ('admin','coach'));

-- ── volunteer slots ───────────────────────────────────────────────
create policy "vol_slots_select"   on volunteer_slots   for select using (true);
create policy "vol_slots_insert"   on volunteer_slots   for insert with check (get_my_role() in ('admin','coach'));
create policy "vol_slots_delete"   on volunteer_slots   for delete using (get_my_role() in ('admin','coach'));
create policy "vol_signups_select" on volunteer_signups for select using (true);
create policy "vol_signups_insert" on volunteer_signups for insert with check (user_id = get_my_db_id());
create policy "vol_signups_delete" on volunteer_signups for delete using (user_id = get_my_db_id());

-- ── media ─────────────────────────────────────────────────────────
create policy "albums_select" on media_albums for select using (true);
create policy "albums_insert" on media_albums for insert with check (get_my_role() in ('admin','coach'));
create policy "albums_delete" on media_albums for delete using (get_my_role() in ('admin','coach'));

create policy "media_items_select" on media_items for select using (true);
create policy "media_items_insert" on media_items for insert with check (uploaded_by = get_my_db_id());
create policy "media_items_delete" on media_items for delete using (
  uploaded_by = get_my_db_id() or get_my_role() in ('admin','coach')
);

-- ================================================================
-- Enable Realtime for chat (run this after the above)
-- ================================================================
-- alter publication supabase_realtime add table chat_messages;
