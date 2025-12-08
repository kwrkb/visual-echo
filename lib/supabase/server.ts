/**
 * Supabase Client for Server Components and Server Actions
 * サーバー環境で使用するSupabaseクライアント
 * Server Components, Server Actions, Route Handlersで使用してください
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAllはServer Componentsから呼ばれる場合があり、
            // その場合はcookieの設定に失敗します（middlewareで処理）
          }
        },
      },
    }
  );
}
