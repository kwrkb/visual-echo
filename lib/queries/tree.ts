
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { TreeNode, TreeGeneration } from "@/types/database";

/**
 * フラットな生成リストをネストされたツリー構造に変換する
 */
export function buildTreeFromFlatData(generations: TreeGeneration[]): TreeNode[] {
    const generationMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // まず全てのノードをMapに登録
    generations.forEach((gen) => {
        generationMap.set(gen.id, { ...gen, children: [] });
    });

    // 親子関係を構築
    generations.forEach((gen) => {
        const node = generationMap.get(gen.id);
        if (!node) return;

        if (gen.parent_id && generationMap.has(gen.parent_id)) {
            const parent = generationMap.get(gen.parent_id);
            parent?.children?.push(node);
        } else {
            // 親がいない、または取得データ内に親が含まれていない場合はルート扱い
            roots.push(node);
        }
    });

    return roots;
}

/**
 * Supabaseクライアントを使ってツリーデータを取得する共通関数
 */
async function fetchTreeData(
    supabase: SupabaseClient<Database>,
    rootId?: string | null
): Promise<TreeNode[]> {
    const { data, error } = await supabase.rpc("get_tree_structure", {
        root_id: rootId || null
    });

    if (error) {
        console.error("Error fetching tree data:", error);
        return [];
    }

    // 完了していないノード（pending/failed）を除外
    const filteredData = (data || []).filter(node => node.status === 'completed');

    return buildTreeFromFlatData(filteredData);
}

/**
 * サーバーサイドでツリーデータを取得する (Server Components用)
 */
export async function fetchTreeDataServer(rootId?: string | null): Promise<TreeNode[]> {
    const supabase = await createServerClient();
    return fetchTreeData(supabase, rootId);
}

/**
 * クライアントサイドでツリーデータを取得する (Client Components用)
 */
export async function fetchTreeDataClient(rootId?: string | null): Promise<TreeNode[]> {
    const supabase = createBrowserClient();
    return fetchTreeData(supabase, rootId);
}
