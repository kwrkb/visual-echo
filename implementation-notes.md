# Implementation Notes

コード実装中に生じた判断・選択・妥協のログ。

---

## 2026-06-08: 依存関係アップデート + セキュリティチェック

### postcss 脆弱性の解消方法

**判断**: `overrides.postcss: "^8.5.15"` を package.json に追加。

当初「Next 16 メジャー更新で postcss moderate (GHSA-qx2v-qp2m-jg93) が解消できる」と計画していたが、実際には Next 16.2.7 も内部で `postcss@8.4.31` を抱えており解消されなかった（脆弱な範囲: `next 9.3.4-canary.0 - 16.3.0-canary.5`）。

`overrides` での強制アップグレードは Next 15 でも可能だった。Next 16 の採用理由は「最新メジャーへの追従 + next lint 廃止対応」に整理される。

実際のリスク: この XSS は postcss が CSS を stringify する際のみ発動し、Next がビルド時に処理する自プロジェクトの CSS（信頼済み入力）のみを対象とするため、ランタイムリスクは実質ゼロ。

### middleware.ts → proxy.ts の改名を保留

**判断**: 改名しない（deprecated 警告は許容）。

Next 16 でビルド時に `The "middleware" file convention is deprecated. Please use "proxy" instead.` の警告が出る。ただし：
- `proxy.ts` はランタイムが nodejs 固定になる
- 現在の `middleware.ts` は Supabase SSR セッション更新を行うが、Edge Runtime が不要になることの影響を確認していない
- 改名は動作に影響する可能性があり、別 PR で意図的に検証して行うべき判断

### Gemini モデル移行先の選定

**判断**: `gemini-3.1-flash-image`（GA、Stable）を選択。

調査段階で `gemini-3.1-flash-image-preview` が候補に挙がったが、2026-06-25 シャットダウン予定のため除外。GA 版の `gemini-3.1-flash-image`（Nano Banana 2、2026-05-28 リリース、シャットダウン日未定）が適切な後継モデル。

`@google/genai 2.x` の `generateContent` API は後方互換（公式 changelog: "GenerateContent usage is unaffected"）。ただし Gemini API キーが閉鎖中のため、以下は **未検証**:
- genai 2.x での実際のレスポンス形状（`response.candidates[0].content?.parts`）
- 429 エラーの `error.status` 形式（`lib/gemini/client.ts:81` のハンドリング）
- `gemini-3.1-flash-image` モデルでの実際の画像生成

API キー再開後に実動作確認を行うこと。

### eslint flat config 移行で新たに検出されたルール

`app/gallery/page.tsx:30` の `Math.random()` が `react-hooks/purity` ルールに違反。
Server Component（async function）内での非決定的関数の使用が禁止される。

`crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000` で代替。
`Math.random` が特別扱いで禁止されているルールであり、`crypto.getRandomValues` は通過する。

実際のリスク: このページは毎リクエスト動的レンダリング（ƒ Dynamic）のため、`Math.random()` でも機能的な問題はなかった。しかし React の純粋性原則への違反として修正が適切。
