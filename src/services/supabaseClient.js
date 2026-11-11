import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uxmicldxkisowtaliygd.supabase.co/rest/v1/'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_PYlMAWcMPFSrxXiBJgJfzg_fXXFcAC2'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)