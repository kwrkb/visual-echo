import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type RpcName = keyof Database["public"]["Functions"];
type RpcResult =
  | { data: unknown; error: null }
  | { data: null; error: { message: string } };
type RpcResults = Partial<Record<RpcName, RpcResult>>;

/**
 * Supabase クライアントの軽量モック工場
 * .rpc() の戻り値を差し替え可能
 */
export function createMockSupabase(
  rpcResults: RpcResults = {}
): SupabaseClient<Database> {
  const mock = {
    rpc: vi.fn((name: string, args?: Record<string, unknown>) => {
      void args;
      if (Object.prototype.hasOwnProperty.call(rpcResults, name)) {
        return Promise.resolve(rpcResults[name as RpcName]!);
      }
      return Promise.resolve({ data: null, error: { message: `Unknown RPC: ${name}` } });
    }),
  };

  return mock as unknown as SupabaseClient<Database>;
}
