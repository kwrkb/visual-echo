import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Generation } from '@/types/database';

/**
 * 指定された世代からルートまでの系譜を取得する
 * 再帰CTEによる一括取得で N+1 クエリを回避
 * 返り値は古い順（ルート → 指定世代）
 */
export async function getLineage(
  supabase: SupabaseClient<Database>,
  generationId: string
): Promise<Generation[]> {
  const { data, error } = await supabase.rpc('get_lineage', {
    generation_id: generationId,
  });

  if (error) {
    console.error('Failed to get lineage:', error);
    return [];
  }

  return (data as Generation[]) || [];
}
