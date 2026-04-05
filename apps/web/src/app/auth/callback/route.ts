import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)

    const userEmail = data.user?.email ?? ''

    // Gate: email must be on the roster (checks primary email + any linked emails)
    const { data: member } = await supabase
      .from('roster_members')
      .select('id')
      .ilike('email', userEmail)
      .maybeSingle()

    // Also check roster_member_emails table if it exists
    let linkedMember = null
    if (!member) {
      const { data: linked } = await supabase
        .from('roster_member_emails')
        .select('member_id')
        .ilike('email', userEmail)
        .maybeSingle()
      linkedMember = linked
    }

    if (!member && !linkedMember) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/sign-in?error=not_on_roster`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
