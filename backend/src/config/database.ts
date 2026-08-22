import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export const supabasePublic = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
