import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// POST /api/invite  { email: string }
// Requires: caller must be admin, email must be on roster_members
// Returns: { link: string }
export async function POST(req: NextRequest) {
  // 1. Verify the caller is an authenticated admin
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(toSet) { try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  // 2. Validate target email is on the roster
  const { email } = await req.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const { data: member } = await supabase
    .from('roster_members')
    .select('id')
    .ilike('email', email.trim())
    .maybeSingle()

  if (!member) {
    // Also check secondary emails
    const { data: secondary } = await supabase
      .from('roster_member_emails')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle()

    if (!secondary) {
      return NextResponse.json({ error: 'Email not found on roster' }, { status: 404 })
    }
  }

  // 3. Generate invite link using service role key
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json({ error: 'Server not configured for invites (missing service key)' }, { status: 500 })
  }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email: email.trim(),
    options: { redirectTo },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ link: data.properties?.action_link })
}
