import { describe, it, expect, vi, beforeEach } from "vitest";

// next/cache, next/server のモック
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/server", () => ({
  after: vi.fn((fn: () => void) => fn()),
}));

// Supabase サーバークライアントのモック
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Gemini クライアントのモック
vi.mock("@/lib/gemini/client", () => ({
  generateImage: vi.fn(async () => "/images/generated/test.png"),
}));

// 動的 import で 'use server' ファイルを読み込む
const { createGeneration } = await import("./generations");

/** 親の存在確認が成功するモックを設定 */
function setupParentExistsMock() {
  return vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: { id: "parent-1" }, error: null }),
    }),
  });
}

/** insert → select('id') → single のチェーンモックを設定 */
function setupInsertChainMock(result: { data: unknown; error: unknown }) {
  mockSingle.mockResolvedValue(result);
  mockSelect.mockReturnValue({ single: mockSingle });
  mockInsert.mockReturnValue({ select: mockSelect });
}

/** 全操作（親確認・挿入・更新）をまとめてモック設定 */
function setupMocksForCreation(
  insertResult: { data: unknown; error: unknown },
  options: { parentExists?: boolean } = {}
) {
  setupInsertChainMock(insertResult);
  const parentSelectMock = options.parentExists !== false
    ? setupParentExistsMock()
    : vi.fn();

  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: parentSelectMock,
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
    vi.restoreAllMocks();
  });

  it.each([
    { name: "空プロンプト", prompt: "" },
    { name: "空白のみのプロンプト", prompt: "   " },
  ])("$nameでエラーを返す", async ({ prompt }) => {
    const result = await createGeneration(null, prompt);
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

  it("正常系（親なし）: 生成レコードを作成して ID を返す", async () => {
    setupMocksForCreation({ data: { id: "new-gen-1" }, error: null });
    const result = await createGeneration(null, "a beautiful sunset");
    expect(result.data).toEqual({ id: "new-gen-1" });
    expect(result.error).toBeNull();
  });

  it("正常系（親あり）: 親の存在確認後に生成レコードを作成する", async () => {
    setupMocksForCreation(
      { data: { id: "child-gen-1" }, error: null },
      { parentExists: true }
    );
    const result = await createGeneration("parent-1", "a child image");
    expect(result.data).toEqual({ id: "child-gen-1" });
    expect(result.error).toBeNull();
  });
});
