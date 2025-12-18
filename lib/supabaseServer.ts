// lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // URL sama dengan client
  process.env.SUPABASE_SERVICE_ROLE_KEY!      // Key server-side
)
