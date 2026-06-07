# 🎨 Visual Echo

**Visual Echo**は、生成AIを活用した非同期・分岐型の画像連想ゲームです。

画像を言葉で表現し、AIがその言葉から新しい画像を生成。この連鎖によって、当初の意図から離れていく（あるいは奇跡的に維持される）視覚的な変遷を楽しむことができます。

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.5-orange?logo=google)](https://ai.google.dev/)

## ✨ 特徴

- 🌳 **ツリー構造**: Gitのブランチのように、1つの画像から複数の解釈が分岐
- 🔄 **非同期処理**: リアルタイム性を必要とせず、自分のペースでプレイ可能
- 🎯 **視覚化**: インタラクティブなツリービューで全体の連鎖を俯瞰
- 🎨 **AI生成**: Google Gemini 2.5 Flash Imageによる高品質な画像生成
- 📊 **系譜追跡**: 画像の誕生から現在まで、すべての変遷を追跡可能

## 🖼️ スクリーンショット

### ギャラリービュー
ランダムに選ばれた3枚の画像を表示。各画像から新しい連鎖を開始できます。

### ツリービュー
すべての画像の連鎖を木構造で可視化。ズーム・パン操作に対応。

### 画像詳細
画像の系譜（ルートから現在まで）を視覚的に表示し、新しい解釈を追加できます。

## 🛠 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Frontend | Next.js 15 (App Router) | React 19ベースのフルスタックフレームワーク |
| Language | TypeScript 5 | 型安全な開発環境 |
| Database | Supabase (PostgreSQL) | リアルタイムデータベース |
| AI Model | Google Gemini 2.5 Flash Image | Text-to-Image生成 |
| Styling | Tailwind CSS | ユーティリティファーストCSS |
| Storage | Local Filesystem | 生成画像の保存 (`public/images/generated/`) |

## 📐 アーキテクチャ

### データフロー

```mermaid
sequenceDiagram
    participant User
    participant ServerAction as Next.js Server Action
    participant DB as Supabase DB
    participant Background as Background Process
    participant Gemini as Google Gemini API
    participant LocalFS as Local Filesystem

    User->>ServerAction: 1. 説明テキスト送信
    ServerAction->>DB: 2. Pending生成レコード作成
    ServerAction->>Background: 3. 非同期で画像生成開始
    Background->>Gemini: 4. Prompt送信
    Gemini->>Background: 5. 画像データ返却 (Base64)
    Background->>LocalFS: 6. 画像保存
    Background->>DB: 7. メタデータ更新 (completed)
    User->>DB: 8. ポーリングで状態確認
    DB->>User: 9. 完成画像とメタデータ返却
```

### データベース設計

**generations テーブル** - 自己参照によるツリー構造（Adjacency List パターン）

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | UUID | 主キー（自動生成） |
| `parent_id` | UUID | 親画像のID（ルートの場合はNULL） |
| `image_url` | TEXT | 生成画像のローカルパス |
| `prompt` | TEXT | ユーザー入力の説明文 |
| `created_at` | TIMESTAMPTZ | 作成日時 |
| `status` | generation_status | 生成ステータス（pending/completed/failed） |

**RPC関数**: `get_tree_structure(root_id UUID)` - 再帰的CTEによる効率的なツリー取得

## 🚀 セットアップ

### 前提条件

- Node.js 20.9.0以上
- Supabaseアカウント
- Google Gemini APIキー

### インストール手順

1. **リポジトリのクローン**

```bash
git clone https://github.com/kwrkb/visual-echo.git
cd visual-echo
```

2. **依存関係のインストール**

```bash
npm install
```

3. **環境変数の設定**

```bash
cp .env.local.example .env.local
```

`.env.local`を編集して、以下を設定:

```bash
# Supabase設定（Project Settings → API から取得）
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# サーバーサイドの書き込み用（RLS をバイパス）
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API設定（https://makersuite.google.com/app/apikey から取得）
GEMINI_API_KEY=your-gemini-api-key

# オプション: モデル指定（デフォルト: gemini-2.5-flash-image）
GEMINI_MODEL=gemini-2.5-flash-image
```

4. **データベースのセットアップ**

Supabase DashboardのSQL Editorで以下を順番に実行:

```sql
-- 1. スキーマとテーブル作成
-- supabase/schema.sql の内容を実行

-- 2. RPC関数作成（既存DBの場合は以下のマイグレーションを実行）
-- supabase/migrations/add_generation_status_enum.sql
-- supabase/migrations/update_tree_rpc_enum.sql
```

新規セットアップの場合は`supabase/schema.sql`のみでOKです。

5. **開発サーバーの起動**

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📱 使い方

### 1. ギャラリーで画像を選ぶ
`/gallery` にアクセスして、ランダムに表示される3枚の画像から好きなものを選択。

### 2. 画像を言葉で説明
選択した画像を見て、その内容を自分の言葉で説明します。

### 3. AIが新しい画像を生成
あなたの説明をもとに、AIが新しい画像を生成します（約10〜30秒）。

### 4. 連鎖を確認
生成された画像と元の画像を比較。系譜ビューで、ルートからの変遷を確認できます。

### 5. ツリービューで全体を俯瞰
`/tree` にアクセスして、すべての画像の連鎖をインタラクティブなツリーで探索。

## 🎯 主要機能

### ギャラリー (`/gallery`)
- ランダムに3枚の画像を表示
- 「全て表示」ボタンで全画像一覧に遷移

### ツリービュー (`/tree`)
- 全画像の連鎖を木構造で可視化
- ズーム・パン操作に対応
- 各ノードをクリックして詳細へ遷移

### 画像詳細 (`/gallery/[id]`)
- 画像の系譜（ルートから現在まで）を表示
- プロンプト入力フォームで新しい分岐を作成
- 子画像一覧を表示

### 新規作成 (`/create`)
- ルート画像（ツリーの起点）を生成

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lintチェック
npm run lint
```

## 📊 プロジェクト構成

```
visual-echo/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── gallery/             # ギャラリーページ群
│   ├── tree/                # ツリービュー
│   └── create/              # 新規作成ページ
├── components/              # Reactコンポーネント
├── lib/                     # ライブラリ・ユーティリティ
│   ├── supabase/           # Supabaseクライアント
│   ├── gemini/             # Gemini APIクライアント
│   └── queries/            # データベースクエリ
├── types/                   # TypeScript型定義
├── supabase/               # データベース関連
│   ├── schema.sql          # スキーマ定義
│   └── migrations/         # マイグレーションスクリプト
└── public/                 # 静的ファイル
    └── images/
        └── generated/      # AI生成画像（gitignore対象）
```

## ⚠️ 注意事項

### ローカル環境での動作を想定
本アプリケーションは生成された画像をローカルファイルシステムに保存します。本番環境にデプロイする場合は、Supabase StorageやCloudinaryなどのクラウドストレージへの移行が必要です。

### API利用料金
Google Gemini APIの使用により料金が発生する可能性があります。詳細は[Gemini API Pricing](https://ai.google.dev/pricing)をご確認ください。

### データベースポリシー
開発用に全ユーザーが読み書き可能なRLSポリシーが設定されています。本番環境では適切な認証・認可ポリシーを設定してください。

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue・Pull Requestを歓迎します！

## 📮 お問い合わせ

質問や提案がある場合は、[Issues](https://github.com/kwrkb/visual-echo/issues)でお知らせください。

---

**Made with ❤️ using Next.js, Supabase, and Google Gemini AI**

---

# 🇬🇧 Visual Echo (English)

**Visual Echo** is an asynchronous, branching image association game powered by generative AI.

Describe an image in words, and AI will generate a new image based on your description. Through this chain, you can enjoy the visual evolution that departs from (or miraculously maintains) the original intention.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.5-orange?logo=google)](https://ai.google.dev/)

## ✨ Features

- 🌳 **Tree Structure**: Just like Git branches, multiple interpretations branch out from a single image.
- 🔄 **Asynchronous Processing**: No real-time requirement; play at your own pace.
- 🎯 **Visualization**: Overview the entire chain with an interactive tree view.
- 🎨 **AI Generation**: High-quality image generation using Google Gemini 2.5 Flash Image.
- 📊 **Genealogy Tracking**: Track every transition from the image's birth to the present.

## 🖼️ Screenshots

### Gallery View
Displays 3 randomly selected images. You can start a new chain from each image.

### Tree View
Visualizes the chain of all images in a tree structure. Supports zoom and pan operations.

### Image Details
Visually displays the genealogy of an image (from root to current) and allows adding new interpretations.

## 🛠 Tech Stack

| Category | Technology | Usage |
|---------|------|------|
| Frontend | Next.js 15 (App Router) | React 19-based full-stack framework |
| Language | TypeScript 5 | Type-safe development environment |
| Database | Supabase (PostgreSQL) | Real-time database |
| AI Model | Google Gemini 2.5 Flash Image | Text-to-Image generation |
| Styling | Tailwind CSS | Utility-first CSS |
| Storage | Local Filesystem | Saving generated images (`public/images/generated/`) |

## 📐 Architecture

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant ServerAction as Next.js Server Action
    participant DB as Supabase DB
    participant Background as Background Process
    participant Gemini as Google Gemini API
    participant LocalFS as Local Filesystem

    User->>ServerAction: 1. Send description text
    ServerAction->>DB: 2. Create Pending generation record
    ServerAction->>Background: 3. Start image generation asynchronously
    Background->>Gemini: 4. Send Prompt
    Gemini->>Background: 5. Return image data (Base64)
    Background->>LocalFS: 6. Save image
    Background->>DB: 7. Update metadata (completed)
    User->>DB: 8. Check status via polling
    DB->>User: 9. Return completed image and metadata
```

### Database Design

**generations table** - Tree structure via self-reference (Adjacency List Pattern)

| Column Name | Type | Description |
|---------|-----|------|
| `id` | UUID | Primary Key (Auto-generated) |
| `parent_id` | UUID | Parent Image ID (NULL if root) |
| `image_url` | TEXT | Local path of the generated image |
| `prompt` | TEXT | Description entered by the user |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `status` | generation_status | Generation status (pending/completed/failed) |

**RPC Function**: `get_tree_structure(root_id UUID)` - Efficient tree retrieval using Recursive CTE

## 🚀 Setup

### Prerequisites

- Node.js 20.9.0 or higher
- Supabase Account
- Google Gemini API Key

### Installation Steps

1. **Clone the repository**

```bash
git clone https://github.com/kwrkb/visual-echo.git
cd visual-echo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set the following:

```bash
# Supabase Configuration (Get from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API Configuration (Get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key

# Optional: Model specification (Default: gemini-2.5-flash-image)
GEMINI_MODEL=gemini-2.5-flash-image
```

4. **Database Setup**

Run the following in order in the Supabase Dashboard SQL Editor:

```sql
-- 1. Create schema and tables
-- Execute content of supabase/schema.sql

-- 2. Create RPC functions (Run the following migrations if using an existing DB)
-- supabase/migrations/add_generation_status_enum.sql
-- supabase/migrations/update_tree_rpc_enum.sql
```

For a new setup, just `supabase/schema.sql` is sufficient.

5. **Start Development Server**

```bash
npm run dev
```

The application will start at http://localhost:3000.

## 📱 Usage

### 1. Choose an image in the Gallery
Access `/gallery` and select your favorite from 3 randomly displayed images.

### 2. Describe the image
Look at the selected image and describe its content in your own words.

### 3. AI generates a new image
Based on your description, AI generates a new image (approx. 10-30 seconds).

### 4. Check the chain
Compare the generated image with the original. You can see the transition from the root in the genealogy view.

### 5. Overview with Tree View
Access `/tree` to explore the chains of all images in an interactive tree.

## 🎯 Key Features

### Gallery (`/gallery`)
- Displays 3 random images
- "View All" button to transition to the full image list

### Tree View (`/tree`)
- Visualizes the chain of all images in a tree structure
- Supports zoom and pan operations
- Click each node to transition to details

### Image Details (`/gallery/[id]`)
- Displays image genealogy (from root to current)
- Prompt input form to create a new branch
- Displays list of child images

### Create New (`/create`)
- Generates a root image (starting point of a tree)

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint check
npm run lint
```

## 📊 Project Structure

```
visual-echo/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── gallery/             # Gallery pages
│   ├── tree/                # Tree view
│   └── create/              # Creation page
├── components/              # React components
├── lib/                     # Libraries & Utilities
│   ├── supabase/           # Supabase client
│   ├── gemini/             # Gemini API client
│   └── queries/            # Database queries
├── types/                   # TypeScript type definitions
├── supabase/               # Database related
│   ├── schema.sql          # Schema definition
│   └── migrations/         # Migration scripts
└── public/                 # Static files
    └── images/
        └── generated/      # AI generated images (gitignored)
```

## ⚠️ Notes

### Assumes local environment operation
This application saves generated images to the local filesystem. To deploy to a production environment, migration to cloud storage such as Supabase Storage or Cloudinary is required.

### API Usage Costs
Charges may apply for using the Google Gemini API. Please check [Gemini API Pricing](https://ai.google.dev/pricing) for details.

### Database Policy
For development, an RLS policy allowing read/write for all users is set. Please set appropriate authentication/authorization policies for production.

## 📝 License

MIT License

## 🤝 Contribution

Issues and Pull Requests are welcome!

## 📮 Contact

If you have questions or suggestions, please let us know in [Issues](https://github.com/kwrkb/visual-echo/issues).
