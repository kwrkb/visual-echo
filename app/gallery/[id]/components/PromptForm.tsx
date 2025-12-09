'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGeneration } from '@/app/actions/generations';

interface PromptFormProps {
  parentId: string | null;
}

export function PromptForm({ parentId }: PromptFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: submitError } = await createGeneration(parentId, prompt);

    setLoading(false);

    if (submitError) {
      setError(submitError);
    } else if (data) {
      // 生成成功 - 生成中ページにリダイレクト
      router.push(`/gallery/${data.id}/generating`);
    }
  };

  const isInitial = !parentId;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">{isInitial ? '新しいお題を作る' : 'この画像を説明してみましょう'}</h2>
      <p className="text-gray-900 mb-6 text-sm">
        {isInitial
          ? 'あなたの想像力で新しいストーリーを始めましょう。どんな画像を作りたいですか？'
          : 'この画像が何を表しているか、あなたの言葉で説明してください。あなたの説明から、AIが新しい画像を生成します。'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          画像の説明
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
          placeholder="例: 夕暮れの海辺で静かに佇む灯台"
          disabled={loading}
        />
        <p className="text-xs text-gray-700 mt-1 text-right">
          {prompt.length} / 1000
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || prompt.trim().length === 0}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '送信中...' : 'AIに画像を生成してもらう'}
      </button>
    </form>
  );
}
