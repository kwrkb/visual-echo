# Visual Echo - セットアップガイド

## 📋 完了した初期セットアップ

以下のセットアップが完了しています：

### ✅ 1. プロジェクト初期化
- Next.js 15 + TypeScript + Tailwind CSS
- App Router構成
- ESLint設定

### ✅ 2. 依存関係インストール
```json
{
  "@supabase/supabase-js": "^2.86.2",
  "@supabase/ssr": "^0.6.0",
  "@google/generative-ai": "^0.24.1"
}
```

### ✅ 3. 環境変数テンプレート
- `.env.local.example` - 共有用テンプレート
- `.env.local` - 実際の設定ファイル（要編集）

### ✅ 4. データベーススキーマ
- `supabase/schema.sql` - generations テーブル定義

### ✅ 5. Supabaseクライアント
- `lib/supabase/client.ts` - クライアント用
- `lib/supabase/server.ts` - サーバー用
- `lib/supabase/middleware.ts` - middleware用
- `middleware.ts` - Next.js middleware設定

### ✅ 6. TypeScript型定義
- `types/database.ts` - データベーススキーマの型定義

### ✅ 7. Gemini APIクライアント
- `lib/gemini/client.ts` - 画像生成用クライアント

## 🚀 次のステップ

### 1. 環境変数の設定

`.env.local`ファイルを編集して、実際の値を設定してください：

```bash
# 1. Supabaseプロジェクトを作成
# https://supabase.com/dashboard

# 2. Project Settings → API から取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 3. Google AI Studio でAPIキーを取得
# https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key-here

# 4. (オプション) 使用するモデルを指定
GEMINI_MODEL=gemini-2.0-flash-exp
```

### 2. データベースのセットアップ

1. Supabaseダッシュボードにログイン
2. SQL Editorを開く
3. `supabase/schema.sql`の内容を貼り付けて実行

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いて確認

### 4. 動作確認

基本的なページが表示されればセットアップ完了です！

## 📁 プロジェクト構造

```
visual-echo/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ホームページ
│   └── globals.css          # グローバルスタイル
├── lib/                     # ユーティリティ
│   ├── supabase/           # Supabaseクライアント
│   │   ├── client.ts       # クライアント用
│   │   ├── server.ts       # サーバー用
│   │   └── middleware.ts   # middleware用
│   └── gemini/             # Gemini API
│       └── client.ts       # 画像生成クライアント
├── types/                   # TypeScript型定義
│   └── database.ts         # データベーススキーマ型
├── supabase/               # Supabaseスキーマ
│   └── schema.sql          # テーブル定義
├── middleware.ts           # Next.js middleware
└── .env.local              # 環境変数（要設定）
```

## 🛠 主な技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| Framework | Next.js | 15.1.0 |
| Language | TypeScript | 5.x |
| UI | Tailwind CSS | 3.4.x |
| Database | Supabase (PostgreSQL) | - |
| AI | Google Gemini API | 2.0 |

## 📝 開発時の注意点

### Server ComponentsとClient Components

- **Server Components**: デフォルト。`lib/supabase/server.ts`を使用
- **Client Components**: `'use client'`を追加。`lib/supabase/client.ts`を使用

### 型安全性

全てのSupabaseクエリで型推論が効きます：

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();

// 型安全なクエリ
const { data, error } = await supabase
  .from('generations')
  .select('*')
  .eq('status', 'completed'); // 型チェックされます
```

## 🔗 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
