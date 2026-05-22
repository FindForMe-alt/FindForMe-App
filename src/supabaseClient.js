import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jruixkdjqdwixemqsjaz.supabase.co'
const supabaseKey = 'sb_publishable_MBoWHhmBLXQIa_4_Z507Ng_zprYw0_x'

export const supabase = createClient(supabaseUrl, supabaseKey)