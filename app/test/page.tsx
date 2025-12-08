import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();

  // データベース接続テスト
  const { data, error } = await supabase
    .from('generations')
    .select('*')
    .limit(5);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase接続テスト</h1>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">エラーが発生しました</p>
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">✅ 接続成功！</p>
            <p className="text-green-600 text-sm mt-2">
              {data.length > 0
                ? `${data.length}件のレコードを取得しました`
                : 'テーブルは空です（これは正常です）'}
            </p>

            {data.length > 0 && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-900">
          <p>接続情報:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...</li>
            <li>テーブル: generations</li>
            <li>RLS: 有効（開発用ポリシー適用中）</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
