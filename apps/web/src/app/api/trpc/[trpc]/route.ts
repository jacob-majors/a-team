export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '@a-team/api'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError({ error }) {
      console.error('tRPC error:', error)
    },
  })

export { handler as GET, handler as POST }
