# LESSONS.md

Visual Echo 開発で得た教訓・パターンを記録する。

---

## Phase 1: ブラインドモード (2026-03-08)

### リーフノード判定は status を考慮する
- `getLeafNodes` で子の有無を判定する際、`pending`/`failed` の子も含めると、失敗した生成があるだけで親がリーフから除外される
- **ルール**: 子の存在判定には必ず `.eq('status', 'completed')` を付ける

### 共通ロジックは早めに抽出する
- `getLineage` が `gallery/[id]/page.tsx` と `gallery/[id]/result/page.tsx` に重複していた
- 新規ファイルで同じロジックを使う時点で `lib/queries/` に共通化すべき
- **ルール**: 2箇所で使うなら即抽出（code-quality ルール #6）

### クエリパラメータでフロー分岐する
- `?from=play` パラメータで generating → result のフローを分岐
- generating ページで `useSearchParams` を使う場合、依存配列に忘れず追加する
- **パターン**: フロー元の情報はクエリパラメータで伝播、Server Component では `searchParams` prop で受け取る

### Supabase で LEFT JOIN 相当はクライアント側フィルタで代替
- リーフノード取得（子を持たないノード）は Supabase JS クライアントでは直接表現できない
- 2段階クエリ（parent_id 一覧取得 → Set で除外）で対応
- **今後**: データ量が増えたら RPC (PostgreSQL関数) に移行する

### Supabase RPC でクエリ最適化する判断基準
- レビュー指摘でリーフノード取得（全件フェッチ→メモリフィルタ）と系譜取得（N+1ループ）のスケーラビリティ問題が発覚
- `NOT EXISTS` サブクエリや再帰CTEはSupabase JSクライアントでは表現できないため、PostgreSQL関数(RPC)に移行
- **ルール**: 「全件取得→JSでフィルタ」「ループ内クエリ」パターンが出たら即RPC化を検討する。`RETURNS SETOF テーブル名` で既存の型定義をそのまま活用できる
- **注意**: `schema.sql` にRPC関数を追加したら、`types/database.ts` の `Functions` セクションも同一コミットで更新する（code-quality ルール #1）

### マルチAIレビューの有効性
- Codex: ロジックバグ（status フィルタ漏れ）を検出
- Gemini: パフォーマンス懸念（N+1、メモリ）とベストプラクティスを指摘
- **ルール**: 機能実装後は Codex + Gemini の2段レビューを実施する

---

## テスト基盤導入 (2026-03-08)

### Vitest は Next.js プロジェクトに最小設定で導入できる
- `vitest.config.ts` に必要なのは `@` エイリアスの解決のみ。`tsconfig.json` の `paths` を手動でマッピングする
- `globals: true` を設定すれば `import { describe, it, expect }` を省略可能だが、明示的 import の方がエディタ補完が安定する

### テスト対象は3層に分けてモック戦略を変える
- **純粋関数**（`buildTreeFromFlatData`, `statusVariant`）: モック不要。入出力だけテスト
- **RPC ラッパー**（`getLeafNodes`, `getLineage`）: `SupabaseClient` を引数に取る設計なので、軽量モック (`createMockSupabase`) を注入するだけで済む
- **Server Action**（`createGeneration`）: `vi.mock` で `next/cache`, `next/server`, Supabase クライアント、Gemini クライアントの4モジュールをモック。`'use server'` ファイルは `await import()` で動的インポートする
- **ルール**: 関数が `SupabaseClient` を引数に取る設計にしておくと、テスト時のモック注入が格段に楽になる（DI パターン）

### Supabase モックは `.rpc()` だけで十分な場合が多い
- `lib/queries/` の関数はすべて `.rpc()` 経由なので、`.from().select().eq()` のチェーンモックは不要
- `createMockSupabase({ rpc名: { data, error } })` の工場関数パターンで RPC 名ごとに戻り値を設定する
- `.from()` チェーンが必要な Server Action テストでは、個別に `mockFrom`/`mockInsert`/`mockSelect`/`mockSingle` を組み立てる

### Server Action テストでの `vi.mock` 順序に注意
- `vi.mock` は巻き上げ（hoisting）されるため、モック変数は `vi.fn()` で宣言してから `vi.mock` 内で参照する
- `'use server'` ファイルのインポートは `await import()` を使う（トップレベル `import` だとモック適用前に実行される）
- **パターン**: `vi.mock` → `const mockXxx = vi.fn()` → `await import()` の順序を守る

### 依存ライブラリの Node.js 最低バージョンを確認する
- Vitest v4 は Node 20+ が必須だが、README には Node 18 以上と記載していた
- Codex レビューで指摘されるまで気づかなかった
- **ルール**: devDependencies 追加時に `engines` 要件を確認し、`package.json` の `engines` フィールドと README を同時に更新する

### Server Action テストのモックセットアップは責務分離する
- `setupInsertMock` が親確認・挿入・更新の3操作を1関数にまとめており、どのテストがどのモックを使うか不明瞭だった
- Gemini レビューで指摘され、`setupParentExistsMock` / `setupInsertChainMock` / `setupMocksForCreation` に分離
- **ルール**: モックセットアップ関数は1操作1関数にし、組み合わせ用の上位関数で合成する
