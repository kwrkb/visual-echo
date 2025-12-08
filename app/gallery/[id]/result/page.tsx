import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 生成された画像データ取得
  const { data: generation, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !generation) {
    notFound();
  }

  // 親画像を取得（存在する場合）
  const { data: parent } = generation.parent_id
    ? await supabase
        .from('generations')
        .select('*')
        .eq('id', generation.parent_id)
        .single()
    : { data: null };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">🎉 画像が生成されました！</h1>
          <p className="text-gray-800">
            あなたの説明から、AIが新しい画像を生成しました
          </p>
        </div>

        {parent && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">変遷の流れ</h2>
            <div className="grid md:grid-cols-3 gap-6 items-center">
              {/* 親画像 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={parent.image_url}
                    alt={parent.prompt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-700 mb-2">元の画像</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{parent.prompt}</p>
                </div>
              </div>

              {/* 矢印 */}
              <div className="text-center text-4xl text-gray-900">→</div>

              {/* 新しく生成された画像 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden ring-4 ring-blue-500">
                <div className="relative aspect-square">
                  <Image
                    src={generation.image_url}
                    alt={generation.prompt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-2">あなたの画像</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{generation.prompt}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!parent && (
          <div className="mb-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={generation.image_url}
                  alt={generation.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-2">{generation.prompt}</p>
                <p className="text-xs text-gray-700">
                  {new Date(generation.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/gallery/${generation.id}`}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            この画像から続けて生成する
          </Link>
          <Link
            href="/gallery"
            className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-gray-200 text-center"
          >
            ギャラリーに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
