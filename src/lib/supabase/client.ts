import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

const fetchWithRetry = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3,
  delay = 500
): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(input, init);
      return response;
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay * Math.pow(2, i)));
    }
  }
  return fetch(input, init);
};

export const supabase: SupabaseClient<any> = createClient<any>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: fetchWithRetry,
    },
  }
);

export async function resilientFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetchWithRetry(input, init);
}

export default supabase;
