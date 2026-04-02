import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from '@a-team/api'
import { headers } from 'next/headers'

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'}/api/trpc`,
      headers() {
        const h = headers()
        const headersList: Record<string, string> = {}
        h.forEach((value, key) => {
          headersList[key] = value
        })
        return headersList
      },
    }),
  ],
})
