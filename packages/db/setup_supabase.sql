-- ================================================================
-- A-Team: Full Supabase Setup script (Schema + Realtime + Triggers)
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
create table public.users (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  email       text not null unique,
  role        user_role not null default 'athlete',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ── Trigger for creating user on sign up ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, role)
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'athlete'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Events ───────────────────────────────────────────────────────
create table public.events (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text,
  type        event_type not null default 'practice',
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  location    text,
  created_by  text not null references public.users(id),
  created_at  timestamptz not null default now()
);

-- ── RSVPs ────────────────────────────────────────────────────────
create table public.rsvps (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references public.events(id) on delete cascade,
  user_id     text not null references public.users(id) on delete cascade,
  status      rsvp_status not null default 'yes',
  created_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- ── Ride Groups ───────────────────────────────────────────────────
create table public.ride_groups (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references public.events(id) on delete cascade,
  name        text not null,
  start_time  text,
  created_at  timestamptz not null default now()
);

create table public.ride_group_members (
  id             text primary key default gen_random_uuid()::text,
  ride_group_id  text not null references public.ride_groups(id) on delete cascade,
  user_id        text not null references public.users(id) on delete cascade,
  unique (ride_group_id, user_id)
);

-- ── Roster Profiles ───────────────────────────────────────────────
create table public.roster_profiles (
  id               text primary key default gen_random_uuid()::text,
  user_id          text not null unique references public.users(id) on delete cascade,
  dues_paid        boolean not null default false,
  dues_amount      integer,
  pit_zone_status  text,
  notes            text,
  phone            text,
  grade            text,
  updated_at       timestamptz not null default now()
);

-- ── Chat Channels ─────────────────────────────────────────────────
create table public.chat_channels (
  id          text primary key default gen_random_uuid()::text,
  name        text not null unique,
  description text,
  type        channel_type not null default 'public',
  created_at  timestamptz not null default now()
);

-- Seed default channels
insert into public.chat_channels (id, name, description, type) values
  (gen_random_uuid()::text, 'all-team', 'Everyone',              'public'),
  (gen_random_uuid()::text, 'coaches',  'Coaches & admins only', 'coaches'),
  (gen_random_uuid()::text, 'riders',   'Athletes',              'public'),
  (gen_random_uuid()::text, 'parents',  'Parent communication',  'public');

-- ── Chat Messages ─────────────────────────────────────────────────
create table public.chat_messages (
  id          text primary key default gen_random_uuid()::text,
  channel_id  text not null references public.chat_channels(id) on delete cascade,
  user_id     text not null references public.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ── Announcements ─────────────────────────────────────────────────
create table public.announcements (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  body        text not null,
  created_by  text not null references public.users(id),
  created_at  timestamptz not null default now()
);

create table public.announcement_dismissals (
  id               text primary key default gen_random_uuid()::text,
  announcement_id  text not null references public.announcements(id) on delete cascade,
  user_id          text not null references public.users(id) on delete cascade,
  dismissed_at     timestamptz not null default now(),
  unique (announcement_id, user_id)
);

-- ── Documents ─────────────────────────────────────────────────────
create table public.documents (
  id           text primary key default gen_random_uuid()::text,
  name         text not null,
  description  text,
  url          text not null,
  category     text,
  uploaded_by  text not null references public.users(id),
  created_at   timestamptz not null default now()
);

-- ── Volunteer Slots ───────────────────────────────────────────────
create table public.volunteer_slots (
  id          text primary key default gen_random_uuid()::text,
  event_id    text not null references public.events(id) on delete cascade,
  name        text not null,
  capacity    integer not null default 1,
  created_at  timestamptz not null default now()
);

create table public.volunteer_signups (
  id          text primary key default gen_random_uuid()::text,
  slot_id     text not null references public.volunteer_slots(id) on delete cascade,
  user_id     text not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (slot_id, user_id)
);

-- ── Media Albums ──────────────────────────────────────────────────
create table public.media_albums (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  description text,
  event_id    text references public.events(id) on delete set null,
  created_by  text not null references public.users(id),
  created_at  timestamptz not null default now()
);

create table public.media_items (
  id             text primary key default gen_random_uuid()::text,
  album_id       text not null references public.media_albums(id) on delete cascade,
  url            text not null,
  thumbnail_url  text,
  caption        text,
  uploaded_by    text not null references public.users(id),
  created_at     timestamptz not null default now()
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================
alter table public.users                   enable row level security;
alter table public.events                  enable row level security;
alter table public.rsvps                   enable row level security;
alter table public.ride_groups             enable row level security;
alter table public.ride_group_members      enable row level security;
alter table public.roster_profiles         enable row level security;
alter table public.chat_channels           enable row level security;
alter table public.chat_messages           enable row level security;
alter table public.announcements           enable row level security;
alter table public.announcement_dismissals enable row level security;
alter table public.documents               enable row level security;
alter table public.volunteer_slots         enable row level security;
alter table public.volunteer_signups       enable row level security;
alter table public.media_albums            enable row level security;
alter table public.media_items             enable row level security;

-- ── Helper: get current user's DB id & role ───────────────────────
create or replace function public.get_my_db_id()
returns text
language sql stable security definer
as $$
  select auth.uid()::text;
$$;

create or replace function public.get_my_role()
returns user_role
language sql stable security definer
as $$
  select role from public.users where id = auth.uid()::text;
$$;

-- ── Policy mapping ────────────────────────────────────────────────
create policy "users_select" on public.users for select using (true);
create policy "users_update" on public.users for update using (
  id = auth.uid()::text or get_my_role() = 'admin'
);

create policy "events_select" on public.events for select using (true);
create policy "events_insert" on public.events for insert with check (get_my_role() in ('admin','coach'));
create policy "events_update" on public.events for update using (get_my_role() in ('admin','coach'));
create policy "events_delete" on public.events for delete using (get_my_role() in ('admin','coach'));

create policy "rsvps_select" on public.rsvps for select using (
  user_id = get_my_db_id() or get_my_role() in ('admin','coach')
);
create policy "rsvps_insert" on public.rsvps for insert with check (user_id = get_my_db_id());
create policy "rsvps_update" on public.rsvps for update using (user_id = get_my_db_id());

create policy "ride_groups_select" on public.ride_groups for select using (true);
create policy "ride_groups_insert" on public.ride_groups for insert with check (get_my_role() in ('admin','coach'));
create policy "ride_group_members_select" on public.ride_group_members for select using (true);
create policy "ride_group_members_insert" on public.ride_group_members for insert with check (get_my_role() in ('admin','coach'));

create policy "roster_select" on public.roster_profiles for select using (
  user_id = get_my_db_id() or get_my_role() in ('admin','coach')
);
create policy "roster_insert" on public.roster_profiles for insert with check (get_my_role() in ('admin','coach'));
create policy "roster_update" on public.roster_profiles for update using (get_my_role() in ('admin','coach'));

create policy "chat_channels_select" on public.chat_channels for select using (
  type = 'public'
  or (type = 'coaches' and get_my_role() in ('admin','coach'))
  or (type = 'admin'   and get_my_role() = 'admin')
);
create policy "chat_channels_insert" on public.chat_channels for insert with check (get_my_role() in ('admin','coach'));

create policy "chat_messages_select" on public.chat_messages for select using (true);
create policy "chat_messages_insert" on public.chat_messages for insert with check (user_id = get_my_db_id());

create policy "ann_select"  on public.announcements for select using (true);
create policy "ann_insert"  on public.announcements for insert with check (get_my_role() in ('admin','coach'));
create policy "ann_delete"  on public.announcements for delete using (get_my_role() in ('admin','coach'));

create policy "ann_dismiss_select" on public.announcement_dismissals for select using (user_id = get_my_db_id());
create policy "ann_dismiss_insert" on public.announcement_dismissals for insert with check (user_id = get_my_db_id());

create policy "docs_select" on public.documents for select using (true);
create policy "docs_insert" on public.documents for insert with check (get_my_role() in ('admin','coach'));
create policy "docs_delete" on public.documents for delete using (get_my_role() in ('admin','coach'));

create policy "vol_slots_select"   on public.volunteer_slots   for select using (true);
create policy "vol_slots_insert"   on public.volunteer_slots   for insert with check (get_my_role() in ('admin','coach'));
create policy "vol_slots_delete"   on public.volunteer_slots   for delete using (get_my_role() in ('admin','coach'));
create policy "vol_signups_select" on public.volunteer_signups for select using (true);
create policy "vol_signups_insert" on public.volunteer_signups for insert with check (user_id = get_my_db_id());
create policy "vol_signups_delete" on public.volunteer_signups for delete using (user_id = get_my_db_id());

create policy "albums_select" on public.media_albums for select using (true);
create policy "albums_insert" on public.media_albums for insert with check (get_my_role() in ('admin','coach'));
create policy "albums_delete" on public.media_albums for delete using (get_my_role() in ('admin','coach'));

create policy "media_items_select" on public.media_items for select using (true);
create policy "media_items_insert" on public.media_items for insert with check (uploaded_by = get_my_db_id());
create policy "media_items_delete" on public.media_items for delete using (
  uploaded_by = get_my_db_id() or get_my_role() in ('admin','coach')
);

-- ================================================================
-- Enable Realtime for chat
-- ================================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.chat_messages;
