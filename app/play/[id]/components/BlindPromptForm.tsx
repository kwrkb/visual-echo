'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGeneration } from '@/app/actions/generations';
import { Button } from '@/components/ui/Button';

const PROMPT_MAX_LENGTH = 1000;
const ERROR_THRESHOLD = 950;
const WARNING_THRESHOLD = 900;

interface BlindPromptFormProps {
  parentId: string;
}

export function BlindPromptForm({ parentId }: BlindPromptFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: submitError } = await createGeneration(
      parentId,
      prompt
    );

    setLoading(false);

    if (submitError) {
      setError(submitError);
    } else if (data) {
      router.push(`/gallery/${data.id}/generating?from=play`);
    }
  };

  const charCount = prompt.length;
  const charColor =
    charCount > ERROR_THRESHOLD
      ? 'text-ve-error'
      : charCount > WARNING_THRESHOLD
        ? 'text-ve-warning'
        : 'text-ve-text-subtle';

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm p-6"
    >
      <h2 className="text-xl font-semibold text-ve-text mb-2">
        この画像に何が見えますか？
      </h2>
      <p className="text-sm text-ve-text-muted mb-6 leading-relaxed">
        あなたの目に映ったものを、自由に言葉にしてください。
        <br />
        あなたの説明から、AIが新しい画像を生成します。
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-ve-error text-sm">
          {error}
        </div>
      )}

      <div className="mb-5">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          maxLength={PROMPT_MAX_LENGTH}
          className="w-full px-4 py-3 border border-ve-border rounded-xl bg-ve-surface text-ve-text placeholder:text-ve-text-subtle resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ve-accent/30 focus:border-ve-accent"
          placeholder="例: 暗い森の中に光る小さな扉がある..."
          disabled={loading}
          autoFocus
        />
        <p className={`text-xs mt-1.5 text-right ${charColor}`}>
          {charCount} / {PROMPT_MAX_LENGTH}
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || prompt.trim().length === 0}
        size="lg"
        className="w-full"
      >
        {loading ? '送信中...' : '解釈を送信する'}
      </Button>
    </form>
  );
}
