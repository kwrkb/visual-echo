-- Visual Echo Database Schema
-- SupabaseのSQL Editorで実行してください

-- Enable UUID extension (通常は既に有効)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 生成ステータスのENUM型定義
CREATE TYPE generation_status AS ENUM ('pending', 'completed', 'failed');

-- Generations テーブル
-- 画像生成の履歴と連鎖を管理
CREATE TABLE IF NOT EXISTS generations (
  -- 主キー: 自動生成されるUUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 親画像ID: 連鎖の元となった画像（最初の画像はNULL）
  parent_id UUID REFERENCES generations(id) ON DELETE SET NULL,

  -- 生成された画像のURL（Supabase Storageまたは外部URL）
  image_url TEXT NOT NULL,

  -- ユーザーが入力したプロンプト（画像の説明文）
  prompt TEXT NOT NULL,

  -- 作成日時（タイムゾーン付き）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 生成ステータス
  status generation_status NOT NULL DEFAULT 'pending'
);

-- インデックス: parent_idでの検索を高速化（子画像の取得用）
CREATE INDEX IF NOT EXISTS idx_generations_parent_id ON generations(parent_id);

-- インデックス: 作成日時での検索・ソートを高速化
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- インデックス: ステータスでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

-- Row Level Security (RLS) を有効化
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- SELECT は公開ゲームのため全ユーザーに開放
CREATE POLICY "Enable read access for all users" ON generations
  FOR SELECT USING (true);

-- INSERT / UPDATE / DELETE は service_role クライアント経由のみ許可する。
-- service_role は Supabase のデフォルトで RLS をバイパスするため明示ポリシーは不要。
-- anon クライアントからの書き込みはポリシー不在により自動的に拒否される。
-- アプリ側は lib/supabase/admin.ts の createAdminClient() を使うこと。
-- 将来ユーザー認証を導入する際は auth.uid() ベースのポリシーに差し替える。

-- リーフノード取得関数（子を持たない完了済み世代）
-- クライアント側での全件フェッチを避け、DB側でフィルタリング
CREATE OR REPLACE FUNCTION get_leaf_nodes()
RETURNS SETOF generations
LANGUAGE sql
STABLE
AS $$
  SELECT g.*
  FROM generations g
  WHERE g.status = 'completed'
    AND NOT EXISTS (
      SELECT 1 FROM generations c
      WHERE c.parent_id = g.id
        AND c.status = 'completed'
    );
$$;

-- 系譜取得関数（指定世代からルートまでの系譜を一括取得）
-- N+1クエリを回避する再帰CTE
CREATE OR REPLACE FUNCTION get_lineage(generation_id UUID)
RETURNS SETOF generations
LANGUAGE sql
STABLE
AS $$
  WITH RECURSIVE lineage AS (
    SELECT g.*, 0 AS depth
    FROM generations g
    WHERE g.id = generation_id
    UNION ALL
    SELECT p.*, l.depth + 1
    FROM generations p
    INNER JOIN lineage l ON l.parent_id = p.id
  )
  SELECT id, parent_id, image_url, prompt, created_at, status
  FROM lineage
  ORDER BY depth DESC;
$$;

-- コメント追加（テーブルとカラムの説明）
COMMENT ON TABLE generations IS '画像生成の履歴と連鎖を管理するテーブル';
COMMENT ON COLUMN generations.id IS '生成レコードの一意な識別子';
COMMENT ON COLUMN generations.parent_id IS '親画像のID（連鎖の元となった画像）';
COMMENT ON COLUMN generations.image_url IS '生成された画像のURL';
COMMENT ON COLUMN generations.prompt IS 'ユーザーが入力した画像の説明文';
COMMENT ON COLUMN generations.created_at IS 'レコード作成日時';
COMMENT ON COLUMN generations.status IS '生成ステータス (pending, completed, failed)';
