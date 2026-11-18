import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ PERINGATAN: SUPABASE_URL atau SUPABASE_ANON_KEY belum diisi di file .env!");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: {
    transport: ws,
  },
});
