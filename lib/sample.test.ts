import { describe, it, expect } from "vitest";
import { sample } from "./sample";

describe("sample", () => {
  it("k 件返す", () => {
    const arr = Array.from({ length: 10 }, (_, i) => i);
    expect(sample(arr, 3)).toHaveLength(3);
  });

  it("k > length のとき length 件を上限とする", () => {
    const arr = [1, 2, 3];
    expect(sample(arr, 10)).toHaveLength(3);
  });

  it("k <= 0 のとき空配列を返す", () => {
    expect(sample([1, 2, 3], 0)).toEqual([]);
    expect(sample([1, 2, 3], -1)).toEqual([]);
  });

  it("元配列を破壊しない", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    sample(arr, 3);
    expect(arr).toEqual(copy);
  });

  it("返却要素が全て元配列由来である", () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const result = sample(arr, 5);
    for (const v of result) {
      expect(arr).toContain(v);
    }
  });

  // 回帰ガード: crypto.getRandomValues の 65536 バイト上限（Uint32Array で 16384 要素）を
  // 超える大きな配列でも k=3 なら QuotaExceededError を投げない
  it("20000 件の配列から 3 件をサンプリングしても throw しない", () => {
    const large = Array.from({ length: 20000 }, (_, i) => i);
    expect(() => sample(large, 3)).not.toThrow();
    expect(sample(large, 3)).toHaveLength(3);
  });

  it("空配列からサンプリングすると空配列を返す", () => {
    expect(sample([], 3)).toEqual([]);
  });
});
