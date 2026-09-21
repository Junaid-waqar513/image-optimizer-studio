import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-safe client (publishable/anon key only — RLS protects the data).
// Set in Vercel + .env:  VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!url || !key) {
    throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set.");
  }
  client = createClient(url, key);
  return client;
}
