// frontend/src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
// (ถ้ามีไฟล์ schema ที่ gen มา) import type { Database } from "./types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env files."
  );
}

// ถ้ามี type: createClient<Database>(...)
export const supabase = createClient(/* <Database> */ supabaseUrl, supabaseAnonKey);
