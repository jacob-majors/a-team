import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['admin', 'coach', 'athlete', 'parent'])
export const eventTypeEnum = pgEnum('event_type', ['practice', 'race', 'meeting'])
export const rsvpStatusEnum = pgEnum('rsvp_status', ['yes', 'no', 'maybe'])
export const channelTypeEnum = pgEnum('channel_type', ['public', 'coaches', 'admin'])

export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: userRoleEnum('role').notNull().default('athlete'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const events = pgTable('events', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  description: text('description'),
  type: eventTypeEnum('type').notNull().default('practice'),
  startAt: timestamp('start_at').notNull(),
  endAt: timestamp('end_at').notNull(),
  location: text('location'),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rsvps = pgTable('rsvps', {
  id: text('id').primaryKey().notNull(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: rsvpStatusEnum('status').notNull().default('yes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rideGroups = pgTable('ride_groups', {
  id: text('id').primaryKey().notNull(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  startTime: text('start_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rideGroupMembers = pgTable('ride_group_members', {
  id: text('id').primaryKey().notNull(),
  rideGroupId: text('ride_group_id').notNull().references(() => rideGroups.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const rosterProfiles = pgTable('roster_profiles', {
  id: text('id').primaryKey().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  duesPaid: boolean('dues_paid').notNull().default(false),
  duesAmount: integer('dues_amount'),
  pitZoneStatus: text('pit_zone_status'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const chatChannels = pgTable('chat_channels', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: channelTypeEnum('type').notNull().default('public'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey().notNull(),
  channelId: text('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const announcements = pgTable('announcements', {
  id: text('id').primaryKey().notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const announcementDismissals = pgTable('announcement_dismissals', {
  id: text('id').primaryKey().notNull(),
  announcementId: text('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dismissedAt: timestamp('dismissed_at').notNull().defaultNow(),
})

export const documents = pgTable('documents', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  url: text('url').notNull(),
  category: text('category'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const volunteerSlots = pgTable('volunteer_slots', {
  id: text('id').primaryKey().notNull(),
  eventId: text('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const volunteerSignups = pgTable('volunteer_signups', {
  id: text('id').primaryKey().notNull(),
  slotId: text('slot_id').notNull().references(() => volunteerSlots.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const mediaAlbums = pgTable('media_albums', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  eventId: text('event_id').references(() => events.id, { onDelete: 'set null' }),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const mediaItems = pgTable('media_items', {
  id: text('id').primaryKey().notNull(),
  albumId: text('album_id').notNull().references(() => mediaAlbums.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption: text('caption'),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
