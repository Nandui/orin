import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Server-side Supabase client using the SERVICE ROLE key.
//
// IMPORTANT: this key bypasses Row-Level Security and must NEVER be exposed to
// the browser. Only import this from server components, route handlers, and
// cron jobs.
//
// Returns null when Supabase isn't configured so callers can fall back to
// seeded mock data — this keeps the app buildable/deployable with no env set.

let cached: SupabaseClient | null | undefined;

// The Supabase <-> Vercel integration may expose the project URL under either
// name, so accept both.
function supabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
}

function serviceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getServiceClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = supabaseUrl();
  const key = serviceKey();

  if (!url || !key) {
    cached = null;
    return cached;
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && serviceKey());
}
