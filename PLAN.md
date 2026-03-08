# PLAN: Visual Echo — 解釈の連鎖を実現する

## Context

VISION.md を書き直し、Visual Echo の本質を再定義した。
「複数人の解釈がAIを媒介として連鎖し、変化の軌跡そのものを楽しむ」というコンセプト。

現在の実装は**単独プレイの画像生成ツール**に近い。
VISIONが描く「別の誰かが見て、また別の解釈を生む」体験はまだ実現できていない。

このPLANは、VISIONの哲学に沿って3つのフェーズで段階的に体験を構築する。

---

## Phase 1: 「見えない連鎖」— ブラインドモード ✅ 完了

### Why
VISIONの核心は伝言ゲーム構造。今の実装ではプロンプト履歴・系譜が見えた状態で説明を書くため、「解釈の連鎖」が成立しない。純粋に画像だけを見て言葉にする体験が必要。

### 実装内容
- [x] `/play` ページ: ランダムリーフノード選択 → `/play/[id]` へリダイレクト
- [x] `/play/[id]` ページ: 画像のみ表示（プロンプト・系譜・子画像は非表示）+ テキスト入力
- [x] 送信後のリビール体験: 系譜の全体を「初めて」見せる
- [x] ホームページCTA更新: 「参加する」をプライマリに、「観察する」をセカンダリに
- [x] リーフノード取得クエリ (`lib/queries/leaves.ts`)

### Key Files
| ファイル | 操作 |
|---------|------|
| `app/play/page.tsx` | 新規 |
| `app/play/[id]/page.tsx` | 新規 |
| `app/play/[id]/components/BlindPromptForm.tsx` | 新規 |
| `app/gallery/[id]/result/page.tsx` | 変更: リビール強化 |
| `app/gallery/[id]/generating/page.tsx` | 変更: `from=play` パラメータ対応 |
| `app/page.tsx` | 変更: CTA構成 |
| `lib/queries/leaves.ts` | 新規 |

---

## Phase 2: 「種を蒔く」— 画像アップロードとチェーン

### Why
VISIONは「1枚の画像を誰かが言葉で説明する」から始まる。現在はテキスト→AI画像でしか開始できない。人間が選んだ画像から連鎖が始まることで、AIは出発点ではなく媒介に徹する。

### Tasks
- [ ] スキーマ拡張: `title TEXT` カラム追加 + `types/database.ts` 同期
- [ ] `/create` ページにタブUI: 「画像をアップロード」/「テキストから生成」
- [ ] 画像アップロード → `public/images/uploaded/` に保存 → ルートノード作成
- [ ] チェーン一覧ページ (`/chains`): ルートノード一覧、画像、タイトル、深さ表示
- [ ] チェーン詳細ページ (`/chains/[id]`): ツリー表示 + 参加ボタン + 共有リンク
- [ ] 共有リンク: URLコピー → アクセスで該当チェーン内リーフにリダイレクト

---

## Phase 3: 「軌跡を味わう」— 観察体験の深化

### Why
VISIONは「遊ぶ体験」と「眺める体験」の両方を重視。Phase 1-2で「遊ぶ」が整ったので、「どこで意味が変わったのか」を観察する体験を磨く。変化の軌跡そのものがVisual Echoの作品。

### Tasks
- [ ] スキーマ拡張: `contributor_id TEXT` + `types/database.ts` 同期
- [ ] Cookieベース匿名ID (`lib/identity/anonymous.ts`)
- [ ] チェーン再生モード (`/chains/[id]/replay`): ルート→末端をステップ再生
- [ ] 分岐ポイントで枝選択UI
- [ ] 匿名貢献者バッジ表示（系譜・ツリーに「あなた」ラベル）
- [ ] TreeView改善: 分岐ポイントのハイライト

---

## テスト基盤導入 ✅ 完了

### Why
プロジェクトにテストが一切なく、レビュー指摘でクエリロジックを書き換えた際も手動確認のみだった。
純粋関数とサーバーアクションのバリデーションにユニットテストを入れ、リグレッションを防ぐ。

### 実装内容
- [x] Vitest 導入 (`vitest.config.ts`, `package.json` にスクリプト追加)
- [x] 純粋関数テスト (`lib/ui/status.test.ts`, `lib/queries/tree.test.ts`)
- [x] Supabase モックヘルパー (`lib/test-helpers.ts`)
- [x] RPC ラッパーテスト (`lib/queries/leaves.test.ts`, `lib/queries/lineage.test.ts`)
- [x] Server Action テスト (`app/actions/generations.test.ts`)

### 結果
- 5 テストファイル / 25 テストケース / 全パス
- lint エラーなし

---

## 依存関係

```
Phase 1 (ブラインド) ← スキーマ変更なし、即着手可 ✅ 完了
    ↓
Phase 2 (アップロード + チェーン) ← スキーマ変更 (title)
    ↓
Phase 3 (観察体験) ← スキーマ変更 (contributor_id)、Phase 1-2前提
```

## 検証（全Phase共通）
- `npm run lint` パス
- `npm run build` 成功
- `npm test` パス
- 手動テストで完了条件を確認
