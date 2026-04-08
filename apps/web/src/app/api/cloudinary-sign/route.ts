import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// POST /api/cloudinary-sign  { folder?: string, resource_type?: string }
// Returns: { signature, timestamp, apiKey, cloudName }
// Client uses these to upload directly to Cloudinary (no file passes through our server)
export async function POST(req: NextRequest) {
  // Require authenticated user
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

  // Allow dev bypass
  const devBypass = req.cookies.get('dev_bypass')?.value === '1'
  if (!user && !devBypass) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.CLOUDINARY_API_KEY
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
  }

  const { folder = 'posts', resource_type = 'auto' } = await req.json().catch(() => ({}))

  const timestamp = Math.round(Date.now() / 1000)

  // Build param string for signature — must be sorted alphabetically, no resource_type
  const params: Record<string, string | number> = { folder, timestamp }
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')

  const signature = createHash('sha256')
    .update(paramString + apiSecret)
    .digest('hex')

  return NextResponse.json({ signature, timestamp, apiKey, cloudName, folder, resource_type })
}
