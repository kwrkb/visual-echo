-- Visual Echo Database Schema
-- SupabaseのSQL Editorで実行してください

-- Enable UUID extension (通常は既に有効)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- インデックス: parent_idでの検索を高速化（子画像の取得用）
CREATE INDEX IF NOT EXISTS idx_generations_parent_id ON generations(parent_id);

-- インデックス: 作成日時での検索・ソートを高速化
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- インデックス: ステータスでのフィルタリングを高速化
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

-- Row Level Security (RLS) を有効化
-- 本番環境では適切なポリシーを設定してください
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 開発用: 全員が読み書き可能なポリシー（本番では変更すること！）
CREATE POLICY "Enable read access for all users" ON generations
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON generations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON generations
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON generations
  FOR DELETE USING (true);

-- コメント追加（テーブルとカラムの説明）
COMMENT ON TABLE generations IS '画像生成の履歴と連鎖を管理するテーブル';
COMMENT ON COLUMN generations.id IS '生成レコードの一意な識別子';
COMMENT ON COLUMN generations.parent_id IS '親画像のID（連鎖の元となった画像）';
COMMENT ON COLUMN generations.image_url IS '生成された画像のURL';
COMMENT ON COLUMN generations.prompt IS 'ユーザーが入力した画像の説明文';
COMMENT ON COLUMN generations.created_at IS 'レコード作成日時';
COMMENT ON COLUMN generations.status IS '生成ステータス (pending, completed, failed)';
