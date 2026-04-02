export type UserRole = 'admin' | 'coach' | 'athlete' | 'parent'

export type EventType = 'practice' | 'race' | 'meeting'

export type RsvpStatus = 'yes' | 'no' | 'maybe'

export type ChannelType = 'public' | 'coaches' | 'admin'

export interface User {
  id: string
  clerkId: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string | null
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description?: string | null
  type: EventType
  startAt: Date
  endAt: Date
  location?: string | null
  createdBy: string
  createdAt: Date
}

export interface Rsvp {
  id: string
  eventId: string
  userId: string
  status: RsvpStatus
  createdAt: Date
}

export interface RideGroup {
  id: string
  eventId: string
  name: string
  startTime?: string | null
  createdAt: Date
}

export interface RideGroupMember {
  id: string
  rideGroupId: string
  userId: string
}

export interface RosterProfile {
  id: string
  userId: string
  duesPaid: boolean
  duesAmount?: number | null
  pitZoneStatus?: string | null
  notes?: string | null
  updatedAt: Date
}

export interface ChatChannel {
  id: string
  name: string
  description?: string | null
  type: ChannelType
  createdAt: Date
}

export interface ChatMessage {
  id: string
  channelId: string
  userId: string
  content: string
  createdAt: Date
}

export interface Announcement {
  id: string
  title: string
  body: string
  createdBy: string
  createdAt: Date
}

export interface Document {
  id: string
  name: string
  description?: string | null
  url: string
  category?: string | null
  uploadedBy: string
  createdAt: Date
}

export interface VolunteerSlot {
  id: string
  eventId: string
  name: string
  capacity: number
  createdAt: Date
}

export interface VolunteerSignup {
  id: string
  slotId: string
  userId: string
  createdAt: Date
}

export interface MediaAlbum {
  id: string
  name: string
  eventId?: string | null
  createdBy: string
  createdAt: Date
}

export interface MediaItem {
  id: string
  albumId: string
  url: string
  thumbnailUrl?: string | null
  caption?: string | null
  uploadedBy: string
  createdAt: Date
}
