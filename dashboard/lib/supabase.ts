import { createClient } from '@supabase/supabase-js'

// For the MVP, we assume environment variables are set in .env.local
// or default to placeholder values if not yet configured for local dev.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Service role key for backend-only operations that bypass RLS
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
