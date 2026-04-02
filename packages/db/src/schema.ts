import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  uuid,
  date,
} from 'drizzle-orm/pg-core'

export const userRoleEnum   = pgEnum('user_role',    ['admin', 'coach', 'athlete', 'parent'])
export const eventTypeEnum  = pgEnum('event_type',   ['practice', 'race', 'meeting'])
export const rsvpStatusEnum = pgEnum('rsvp_status',  ['yes', 'no', 'maybe'])
export const channelTypeEnum = pgEnum('channel_type', ['public', 'coaches', 'admin'])

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().notNull(),
  name:         text('name').notNull(),
  email:        text('email').notNull().unique(),
  phone:        text('phone'),
  role:         userRoleEnum('role').notNull().default('athlete'),
  avatarUrl:    text('avatar_url'),
  emailOptIn:   boolean('email_opt_in').notNull().default(true),
  isAlumni:     boolean('is_alumni').notNull().default(false),
  alumniSince:  date('alumni_since'),
  notes:        text('notes'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})

export const alumniProfiles = pgTable('alumni_profiles', {
  id:              uuid('id').primaryKey().notNull(),
  userId:          uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  graduationYear:  integer('graduation_year'),
  yearsActive:     text('years_active'),
  achievements:    text('achievements'),
  currentStatus:   text('current_status'),
  wantsContact:    boolean('wants_contact').notNull().default(false),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
})

export const events = pgTable('events', {
  id:          uuid('id').primaryKey().notNull(),
  title:       text('title').notNull(),
  description: text('description'),
  type:        eventTypeEnum('type').notNull().default('practice'),
  startAt:     timestamp('start_at').notNull(),
  endAt:       timestamp('end_at').notNull(),
  location:    text('location'),
  createdBy:   uuid('created_by').notNull().references(() => users.id),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const rsvps = pgTable('rsvps', {
  id:        uuid('id').primaryKey().notNull(),
  eventId:   uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status:    rsvpStatusEnum('status').notNull().default('yes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rideGroups = pgTable('ride_groups', {
  id:        uuid('id').primaryKey().notNull(),
  eventId:   uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  startTime: text('start_time'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const rideGroupMembers = pgTable('ride_group_members', {
  id:           uuid('id').primaryKey().notNull(),
  rideGroupId:  uuid('ride_group_id').notNull().references(() => rideGroups.id, { onDelete: 'cascade' }),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
})

export const rosterProfiles = pgTable('roster_profiles', {
  id:                      uuid('id').primaryKey().notNull(),
  userId:                  uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  grade:                   text('grade'),
  school:                  text('school'),
  dateOfBirth:             date('date_of_birth'),
  jerseyNumber:            text('jersey_number'),
  bikeType:                text('bike_type'),
  emergencyContactName:    text('emergency_contact_name'),
  emergencyContactPhone:   text('emergency_contact_phone'),
  duesPaid:                boolean('dues_paid').notNull().default(false),
  duesAmount:              integer('dues_amount'),
  pitZoneStatus:           text('pit_zone_status'),
  leagueRegistered:        boolean('league_registered').notNull().default(false),
  notes:                   text('notes'),
  updatedAt:               timestamp('updated_at').notNull().defaultNow(),
})

export const chatChannels = pgTable('chat_channels', {
  id:          uuid('id').primaryKey().notNull(),
  name:        text('name').notNull().unique(),
  description: text('description'),
  type:        channelTypeEnum('type').notNull().default('public'),
  createdBy:   uuid('created_by').references(() => users.id),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const chatMessages = pgTable('chat_messages', {
  id:         uuid('id').primaryKey().notNull(),
  channelId:  uuid('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:    text('content').notNull(),
  replyToId:  uuid('reply_to_id'),
  edited:     boolean('edited').notNull().default(false),
  deleted:    boolean('deleted').notNull().default(false),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
})

export const chatReactions = pgTable('chat_reactions', {
  id:        uuid('id').primaryKey().notNull(),
  messageId: uuid('message_id').notNull().references(() => chatMessages.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  emoji:     text('emoji').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const announcements = pgTable('announcements', {
  id:        uuid('id').primaryKey().notNull(),
  title:     text('title').notNull(),
  body:      text('body').notNull(),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const announcementDismissals = pgTable('announcement_dismissals', {
  id:             uuid('id').primaryKey().notNull(),
  announcementId: uuid('announcement_id').notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  userId:         uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dismissedAt:    timestamp('dismissed_at').notNull().defaultNow(),
})

export const documents = pgTable('documents', {
  id:          uuid('id').primaryKey().notNull(),
  name:        text('name').notNull(),
  description: text('description'),
  url:         text('url').notNull(),
  category:    text('category'),
  uploadedBy:  uuid('uploaded_by').notNull().references(() => users.id),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const volunteerSlots = pgTable('volunteer_slots', {
  id:        uuid('id').primaryKey().notNull(),
  eventId:   uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  name:      text('name').notNull(),
  capacity:  integer('capacity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const volunteerSignups = pgTable('volunteer_signups', {
  id:        uuid('id').primaryKey().notNull(),
  slotId:    uuid('slot_id').notNull().references(() => volunteerSlots.id, { onDelete: 'cascade' }),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const mediaAlbums = pgTable('media_albums', {
  id:          uuid('id').primaryKey().notNull(),
  name:        text('name').notNull(),
  description: text('description'),
  eventId:     uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
  createdBy:   uuid('created_by').notNull().references(() => users.id),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

export const mediaItems = pgTable('media_items', {
  id:           uuid('id').primaryKey().notNull(),
  albumId:      uuid('album_id').notNull().references(() => mediaAlbums.id, { onDelete: 'cascade' }),
  url:          text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  caption:      text('caption'),
  uploadedBy:   uuid('uploaded_by').notNull().references(() => users.id),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})
