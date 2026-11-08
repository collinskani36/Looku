import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** False until .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. */
export const isSupabaseConfigured = Boolean(url && key);

if (!isSupabaseConfigured) {
  console.warn("Supabase is not configured: copy .env.example to .env and fill it in.");
}

export const supabase = createClient(url ?? "http://localhost:54321", key ?? "not-configured");

export const IMAGE_BUCKET = "site-images";
