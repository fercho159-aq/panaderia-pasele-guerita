import { createClient } from '@supabase/supabase-js';

// Re-export the client creation function
export const getSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string) => {
    return createClient(supabaseUrl, supabaseAnonKey);
};
