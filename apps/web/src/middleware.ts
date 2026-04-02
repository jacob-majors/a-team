import { NextResponse } from 'next/server'

// Auth is disabled for local preview — add Clerk keys to .env.local to enable
export default function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}
