'use client'

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@a-team/api'

export const trpc = createTRPCReact<AppRouter>()
