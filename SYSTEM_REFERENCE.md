# A-Team System Reference

This file is the low-token reference for how this repo actually works right now.

It is based on the current codebase, not on assumptions.

## 1. What This Repo Is

This is a Turborepo-style monorepo with:

- `apps/web`: Next.js 14 app router frontend
- `packages/api`: tRPC server router definitions
- `packages/db`: Drizzle schema + Postgres/Supabase helpers + SQL files
- `packages/ui`: shared UI primitives
- `packages/types`: shared TypeScript domain types
- `packages/utils`: shared helpers like `cn`, `formatDate`, `getInitials`

Core stack in active use:

- Next.js 14
- React 18
- Tailwind CSS
- Supabase auth/database/storage/realtime
- Drizzle ORM
- tRPC
- Cloudinary for file uploads in some features

Packages installed but not meaningfully wired into the current app:

- Clerk packages are installed and listed in `turbo.json`, but the app currently uses Supabase auth, not Clerk.

## 2. Top-Level File Map

- `package.json`: npm workspaces + root scripts
- `turbo.json`: build/dev task graph and env allowlist
- `tsconfig.json`: base TS config
- `vercel.json`: Vercel build/install commands
- `.mcp.json`: Supabase MCP server config
- `apps/web/next.config.js`: monorepo transpile packages, extra module resolution, allowed image domains
- `packages/db/src/schema.ts`: current TypeScript source of truth for typed DB schema
- `packages/db/setup_supabase.sql`: most complete SQL setup script for Supabase
- `packages/db/migrations/*.sql`: older/inconsistent SQL snapshots

## 3. Workspace and Scripts

### Root `package.json`

Workspaces:

- `apps/*`
- `packages/*`

Scripts:

- `npm run dev` -> `turbo dev`
- `npm run build` -> `turbo build`
- `npm run lint` -> `turbo lint`
- `npm run type-check` -> `turbo type-check`
- `npm run format` -> Prettier over `**/*.{ts,tsx,md}`

Requirements:

- Node `>=18`
- package manager: `npm@11.11.1`

### `turbo.json`

Build task env allowlist:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

Important note:

- Turbo includes Clerk env vars, but the running app code does not currently use Clerk.

### `vercel.json`

- `buildCommand`: `npm run build`
- `installCommand`: `cd ../.. && npm install`
- `framework`: `nextjs`

## 4. Runtime Environment Variables

These are the actual env vars referenced in code.

### Required for the app to function

- `NEXT_PUBLIC_SUPABASE_URL`
  - Used by:
    - `apps/web/src/lib/supabase/server.ts`
    - `apps/web/src/lib/supabase/client.ts`
    - `apps/web/src/lib/supabase/middleware.ts`
    - `packages/api/src/trpc.ts`
    - `packages/db/src/supabase.ts`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Used by the same files above
- `DATABASE_URL`
  - Used by `packages/db/src/client.ts`
  - Required for any Drizzle/tRPC server procedure that uses `db`
- `NEXT_PUBLIC_APP_URL`
  - Used for:
    - server tRPC base URL in `apps/web/src/lib/trpc/server.ts`
    - auth redirect URLs in sign-in/sign-up/invite
  - Falls back to `http://localhost:3000` or `location.origin` in some places

### Required for invite generation

- `SUPABASE_SERVICE_ROLE_KEY`
  - Used only by `apps/web/src/app/api/invite/route.ts`

### Required for Cloudinary uploads

- `CLOUDINARY_API_SECRET`
  - Used by `apps/web/src/app/api/cloudinary-sign/route.ts`
- `CLOUDINARY_API_KEY`
  - Used by the same route
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - Used by the same route and by the browser upload flow

### Installed / listed but not used in current runtime flow

- All Clerk env vars listed in `turbo.json`

## 5. Next.js App Structure

### Public routes

- `/`
  - Marketing landing page
- `/donate`
- `/sponsors`
- `/schools`

### Auth routes

- `/sign-in`
- `/sign-up`
- `/auth/callback`
- `/auth/signout`

### Protected app routes under `/dashboard`

- `/dashboard`
- `/dashboard/home`
- `/dashboard/roster`
- `/dashboard/chat`
- `/dashboard/announcements`
- `/dashboard/documents`
- `/dashboard/volunteers`
- `/dashboard/posts`
- `/dashboard/ride-groups`
- `/dashboard/database`
- `/dashboard/photos`
- `/dashboard/settings`
- `/dashboard/more`

### API routes

- `/api/trpc/[trpc]`
- `/api/cloudinary-sign`
- `/api/invite`

## 6. Auth and Access Model

The live auth system is Supabase Auth.

### Main auth files

- `apps/web/src/lib/supabase/server.ts`
- `apps/web/src/lib/supabase/client.ts`
- `apps/web/src/lib/supabase/middleware.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/auth/callback/route.ts`

### Middleware behavior

`apps/web/src/lib/supabase/middleware.ts`:

- Refreshes Supabase session by calling `supabase.auth.getUser()`
- Treats these as public:
  - `/`
  - `/donate*`
  - `/sponsors*`
  - `/schools*`
- Treats these as auth pages:
  - `/sign-in*`
  - `/sign-up*`
  - `/auth*`
- Redirects unauthenticated users on protected pages to `/sign-in`
- Allows a dev bypass cookie:
  - cookie name: `dev_bypass`
  - bypass value checked: `'1'`

### Auth callback behavior

`apps/web/src/app/auth/callback/route.ts`:

1. Reads `code` and optional `next` query params.
2. Exchanges auth code for session.
3. Reads authenticated email from Supabase user.
4. Checks roster access against:
   - `roster_members.email`
   - `roster_member_emails.email`
5. If email is not on roster:
   - signs user out
   - redirects to `/sign-in?error=not_on_roster`
6. If allowed:
   - redirects to `next` or `/dashboard`

### Sign-in page behavior

`apps/web/src/app/sign-in/[[...sign-in]]/page.tsx`:

- Supports Google OAuth
- Supports email/password sign-in
- Rechecks roster membership against `roster_members.email`
- Has a hard-coded dev flag:
  - `const IS_DEV = true`
- Dev login behavior:
  - sets `document.cookie = 'dev_bypass=1; path=/; max-age=86400'`
  - redirects to `/dashboard`

### Sign-up page behavior

`apps/web/src/app/sign-up/[[...sign-up]]/page.tsx`:

- Supports email/password sign-up
- Supports Google OAuth
- Uses `emailRedirectTo` / `redirectTo` -> `${siteUrl}/auth/callback`
- Does not itself verify roster access; callback route does

## 7. Layout, Role Switching, and Client-Side Identity Overrides

### Dashboard layout

`apps/web/src/app/dashboard/layout.tsx`:

- Requires logged-in user unless `dev_bypass=1`
- Reads profile from `users` table:
  - `name`
  - `role`
- Wraps dashboard in:
  - `ShadowProvider`
  - `RoleProvider`

### Real auth role vs UI role

Important:

- `RoleProvider` is only a client-side UI context.
- `RoleSwitcher` lets the viewer change visible UI role locally.
- This is not real authorization.
- Real DB access is whatever Supabase policies permit.

### Shadow mode

`apps/web/src/components/layout/shadow-context.tsx`:

- localStorage key: `shadow_as`
- stores:
  - `memberId`
  - `name`
  - `role`

### Theme

Theme storage:

- localStorage key: `theme`
- values:
  - `light`
  - `dark`
  - `system`

## 8. Browser-Side Local Storage Keys

These keys are explicitly used in app code:

- `theme`
- `shadow_as`
- `dev_profile`
- `documents_v1`
- `vol_slots_v1`
- `ride_groups_v1`

### `dev_profile`

Used by dev bypass flows. Shape varies slightly by page, but current fields used are:

- `name`
- `phone`
- `email_opt_in`
- `avatar_url`

### `documents_v1`

Fallback cache for documents if Supabase `documents` table is missing/unusable.

Stored doc shape:

- `id`
- `name`
- `description`
- `url`
- `category`
- `type`
- `uploadedBy`
- `createdAt`

### `vol_slots_v1`

Local-only volunteer slots data.

Stored slot shape:

- `id`
- `eventId`
- `eventTitle`
- `eventDate`
- `role`
- `description`
- `timeSlot`
- `location`
- `capacity`
- `signups`

### `ride_groups_v1`

Local-only ride group planner data.

Stored shape:

- `riders`
- `groups`

## 9. Package-Level Details

### `packages/utils`

Exports:

- `cn(...inputs)`
- `formatDate(date)`
- `formatTime(date)`
- `formatDateTime(date)`
- `getInitials(name)`

### `packages/types`

Exports union types/interfaces for:

- `UserRole`
- `EventType`
- `RsvpStatus`
- `ChannelType`
- `User`
- `Event`
- `Rsvp`
- `RideGroup`
- `RideGroupMember`
- `RosterProfile`
- `ChatChannel`
- `ChatMessage`
- `Announcement`
- `Document`
- `VolunteerSlot`
- `VolunteerSignup`
- `MediaAlbum`
- `MediaItem`

Important:

- These types reflect only part of the system.
- They do not include browser-only tables like `roster_members`, `post_likes`, `post_comments`, `parent_athlete_links`, etc.

### `packages/ui`

Shared components:

- `Avatar`
- `Badge`
- `Button`
- `Card`
- `CardHeader`
- `CardTitle`
- `CardContent`

## 10. tRPC System

### Server route

`apps/web/src/app/api/trpc/[trpc]/route.ts`

- runtime: `nodejs`
- dynamic: `force-dynamic`
- exposes GET and POST via `fetchRequestHandler`

### tRPC context

`packages/api/src/trpc.ts`

Context fields:

- `userId: string | null`
- `headers: Headers`

Auth behavior:

- Creates Supabase SSR client from request cookies
- Calls `supabase.auth.getUser()`
- `protectedProcedure` throws `UNAUTHORIZED` if no `userId`

### Client access

- client components use `apps/web/src/lib/trpc/client.ts` + `provider.tsx`
- server components can use `apps/web/src/lib/trpc/server.ts`

### App router

`packages/api/src/index.ts` exposes:

- `events`
- `rsvps`
- `roster`
- `chat`
- `announcements`

## 11. Exact tRPC Procedures

### `events.list`

- type: protected query
- input: none
- returns: all rows from `events`, ordered by `startAt`

### `events.getById`

- type: protected query
- input:
  - `id: string`

### `events.create`

- type: protected mutation
- input:
  - `title: string`
  - `description?: string`
  - `type: 'practice' | 'race' | 'meeting'`
  - `startAt: Date`
  - `endAt: Date`
  - `location?: string`
- server-populated:
  - `id = randomUUID()`
  - `createdBy = ctx.userId`

### `events.update`

- type: protected mutation
- input:
  - `id: string`
  - `title?: string`
  - `description?: string`
  - `type?: 'practice' | 'race' | 'meeting'`
  - `startAt?: Date`
  - `endAt?: Date`
  - `location?: string`

### `rsvps.upsert`

- type: protected mutation
- input:
  - `eventId: string`
  - `status: 'yes' | 'no' | 'maybe'`

Behavior:

- Finds existing RSVP for current user and event
- updates if found
- inserts if missing

### `rsvps.forEvent`

- type: protected query
- input:
  - `eventId: string`

### `roster.list`

- type: protected query
- input: none
- returns:
  - `users`
  - left joined `roster_profiles`

### `roster.getById`

- type: protected query
- input:
  - `id: string`

### `roster.update`

- type: protected mutation
- input:
  - `userId: string`
  - `duesPaid?: boolean`
  - `duesAmount?: number`
  - `pitZoneStatus?: string`
  - `notes?: string`

Behavior:

- updates `roster_profiles` if row exists
- inserts one otherwise

### `chat.getChannels`

- type: protected query
- input: none

### `chat.getMessages`

- type: protected query
- input:
  - `channelId: string`
  - `limit: number = 50`
  - `cursor?: string`

Important:

- `cursor` is accepted but not actually used for pagination logic.

### `chat.sendMessage`

- type: protected mutation
- input:
  - `channelId: string`
  - `content: string`

### `chat.createChannel`

- type: protected mutation
- input:
  - `name: string`
  - `description?: string`
  - `type: 'public' | 'coaches' | 'admin'` default `'public'`

### `announcements.list`

- type: protected query
- input: none

### `announcements.create`

- type: protected mutation
- input:
  - `title: string`
  - `body: string`

### `announcements.dismiss`

- type: protected mutation
- input:
  - `announcementId: string`

### `announcements.getDismissals`

- type: protected query
- input: none

## 12. REST/API Route Contracts

### `POST /api/cloudinary-sign`

Request body:

- `folder?: string`
- `resource_type?: string`

Default body interpretation:

- `folder = 'posts'`
- `resource_type = 'auto'`

Response body:

- `signature`
- `timestamp`
- `apiKey`
- `cloudName`
- `folder`
- `resource_type`

Auth:

- requires authenticated user or `dev_bypass=1`

### `POST /api/invite`

Request body:

- `email: string`

Auth/authorization:

- user must be logged in
- `users.role` must equal `'admin'`
- email must exist in either:
  - `roster_members.email`
  - `roster_member_emails.email`

Response body on success:

- `link: string | undefined`

Required env:

- `SUPABASE_SERVICE_ROLE_KEY`

## 13. Database Layers in This Repo

There are really two overlapping database models.

### Model A: typed Drizzle schema

Defined in:

- `packages/db/src/schema.ts`

This is the current TypeScript schema used by `@a-team/db` and tRPC procedures.

### Model B: direct Supabase browser tables

Used heavily by dashboard pages with `.from('table_name')`.

This includes extra tables not represented in the current Drizzle schema.

That means:

- the codebase does not have one single perfectly aligned data model
- several UI pages depend on tables/columns that only exist in SQL files or in Supabase directly

## 14. Current Drizzle Schema Tables

From `packages/db/src/schema.ts`.

### Enums

- `user_role`: `admin | coach | athlete | parent`
- `event_type`: `practice | race | meeting`
- `rsvp_status`: `yes | no | maybe`
- `channel_type`: `public | coaches | admin`

### `users`

Columns:

- `id: uuid` primary key
- `name: text` required
- `email: text` required unique
- `phone: text | null`
- `role: user_role` default `athlete`
- `avatar_url: text | null`
- `email_opt_in: boolean` default `true`
- `is_alumni: boolean` default `false`
- `alumni_since: date | null`
- `notes: text | null`
- `created_at: timestamp`

### `alumni_profiles`

- `id`
- `user_id` unique fk -> `users.id`
- `graduation_year`
- `years_active`
- `achievements`
- `current_status`
- `wants_contact`
- `created_at`

### `events`

- `id`
- `title`
- `description`
- `type`
- `start_at`
- `end_at`
- `location`
- `created_by` fk -> `users.id`
- `created_at`

### `rsvps`

- `id`
- `event_id` fk
- `user_id` fk
- `status`
- `created_at`

### `ride_groups`

- `id`
- `event_id`
- `name`
- `start_time`
- `created_at`

### `ride_group_members`

- `id`
- `ride_group_id`
- `user_id`

### `roster_profiles`

- `id`
- `user_id`
- `grade`
- `school`
- `date_of_birth`
- `jersey_number`
- `bike_type`
- `emergency_contact_name`
- `emergency_contact_phone`
- `dues_paid`
- `dues_amount`
- `pit_zone_status`
- `league_registered`
- `notes`
- `updated_at`

### `chat_channels`

- `id`
- `name`
- `description`
- `type`
- `created_by`
- `created_at`

### `chat_messages`

- `id`
- `channel_id`
- `user_id`
- `content`
- `reply_to_id`
- `edited`
- `deleted`
- `created_at`
- `updated_at`

### `chat_reactions`

- `id`
- `message_id`
- `user_id`
- `emoji`
- `created_at`

### `announcements`

- `id`
- `title`
- `body`
- `created_by`
- `created_at`

### `announcement_dismissals`

- `id`
- `announcement_id`
- `user_id`
- `dismissed_at`

### `documents`

- `id`
- `name`
- `description`
- `url`
- `category`
- `uploaded_by`
- `created_at`

### `volunteer_slots`

- `id`
- `event_id`
- `name`
- `capacity`
- `created_at`

### `volunteer_signups`

- `id`
- `slot_id`
- `user_id`
- `created_at`

### `media_albums`

- `id`
- `name`
- `description`
- `event_id`
- `created_by`
- `created_at`

### `media_items`

- `id`
- `album_id`
- `url`
- `thumbnail_url`
- `caption`
- `uploaded_by`
- `created_at`

## 15. Direct-Supabase Tables Referenced by the Frontend

These are used in browser code, whether or not they exist in the typed schema.

### Tables clearly expected by the UI

- `users`
- `events`
- `chat_channels`
- `chat_messages`
- `chat_reactions`
- `documents`
- `roster_profiles`
- `alumni_profiles`

### Extra tables expected by specific pages / flows

- `roster_members`
- `roster_member_emails`
- `parent_athlete_links`
- `posts`
- `post_likes`
- `post_comments`

### Storage bucket expected by settings page

- Supabase storage bucket: `avatars`

## 16. Important Schema Mismatches

These are the main places where the repo disagrees with itself.

### 1. Old Clerk-era SQL vs current Supabase-auth code

`packages/db/migrations/001_initial.sql` includes:

- `users.clerk_id`
- text primary keys in places

But current app code uses:

- Supabase Auth user IDs
- UUID-based schema in `setup_supabase.sql` and `schema.ts`

### 2. `roster_members` exists in SQL/UI, but not in Drizzle schema

Used by:

- sign-in checks
- auth callback
- roster page
- settings page
- announcements email tool
- invite route

### 3. `documents` shape mismatch

Drizzle schema/table type:

- has `name`, `description`, `url`, `category`, `uploaded_by`, `created_at`

Documents UI expects extra column:

- `type: 'file' | 'link'`

`002_multi_email_shadow.sql` creates `documents.type`, but Drizzle schema does not.

### 4. Chat channel types mismatch

Drizzle enum:

- `public | coaches | admin`

Chat page runtime types:

- `public | coaches | admin | hs | devo`

So the UI expects channel types the schema enum does not define.

### 5. Volunteer page is localStorage-based, not wired to schema tables

There are typed/schema tables:

- `volunteer_slots`
- `volunteer_signups`

But `apps/web/src/app/dashboard/volunteers/page.tsx` stores slots in localStorage key `vol_slots_v1` instead of using those tables.

### 6. Ride groups page is localStorage-based, not wired to schema tables

There are typed/schema tables:

- `ride_groups`
- `ride_group_members`

But `apps/web/src/app/dashboard/ride-groups/page.tsx` uses localStorage key `ride_groups_v1`.

### 7. Announcements page is mostly local UI state

There is a tRPC announcements router and DB tables.

But `apps/web/src/app/dashboard/announcements/page.tsx`:

- creates announcements in component state only
- dismisses announcements in component state only
- only uses Supabase for the email-recipient tool

### 8. Posts feature depends on tables not defined in current schema

Posts page expects:

- `posts`
- `post_likes`
- `post_comments`

These are not in `packages/db/src/schema.ts`.

## 17. SQL Files and What They Mean

### `packages/db/setup_supabase.sql`

This is the most complete SQL bootstrap script in the repo.

It creates:

- `users`
- `alumni_profiles`
- `events`
- `rsvps`
- `ride_groups`
- `ride_group_members`
- `roster_profiles`
- `chat_channels`
- `chat_messages`
- `chat_reactions`
- `announcements`
- `announcement_dismissals`
- `documents`
- `volunteer_slots`
- `volunteer_signups`
- `media_albums`
- `media_items`

It also:

- enables RLS on those tables
- adds `handle_new_user()` trigger on `auth.users`
- seeds default chat channels

### `packages/db/seed_data.sql`

Creates/uses separate roster model:

- `roster_members`

Also seeds:

- many `events`
- many `roster_members`

### `packages/db/migrations/002_multi_email_shadow.sql`

Adds tables for:

- `roster_member_emails`
- `parent_athlete_links`
- a `documents` table definition with `type`

Important:

- this file references `public.roster_members`
- it is designed around the browser-side roster model, not the Drizzle schema model

## 18. Feature-by-Feature Data Contracts

### Landing / marketing

Main files:

- `apps/web/src/app/page.tsx`
- `apps/web/src/app/sponsors/page.tsx`
- `apps/web/src/app/schools/page.tsx`
- `apps/web/src/app/donate/page.tsx`

These are mostly static and do not depend on DB state.

### Calendar

Main file:

- `apps/web/src/app/dashboard/page.tsx`

Supabase table used:

- `events`

Columns expected by UI:

- `id`
- `title`
- `type`
- `start_at`
- `end_at`
- `location`
- `description`
- `created_by`

### Dashboard home

Main file:

- `apps/web/src/app/dashboard/home/page.tsx`

Reads:

- `users.name`
- `events.id,title,type,start_at,location`
- `posts.id,content,image_url,created_at,user_id`
- `post_likes.id`

### Roster page

Main file:

- `apps/web/src/app/dashboard/roster/page.tsx`

Primary table:

- `roster_members`

Columns expected:

- `id`
- `first_name`
- `last_name`
- `full_name`
- `email`
- `phone`
- `grade`
- `role`
- `other_role`
- `is_admin`
- `is_guardian`
- `is_racer`
- `is_hs_athlete`
- `is_dev_athlete`
- `is_grit`
- `is_team_captain`
- `is_windsor_hs`
- `has_training_peaks`
- `is_child`
- `dues_paid`
- `dues_amount`
- `pit_zone_status`
- `notes`

CSV import app fields available in UI:

- `firstName`
- `lastName`
- `email`
- `phone`
- `grade`
- `otherRole`
- `duesPaid`
- `duesAmount`
- `pitZoneStatus`
- `notes`
- `isAdmin`
- `isGuardian`
- `isRacer`
- `isHSAthlete`
- `isDevAthlete`
- `isGrit`
- `isTeamCaptain`
- `isWindsorHS`
- `hasTrainingPeaks`
- `isChild`

Invite flow from roster page:

- calls `POST /api/invite`
- requires admin user in `users.role`

### Database page

Main file:

- `apps/web/src/app/dashboard/database/page.tsx`

Reads/writes:

- `users`
- `roster_profiles`
- `alumni_profiles`

This page aligns more closely with the current Drizzle/Supabase typed schema.

### Settings page

Main file:

- `apps/web/src/app/dashboard/settings/page.tsx`

Reads/writes:

- `users`
- `roster_members`
- `parent_athlete_links`
- Supabase storage bucket `avatars`

User fields saved to `users`:

- `id`
- `name`
- `phone`
- `email_opt_in`
- `email`
- `avatar_url` (when photo uploaded)

Roster flags read from `roster_members`:

- `role`
- `is_racer`
- `is_hs_athlete`
- `is_dev_athlete`
- `is_grit`
- `is_team_captain`
- `is_windsor_hs`
- `has_training_peaks`

### Chat page

Main file:

- `apps/web/src/app/dashboard/chat/page.tsx`

Tables used:

- `users`
- `roster_members`
- `chat_channels`
- `chat_messages`
- `chat_reactions`

Expected `chat_channels` columns:

- `id`
- `name`
- `description`
- `type`
- `created_by`

Expected `chat_messages` columns:

- `id`
- `channel_id`
- `user_id`
- `content`
- `reply_to_id`
- `edited`
- `deleted`
- `created_at`

Expected `chat_reactions` columns:

- `id`
- `message_id`
- `user_id`
- `emoji`

Extra runtime message tag system is UI-only:

- `attendance`
- `question`
- `general`

### Announcements page

Main file:

- `apps/web/src/app/dashboard/announcements/page.tsx`

Current reality:

- announcement cards are local component state only
- email recipient tool reads from `roster_members`

Email audience filter values:

- `all`
- `athletes`
- `coaches`
- `parents`

### Documents page

Main file:

- `apps/web/src/app/dashboard/documents/page.tsx`

Tables/storage used:

- `documents`
- Cloudinary for file uploads
- localStorage fallback `documents_v1`

Expected `documents` columns by UI:

- `id`
- `name`
- `description`
- `url`
- `category`
- `type`
- `uploaded_by`
- `created_at`

Categories in UI:

- `Waivers & Forms`
- `Race Info`
- `Team Policies`
- `Resources`

### Posts / Team Feed

Main file:

- `apps/web/src/app/dashboard/posts/page.tsx`

Tables expected:

- `posts`
- `post_likes`
- `post_comments`
- `users`

Expected `posts` columns:

- `id`
- `user_id`
- `content`
- `image_url`
- `created_at`
- `deleted`

Expected `post_likes` columns:

- `id`
- `post_id`
- `user_id`

Expected `post_comments` columns:

- `id`
- `post_id`
- `user_id`
- `content`
- `created_at`

Image uploads:

- use `uploadToCloudinary(file, 'posts')`

### Volunteers page

Main file:

- `apps/web/src/app/dashboard/volunteers/page.tsx`

Reads from Supabase only to discover race events:

- `events`

Stores volunteer slot data locally:

- localStorage key `vol_slots_v1`

### Ride groups page

Main file:

- `apps/web/src/app/dashboard/ride-groups/page.tsx`

No DB usage.

Uses:

- CSV import via PapaParse
- localStorage key `ride_groups_v1`

CSV columns auto-detected:

- name-like headers:
  - `name`
  - `rider`
  - `athlete`
  - `first name`
  - `full name`
- time-like headers:
  - `time`
  - `result`
  - `finish`
  - `duration`
  - `seconds`

### Photos page

Main file:

- `apps/web/src/app/dashboard/photos/page.tsx`

Current status:

- not built
- informational comparison page only

## 19. Cloudinary Upload Flow

Client helper:

- `apps/web/src/lib/cloudinary.ts`

Allowed folders in helper type:

- `posts`
- `documents`
- `avatars`

Flow:

1. Client POSTs to `/api/cloudinary-sign`
2. Server returns signed params
3. Browser uploads directly to Cloudinary
4. Client receives `secure_url`
5. That URL is stored in app data

Important:

- settings page avatar upload does not use Cloudinary
- settings page uses Supabase Storage bucket `avatars`

## 20. Supabase Storage Usage

Current explicit storage usage:

- bucket name: `avatars`

Used by:

- `apps/web/src/app/dashboard/settings/page.tsx`

Expected capability:

- `upload(path, file, { upsert: true })`
- `getPublicUrl(path)`

## 21. Realtime Usage

Realtime is used in:

- posts page
- chat page

### Posts realtime

Subscribes to postgres changes on:

- `posts`
- `post_likes`
- `post_comments`

### Chat realtime

Uses Supabase realtime channel/presence patterns for:

- message updates
- typing indicators

## 22. Dev/Test Shortcuts Built Into the App

### Dev bypass cookie

- cookie: `dev_bypass=1`
- checked in middleware and some API routes

### Dev profile local storage

- localStorage key: `dev_profile`

### Hard-coded sign-in dev flag

- `IS_DEV = true` in sign-in page

This means the dev skip-login control is currently always available in that page unless code is changed.

## 23. What Is Most Likely the Real “Needed Setup” for This App

If you want the broadest current feature coverage, you need:

1. Supabase project
2. `NEXT_PUBLIC_SUPABASE_URL`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `DATABASE_URL`
5. `NEXT_PUBLIC_APP_URL`
6. `SUPABASE_SERVICE_ROLE_KEY` if invites are needed
7. Supabase storage bucket `avatars`
8. Cloudinary account/env vars if posts/documents uploads are needed
9. SQL for both:
   - the main typed schema
   - the browser-only roster/posts/linking tables the UI expects

## 24. Recommended Source-of-Truth Order

If you need to reason about this repo without wasting tokens, use this order:

1. `packages/db/src/schema.ts`
   - current typed backend schema
2. `apps/web/src/app/**/page.tsx`
   - tells you what the UI actually reads/writes
3. `packages/db/setup_supabase.sql`
   - best full SQL bootstrap
4. `packages/db/seed_data.sql`
   - extra roster/event seed model
5. `packages/db/migrations/002_multi_email_shadow.sql`
   - extra roster linking/email tables

## 25. Short Version

The repo is one app with two overlapping data models:

- a typed Drizzle/tRPC model
- a direct Supabase browser model

That is the single biggest thing to remember.

If a feature looks confusing, check whether it uses:

- `db` / tRPC / `packages/db/src/schema.ts`
- or `.from('table')` directly in a page

Those are often not using the exact same schema.
