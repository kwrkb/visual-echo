/**
 * Supabase Client for Client Components
 * ブラウザ環境で使用するSupabaseクライアント
 * Client Componentsで使用してください
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
