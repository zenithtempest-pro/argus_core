import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

const defaultUrl = 'https://arguscore-placeholder.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    !key.includes('your-supabase-anon-key') &&
    !key.includes('placeholder')
  );
}

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  const supabaseUrl = rawUrl || defaultUrl;
  const supabaseAnonKey = rawKey || defaultKey;

  if (typeof window !== 'undefined' && (!rawUrl || !rawKey || rawUrl.includes('placeholder'))) {
    console.warn(
      '[ArgusCore Supabase] Using fallback/placeholder credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel Environment Variables and redeployed.'
    );
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const supabase = createClient();
