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

---

## NVIDIA NIM 移行 + Supabase 新 API キー方式 (2026-06-08)

### 画像生成プロバイダの差し替えは「1関数のシグネチャ維持」で激安になる
- `generateImage(prompt: string): Promise<string>` を維持したため、Gemini → NVIDIA NIM の差し替えは呼び出し元 import 1行・テストモック 1行のみ
- `lib/gemini/client.ts` → `lib/nim/client.ts` にリネームし中身を全面差し替え。SDK (`@google/genai`) を削除し標準 `fetch` 実装に（70パッケージ削減）
- **ルール**: 外部サービスのクライアントは「単一の安定したエクスポート関数」に閉じ込めておくと、プロバイダ移行のブラスト半径が最小になる

### 外部APIのレスポンス実形状は推測で確定しない（ライブ1回で裏取り）
- NVIDIA NIM FLUX.1-schnell のレスポンス base64 フィールド（`artifacts[0].base64` vs OpenAI互換 `data[0].b64_json`）はドキュメントがJSレンダリングで取得できず、ユーザー提供コードも `print` 止まりだった
- 両対応パース（`artifacts?.[0]?.base64 ?? data?.[0]?.b64_json`）+ 想定外時にレスポンス全体をログ、という防御を入れた上で **ライブ1枚生成で確定**
- **発覚**: schnell は **JPEG** を返す（`.png` 固定保存は不整合）。buffer 先頭のマジックバイト（JPEG `FF D8` / PNG `89 50`）で拡張子を判定する方式に修正
- **ルール**: 外部APIのレスポンス形状・MIMEは実レスポンスで確認する。拡張子はContent由来のマジックバイトで決め、固定値をハードコードしない

### `.env.local` が 1Password の `op://` 参照のときは `op run` で起動する
- `.env.local` に実値でなく `op://...` 参照が入っていると、`next dev` 直起動ではキー未解決のまま送られ 401 / Invalid API key になる
- WSL から Windows の `op.exe` を使う場合: `op.exe run --env-file=<win path> -- wsl.exe bash -c '...npm run dev'` で、解決した環境変数を `WSLENV`（`/u` フラグで Win→WSL 方向）経由で WSL の npm に橋渡しする
- 新WSLセッションは fnm が初期化されないため、node の実体 bin パスを `PATH` に明示前置する（`$PATH` 展開値に括弧入りWindowsパスが混じるのでクオート必須）
- **ルール**: ローカル起動補助は `.wslenv.env` + 起動スクリプトに集約し、秘密は平文ファイルに書き出さず `op run` で直接プロセスに渡す

### Supabase は legacy JWT キー → 新 API キー方式（publishable / secret）へ
- legacy `anon`/`service_role` JWT は段階的廃止（late 2026 削除予定）。`sb_publishable_...`（anon 代替）/ `sb_secret_...`（service_role 代替）へ移行
- `@supabase/ssr` / `@supabase/supabase-js` は新キーをそのまま受け入れるため、**コード変更は環境変数名の置換のみ**（ライブラリAPI不変）
- publishable は Client Component（ブラウザ）でも使うため `NEXT_PUBLIC_` プレフィックス必須。secret はサーバー専用（`NEXT_PUBLIC_` 厳禁）
- RLS ポリシーの `service_role` は **Postgres ロール名**であり、secret キーは内部でこのロールにマップされるため、ポリシーSQLは変更不要
- **ルール**: 「読み取りは成功するのに書き込みだけ Invalid API key」は anon/service_role 片方のキーだけ無効なサイン。新キー移行時は publishable=ブラウザ可・secret=サーバー専用の境界を崩さない
