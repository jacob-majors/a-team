-- ================================================================
-- Migration 002: Multiple emails per roster member + parent-athlete shadow linking
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ── Multiple emails per person ────────────────────────────────────────────────
-- Allows one roster member to have several email addresses (personal, school, work).
-- The primary email stays on roster_members.email.
-- Additional/alternative emails go here.

create table if not exists public.roster_member_emails (
  id          uuid primary key default gen_random_uuid(),
  member_id   uuid not null references public.roster_members(id) on delete cascade,
  email       text not null,
  label       text,            -- e.g. "Personal", "School", "Work"
  created_at  timestamptz not null default now(),
  unique (email)
);

alter table public.roster_member_emails enable row level security;

do $$ begin
  create policy "member_emails: auth read"
    on public.roster_member_emails for select using (auth.uid() is not null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "member_emails: staff write"
    on public.roster_member_emails for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "member_emails: staff update"
    on public.roster_member_emails for update using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "member_emails: staff delete"
    on public.roster_member_emails for delete using (true);
exception when duplicate_object then null; end $$;


-- ── Parent-athlete shadow linking ─────────────────────────────────────────────
-- Allows a parent/guardian roster member to be linked to one or more athlete members.
-- When a parent is linked, they can "shadow" (view the app as) their athlete.

create table if not exists public.parent_athlete_links (
  id                uuid primary key default gen_random_uuid(),
  parent_member_id  uuid not null references public.roster_members(id) on delete cascade,
  athlete_member_id uuid not null references public.roster_members(id) on delete cascade,
  created_at        timestamptz not null default now(),
  unique (parent_member_id, athlete_member_id)
);

alter table public.parent_athlete_links enable row level security;

do $$ begin
  create policy "parent_links: auth read"
    on public.parent_athlete_links for select using (auth.uid() is not null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "parent_links: staff write"
    on public.parent_athlete_links for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "parent_links: staff delete"
    on public.parent_athlete_links for delete using (true);
exception when duplicate_object then null; end $$;


-- ── Documents table (used by web app documents page) ─────────────────────────
create table if not exists public.documents (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  description  text,
  url          text,
  category     text not null default 'Resources',
  type         text not null default 'link',   -- 'link' | 'file'
  uploaded_by  text,
  created_at   timestamptz not null default now()
);

alter table public.documents enable row level security;

do $$ begin
  create policy "documents: auth read"
    on public.documents for select using (auth.uid() is not null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "documents: staff write"
    on public.documents for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "documents: staff delete"
    on public.documents for delete using (true);
exception when duplicate_object then null; end $$;
