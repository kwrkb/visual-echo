# Supabase Storage セットアップ

## ストレージバケットの作成

1. Supabaseダッシュボードにアクセス
2. 左メニューから「Storage」を選択
3. 「New Bucket」をクリック
4. 以下の設定で作成:
   - Name: `generations`
   - Public: `true` (画像を公開アクセス可能にする)
   - File size limit: `5MB`
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

## RLSポリシーの設定

以下のポリシーを追加（開発用 - 本番環境では制限を追加すること）:

```sql
-- 全ユーザーが画像を読み取り可能
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'generations');

-- 認証済みユーザーが画像をアップロード可能
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'generations');
```

## 使用方法

画像のアップロード例:

```typescript
const supabase = createClient();
const file = new File([blob], 'image.png', { type: 'image/png' });
const { data, error } = await supabase.storage
  .from('generations')
  .upload(`${Date.now()}.png`, file);

if (data) {
  const publicUrl = supabase.storage
    .from('generations')
    .getPublicUrl(data.path).data.publicUrl;
}
```
