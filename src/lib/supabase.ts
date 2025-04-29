import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://svkkfcdvutpbhijjlazm.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2a2tmY2R2dXRwYmhpampsYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjM3ODcsImV4cCI6MjA2MTM5OTc4N30.8v7qLSaA3vUWAgSPl2JZHEXgmDVQsc6P8MFIEy5d6Mo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
