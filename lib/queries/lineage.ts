import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Generation } from '@/types/database';

/**
 * 指定された世代からルートまでの系譜を取得する
 * 返り値は古い順（ルート → 指定世代）
 */
export async function getLineage(
  supabase: SupabaseClient<Database>,
  generationId: string
): Promise<Generation[]> {
  const lineage: Generation[] = [];
  let currentId: string | null = generationId;

  while (currentId) {
    const result = await supabase
      .from('generations')
      .select('*')
      .eq('id', currentId)
      .single();

    if (result.error || !result.data) break;

    const row: Generation = result.data;
    lineage.push(row);
    currentId = row.parent_id;
  }

  lineage.reverse();
  return lineage;
}
