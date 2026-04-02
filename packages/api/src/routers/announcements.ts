import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db, announcements, announcementDismissals } from '@a-team/db'
import { eq } from 'drizzle-orm'

export const announcementsRouter = router({
  list: protectedProcedure.query(async () => {
    return db.select().from(announcements).orderBy(announcements.createdAt)
  }),

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const [announcement] = await db
        .insert(announcements)
        .values({ id: crypto.randomUUID(), ...input, createdBy: ctx.userId })
        .returning()
      return announcement
    }),

  dismiss: protectedProcedure
    .input(z.object({ announcementId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [dismissal] = await db
        .insert(announcementDismissals)
        .values({ id: crypto.randomUUID(), ...input, userId: ctx.userId })
        .returning()
      return dismissal
    }),

  getDismissals: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(announcementDismissals)
      .where(eq(announcementDismissals.userId, ctx.userId))
  }),
})
