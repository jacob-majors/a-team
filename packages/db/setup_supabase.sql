-- ================================================================
-- A-Team: Full Supabase Setup Script
-- Run this FRESH in Supabase → SQL Editor → New Query
-- ================================================================

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────
do $$ begin
  create type user_role    as enum ('admin', 'coach', 'athlete', 'parent');
exception when duplicate_object then null; end $$;
do $$ begin
  create type event_type   as enum ('practice', 'race', 'meeting');
exception when duplicate_object then null; end $$;
do $$ begin
  create type rsvp_status  as enum ('yes', 'no', 'maybe');
exception when duplicate_object then null; end $$;
do $$ begin
  create type channel_type as enum ('public', 'coaches', 'admin');
exception when duplicate_object then null; end $$;

-- ── Users (id = auth.users.id) ───────────────────────────────────
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  name             text not null,
  email            text not null unique,
  phone            text,
  role             user_role not null default 'athlete',
  avatar_url       text,
  email_opt_in     boolean not null default true,
  is_alumni        boolean not null default false,
  alumni_since     date,
  notes            text,
  created_at       timestamptz not null default now()
);

-- ── Trigger: create public.users row on auth.users insert ────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    'athlete'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Alumni extended profile ───────────────────────────────────────
create table if not exists public.alumni_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.users(id) on delete cascade,
  graduation_year integer,
  years_active    text,            -- e.g. "2018-2022"
  achievements    text,
  current_status  text,            -- what they're up to now
  wants_contact   boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── Events ───────────────────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  type        event_type not null default 'practice',
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  location    text,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now()
);

-- ── RSVPs ────────────────────────────────────────────────────────
create table if not exists public.rsvps (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  status      rsvp_status not null default 'yes',
  created_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ── Ride Groups ───────────────────────────────────────────────────
create table if not exists public.ride_groups (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        text not null,
  start_time  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.ride_group_members (
  id             uuid primary key default gen_random_uuid(),
  ride_group_id  uuid not null references public.ride_groups(id) on delete cascade,
  user_id        uuid not null references public.users(id) on delete cascade,
  unique (ride_group_id, user_id)
);

-- ── Roster Profiles ───────────────────────────────────────────────
create table if not exists public.roster_profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null unique references public.users(id) on delete cascade,
  grade            text,
  school           text,
  date_of_birth    date,
  jersey_number    text,
  bike_type        text,
  emergency_contact_name  text,
  emergency_contact_phone text,
  dues_paid        boolean not null default false,
  dues_amount      integer,
  pit_zone_status  text,
  league_registered boolean not null default false,
  notes            text,
  updated_at       timestamptz not null default now()
);

-- ── Chat Channels ─────────────────────────────────────────────────
create table if not exists public.chat_channels (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  type        channel_type not null default 'public',
  created_by  uuid references public.users(id),
  created_at  timestamptz not null default now()
);

-- Seed default channels
insert into public.chat_channels (name, description, type) values
  ('all-team', 'Everyone',              'public'),
  ('coaches',  'Coaches & admins only', 'coaches'),
  ('riders',   'Athletes',              'public'),
  ('parents',  'Parent communication',  'public')
on conflict (name) do nothing;

-- ── Chat Messages ─────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid not null references public.chat_channels(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  content     text not null,
  reply_to_id uuid references public.chat_messages(id) on delete set null,
  edited      boolean not null default false,
  deleted     boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Chat Reactions ────────────────────────────────────────────────
create table if not exists public.chat_reactions (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (message_id, user_id, emoji)
);

-- ── Announcements ─────────────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.announcement_dismissals (
  id               uuid primary key default gen_random_uuid(),
  announcement_id  uuid not null references public.announcements(id) on delete cascade,
  user_id          uuid not null references public.users(id) on delete cascade,
  dismissed_at     timestamptz not null default now(),
  unique (announcement_id, user_id)
);

-- ── Documents ─────────────────────────────────────────────────────
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  url          text not null,
  category     text,
  uploaded_by  uuid not null references public.users(id),
  created_at   timestamptz not null default now()
);

-- ── Volunteer Slots ───────────────────────────────────────────────
create table if not exists public.volunteer_slots (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events(id) on delete cascade,
  name        text not null,
  capacity    integer not null default 1,
  created_at  timestamptz not null default now()
);

create table if not exists public.volunteer_signups (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references public.volunteer_slots(id) on delete cascade,
  user_id     uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (slot_id, user_id)
);

-- ── Media ─────────────────────────────────────────────────────────
create table if not exists public.media_albums (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  event_id    uuid references public.events(id) on delete set null,
  created_by  uuid not null references public.users(id),
  created_at  timestamptz not null default now()
);

create table if not exists public.media_items (
  id             uuid primary key default gen_random_uuid(),
  album_id       uuid not null references public.media_albums(id) on delete cascade,
  url            text not null,
  thumbnail_url  text,
  caption        text,
  uploaded_by    uuid not null references public.users(id),
  created_at     timestamptz not null default now()
);

-- ================================================================
-- Row Level Security
-- ================================================================
alter table public.users                   enable row level security;
alter table public.alumni_profiles         enable row level security;
alter table public.events                  enable row level security;
alter table public.rsvps                   enable row level security;
alter table public.ride_groups             enable row level security;
alter table public.ride_group_members      enable row level security;
alter table public.roster_profiles         enable row level security;
alter table public.chat_channels           enable row level security;
alter table public.chat_messages           enable row level security;
alter table public.chat_reactions          enable row level security;
alter table public.announcements           enable row level security;
alter table public.announcement_dismissals enable row level security;
alter table public.documents               enable row level security;
alter table public.volunteer_slots         enable row level security;
alter table public.volunteer_signups       enable row level security;
alter table public.media_albums            enable row level security;
alter table public.media_items             enable row level security;

-- Helper functions
create or replace function public.my_role()
returns user_role language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;

-- Users
create policy "users: anyone can view"   on public.users for select using (true);
create policy "users: self or admin can update" on public.users for update
  using (id = auth.uid() or my_role() = 'admin');

-- Alumni
create policy "alumni: admin/coach view" on public.alumni_profiles for select
  using (my_role() in ('admin','coach') or user_id = auth.uid());
create policy "alumni: admin manage"     on public.alumni_profiles for all
  using (my_role() = 'admin');

-- Events
create policy "events: all view"    on public.events for select using (true);
create policy "events: staff write" on public.events for insert with check (my_role() in ('admin','coach'));
create policy "events: staff edit"  on public.events for update using (my_role() in ('admin','coach'));
create policy "events: staff del"   on public.events for delete using (my_role() in ('admin','coach'));

-- RSVPs
create policy "rsvps: own view"    on public.rsvps for select using (user_id = auth.uid() or my_role() in ('admin','coach'));
create policy "rsvps: own insert"  on public.rsvps for insert with check (user_id = auth.uid());
create policy "rsvps: own update"  on public.rsvps for update using (user_id = auth.uid());

-- Ride groups
create policy "ride_groups: all view"     on public.ride_groups for select using (true);
create policy "ride_groups: staff write"  on public.ride_groups for insert with check (my_role() in ('admin','coach'));
create policy "rgm: all view"             on public.ride_group_members for select using (true);
create policy "rgm: staff write"          on public.ride_group_members for insert with check (my_role() in ('admin','coach'));

-- Roster
create policy "roster: staff view" on public.roster_profiles for select
  using (user_id = auth.uid() or my_role() in ('admin','coach'));
create policy "roster: staff write" on public.roster_profiles for all
  using (my_role() in ('admin','coach'));

-- Chat channels (filtered by type based on role)
create policy "channels: select" on public.chat_channels for select using (
  type = 'public'
  or (type = 'coaches' and my_role() in ('admin','coach'))
  or (type = 'admin'   and my_role() = 'admin')
);
create policy "channels: insert" on public.chat_channels for insert
  with check (my_role() in ('admin','coach'));

-- Chat messages
create policy "messages: all view"   on public.chat_messages for select using (true);
create policy "messages: own insert" on public.chat_messages for insert with check (user_id = auth.uid());
create policy "messages: own edit"   on public.chat_messages for update using (user_id = auth.uid() or my_role() = 'admin');
create policy "messages: admin del"  on public.chat_messages for delete using (user_id = auth.uid() or my_role() = 'admin');

-- Reactions
create policy "reactions: all view"   on public.chat_reactions for select using (true);
create policy "reactions: own toggle" on public.chat_reactions for insert with check (user_id = auth.uid());
create policy "reactions: own del"    on public.chat_reactions for delete using (user_id = auth.uid());

-- Announcements
create policy "ann: all view"     on public.announcements for select using (true);
create policy "ann: staff write"  on public.announcements for insert with check (my_role() in ('admin','coach'));
create policy "ann: staff del"    on public.announcements for delete using (my_role() in ('admin','coach'));
create policy "ann_d: own view"   on public.announcement_dismissals for select using (user_id = auth.uid());
create policy "ann_d: own insert" on public.announcement_dismissals for insert with check (user_id = auth.uid());

-- Documents
create policy "docs: all view"    on public.documents for select using (true);
create policy "docs: staff write" on public.documents for insert with check (my_role() in ('admin','coach'));
create policy "docs: staff del"   on public.documents for delete using (my_role() in ('admin','coach'));

-- Volunteers
create policy "vslots: all view"    on public.volunteer_slots   for select using (true);
create policy "vslots: staff write" on public.volunteer_slots   for insert with check (my_role() in ('admin','coach'));
create policy "vslots: staff del"   on public.volunteer_slots   for delete using (my_role() in ('admin','coach'));
create policy "vsig: all view"      on public.volunteer_signups for select using (true);
create policy "vsig: own insert"    on public.volunteer_signups for insert with check (user_id = auth.uid());
create policy "vsig: own del"       on public.volunteer_signups for delete using (user_id = auth.uid());

-- Media
create policy "albums: all view"   on public.media_albums for select using (true);
create policy "albums: staff write" on public.media_albums for insert with check (my_role() in ('admin','coach'));
create policy "albums: staff del"  on public.media_albums for delete using (my_role() in ('admin','coach'));
create policy "media: all view"    on public.media_items   for select using (true);
create policy "media: own upload"  on public.media_items   for insert with check (uploaded_by = auth.uid());
create policy "media: staff del"   on public.media_items   for delete
  using (uploaded_by = auth.uid() or my_role() in ('admin','coach'));

-- ================================================================
-- Realtime — enable postgres_changes on chat tables
-- ================================================================
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_reactions;
alter publication supabase_realtime add table public.chat_channels;

-- ================================================================
-- NOTES for Google OAuth:
-- In your Supabase Dashboard → Authentication → Providers → Google
-- Enable Google provider, add your Google OAuth client ID and secret.
-- Set Authorized redirect URI in Google Cloud Console to:
--   https://<your-project-ref>.supabase.co/auth/v1/callback
-- ================================================================
