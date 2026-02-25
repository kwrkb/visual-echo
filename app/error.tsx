"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ve-bg flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-ve-error"
            >
              <path
                d="M10 10l12 12M22 10L10 22"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ve-text mb-2">
            エラーが発生しました
          </h1>
          <p className="text-sm text-ve-text-muted mb-6">
            予期しないエラーが発生しました。もう一度お試しください。
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="primary">
              再試行
            </Button>
            <Button href="/" variant="secondary">
              ホームに戻る
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
