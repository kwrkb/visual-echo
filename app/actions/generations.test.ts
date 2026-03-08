import { describe, it, expect, vi, beforeEach } from "vitest";

// next/cache, next/server のモック
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/server", () => ({
  after: vi.fn((fn: () => void) => fn()),
}));

// Supabase サーバークライアントのモック
const mockSelect = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

// Gemini クライアントのモック
vi.mock("@/lib/gemini/client", () => ({
  generateImage: vi.fn(async () => "/images/generated/test.png"),
}));

// 動的 import で 'use server' ファイルを読み込む
const { createGeneration } = await import("./generations");

function setupInsertMock(result: { data: unknown; error: unknown }) {
  mockSingle.mockResolvedValue(result);
  mockSelect.mockReturnValue({ single: mockSingle });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: "parent-1" }, error: null }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  });
}

function setupParentNotFoundMock() {
  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      }),
    }),
  });
}

describe("createGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("空プロンプトでエラーを返す", async () => {
    const result = await createGeneration(null, "");
    expect(result.error).toBe("プロンプトを入力してください");
    expect(result.data).toBeNull();
  });

  it("空白のみのプロンプトでエラーを返す", async () => {
    const result = await createGeneration(null, "   ");
    expect(result.error).toBe("プロンプトを入力してください");
    expect(result.data).toBeNull();
  });

  it("1000文字超のプロンプトでエラーを返す", async () => {
    const longPrompt = "a".repeat(1001);
    const result = await createGeneration(null, longPrompt);
    expect(result.error).toBe("プロンプトは1000文字以内で入力してください");
    expect(result.data).toBeNull();
  });

  it("存在しない親IDでエラーを返す", async () => {
    setupParentNotFoundMock();
    const result = await createGeneration("nonexistent", "test prompt");
    expect(result.error).toBe("指定された親画像が見つかりません");
    expect(result.data).toBeNull();
  });

  it("正常系: 生成レコードを作成して ID を返す", async () => {
    setupInsertMock({ data: { id: "new-gen-1" }, error: null });
    const result = await createGeneration(null, "a beautiful sunset");
    expect(result.data).toEqual({ id: "new-gen-1" });
    expect(result.error).toBeNull();
  });
});
