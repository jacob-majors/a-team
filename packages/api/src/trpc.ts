import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { createServerClient } from '@supabase/ssr'

export interface Context {
  userId: string | null
  headers: Headers
}

export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  // Build a lightweight Supabase client that reads cookies from the request.
  // Cookie writing is a no-op here — the middleware handles token refresh.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const cookieHeader = opts.req.headers.get('cookie') ?? ''
          return cookieHeader.split(';').filter(Boolean).map(pair => {
            const [name, ...rest] = pair.trim().split('=')
            return { name: name!.trim(), value: rest.join('=').trim() }
          })
        },
        setAll() {
          // No-op — middleware owns cookie writes
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  return {
    userId: user?.id ?? null,
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
