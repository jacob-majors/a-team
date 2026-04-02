import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db, events, rsvps } from '@a-team/db'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export const eventsRouter = router({
  list: protectedProcedure.query(async () => {
    return db.select().from(events).orderBy(events.startAt)
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const [event] = await db.select().from(events).where(eq(events.id, input.id))
    return event ?? null
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['practice', 'race', 'meeting']),
        startAt: z.date(),
        endAt: z.date(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const [event] = await db
        .insert(events)
        .values({ ...input, id: randomUUID(), createdBy: ctx.userId })
        .returning()
      return event
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        type: z.enum(['practice', 'race', 'meeting']).optional(),
        startAt: z.date().optional(),
        endAt: z.date().optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input
      const [event] = await db.update(events).set(data).where(eq(events.id, id)).returning()
      return event
    }),
})

export const rsvpsRouter = router({
  upsert: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        status: z.enum(['yes', 'no', 'maybe']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existing = await db
        .select()
        .from(rsvps)
        .where(eq(rsvps.eventId, input.eventId))
      const myRsvp = existing.find((r) => r.userId === ctx.userId)

      if (myRsvp) {
        const [updated] = await db
          .update(rsvps)
          .set({ status: input.status })
          .where(eq(rsvps.id, myRsvp.id))
          .returning()
        return updated
      }

      const [created] = await db
        .insert(rsvps)
        .values({ id: randomUUID(), ...input, userId: ctx.userId })
        .returning()
      return created
    }),

  forEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      return db.select().from(rsvps).where(eq(rsvps.eventId, input.eventId))
    }),
})
