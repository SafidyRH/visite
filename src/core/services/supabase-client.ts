import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

class SupabaseClientSingleton {
  private static instance: SupabaseClient;

  private constructor() {}

  public static getInstance(): SupabaseClient {
    if (!SupabaseClientSingleton.instance) {
      SupabaseClientSingleton.instance = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );
    }
    return SupabaseClientSingleton.instance;
  }
}

export const supabase = SupabaseClientSingleton.getInstance();