"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGeneration } from "@/app/actions/generations";
import { Button } from "@/components/ui/Button";

interface PromptFormProps {
  parentId: string | null;
}

export function PromptForm({ parentId }: PromptFormProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
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
      router.push(`/gallery/${data.id}/generating`);
    }
  };

  const isInitial = !parentId;
  const charCount = prompt.length;
  const charColor =
    charCount > 950
      ? "text-ve-error"
      : charCount > 900
        ? "text-ve-warning"
        : "text-ve-text-subtle";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm p-6"
    >
      <h2 className="text-xl font-semibold text-ve-text mb-2">
        {isInitial ? "新しいエコーを始める" : "この画像を説明してみましょう"}
      </h2>
      <p className="text-sm text-ve-text-muted mb-6 leading-relaxed">
        {isInitial
          ? "あなたの想像力で新しいストーリーを始めましょう。どんな画像を作りたいですか？"
          : "この画像が何を表しているか、あなたの言葉で説明してください。あなたの説明から、AIが新しい画像を生成します。"}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-ve-error text-sm">
          {error}
        </div>
      )}

      <div className="mb-5">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-ve-text mb-2"
        >
          画像の説明
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          maxLength={1000}
          className="w-full px-4 py-3 border border-ve-border rounded-xl bg-ve-surface text-ve-text placeholder:text-ve-text-subtle resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ve-accent/30 focus:border-ve-accent"
          placeholder="例: 夕暮れの海辺で静かに佇む灯台"
          disabled={loading}
        />
        <p className={`text-xs mt-1.5 text-right ${charColor}`}>
          {charCount} / 1000
        </p>
      </div>

      <Button
        type="submit"
        disabled={loading || prompt.trim().length === 0}
        size="lg"
        className="w-full"
      >
        {loading ? "送信中..." : "AIに画像を生成してもらう"}
      </Button>
    </form>
  );
}
