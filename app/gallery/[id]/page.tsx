import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PromptForm } from './components/PromptForm';
import { ChildImages } from './components/ChildImages';
import { ImageLineage } from './components/ImageLineage';
import type { Generation } from '@/types/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 親を遡って系譜を取得する関数
async function getLineage(supabase: SupabaseClient<Database>, generationId: string): Promise<Generation[]> {
  const lineage: Generation[] = [];
  let currentId: string | null = generationId;

  while (currentId) {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', currentId)
      .single<Generation>();

    if (error || !data) break;

    lineage.unshift(data); // 先頭に追加（古い順になる）

    currentId = data.parent_id;
  }

  return lineage;
}

export default async function GenerationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 画像データ取得
  const { data: generation, error } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !generation) {
    notFound();
  }

  // 系譜を取得（ルートから現在の画像まで）
  const lineage = await getLineage(supabase, id);

  // 子画像を取得（この画像から生成された画像）
  const { data: childGenerations } = await supabase
    .from('generations')
    .select('*')
    .eq('parent_id', id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/gallery"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← ギャラリーに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">画像詳細</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 左側: 画像表示 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={generation.image_url}
                  alt={generation.prompt}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="p-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">
                  元のプロンプト
                </h2>
                <p className="text-gray-800">{generation.prompt}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                  <span>
                    作成日: {new Date(generation.created_at).toLocaleDateString('ja-JP')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${generation.status === 'completed'
                        ? 'bg-green-500'
                        : generation.status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                        }`}
                    />
                    {generation.status}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 右側: プロンプト入力フォーム */}
          <div>
            <PromptForm parentId={generation.id} />
          </div>
        </div>

        {/* 系譜表示 */}
        {lineage.length > 1 && <ImageLineage lineage={lineage} />}

        {/* 子画像一覧 */}
        <ChildImages children={childGenerations || []} />
      </div>
    </main>
  );
}
