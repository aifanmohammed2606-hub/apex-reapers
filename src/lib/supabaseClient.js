import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in environment variables.'
  );
}

// Browser-side Supabase client — uses anon key for Auth only.
// All data mutations go through Vercel API routes (which use the service role key).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
