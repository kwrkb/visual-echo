import { createClient } from '@/lib/supabase/server';
import { ImageGrid } from './components/ImageGrid';

export default async function GalleryPage() {
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

  // null親（ルート画像）と非null親を分離
  const nullParents = (allGenerations || []).filter(gen => gen.parent_id === null);
  const withParents = (allGenerations || []).filter(gen => gen.parent_id !== null);

  // 非null親については、同じ親を持つ画像の中から最新のものだけを選ぶ
  const parentMap = new Map<string, typeof allGenerations[0]>();
  for (const gen of withParents) {
    // まだこの親の画像を追加していない場合のみ追加（最新順にソートされているため、最初のものが最新）
    if (!parentMap.has(gen.parent_id!)) {
      parentMap.set(gen.parent_id!, gen);
    }
  }

  // null親と非null親（重複除去済み）を結合し、最新の3つまでに絞る
  const displayGenerations = [...nullParents, ...Array.from(parentMap.values())].slice(0, 3);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Visual Echo ギャラリー
          </h1>
          <p className="text-gray-900">
            AI が生成した画像の連鎖を探索しましょう
          </p>
        </div>

        <ImageGrid generations={displayGenerations} />
      </div>
    </main>
  );
}
