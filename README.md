Visual Echo (AI Image Telephone)
Visual Echo は、生成AIを活用した「非同期・分岐型」の連想ゲーム（伝言ゲーム）アプリケーションです。
プレイヤーは「画像」を「言語化」し、AIはその言葉から再び「画像」を生成します。この繰り返しにより、当初の意図から離れていく（あるいは奇跡的に維持される）視覚的な変遷を楽しむことができます。
📖 概要 (Overview)
従来の伝言ゲームと異なり、リアルタイム性を必要としません。Gitのブランチのように、1つの画像から複数の解釈（派生）が生まれ、巨大な「イマジネーションの樹形図」が形成されます。
ゲームループ
 * View: プレイヤーは、文脈が隠された「1枚の画像」のみを見ます。
 * Input: その画像が何を表しているか、テキストで説明（プロンプト化）します。
 * Generate: AI (DALL-E 3) がそのテキストを元に、次の画像を生成します。
 * Reveal: 投稿後、その画像に至るまでの過去の変遷（履歴）が閲覧可能になります。
🛠 技術スタック (Tech Stack)
効率的な開発とスケーラビリティを考慮したモダン構成です。
| Category | Technology | Usage |
|---|---|---|
| Frontend | Next.js (App Router) | UI構築, Vercelへのデプロイ |
| Backend | Next.js API Routes | サーバーレス関数としてのバックエンド処理 |
| Database | Supabase (PostgreSQL) | ゲームデータおよび画像URLの管理 |
| Storage | Supabase Storage | 生成された画像の永続化 (DALL-E URLの一時性を回避) |
| AI Model | OpenAI API (DALL-E 3) | Text-to-Image 生成 |
| Styling | Tailwind CSS | 高速なUIスタイリング |
📐 システム構成 (Architecture)
データフロー
graph TD
    User[User] -->|1. 説明テキスト送信| NextAPI[Next.js API]
    NextAPI -->|2. Prompt送信| OpenAI[OpenAI DALL-E 3]
    OpenAI -->|3. 画像生成 & URL返却| NextAPI
    NextAPI -->|4. 画像保存| Storage[Supabase Storage]
    NextAPI -->|5. メタデータ保存| DB[(Supabase DB)]
    DB -->|6. 履歴データ返却| User

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
 * [ ] Phase 1: Environment Setup
   * Next.jsプロジェクトの作成
   * Supabaseプロジェクトの作成と接続
   * OpenAI APIキーの設定
 * [ ] Phase 2: Core Logic (MVP)
   * 画像表示機能の実装
   * テキスト入力フォームとDB保存の実装
   * OpenAI API連携による画像生成機能の実装
 * [ ] Phase 3: Storage Integration
   * 生成画像のSupabase Storageへのアップロード処理
 * [ ] Phase 4: UI/UX Refinement
   * 履歴（ツリー）表示画面の実装
   * ローディング等のインタラクション改善
 * [ ] Phase 5: Deploy
   * Vercelへの本番デプロイ
💻 セットアップ (Local Development)
# 1. Clone repository
git clone https://github.com/your-username/visual-echo.git
cd visual-echo

# 2. Install dependencies
npm install

# 3. Environment variables setup
cp .env.example .env.local
# .env.localに以下を設定:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY

# 4. Run development server
npm run dev
