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

---

## 設計判断ログ（旧 implementation-notes.md より統合 / 2026-07-26）

実装中に下した判断と、その理由（採用しなかった代替案を含む）。以降の節は旧 `implementation-notes.md` の内容をそのまま移設したもの。

### 2026-06-08: 依存関係アップデート + セキュリティチェック

#### postcss 脆弱性の解消方法

**判断**: `overrides.postcss: "^8.5.15"` を package.json に追加。

当初「Next 16 メジャー更新で postcss moderate (GHSA-qx2v-qp2m-jg93) が解消できる」と計画していたが、実際には Next 16.2.7 も内部で `postcss@8.4.31` を抱えており解消されなかった（脆弱な範囲: `next 9.3.4-canary.0 - 16.3.0-canary.5`）。

`overrides` での強制アップグレードは Next 15 でも可能だった。Next 16 の採用理由は「最新メジャーへの追従 + next lint 廃止対応」に整理される。

実際のリスク: この XSS は postcss が CSS を stringify する際のみ発動し、Next がビルド時に処理する自プロジェクトの CSS（信頼済み入力）のみを対象とするため、ランタイムリスクは実質ゼロ。

#### middleware.ts → proxy.ts の改名を保留

**判断**: 改名しない（deprecated 警告は許容）。

Next 16 でビルド時に `The "middleware" file convention is deprecated. Please use "proxy" instead.` の警告が出る。ただし：
- `proxy.ts` はランタイムが nodejs 固定になる
- 現在の `middleware.ts` は Supabase SSR セッション更新を行うが、Edge Runtime が不要になることの影響を確認していない
- 改名は動作に影響する可能性があり、別 PR で意図的に検証して行うべき判断

#### Gemini モデル移行先の選定

**判断**: `gemini-3.1-flash-image`（GA、Stable）を選択。

調査段階で `gemini-3.1-flash-image-preview` が候補に挙がったが、2026-06-25 シャットダウン予定のため除外。GA 版の `gemini-3.1-flash-image`（Nano Banana 2、2026-05-28 リリース、シャットダウン日未定）が適切な後継モデル。

`@google/genai 2.x` の `generateContent` API は後方互換（公式 changelog: "GenerateContent usage is unaffected"）。ただし Gemini API キーが閉鎖中のため、以下は **未検証**:
- genai 2.x での実際のレスポンス形状（`response.candidates[0].content?.parts`）
- 429 エラーの `error.status` 形式（`lib/gemini/client.ts:81` のハンドリング）
- `gemini-3.1-flash-image` モデルでの実際の画像生成

API キー再開後に実動作確認を行うこと。

---

### 2026-06-08: 画像生成バックエンドを Gemini → NVIDIA NIM (FLUX.1-schnell) へ移行

#### 移行の理由

Gemini API キーが閉鎖中で一度も実動作検証できていなかった（previous notes 参照）。ユーザーが NVIDIA NIM のホスト型 API キー (`NVIDIA_NIM_API_KEY`) を取得したため、この機会に切り替え。

#### モデル選定: FLUX.1-schnell

- schnell は 4-step の distilled モデルで高速かつ無料枠に優しい。Visual Echo の連鎖生成（1セッションで複数回 API 呼び出し）に適している。
- dev / FLUX.2-klein も検討したが、1 生成あたりのコスト・速度比で schnell が最適。

#### エンドポイント・API 形式

ユーザー提供のコード例より確定した仕様:
```
POST https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-schnell
Authorization: Bearer <NVIDIA_NIM_API_KEY>
Body: { "prompt": "...", "width": 1024, "height": 1024, "seed": 0, "steps": 4 }
```

#### レスポンス形式の不確実性とフォールバック方針

**未確認**: ユーザー提供コードは `print(response_body)` 止まりでレスポンス形式が実値未確認。
- NVIDIA NIM 標準: `artifacts[0].base64`（`finishReason: "SUCCESS"` 付き）
- OpenAI 互換: `data[0].b64_json`

**判断**: `json.artifacts?.[0]?.base64 ?? json.data?.[0]?.b64_json` で両形式を試みる。どちらも無ければ `console.error` でレスポンス全体をログして throw するので、実装後の 1 枚ライブ生成テストでフィールド名を確定できる。

#### 実装スコープ最小化

`generateImage(prompt: string): Promise<string>` のシグネチャを維持することで、呼び出し元 (`app/actions/generations.ts`) はimport 1 行、テストモックはパス 1 行の変更のみ。SDK 削除（`@google/genai`）で 70 パッケージが減少。

#### ライブ検証で判明: FLUX.1-schnell は JPEG を返す

**判断**: 拡張子をマジックバイトで判定（JPEG `FF D8` → `.jpg` / PNG `89 50` → `.png`）。

Gemini 版は `.png` 固定だったが、実際に NVIDIA NIM (op.exe 経由で `op://` 参照を解決して起動) で 1 枚生成したところ、レスポンスの実体は JPEG だった（`file` コマンドで `JPEG image data 1024x1024`）。`.png` 拡張子で JPEG を保存する不整合を避けるため、buffer 先頭バイトで判定する方式に変更。レスポンスの base64 フィールドは `artifacts[0].base64` / `data[0].b64_json` の両対応で吸収（実形状の厳密な特定は未実施だが、両対応のため動作に問題なし）。

#### ローカル開発時の起動方法（op:// 参照）

`.env.local` は 1Password の `op://` 参照を含むため、`next dev` を直接起動するとキーが未解決のまま送られ 401 / Invalid API key になる。`op.exe run --env-file=.env.local -- <npm>` で参照を解決して起動する必要がある（WSL からは Windows の `op.exe` 経由 + `WSLENV` で環境変数を WSL の npm へ橋渡し）。`.wslenv.env` がその WSLENV 定義ファイル。

### 2026-06-08: Supabase を新 API キー方式（publishable / secret）へ移行

#### publishable キーは `NEXT_PUBLIC_` プレフィックス必須

**判断**: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SECRET_KEY` を採用（ユーザー確認済み）。

publishable キーは Client Component（`generating` ページのブラウザ側ポーリング `lib/supabase/client.ts`）で使うため、Next.js の制約上 `NEXT_PUBLIC_` が必須。secret キーはサーバー専用なので `NEXT_PUBLIC_` を付けない（付けると漏洩）。

#### 後方互換フォールバックは入れない

**判断**: `?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` のようなフォールバックは追加せず、変数名をクリーンに置換。ユーザーが新方式へ完全移行するため、旧変数の併存は不要（過剰設計回避）。`@supabase/ssr` / `supabase-js` は新キーをそのまま受け入れるため、コード変更は環境変数名の置換のみ。

#### RLS の `service_role` は Postgres ロール名なので SQL 変更不要

secret キーは内部で `service_role` ロールにマップされる。`supabase/migrations/tighten_rls_service_role_only.sql` のポリシーはロール名を参照しており API キー名ではないため、ポリシー本体は不変（コメントの env 名のみ更新）。

---

---

### 2026-06-09: /code-review high 指摘の修正

#### QuotaExceededError リグレッションの根本修正

**判断**: `lib/sample.ts` に純粋関数 `sample<T>(arr, k)` を抽出し、gallery/page.tsx はそれを呼ぶだけにした。

前回のレビュー対応（Fisher-Yates 導入）で `crypto.getRandomValues(new Uint32Array(全件数))` を書いたことで、completed 行数が 16,384 件を超えると `QuotaExceededError` が発生し gallery ページが 500 になるリグレッションを入れた。Web Crypto の 65,536 バイト上限（Uint32Array で 16,384 要素）の見落とし。

修正は「全件シャッフルの後 3 件 slice」から「3 件だけを部分 Fisher-Yates でサンプリング」へのアルゴリズム是正。`Uint32Array(k)` のサイズは選択数に固定されるため、行数に依存しなくなった。

ユーティリティ抽出の理由: 修正をテストで固定するため（純粋関数 → モックなしで回帰テスト可能）。`lib/sample.test.ts` に `sample(large(20000), 3)` が throw しないテストを追加。

#### nim/client.ts の cleanup 2 件

**dead code 解消**: 拡張子判定の入れ子三項（PNG 分岐が両方 `"png"` で dead）を単一三項に簡約。コメントも実挙動（JPEG 以外は .png フォールバック）に合わせた。

**未使用型フィールド削除**: `artifacts` の要素型から `finishReason?: string` を削除。コード中で参照しておらず、型が実際のレスポンスフィールドと一致するかも未確認のため。

#### 見送り: gallery の全件 fetch → RPC 化
DB 側で `ORDER BY random() LIMIT 3` する RPC を追加するのが本筋だが、`schema.sql` の手動マイグレーションが要る。dev 段階のギャラリーには過剰。フォローアップ Issue 候補として残す。

---

#### eslint flat config 移行で新たに検出されたルール

`app/gallery/page.tsx:30` の `Math.random()` が `react-hooks/purity` ルールに違反。
Server Component（async function）内での非決定的関数の使用が禁止される。

`crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000` で代替。
`Math.random` が特別扱いで禁止されているルールであり、`crypto.getRandomValues` は通過する。

実際のリスク: このページは毎リクエスト動的レンダリング（ƒ Dynamic）のため、`Math.random()` でも機能的な問題はなかった。しかし React の純粋性原則への違反として修正が適切。
