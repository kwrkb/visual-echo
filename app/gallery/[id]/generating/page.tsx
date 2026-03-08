"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface PageProps {
  params: Promise<{ id: string }>;
}

const steps = [
  { label: "プロンプトを解析", key: "analyze" },
  { label: "画像を生成", key: "generate" },
  { label: "保存処理", key: "save" },
] as const;

export default function GeneratingPage({ params }: PageProps) {
  const { id: generationId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPlay = searchParams.get("from") === "play";
  const [status, setStatus] = useState<"pending" | "completed" | "failed">(
    "pending"
  );
  const [activeStep, setActiveStep] = useState(0);

  // Simulate step progression while pending
  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(() => {
      setActiveStep((s) => (s < 2 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(timer);
  }, [status]);

  useEffect(() => {
    const supabase = createClient();

    const checkStatus = async () => {
      const { data, error } = await supabase
        .from("generations")
        .select("status")
        .eq("id", generationId)
        .single();

      if (error) {
        console.error("Status check error:", error);
        return;
      }

      if (data.status === "completed") {
        setStatus("completed");
        clearInterval(pollInterval);
        const resultUrl = fromPlay
          ? `/gallery/${generationId}/result?from=play`
          : `/gallery/${generationId}/result`;
        setTimeout(() => {
          router.push(resultUrl);
        }, 1500);
      } else if (data.status === "failed") {
        setStatus("failed");
        clearInterval(pollInterval);
      }
    };

    // pollInterval を先に宣言してから初回チェックを実行（TDZ回避）
    const pollInterval = setInterval(checkStatus, 2000);
    checkStatus();

    return () => clearInterval(pollInterval);
  }, [generationId, router, fromPlay]);

  return (
    <div className="min-h-screen bg-ve-bg flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto text-center animate-fade-up">
          {status === "pending" && (
            <>
              {/* Ripple animation */}
              <div className="relative w-32 h-32 mx-auto mb-8" aria-hidden="true">
                <div className="absolute inset-0 rounded-full border-2 border-ve-accent/30 animate-ripple" />
                <div
                  className="absolute inset-0 rounded-full border-2 border-ve-accent/20 animate-ripple"
                  style={{ animationDelay: "0.6s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border-2 border-ve-accent/10 animate-ripple"
                  style={{ animationDelay: "1.2s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-ve-accent-light flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-ve-accent"
                    >
                      <path
                        d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-ve-text mb-2">
                画像を生成中...
              </h1>
              <p className="text-sm text-ve-text-muted mb-8">
                AIがあなたの説明から新しい画像を生成しています
              </p>

              {/* Stepper */}
              <div className="flex items-center justify-center gap-2">
                {steps.map((step, i) => {
                  const isDone = i < activeStep;
                  const isActive = i === activeStep;
                  return (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            isDone
                              ? "bg-ve-success text-white"
                              : isActive
                                ? "bg-ve-accent text-white"
                                : "bg-ve-bg-muted text-ve-text-subtle"
                          }`}
                        >
                          {isDone ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <span
                          className={`text-[11px] whitespace-nowrap ${
                            isActive
                              ? "text-ve-accent font-medium"
                              : isDone
                                ? "text-ve-success"
                                : "text-ve-text-subtle"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className={`w-8 h-[2px] mb-5 ${
                            isDone ? "bg-ve-success" : "bg-ve-border"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {status === "completed" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-ve-success">
                  <path d="M8 16l6 6 10-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-ve-success mb-2">
                生成完了！
              </h1>
              <p className="text-sm text-ve-text-muted">
                結果ページにリダイレクトしています...
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-ve-error">
                  <path d="M10 10l12 12M22 10L10 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-ve-error mb-2">
                生成失敗
              </h1>
              <p className="text-sm text-ve-text-muted mb-6">
                画像の生成に失敗しました。もう一度お試しください。
              </p>
              <Button
                onClick={() => router.push("/gallery")}
                variant="secondary"
              >
                ギャラリーに戻る
              </Button>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
