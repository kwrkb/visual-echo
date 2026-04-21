-- Migration: RLS を SELECT のみ公開に変更し、書き込み（INSERT/UPDATE/DELETE）を service_role 経由に限定する
-- Issue: #7 security: RLSポリシーが全開放状態
--
-- 前提: アプリ側は lib/supabase/admin.ts の createAdminClient()（SUPABASE_SERVICE_ROLE_KEY）
--       を使って書き込みを行うこと。service_role は Supabase のデフォルトで RLS をバイパスする。
--       anon からの書き込みはポリシー不在により自動的に拒否される。

-- 旧ポリシー（全開放）を削除
DROP POLICY IF EXISTS "Enable insert access for all users" ON generations;
DROP POLICY IF EXISTS "Enable update access for all users" ON generations;
DROP POLICY IF EXISTS "Enable delete access for all users" ON generations;

-- SELECT は公開ゲームのため全ユーザーに開放（既存ポリシーがあればスキップ）
DROP POLICY IF EXISTS "Enable read access for all users" ON generations;
CREATE POLICY "Enable read access for all users" ON generations
  FOR SELECT USING (true);
