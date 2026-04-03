-- ================================================================
-- A-Team: Seed Data — Calendar Events + Roster Members
-- Run in Supabase → SQL Editor → New Query
-- ================================================================

-- ── Create roster_members table if it doesn't exist ──────────────
create table if not exists public.roster_members (
  id                 uuid primary key default gen_random_uuid(),
  first_name         text not null,
  last_name          text,
  full_name          text not null,
  email              text,
  phone              text,
  grade              text,
  role               text not null default 'athlete',
  other_role         text,
  is_admin           boolean not null default false,
  is_guardian        boolean not null default false,
  is_racer           boolean not null default false,
  is_hs_athlete      boolean not null default false,
  is_dev_athlete     boolean not null default false,
  is_grit            boolean not null default false,
  is_team_captain    boolean not null default false,
  is_windsor_hs      boolean not null default false,
  has_training_peaks boolean not null default false,
  is_child           boolean not null default false,
  dues_paid          boolean not null default false,
  dues_amount        numeric,
  pit_zone_status    text,
  notes              text,
  created_at         timestamptz not null default now()
);

alter table public.roster_members enable row level security;

do $$ begin
  create policy "roster: auth read"    on public.roster_members for select using (auth.uid() is not null);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "roster: staff write"  on public.roster_members for insert with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "roster: staff update" on public.roster_members for update using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "roster: staff del"    on public.roster_members for delete using (true);
exception when duplicate_object then null; end $$;

-- ── Calendar Events ──────────────────────────────────────────────
-- Uses the first user in auth.users as created_by.
-- If no users exist yet, sign in once first then re-run.

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from public.users limit 1;
  if admin_id is null then
    raise exception 'No users found. Sign in to the app first, then re-run this script.';
  end if;

  insert into public.events (title, type, start_at, end_at, location, created_by) values
    ('HS Ride',                                         'practice', '2026-04-04 09:00:00-07', '2026-04-04 12:00:00-07', null,                           admin_id),
    ('Girls Riding Together: GRiT Practice',            'practice', '2026-04-08 16:30:00-07', '2026-04-08 17:30:00-07', 'Annadel (Channel Dr.)',         admin_id),
    ('RACE 3 - Six Sigma',                              'race',     '2026-04-11 00:00:00-07', '2026-04-11 23:59:00-07', 'Six Sigma',                     admin_id),
    ('Combined Devo/HS Ride for Non-Racers',            'practice', '2026-04-11 09:00:00-07', '2026-04-11 12:00:00-07', null,                           admin_id),
    ('Girls Riding Together: GRiT Practice',            'practice', '2026-04-22 16:30:00-07', '2026-04-22 17:30:00-07', 'Annadel (Channel Dr.)',         admin_id),
    ('HS Ride',                                         'practice', '2026-04-25 09:00:00-07', '2026-04-25 12:00:00-07', null,                           admin_id),
    ('VOLUNTEER: Levi''s GranFondo Rest Stop',          'meeting',  '2026-04-25 09:30:00-07', '2026-04-25 16:30:00-07', 'Mercuryville Rest Stop',        admin_id),
    ('RACE 4 - Stafford Lake',                          'race',     '2026-05-02 00:00:00-07', '2026-05-02 23:59:00-07', 'Stafford Lake',                 admin_id),
    ('RTA EVENT: Wilderness First Aid (Day 1)',          'meeting',  '2026-05-02 00:00:00-07', '2026-05-02 23:59:00-07', null,                           admin_id),
    ('RTA EVENT: Wilderness First Aid (Day 2)',          'meeting',  '2026-05-03 00:00:00-07', '2026-05-03 23:59:00-07', null,                           admin_id),
    ('Girls Riding Together: GRiT Practice',            'practice', '2026-05-06 16:30:00-07', '2026-05-06 17:30:00-07', 'Annadel (Channel Dr.)',         admin_id),
    ('End of the Season Celebration!',                  'meeting',  '2026-05-09 10:00:00-07', '2026-05-09 13:00:00-07', null,                           admin_id),
    ('DEVO RACE 5 - Six Sigma',                         'race',     '2026-05-16 00:00:00-07', '2026-05-16 23:59:00-07', 'Six Sigma',                     admin_id),
    ('CHAMPIONSHIPS at Six Sigma',                      'race',     '2026-05-17 00:00:00-07', '2026-05-17 23:59:00-07', 'Six Sigma',                     admin_id),
    ('NorCal League: GRiT Summer Camp',                 'meeting',  '2026-07-19 00:00:00-07', '2026-07-19 23:59:00-07', null,                           admin_id),
    ('NorCal League: Boys Summer Camp',                 'meeting',  '2026-07-26 00:00:00-07', '2026-07-26 23:59:00-07', null,                           admin_id),
    ('NICA Western Regionals',                          'race',     '2026-11-14 00:00:00-08', '2026-11-14 23:59:00-08', 'St. George (Utah)',              admin_id)
  on conflict do nothing;
end $$;

-- ── Roster Members ───────────────────────────────────────────────

insert into public.roster_members
  (first_name, last_name, full_name, role, other_role, is_admin, is_guardian, is_racer, is_hs_athlete, is_dev_athlete, is_grit, is_team_captain, is_windsor_hs, has_training_peaks, is_child, dues_paid)
values
  ('Jesus','Díaz','Jesus Díaz','admin','Devo Director',true,true,true,false,true,true,true,false,false,false,false),
  ('Todd','Smith','Todd Smith','admin','Devo Head Coach',true,false,false,false,false,false,false,false,false,false,false),
  ('Maggie','Swarner','Maggie Swarner','admin','GRiT Head Coach',true,true,true,true,false,true,true,true,false,false,false),
  ('Zack','Hirsekorn','Zack Hirsekorn','admin','Head Coach',true,false,false,false,false,false,false,false,false,false,false),
  ('Jill','Brodt','Jill Brodt','admin','Director of Coaching',true,true,true,true,false,true,true,false,false,false,false),
  ('Tony','Cinquini','Tony Cinquini','admin','L3 Asst Devo Coach',true,true,true,true,true,false,false,false,true,false,false),
  ('Carin','Guensch','Carin Guensch','admin','L3 Asst GRiT Coach',true,true,true,true,true,true,false,false,false,false,false),
  ('Paul','Finn','Paul Finn','admin','L3 Devo Race Coach',true,true,true,true,true,false,true,false,true,false,false),
  ('Greg','Guensch','Greg Guensch','admin','L3 HS Race Coach',true,true,true,true,true,true,false,false,false,false,false),
  ('Cheryl','Wallace','Cheryl Wallace','admin','Team Director',true,false,false,false,false,false,false,false,false,false,false),
  ('Julie','Divita','Julie Divita','admin','Windsor Team Director',true,true,true,true,false,false,false,true,false,false,false),
  ('Aaron','Jacobs','Aaron Jacobs','parent',null,false,true,true,true,true,false,false,true,false,false,false),
  ('Aaron','Knight','Aaron Knight','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Abbie','Gubera','Abbie Gubera','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Abigail','Fisher','Abigail Fisher','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Alexander','Piazza','Alexander Piazza','parent',null,false,true,true,true,true,true,true,false,false,false,false),
  ('Alex','Iezza','Alex Iezza','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Amy','Merkel','Amy Merkel','parent',null,false,true,true,false,true,false,true,false,false,false,false),
  ('Anastasia','Eliseeva','Anastasia Eliseeva','parent',null,false,true,true,false,true,true,false,false,false,false,false),
  ('Andrea','Lima','Andrea Lima','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Andres','Muro Rodriguez','Andres Muro Rodriguez','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Breann','Roybal','Breann Roybal','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Brena','Kennedy','Brena Kennedy','parent',null,false,true,true,false,true,false,false,false,true,false,false),
  ('Carrie','Peterson-Kirby','Carrie Peterson-Kirby','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Caspian','Padua','Caspian Padua','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Chantal','Valentine','Chantal Valentine','parent',null,false,true,true,true,false,false,false,true,false,false,false),
  ('Charlie','Ness','Charlie Ness','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Chris','Cornilsen','Chris Cornilsen','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Clayton','Vickers','Clayton Vickers','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Jan','Lau','Jan Lau','coach','Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Jon','Fisher','Jon Fisher','coach','Coach',false,true,true,true,true,true,false,false,false,false,false),
  ('Josh','Grigg','Josh Grigg','coach','Coach',false,true,true,false,true,false,false,false,false,false,false),
  ('Kelsey','Cummings','Kelsey Cummings','coach','Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Steven','Curtis','Steven Curtis','coach','Coach',false,true,true,true,false,false,false,true,false,false,false),
  ('Tim','Helms','Tim Helms','coach','Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Wiley Stock','Cummings','Wiley Stock Cummings','coach','Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Constance','Freeman','Constance Freeman','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Dana','Mellon','Dana Mellon','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Dario','Divita','Dario Divita','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Deanna','Tubbs','Deanna Tubbs','parent',null,false,true,false,false,true,false,false,false,false,false,false),
  ('Denise','Thurman','Denise Thurman','parent',null,false,true,true,true,false,true,true,true,true,false,false),
  ('Deutro','Wilson','Deutro Wilson','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Elizabeth','Barney','Elizabeth Barney','parent',null,false,true,false,false,true,false,false,false,false,false,false),
  ('Emily','Raab','Emily Raab','parent',null,false,true,true,true,true,false,false,false,false,false,false),
  ('Eric','Moessing','Eric Moessing','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Erin','Chase','Erin Chase','parent',null,false,true,false,true,true,true,false,false,false,false,false),
  ('Erin','Fender','Erin Fender','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('George','Finn','George Finn','athlete','Devo Team Captain',false,false,false,false,false,false,false,false,false,true,false),
  ('Gerald','Cuison','Gerald Cuison','parent',null,false,true,false,true,false,false,false,false,false,false,false),
  ('Gianluca','Piazza','Gianluca Piazza','athlete','HS Team Captain',false,false,false,false,false,false,false,false,false,true,false),
  ('Gina','Williams','Gina Williams','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Haley','Piazza','Haley Piazza','parent',null,false,true,true,true,true,true,true,false,false,false,false),
  ('Harper','Gambini','Harper Gambini','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Heather','Iezza','Heather Iezza','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Hilda','Rodriguez','Hilda Rodriguez','parent','Pathfinders',false,true,true,true,false,false,false,true,true,false,false),
  ('Jaclyn','Vickers','Jaclyn Vickers','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Jacob','Majors','Jacob Majors','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('James','Vickers','James Vickers','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Jamie','Fitch','Jamie Fitch','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Jamie','Moessing','Jamie Moessing','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Johnny','Orsi','Johnny Orsi','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Jon','Fitch','Jon Fitch','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Kanato','Creekmore','Kanato Creekmore','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Kim','Marcinkowski','Kim Marcinkowski','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Al','Wainer','Al Wainer','coach','L1 Coach',false,true,true,false,true,false,false,false,false,false,false),
  ('Anthony','Dawson','Anthony Dawson','coach','L1 Coach',false,true,false,false,true,true,false,false,false,false,false),
  ('Chris','Barney','Chris Barney','coach','L1 Coach',false,true,false,false,true,false,false,false,false,false,false),
  ('Josh','Adams','Josh Adams','coach','L1 Coach',false,true,true,false,true,true,false,false,false,false,false),
  ('Matthew','Woerner','Matthew Woerner','coach','L1 Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Rebecca','Abbruzzese','Rebecca Abbruzzese','coach','L1 Coach',false,true,true,false,true,true,false,false,false,false,false),
  ('Bonner','Hagemann','Bonner Hagemann','coach','L2 Asst HS Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Larry','Tristano','Larry Tristano','coach','L2 Asst HS Coach',false,true,true,true,false,false,false,false,false,false,false),
  ('Bob','Weaver','Bob Weaver','coach','L2 Coach',false,true,true,true,false,false,true,true,false,false,false),
  ('Brandon','Ingersoll','Brandon Ingersoll','coach','L2 Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Dave','Komar','Dave Komar','coach','L2 Coach',false,true,true,true,false,true,false,false,false,false,false),
  ('Duncan','Meyers','Duncan Meyers','coach','L2 Coach',false,true,true,true,false,false,false,false,false,false,false),
  ('Gordon','Newman','Gordon Newman','coach','L2 Coach',false,true,true,true,false,true,true,false,false,false,false),
  ('Hollis','Adams','Hollis Adams','coach','L2 Coach',false,true,true,false,true,false,false,false,false,false,false),
  ('Jennifer','Hagemann','Jennifer Hagemann','coach','L2 Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Meghan','Sapia','Meghan Sapia','coach','L2 Coach',false,false,false,false,false,false,false,false,false,false,false),
  ('Pat','Fay','Pat Fay','coach','L2 Coach',false,true,true,true,true,false,false,false,false,false,false),
  ('Ryan','Thurman','Ryan Thurman','coach','L2 Coach',false,true,true,true,false,true,true,true,true,false,false),
  ('Aaron','Majors','Aaron Majors','coach','L3 Coach/Hot Wings',false,true,true,true,false,false,false,false,false,false,false),
  ('Adam','Wilson','Adam Wilson','coach','L3 Coach',false,true,true,false,true,false,false,false,false,false,false),
  ('Laura','Fleming','Laura Fleming','parent',null,false,true,true,true,true,true,true,false,false,false,false),
  ('Leia','Giambastiani','Leia Giambastiani','parent',null,false,true,true,true,true,false,true,false,true,false,false),
  ('Lindsey','McFarland','Lindsey McFarland','parent',null,false,true,true,true,false,false,false,true,false,false,false),
  ('Loren','Chase','Loren Chase','parent',null,false,true,false,true,true,true,false,false,false,false,false),
  ('Margo','Mehl','Margo Mehl','parent',null,false,true,false,true,false,false,false,false,false,false,false),
  ('Mary','Wainer','Mary Wainer','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Micah','Jacobs','Micah Jacobs','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Naomi','Fisher','Naomi Fisher','parent',null,false,true,true,true,false,true,false,false,false,false,false),
  ('Naomi','Thurman','Naomi Thurman','athlete','Team Ambassador',false,false,false,false,false,false,false,false,false,true,false),
  ('Rebecca','Stoddard','Rebecca Stoddard','parent','Newsletter Editor',false,true,true,true,false,false,false,false,false,false,false),
  ('Ricarda','Hernandez','Ricarda Hernandez','parent',null,false,true,true,true,false,false,false,true,false,false,false),
  ('Richard','Kirby','Richard Kirby','parent',null,false,true,true,true,false,false,false,false,false,false,false),
  ('Richard W','Kirby','Richard W Kirby','parent',null,false,false,false,false,false,false,false,false,false,false,false),
  ('Riley','Weaver','Riley Weaver','athlete','Team Ambassador',false,false,false,false,false,false,false,false,false,true,false),
  ('Robert','Swarner','Robert Swarner','parent',null,false,true,true,true,false,false,true,true,false,false,false),
  ('Robin','Dawson','Robin Dawson','parent',null,false,false,false,false,false,false,false,false,false,false,false),
  ('Rowen','Meyers','Rowen Meyers','athlete',null,false,false,false,false,false,false,false,false,false,true,false),
  ('Ruby','Brodt','Ruby Brodt','athlete','HS Team Captain',false,false,false,false,false,false,false,false,false,true,false),
  ('Sally','Grigg','Sally Grigg','parent',null,false,true,true,false,true,false,false,false,false,false,false),
  ('Sean','McFarland','Sean McFarland','parent',null,false,true,true,true,false,false,false,true,false,false,false),
  ('Elise','Weaver','Elise Weaver','parent','Social Media Coord',false,true,true,true,false,false,true,true,false,false,false),
  ('Tiffany','Newman','Tiffany Newman','parent',null,false,true,true,true,false,true,true,false,false,false,false),
  ('William','Harper','William Harper','athlete',null,false,false,false,false,false,false,false,false,false,true,false)
on conflict do nothing;
