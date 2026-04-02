import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

export interface Context {
  userId: string | null
  headers: Headers
}

export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  // When Clerk is fully configured, swap this for real auth:
  // import { createClerkClient } from '@clerk/backend'
  // const { userId } = await clerkClient.authenticateRequest(opts.req)
  const authHeader = opts.req.headers.get('x-user-id')
  return {
    userId: authHeader ?? null,
    headers: opts.req.headers,
  }
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } })
})
