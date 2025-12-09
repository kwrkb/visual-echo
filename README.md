Visual Echo (AI Image Telephone)
Visual Echo は、生成AIを活用した「非同期・分岐型」の連想ゲーム（伝言ゲーム）アプリケーションです。
プレイヤーは「画像」を「言語化」し、AIはその言葉から再び「画像」を生成します。この繰り返しにより、当初の意図から離れていく（あるいは奇跡的に維持される）視覚的な変遷を楽しむことができます。
📖 概要 (Overview)
従来の伝言ゲームと異なり、リアルタイム性を必要としません。Gitのブランチのように、1つの画像から複数の解釈（派生）が生まれ、巨大な「イマジネーションの樹形図」が形成されます。

> [!IMPORTANT]
> **ローカル環境での動作を想定しています**
> 本アプリケーションは、生成された画像をローカルファイルシステムに保存します。また、Google Gemini APIを使用して画像を生成するため、API利用料金が発生する可能性があります。

🛠 技術スタック (Tech Stack)
効率的な開発とスケーラビリティを考慮したモダン構成です。
| Category | Technology | Usage |
|---|---|---|
| Frontend | Next.js (App Router) | UI構築 |
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
`get_tree_structure` RPC関数（再帰的CTE）を使用して、効率的にツリー構造を取得します。

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
 * [x] Phase 2: Core Logic (MVP)
 * [x] Phase 3: Storage Integration
 * [x] Phase 4: UI/UX Refinement
 * [x] Phase 5: Tree Visualization
   * 再帰的CTEを使用したデータベース関数 (`get_tree_structure`) の実装
   * ツリー全体を俯瞰できるインタラクティブなツリービュー (`/tree`) の実装
 * [x] Phase 6: Initial Generation
   * 初期画像（ルートノード）の生成機能

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

# 4. Database Setup
# Supabase DashboardのSQL Editorで以下のファイルを実行してください:
# 1. `supabase/schema.sql` (テーブル作成)
# 2. `supabase/migrations/tree_rpc.sql` (RPC関数作成)

# 5. Run development server
npm run dev
