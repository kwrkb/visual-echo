-- Migration: Convert status field from TEXT to ENUM type
-- 既存のデータベースに対してENUM型を追加するマイグレーション

-- Step 1: ENUM型を作成（まだ存在しない場合）
DO $$ BEGIN
    CREATE TYPE generation_status AS ENUM ('pending', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: 一時カラムを追加してENUM型に変換
ALTER TABLE generations ADD COLUMN status_new generation_status;

-- Step 3: 既存データを新しいカラムにコピー
UPDATE generations SET status_new = status::generation_status;

-- Step 4: 古いカラムを削除
ALTER TABLE generations DROP COLUMN status;

-- Step 5: 新しいカラムの名前を変更
ALTER TABLE generations RENAME COLUMN status_new TO status;

-- Step 6: NOT NULL制約とデフォルト値を設定
ALTER TABLE generations ALTER COLUMN status SET NOT NULL;
ALTER TABLE generations ALTER COLUMN status SET DEFAULT 'pending';
