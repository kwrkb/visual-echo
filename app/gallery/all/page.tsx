import { createClient } from '@/lib/supabase/server';
import { ImageGrid } from '../components/ImageGrid';
import Link from 'next/link';

export default async function AllGalleryPage() {
  const supabase = await createClient();

  // 完了済みの画像を全て取得（新しい順）
  const { data: allGenerations, error } = await supabase
    .from('generations')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">ギャラリー</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">エラーが発生しました</p>
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            href="/gallery"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← ギャラリーに戻る
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            全ての作品
          </h1>
          <p className="text-gray-900">
            生成された全ての画像（{allGenerations?.length || 0}枚）
          </p>
        </div>

        <ImageGrid generations={allGenerations || []} />
      </div>
    </main>
  );
}
