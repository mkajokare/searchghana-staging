// Shared Supabase client for MeNimGhana.com
// Project: MeNim Ghana (https://supabase.com/dashboard/project/goohnjcxbupbgpivqmok)
//
// The URL and key below are the "Publishable key" -- Supabase's own docs say this
// key is safe to ship in client-side code as long as Row Level Security (RLS) is
// enabled on every table, which it is for `businesses` and `reviews`. Never put
// the "Secret key" from the Supabase dashboard here or anywhere in this site.
const SUPABASE_URL = 'https://goohnjcxbupbgpivqmok.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_vPhlqLBI8bPLqHKk7xX3KQ_q0eHq23H';

window.sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
