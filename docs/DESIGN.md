# Visual Echo - 設計ドキュメント

## 🎯 プロジェクトの目的

Visual Echoは、AI画像生成を活用した非同期・分岐型の連想ゲームです。伝統的な伝言ゲームをデジタル化し、視覚的な変遷を楽しむ新しい体験を提供します。

### コアバリュー

1. **非同期性**: リアルタイム性不要。いつでも参加可能
2. **分岐性**: 1つの画像から複数の解釈が生まれる
3. **発見性**: 投稿後に歴史的な流れを振り返る楽しさ
4. **創造性**: AIとの協創による予測不可能な結果

## 🏗 システムアーキテクチャ

### 技術スタック選定理由

| 技術 | 選定理由 |
|------|---------|
| **Next.js 15** | App Router + Server Componentsでモダンな開発体験。Vercelへの簡単デプロイ |
| **TypeScript** | 型安全性によるバグ削減と開発効率向上 |
| **Supabase** | PostgreSQL + RESTful API + Storageのオールインワン。認証・RLSも統合 |
| **Gemini API** | Google製の高品質な画像生成API。コスト効率も良好 |
| **Tailwind CSS** | ユーティリティファーストで高速なUI開発 |

### データモデル設計

#### Adjacency List パターン

```
generations テーブル
┌─────────────┬──────────────┬────────────┬─────────┐
│ id (UUID)   │ parent_id    │ image_url  │ prompt  │
├─────────────┼──────────────┼────────────┼─────────┤
│ gen-001     │ NULL         │ img-1.jpg  │ "..."   │ ← ルート
│ gen-002     │ gen-001      │ img-2.jpg  │ "..."   │ ← 派生1
│ gen-003     │ gen-001      │ img-3.jpg  │ "..."   │ ← 派生2
│ gen-004     │ gen-002      │ img-4.jpg  │ "..."   │ ← 派生1-1
└─────────────┴──────────────┴────────────┴─────────┘
```

**利点**:
- シンプルなテーブル構造
- 深さ無制限のツリー表現が可能
- PostgreSQLのRecursive CTEで効率的なツリー走査

**トレードオフ**:
- 深い階層の取得時はクエリコストが増加
  → 解決策: マテリアライズドビューまたはキャッシング（将来的に）

### ステート管理

```
pending → completed
    ↓
  failed
```

- **pending**: 生成リクエスト作成直後（画像未生成）
- **completed**: 画像生成成功・保存完了
- **failed**: 生成失敗（エラー詳細は別途ログテーブルで管理可能）

## 🎨 UI/UX設計

### コアユーザーフロー

```
1. [ギャラリー] 既存の画像を閲覧
     ↓
2. [選択] 気になる画像を選択
     ↓
3. [説明] 画像を見て説明文を入力（履歴は非表示）
     ↓
4. [生成] AIが新しい画像を生成（ローディング表示）
     ↓
5. [公開] 生成完了。履歴チェーンが閲覧可能に
     ↓
6. [共有] SNS共有やURLコピー
```

### 主要画面

#### 1. ホーム画面
- 最新の生成画像をカード形式で表示
- フィルタ: 「ルートのみ」「最新」「人気」
- CTA: 「新しいツリーを開始」「既存画像から派生」

#### 2. 画像詳細画面
- 選択された画像を大きく表示
- プロンプト入力フォーム
- 「この画像から派生する」ボタン
- **重要**: 親の履歴は非表示（ネタバレ防止）

#### 3. 生成中画面
- プログレスインジケーター
- 予想待ち時間表示（Gemini APIのレスポンスタイム）
- キャンセルボタン（ステータスをfailedに更新）

#### 4. 履歴ツリー画面
- D3.jsまたはReact Flowでツリー可視化
- ノードクリックで各画像のプロンプト表示
- ズーム・パン操作対応

#### 5. プロフィール画面（将来的）
- ユーザーの投稿履歴
- お気に入り画像コレクション

## 🔐 セキュリティ設計

### Row Level Security (RLS) ポリシー

現在は開発用に全公開設定。本番前に以下に変更：

```sql
-- 読み取り: 全ユーザー可能（公開ゲームのため）
CREATE POLICY "Anyone can read generations"
ON generations FOR SELECT
USING (true);

-- 作成: 認証済みユーザーのみ（スパム防止）
CREATE POLICY "Authenticated users can create"
ON generations FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 更新: 作成者のみ（将来的にuser_id列追加時）
-- 削除: 管理者のみ
```

### API レート制限

- Gemini API: クライアントIPごとに1分あたり10回まで
- 実装方法: Vercel Edge Functionsでレート制限ミドルウェア
- または: Upstashを使った分散レート制限

### 画像コンテンツモデレーション

- Gemini APIの安全性フィルタを活用
- 不適切コンテンツの自動フィルタリング
- ユーザー報告機能（将来的）

## 📊 パフォーマンス最適化

### 画像最適化

1. **Supabase Storageの画像変換機能**
   - サムネイル生成（200x200, 400x400）
   - WebP自動変換
   - CDN配信による高速ロード

2. **Next.js Image コンポーネント**
   - 遅延読み込み
   - レスポンシブ画像
   - プレースホルダー表示

### データベースクエリ最適化

1. **インデックス戦略**
   - `parent_id`: ツリー走査用
   - `created_at DESC`: 最新順ソート用
   - `status`: ステータスフィルタ用

2. **ページネーション**
   - カーソルベースページング（IDベース）
   - 無限スクロール実装

3. **キャッシング**
   - Next.js の `unstable_cache` でクエリ結果をキャッシュ
   - 再検証: 新規生成時に自動無効化

## 🔄 API設計

### Server Actions

```typescript
// app/actions/generations.ts

// 新規生成リクエスト
export async function createGeneration(
  parentId: string | null,
  prompt: string
): Promise<{ id: string; error?: string }>

// 画像生成実行
export async function generateImage(
  generationId: string
): Promise<{ imageUrl: string; error?: string }>

// ツリー取得
export async function getGenerationTree(
  rootId: string
): Promise<{ tree: GenerationNode[]; error?: string }>
```

### REST API (Route Handlers)

```
POST   /api/generations          - 新規生成作成
GET    /api/generations/:id      - 単一生成取得
GET    /api/generations/:id/tree - ツリー取得
PATCH  /api/generations/:id      - ステータス更新
DELETE /api/generations/:id      - 削除（管理者のみ）
```

## 🧪 テスト戦略

### 単体テスト
- データベース型定義のテスト
- ユーティリティ関数のテスト
- フレームワーク: Vitest

### 統合テスト
- Supabaseクライアントのモック
- API Route Handlersのテスト
- フレームワーク: Vitest + MSW

### E2Eテスト
- 画像選択 → プロンプト入力 → 生成完了の一連の流れ
- フレームワーク: Playwright

## 📱 レスポンシブデザイン

### ブレークポイント

```
sm:  640px  - モバイル（縦）
md:  768px  - タブレット（縦）
lg:  1024px - タブレット（横）
xl:  1280px - ノートPC
2xl: 1536px - デスクトップ
```

### デバイス別最適化

- **モバイル**: シングルカラムレイアウト、タッチ最適化
- **タブレット**: 2カラムグリッド
- **デスクトップ**: 3カラムグリッド、ツリー表示の強化

## 🚀 デプロイメント

### Vercel設定

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "@supabase-publishable-key",
    "NVIDIA_NIM_API_KEY": "@nvidia-nim-api-key"
  }
}
```

### 環境ごとの設定

- **Development**: `.env.local`
- **Preview**: Vercel Environment Variables (preview)
- **Production**: Vercel Environment Variables (production)

## 🔮 将来の拡張性

### Phase 2 機能候補

1. **ユーザー認証**
   - Supabase Auth統合
   - Google/GitHub OAuth

2. **ソーシャル機能**
   - いいね・コメント機能
   - ユーザーフォロー

3. **ゲーミフィケーション**
   - 「最も派生した画像」ランキング
   - 「最長チェーン」達成バッジ

4. **高度なAI機能**
   - 画像スタイル指定
   - 複数モデル対応（DALL-E, Midjourney等）

5. **分析ダッシュボード**
   - 人気のプロンプトパターン
   - 分岐率の統計

### スケーラビリティ対策

- **データベース**: Supabaseの自動スケーリング + Read Replicaの検討
- **Storage**: CDN + 画像圧縮でトラフィック削減
- **API**: Edge Functions + レート制限でコスト管理
