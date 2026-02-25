# Code Quality Rules

git履歴の分析から抽出した再発防止ルール。

1. **DBスキーマ変更は依存箇所を同一コミットで更新**: `supabase/schema.sql` を変更する場合、RPC関数・`types/database.ts`・関連するアプリケーションコードも同じコミットで更新すること
2. **コミット前に `npm run lint` を実行**: 未使用変数、`<img>`→`<Image>`、`any`型などのlintエラーを後追い修正しない（hooks で自動実行される）
3. **`children` をカスタムprop名に使わない**: Reactの予約prop名と衝突するため、`generations` や `childItems` など具体的な名前を使う
4. **`any` 型禁止**: `SupabaseClient<Database>` 等の適切な型を使う。型が不明な場合は `unknown` を使い、型ガードで絞り込む
5. **外部サービスの設定値は初回から環境変数で管理**: モデル名・APIエンドポイント等をハードコードせず、`.env.local` と `CLAUDE.md` の Environment Setup に記載する
6. **Server/Client間の重複ロジックは共通関数に抽出**: フィルタ条件やクエリビルダーを `lib/` 配下の共通モジュールにまとめ、Server Components と Client Components の両方から参照する
