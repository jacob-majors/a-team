// Re-exported for convenience in client components that import from @a-team/db.
// For server components and route handlers, use @/lib/supabase/server instead.
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
