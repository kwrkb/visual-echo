import { describe, it, expect } from "vitest";
import { getLineage } from "./lineage";
import { createMockSupabase } from "@/lib/test-helpers";
import type { Generation } from "@/types/database";

const sampleLineage: Generation[] = [
  {
    id: "root",
    parent_id: null,
    image_url: "/root.png",
    prompt: "root prompt",
    created_at: "2025-01-01T00:00:00Z",
    status: "completed",
  },
  {
    id: "child",
    parent_id: "root",
    image_url: "/child.png",
    prompt: "child prompt",
    created_at: "2025-01-02T00:00:00Z",
    status: "completed",
  },
];

describe("getLineage", () => {
  it("成功時に系譜を返す", async () => {
    const supabase = createMockSupabase({
      get_lineage: { data: sampleLineage, error: null },
    });
    const result = await getLineage(supabase, "child");
    expect(result).toEqual(sampleLineage);
    expect(supabase.rpc).toHaveBeenCalledWith("get_lineage", {
      generation_id: "child",
    });
  });

  it("エラー時に空配列を返す", async () => {
    const supabase = createMockSupabase({
      get_lineage: { data: null, error: { message: "not found" } },
    });
    const result = await getLineage(supabase, "unknown");
    expect(result).toEqual([]);
  });
});
