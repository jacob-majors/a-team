import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db, users, rosterProfiles } from '@a-team/db'
import { eq } from 'drizzle-orm'

export const rosterRouter = router({
  list: protectedProcedure.query(async () => {
    return db
      .select()
      .from(users)
      .leftJoin(rosterProfiles, eq(users.id, rosterProfiles.userId))
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const [result] = await db
      .select()
      .from(users)
      .leftJoin(rosterProfiles, eq(users.id, rosterProfiles.userId))
      .where(eq(users.id, input.id))
    return result ?? null
  }),

  update: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        duesPaid: z.boolean().optional(),
        duesAmount: z.number().optional(),
        pitZoneStatus: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, ...data } = input
      const [existing] = await db
        .select()
        .from(rosterProfiles)
        .where(eq(rosterProfiles.userId, userId))

      if (existing) {
        return db
          .update(rosterProfiles)
          .set({ ...data, updatedAt: new Date() })
          .where(eq(rosterProfiles.userId, userId))
          .returning()
      }

      return db
        .insert(rosterProfiles)
        .values({ id: crypto.randomUUID(), userId, duesPaid: false, ...data, updatedAt: new Date() })
        .returning()
    }),
})
