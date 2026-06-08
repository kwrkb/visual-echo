/**
 * Supabase Admin Client (Service Role)
 *
 * RLS をバイパスするサーバー専用クライアント。書き込み（INSERT/UPDATE/DELETE）は
 * このクライアント経由にし、anon クライアントでの書き込みは RLS で遮断する。
 *
 * ⚠️ Server Actions / Route Handlers / Server Components からのみ使用すること。
 * Client Components にインポートされないよう注意（SUPABASE_SECRET_KEY が漏洩する）。
 */

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
