import { describe, it, expect } from "vitest";
import { getLeafNodes, getRandomLeaf } from "./leaves";
import { createMockSupabase } from "@/lib/test-helpers";
import type { Generation } from "@/types/database";

const sampleLeaf: Generation = {
  id: "leaf-1",
  parent_id: "parent-1",
  image_url: "/img.png",
  prompt: "a cat",
  created_at: "2025-01-01T00:00:00Z",
  status: "completed",
};

describe("getLeafNodes", () => {
  it("成功時にデータを返す", async () => {
    const supabase = createMockSupabase({
      get_leaf_nodes: { data: [sampleLeaf], error: null },
    });
    const result = await getLeafNodes(supabase);
    expect(result).toEqual([sampleLeaf]);
  });

  it("エラー時に空配列を返す", async () => {
    const supabase = createMockSupabase({
      get_leaf_nodes: { data: null, error: { message: "db error" } },
    });
    const result = await getLeafNodes(supabase);
    expect(result).toEqual([]);
  });

  it("null データ時に空配列を返す", async () => {
    const supabase = createMockSupabase({
      get_leaf_nodes: { data: null, error: null },
    });
    const result = await getLeafNodes(supabase);
    expect(result).toEqual([]);
  });
});

describe("getRandomLeaf", () => {
  it("リーフがある場合はいずれか1つを返す", async () => {
    const leaves = [sampleLeaf, { ...sampleLeaf, id: "leaf-2" }];
    const supabase = createMockSupabase({
      get_leaf_nodes: { data: leaves, error: null },
    });
    const result = await getRandomLeaf(supabase);
    expect(result).not.toBeNull();
    expect(leaves.map((l) => l.id)).toContain(result!.id);
  });

  it("リーフがない場合は null を返す", async () => {
    const supabase = createMockSupabase({
      get_leaf_nodes: { data: [], error: null },
    });
    const result = await getRandomLeaf(supabase);
    expect(result).toBeNull();
  });
});
