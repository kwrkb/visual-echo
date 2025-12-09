Visual Echo (AI Image Telephone)
Visual Echo は、生成AIを活用した「非同期・分岐型」の連想ゲーム（伝言ゲーム）アプリケーションです。
プレイヤーは「画像」を「言語化」し、AIはその言葉から再び「画像」を生成します。この繰り返しにより、当初の意図から離れていく（あるいは奇跡的に維持される）視覚的な変遷を楽しむことができます。
📖 概要 (Overview)
従来の伝言ゲームと異なり、リアルタイム性を必要としません。Gitのブランチのように、1つの画像から複数の解釈（派生）が生まれ、巨大な「イマジネーションの樹形図」が形成されます。
ゲームループ
 * View: プレイヤーは、文脈が隠された「1枚の画像」のみを見ます。
 * Input: その画像が何を表しているか、テキストで説明（プロンプト化）します。
 * Generate: AI (Google Gemini) がそのテキストを元に、次の画像を生成します。
 * Reveal: 投稿後、その画像に至るまでの過去の変遷（履歴）が閲覧可能になります。
🛠 技術スタック (Tech Stack)
効率的な開発とスケーラビリティを考慮したモダン構成です。
| Category | Technology | Usage |
|---|---|---|
| Frontend | Next.js (App Router) | UI構築, Vercelへのデプロイ |
| Backend | Next.js API Routes | サーバーレス関数としてのバックエンド処理 |
| Database | Supabase (PostgreSQL) | ゲームデータおよび画像URLの管理 |
| Storage | Local Filesystem | 生成された画像の保存 (public/images/generated/) |
| AI Model | Google Gemini 2.5 Flash Image | Text-to-Image 生成 |
| Styling | Tailwind CSS | 高速なUIスタイリング |
📐 システム構成 (Architecture)
データフロー
```
User[User] -->|1. 説明テキスト送信| ServerAction[Next.js Server Action]
ServerAction -->|2. Pending生成レコード作成| DB[(Supabase DB)]
ServerAction -->|3. 非同期で画像生成開始| Background[Background Process]
Background -->|4. Prompt送信| Gemini[Google Gemini 2.5 Flash Image]
Gemini -->|5. 画像データ返却 (Base64)| Background
Background -->|6. 画像保存| LocalFS[Local Filesystem]
Background -->|7. メタデータ更新 (completed)| DB
User -->|8. ポーリングで状態確認| DB
DB -->|9. 履歴データ返却| User
```

🗃 データベース設計 (Schema)
generations テーブル単体で自己参照（Adjacency List）を行い、ツリー構造を表現します。
| Column Name | Type | Description |
|---|---|---|
| id | uuid | Primary Key (Default: gen_random_uuid()) |
| parent_id | uuid | 親画像のID (Nullable)。NULLの場合はルート（最初のお題）。 |
| image_url | text | 生成された画像のストレージURL。 |
| prompt | text | ユーザーが入力した画像の説明文。 |
| created_at | timestamptz | 作成日時 (Default: now()) |
| status | text | 生成ステータス (pending, completed, failed) |
🚀 開発ロードマップ (Roadmap)
 * [x] Phase 1: Environment Setup
   * Next.jsプロジェクトの作成
   * Supabaseプロジェクトの作成と接続
   * Gemini APIキーの設定
 * [x] Phase 2: Core Logic (MVP)
   * 画像表示機能の実装（ギャラリー、詳細ページ）
   * テキスト入力フォームとDB保存の実装
   * Gemini 2.5 Flash Image API連携による画像生成機能の実装
   * バックグラウンド画像生成とポーリングによるステータス確認
 * [x] Phase 3: Storage Integration
   * 生成画像のローカルファイルシステムへの保存
 * [x] Phase 4: UI/UX Refinement (Part 1)
   * 子画像一覧表示の実装
   * テキスト可読性の改善（ダークカラーの適用）
   * ローディング画面とリザルト画面の実装
 * [x] Phase 4: UI/UX Refinement (Part 2)
   * 画像系譜（リニエージ）表示の実装
   * ギャラリーランダム表示と全画像表示ページの実装
   * 画像生成パラメータの調整（ランダム性向上）
 * [x] Phase 5: Tree Visualization (New!)
   * 再帰的CTEを使用したデータベース関数 (`get_tree_structure`) の実装
   * ツリー全体を俯瞰できるインタラクティブなツリービュー (`/tree`) の実装
   * ズーム機能とスムーズなナビゲーション
 * [ ] Phase 6: Future Improvements
   * 初期画像（ルートノード）の生成機能
   * Vercelへの本番デプロイ
   * Supabase Storageへの移行（本番環境用）
💻 セットアップ (Local Development)
# 1. Clone repository
git clone https://github.com/your-username/visual-echo.git
cd visual-echo

# 2. Install dependencies
npm install

# 3. Environment variables setup
cp .env.local.example .env.local
# .env.localに以下を設定:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GEMINI_API_KEY

# 4. Database Setup (RPC Function)
# Supabase DashboardのSQL Editorで `supabase/migrations/tree_rpc.sql` を実行してください。
# これにより、ツリー構造を取得するための関数が作成されます。

# 5. Run development server
npm run dev
