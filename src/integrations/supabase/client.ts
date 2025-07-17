// Supabase client configuration for Inner Thought Bloom
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://lvwjnkvbgeylioxnqvca.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2d2pua3ZiZ2V5bGlveG5xdmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NjU1MzMsImV4cCI6MjA2ODI0MTUzM30.DEmpJLGeweQUAc9gQap1vR9dFkLyVb_RXHM181dzp8I";

// Export the URL for any edge functions that might need it
export const SUPABASE_PROJECT_URL = SUPABASE_URL;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Additional configuration for development
    flowType: 'pkce'
  }
});