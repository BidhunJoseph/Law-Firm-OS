import { createClient } from '@supabase/supabase-js'

// Note: This client uses the service role key and bypasses RLS.
// It should ONLY be used in server actions or API routes, never exposed to the client.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
