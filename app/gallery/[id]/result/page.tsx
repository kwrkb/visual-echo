import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: generation, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !generation) {
    notFound();
  }

  const { data: parent } = generation.parent_id
    ? await supabase
        .from("generations")
        .select("*")
        .eq("id", generation.parent_id)
        .single()
    : { data: null };

  return (
    <div className="min-h-screen bg-ve-bg py-12">
      <Container>
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="text-3xl font-semibold tracking-tight text-ve-text mb-2">
            新しいエコーが生まれました
          </h1>
          <p className="text-sm text-ve-text-muted">
            あなたの説明から、AIが新しい画像を生成しました
          </p>
        </div>

        {parent ? (
          <div className="mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold text-ve-text mb-6 text-center">
              変遷の流れ
            </h2>
            <div className="grid md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
              {/* Parent image */}
              <div className="bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm overflow-hidden opacity-80">
                <div className="relative aspect-square">
                  <Image
                    src={parent.image_url}
                    alt={parent.prompt}
                    fill
                    className="object-cover saturate-[0.7]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-ve-text-subtle mb-1">元の画像</p>
                  <p className="text-sm text-ve-text-muted line-clamp-2">
                    {parent.prompt}
                  </p>
                </div>
              </div>

              {/* New image */}
              <div className="bg-ve-surface rounded-2xl border border-ve-border shadow-ve-md overflow-hidden ring-2 ring-ve-accent ring-offset-2">
                <div className="relative aspect-square">
                  <Image
                    src={generation.image_url}
                    alt={generation.prompt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-ve-accent font-semibold mb-1">
                    あなたの画像
                  </p>
                  <p className="text-sm text-ve-text line-clamp-2">
                    {generation.prompt}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="max-w-md mx-auto bg-ve-surface rounded-2xl border border-ve-border shadow-ve-md overflow-hidden ring-2 ring-ve-accent ring-offset-2">
              <div className="relative aspect-square">
                <Image
                  src={generation.image_url}
                  alt={generation.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-ve-text leading-relaxed mb-2">
                  {generation.prompt}
                </p>
                <p className="text-xs text-ve-text-subtle">
                  {new Date(generation.created_at).toLocaleDateString("ja-JP")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          <Button href={`/gallery/${generation.id}`} size="lg">
            続けて生成する
          </Button>
          <Button href="/gallery" variant="secondary" size="lg">
            ギャラリーに戻る
          </Button>
          {parent && (
            <Button href={`/tree`} variant="ghost" size="lg">
              ツリーで見る
            </Button>
          )}
        </div>
      </Container>
    </div>
  );
}
