# Visual Echo - 実装計画

## 📅 開発フェーズ

### Phase 1: 基盤構築 ✅ 完了

**期間目安**: 完了済み

**成果物**:
- [x] Next.js + TypeScript + Tailwind CSS環境構築
- [x] Supabaseクライアント設定（Server/Client）
- [x] データベーススキーマ定義とマイグレーション
- [x] TypeScript型定義
- [x] Gemini APIクライアント基盤
- [x] 設計ドキュメント作成

**技術的達成**:
- デュアルSupabaseクライアントパターンの実装
- 型安全なデータベース操作の準備完了
- ミドルウェアによるセッション管理の実装

---

### Phase 2: コア機能実装（MVP）

**期間目安**: 2-3週間

**目標**: 最小限の機能で動作するプロトタイプの完成

#### 2.1 画像表示機能

**タスク**:
- [ ] ギャラリーページの作成 (`app/gallery/page.tsx`)
  - [ ] generationsテーブルからデータ取得
  - [ ] カード形式での画像一覧表示
  - [ ] Next.js Imageコンポーネントでの最適化
  - [ ] ローディング・エラー状態の実装

**実装ファイル**:
```
app/
  gallery/
    page.tsx              # ギャラリーメインページ
    components/
      ImageCard.tsx       # 画像カード
      ImageGrid.tsx       # グリッドレイアウト
      LoadingState.tsx    # ローディング表示
```

**技術スタック**:
- Server ComponentsでSSR
- Suspense境界でローディング管理

#### 2.2 画像詳細＆プロンプト入力

**タスク**:
- [ ] 画像詳細ページ (`app/gallery/[id]/page.tsx`)
  - [ ] Dynamic Routeでidベースルーティング
  - [ ] 選択画像の拡大表示
  - [ ] プロンプト入力フォーム
  - [ ] フォームバリデーション（最大文字数、必須チェック）

**実装ファイル**:
```
app/
  gallery/
    [id]/
      page.tsx            # 詳細ページ
      components/
        PromptForm.tsx    # プロンプト入力
        ImageDetail.tsx   # 画像詳細表示
```

**技術ポイント**:
- Client Componentでフォーム処理
- Server Actionsでデータ送信
- Optimistic UIで即座にフィードバック

#### 2.3 画像生成ロジック

**タスク**:
- [ ] Server Actionの実装 (`app/actions/generations.ts`)
  - [ ] `createGeneration`: DBに新規レコード作成（status: pending）
  - [ ] `generateImage`: Gemini API呼び出し
  - [ ] 画像URLの取得と保存
  - [ ] ステータス更新（pending → completed/failed）

- [ ] Gemini API統合 (`lib/gemini/client.ts`)
  - [ ] 画像生成APIの実装
  - [ ] エラーハンドリング
  - [ ] タイムアウト設定
  - [ ] リトライロジック

**実装ファイル**:
```
app/
  actions/
    generations.ts        # Server Actions
lib/
  gemini/
    client.ts             # 画像生成ロジック
    types.ts              # Gemini API型定義
```

**技術ポイント**:
- エラー時のロールバック処理
- 生成中のステータス管理
- WebSocketまたはポーリングで進捗通知

#### 2.4 生成フロー統合

**タスク**:
- [ ] 生成中画面 (`app/gallery/[id]/generating/page.tsx`)
  - [ ] プログレスインジケーター
  - [ ] ポーリングで生成状態確認
  - [ ] 完了時に結果ページへリダイレクト

- [ ] 結果表示ページ
  - [ ] 生成された画像の表示
  - [ ] 「次の派生を作る」CTA
  - [ ] SNS共有ボタン

**実装ファイル**:
```
app/
  gallery/
    [id]/
      generating/
        page.tsx          # 生成中画面
      result/
        page.tsx          # 結果表示
```

**MVP完成時のゴール**:
✅ ユーザーが画像を選んで説明し、新しい画像が生成される一連のフローが動作

---

### Phase 3: Storage統合

**期間目安**: 1週間

**目標**: 外部APIの一時URLを永続化

#### 3.1 Supabase Storage設定

**タスク**:
- [ ] Supabaseでストレージバケット作成
  - Bucket名: `generated-images`
  - 公開アクセス設定: 読み取りのみ可能

- [ ] RLS ポリシー設定
  - 誰でも読み取り可能
  - 認証ユーザーのみアップロード可能

#### 3.2 画像アップロードロジック

**タスク**:
- [ ] 画像ダウンロード＆アップロード (`lib/storage/upload.ts`)
  - [ ] Gemini APIからの画像URLをfetch
  - [ ] Supabase Storageへアップロード
  - [ ] 公開URLを取得してDBに保存

**実装ファイル**:
```
lib/
  storage/
    upload.ts             # アップロードヘルパー
    config.ts             # バケット設定
```

**技術ポイント**:
- ファイル名の重複回避（UUID使用）
- 画像形式の変換（必要に応じてWebPに）
- サムネイル生成（将来的）

---

### Phase 4: 履歴ツリー表示

**期間目安**: 1-2週間

**目標**: 画像の連鎖を可視化

#### 4.1 ツリーデータ取得

**タスク**:
- [ ] ツリー取得用Server Action (`app/actions/tree.ts`)
  - [ ] Recursive CTEでツリー構造取得
  - [ ] または再帰的な親子クエリ
  - [ ] JSON形式でツリーデータ返却

**SQL例**:
```sql
WITH RECURSIVE tree AS (
  -- ルート取得
  SELECT * FROM generations WHERE id = $1
  UNION ALL
  -- 再帰的に子孫を取得
  SELECT g.* FROM generations g
  INNER JOIN tree t ON g.parent_id = t.id
)
SELECT * FROM tree;
```

#### 4.2 ツリー可視化UI

**タスク**:
- [ ] ツリー表示ページ (`app/tree/[id]/page.tsx`)
  - [ ] React FlowまたはD3.jsでツリー描画
  - [ ] ノードクリックで詳細表示
  - [ ] ズーム・パン操作
  - [ ] レスポンシブ対応（モバイルは縦スクロール）

**ライブラリ候補**:
- `reactflow`: モダンで扱いやすい
- `d3.js`: カスタマイズ性高いが学習コスト高

**実装ファイル**:
```
app/
  tree/
    [id]/
      page.tsx            # ツリー表示
      components/
        TreeView.tsx      # ツリー描画
        TreeNode.tsx      # ノードコンポーネント
```

---

### Phase 5: UI/UX改善

**期間目安**: 1週間

**目標**: ユーザー体験の向上

#### 5.1 インタラクション改善

**タスク**:
- [ ] ローディングアニメーション追加
- [ ] トランジション効果（View Transitions API）
- [ ] スケルトンスクリーン実装
- [ ] トースト通知（成功・エラー）

**ライブラリ**:
- `react-hot-toast`: シンプルな通知
- `framer-motion`: アニメーション

#### 5.2 レスポンシブ対応強化

**タスク**:
- [ ] モバイルUI最適化
  - [ ] タッチジェスチャー対応
  - [ ] モバイルナビゲーション
  - [ ] 画像のピンチズーム

- [ ] タブレットUI調整
  - [ ] 2カラムレイアウト
  - [ ] 画面分割表示

#### 5.3 アクセシビリティ

**タスク**:
- [ ] WAI-ARIA属性追加
- [ ] キーボードナビゲーション対応
- [ ] スクリーンリーダー対応
- [ ] フォーカス管理

---

### Phase 6: パフォーマンス最適化

**期間目安**: 1週間

**目標**: Core Web Vitalsの改善

#### 6.1 画像最適化

**タスク**:
- [ ] サムネイル生成パイプライン
- [ ] WebP自動変換
- [ ] 遅延ロード最適化
- [ ] プレースホルダー画像

#### 6.2 データベース最適化

**タスク**:
- [ ] クエリパフォーマンス測定
- [ ] スロークエリの特定と改善
- [ ] キャッシング戦略の実装
  - [ ] `unstable_cache`でServer-side cache
  - [ ] Revalidation設定

#### 6.3 バンドルサイズ削減

**タスク**:
- [ ] 未使用依存関係の削除
- [ ] コード分割の最適化
- [ ] Dynamic Import活用

---

### Phase 7: テスト実装

**期間目安**: 1週間

**目標**: 品質保証

#### 7.1 単体テスト

**タスク**:
- [ ] ユーティリティ関数のテスト
- [ ] Server Actionsのテスト（Supabaseモック）
- [ ] コンポーネントのテスト（React Testing Library）

**カバレッジ目標**: 70%以上

#### 7.2 E2Eテスト

**タスク**:
- [ ] Playwright設定
- [ ] 主要ユーザーフローのE2Eテスト
  - [ ] 画像選択から生成完了まで
  - [ ] ツリー表示と履歴閲覧

---

### Phase 8: デプロイ

**期間目安**: 2-3日

**目標**: 本番環境への公開

#### 8.1 環境設定

**タスク**:
- [ ] Vercelプロジェクト作成
- [ ] 環境変数設定（Production）
- [ ] ドメイン設定（オプション）
- [ ] Analytics設定（Vercel Analytics）

#### 8.2 セキュリティ強化

**タスク**:
- [ ] RLSポリシーの本番用設定
- [ ] レート制限の実装
- [ ] CSPヘッダー設定
- [ ] 環境変数の再確認

#### 8.3 本番デプロイ

**タスク**:
- [ ] Preview環境でテスト
- [ ] 本番デプロイ実行
- [ ] 動作確認
- [ ] エラー監視設定（Sentry等）

---

## 🎯 マイルストーン

| マイルストーン | 完了条件 | 期限目安 |
|--------------|---------|---------|
| **MVP完成** | 画像選択→説明→生成の一連のフロー動作 | Phase 2完了時 |
| **β版リリース** | Storage統合 + ツリー表示機能 | Phase 4完了時 |
| **正式リリース** | 全機能完成 + テスト + デプロイ | Phase 8完了時 |

## 📊 進捗管理

### 推奨ツール
- **GitHub Projects**: タスク管理
- **GitHub Issues**: バグ・機能リクエスト
- **GitHub Discussions**: 設計議論

### ブランチ戦略
```
main          - 本番環境
└─ develop    - 開発環境
   ├─ feature/gallery
   ├─ feature/generation
   └─ feature/tree-view
```

## 🚧 技術的リスクと対策

| リスク | 影響度 | 対策 |
|-------|-------|------|
| Gemini API不安定 | 高 | リトライロジック + フォールバック |
| ツリー描画のパフォーマンス | 中 | 仮想化 + 段階的ロード |
| Storage容量超過 | 中 | 画像圧縮 + 古い画像の削除ポリシー |
| RLS設定ミス | 高 | 本番前にセキュリティレビュー |

## 🔄 次のアクション

**現在地**: Phase 1完了 ✅

**次のステップ**:
1. Phase 2.1「画像表示機能」の実装開始
2. `app/gallery/page.tsx`の作成
3. Supabaseからのデータ取得ロジック実装

**推奨開始コマンド**:
```bash
# 新しいブランチを作成
git checkout -b feature/gallery

# 開発サーバー起動
npm run dev
```
