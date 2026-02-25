'use client';

import { useState } from 'react';
import { createTestGeneration } from '@/app/actions/generations';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AddSamplePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const sampleImages = [
    {
      prompt: '時を超えた幻想的な風景。崩れゆく古代の神殿、滝、時計の歯車、楽器が織りなすシュルレアリスムの世界',
      url: '/images/seed/image1.jpg',
    },
    {
      prompt: '時空を超えたワニ。古代の機械仕掛けの歯車と本、ピラミッドの目、浮遊する島々が描くファンタジー世界',
      url: '/images/seed/image2.jpg',
    },
    {
      prompt: 'シュルレアリスムの猫。ダリ風の溶ける時計、魚、目、鏡の中の風景が浮遊する幻想空間',
      url: '/images/seed/image3.jpg',
    },
  ];

  const handleAddSample = async (prompt: string, url: string) => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await createTestGeneration(prompt, url);

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: error });
    } else {
      setMessage({ type: 'success', text: `サンプル画像を追加しました (ID: ${data?.id})` });
      setTimeout(() => {
        router.push('/gallery');
      }, 1500);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">サンプル画像の追加</h1>
        <p className="text-gray-900 mb-8">
          テスト用のサンプル画像をデータベースに追加します
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {sampleImages.map((sample, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-64">
                <Image
                  src={sample.url}
                  alt={sample.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-gray-700 mb-4">{sample.prompt}</p>
                <button
                  onClick={() => handleAddSample(sample.prompt, sample.url)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '追加中...' : '追加'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => router.push('/gallery')}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            ギャラリーに戻る
          </button>
        </div>
      </div>
    </main>
  );
}
