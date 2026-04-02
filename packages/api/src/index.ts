import { router } from './trpc'
import { eventsRouter, rsvpsRouter } from './routers/events'
import { rosterRouter } from './routers/roster'
import { chatRouter } from './routers/chat'
import { announcementsRouter } from './routers/announcements'

export const appRouter = router({
  events: eventsRouter,
  rsvps: rsvpsRouter,
  roster: rosterRouter,
  chat: chatRouter,
  announcements: announcementsRouter,
})

export type AppRouter = typeof appRouter

export { createContext } from './trpc'
