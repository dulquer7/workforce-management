import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yqjrwihetwbdpxrvxnqe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_luC2H_eJFBsWm1x9FeXCXw_uK1I9YSM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
