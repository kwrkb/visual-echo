import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Generation } from '@/types/database';

/**
 * リーフノード（子を持たない完了済み世代）を取得する
 *
 * 2段階クエリ:
 * 1. 子として参照されている parent_id を全て取得
 * 2. その中に含まれない完了済み世代がリーフ
 */
export async function getLeafNodes(
  supabase: SupabaseClient<Database>
): Promise<Generation[]> {
  // 子を持つノードのIDセットを構築
  const { data: childRows } = await supabase
    .from('generations')
    .select('parent_id')
    .not('parent_id', 'is', null);

  const parentIdSet = new Set(
    childRows?.map((r) => r.parent_id).filter(Boolean) || []
  );

  // 完了済み世代を取得
  const { data: completed } = await supabase
    .from('generations')
    .select('*')
    .eq('status', 'completed');

  // リーフノード = 子を持たない世代
  return completed?.filter((g) => !parentIdSet.has(g.id)) || [];
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
