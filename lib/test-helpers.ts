import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type RpcResults = Record<
  string,
  { data: unknown; error: null } | { data: null; error: { message: string } }
>;

/**
 * Supabase クライアントの軽量モック工場
 * .rpc() の戻り値を差し替え可能
 */
export function createMockSupabase(
  rpcResults: RpcResults = {}
): SupabaseClient<Database> {
  const mock = {
    rpc: vi.fn((name: string) => {
      if (name in rpcResults) {
        return Promise.resolve(rpcResults[name]);
      }
      return Promise.resolve({ data: null, error: { message: `Unknown RPC: ${name}` } });
    }),
  };

  return mock as unknown as SupabaseClient<Database>;
}
