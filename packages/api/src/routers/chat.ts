import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db, chatChannels, chatMessages } from '@a-team/db'
import { eq, desc } from 'drizzle-orm'

export const chatRouter = router({
  getChannels: protectedProcedure.query(async () => {
    return db.select().from(chatChannels).orderBy(chatChannels.createdAt)
  }),

  getMessages: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.channelId, input.channelId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(input.limit)
    }),

  sendMessage: protectedProcedure
    .input(z.object({ channelId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const [message] = await db
        .insert(chatMessages)
        .values({ id: crypto.randomUUID(), ...input, userId: ctx.userId })
        .returning()
      return message
    }),

  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(['public', 'coaches', 'admin']).default('public'),
      })
    )
    .mutation(async ({ input }) => {
      const [channel] = await db
        .insert(chatChannels)
        .values({ id: crypto.randomUUID(), ...input })
        .returning()
      return channel
    }),
})
