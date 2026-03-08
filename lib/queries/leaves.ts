import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Generation } from '@/types/database';

/**
 * リーフノード（子を持たない完了済み世代）を取得する
 * DB側の NOT EXISTS サブクエリで効率的にフィルタリング
 */
export async function getLeafNodes(
  supabase: SupabaseClient<Database>
): Promise<Generation[]> {
  const { data, error } = await supabase.rpc('get_leaf_nodes');

  if (error) {
    console.error('Failed to get leaf nodes:', error);
    return [];
  }

  return (data as Generation[]) || [];
}

/**
 * ランダムなリーフノードを1つ返す
 * リーフがない場合は null
 */
export async function getRandomLeaf(
  supabase: SupabaseClient<Database>
): Promise<Generation | null> {
  const leaves = await getLeafNodes(supabase);
  if (leaves.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * leaves.length);
  return leaves[randomIndex];
}
