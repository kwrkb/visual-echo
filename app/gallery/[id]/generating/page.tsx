'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GeneratingPage({ params }: PageProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [id, setId] = useState<string>('');

  useEffect(() => {
    params.then(({ id: generationId }) => {
      setId(generationId);

      const supabase = createClient();
      let pollInterval: NodeJS.Timeout;

      // ポーリングでステータスを確認
      const checkStatus = async () => {
        const { data, error } = await supabase
          .from('generations')
          .select('status')
          .eq('id', generationId)
          .single();

        if (error) {
          console.error('Status check error:', error);
          return;
        }

        if (data.status === 'completed') {
          setStatus('completed');
          clearInterval(pollInterval);
          // 完了したら結果ページへリダイレクト
          setTimeout(() => {
            router.push(`/gallery/${generationId}/result`);
          }, 1500);
        } else if (data.status === 'failed') {
          setStatus('failed');
          clearInterval(pollInterval);
        }
      };

      // 初回チェック
      checkStatus();

      // 2秒ごとにステータス確認
      pollInterval = setInterval(checkStatus, 2000);

      return () => {
        if (pollInterval) clearInterval(pollInterval);
      };
    });
  }, [params, router]);

  return (
    <main className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'pending' && (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <h1 className="text-2xl font-bold mb-2">画像を生成中...</h1>
            <p className="text-gray-900 mb-6">
              AIがあなたの説明から新しい画像を生成しています。
              しばらくお待ちください。
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p>⏳ プロンプトを解析中</p>
              <p>🎨 画像を生成中</p>
              <p>💾 保存処理中</p>
            </div>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="mb-6 text-6xl">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-green-600">生成完了！</h1>
            <p className="text-gray-900">
              結果ページにリダイレクトしています...
            </p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="mb-6 text-6xl">❌</div>
            <h1 className="text-2xl font-bold mb-2 text-red-600">生成失敗</h1>
            <p className="text-gray-900 mb-6">
              画像の生成に失敗しました。もう一度お試しください。
            </p>
            <button
              onClick={() => router.push('/gallery')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ギャラリーに戻る
            </button>
          </>
        )}
      </div>
    </main>
  );
}
