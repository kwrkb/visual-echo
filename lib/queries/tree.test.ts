import { describe, it, expect } from "vitest";
import { buildTreeFromFlatData } from "./tree";
import type { TreeGeneration } from "@/types/database";

function makeGen(
  overrides: Partial<TreeGeneration> & { id: string }
): TreeGeneration {
  return {
    parent_id: null,
    image_url: "/img.png",
    prompt: "test",
    created_at: "2025-01-01T00:00:00Z",
    status: "completed",
    depth: 0,
    path: [],
    ...overrides,
  };
}

describe("buildTreeFromFlatData", () => {
  it("空配列 → 空配列", () => {
    expect(buildTreeFromFlatData([])).toEqual([]);
  });

  it("単一ルートノード", () => {
    const roots = buildTreeFromFlatData([makeGen({ id: "a" })]);
    expect(roots).toHaveLength(1);
    expect(roots[0].id).toBe("a");
    expect(roots[0].children).toEqual([]);
  });

  it("線形チェーン（a → b → c）", () => {
    const flat = [
      makeGen({ id: "a" }),
      makeGen({ id: "b", parent_id: "a", depth: 1 }),
      makeGen({ id: "c", parent_id: "b", depth: 2 }),
    ];
    const roots = buildTreeFromFlatData(flat);
    expect(roots).toHaveLength(1);
    expect(roots[0].children![0].id).toBe("b");
    expect(roots[0].children![0].children![0].id).toBe("c");
  });

  it("分岐（a → b, a → c）", () => {
    const flat = [
      makeGen({ id: "a" }),
      makeGen({ id: "b", parent_id: "a", depth: 1 }),
      makeGen({ id: "c", parent_id: "a", depth: 1 }),
    ];
    const roots = buildTreeFromFlatData(flat);
    expect(roots).toHaveLength(1);
    expect(roots[0].children).toHaveLength(2);
    const childIds = roots[0].children!.map((c) => c.id).sort();
    expect(childIds).toEqual(["b", "c"]);
  });

  it("孤児ノード（親がデータに含まれない）はルート扱い", () => {
    const flat = [
      makeGen({ id: "a" }),
      makeGen({ id: "b", parent_id: "missing", depth: 1 }),
    ];
    const roots = buildTreeFromFlatData(flat);
    expect(roots).toHaveLength(2);
  });

  it("複数ルート", () => {
    const flat = [
      makeGen({ id: "a" }),
      makeGen({ id: "b" }),
      makeGen({ id: "c", parent_id: "a", depth: 1 }),
    ];
    const roots = buildTreeFromFlatData(flat);
    expect(roots).toHaveLength(2);
    const rootIds = roots.map((r) => r.id).sort();
    expect(rootIds).toEqual(["a", "b"]);
  });
});
