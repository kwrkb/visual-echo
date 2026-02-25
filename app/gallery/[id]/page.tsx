import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PromptForm } from "./components/PromptForm";
import { ChildImages } from "./components/ChildImages";
import { ImageLineage } from "./components/ImageLineage";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { statusVariant } from "@/lib/ui/status";
import type { Generation } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

async function getLineage(
  supabase: SupabaseClient<Database>,
  generationId: string
): Promise<Generation[]> {
  const lineage: Generation[] = [];
  let currentId: string | null = generationId;

  while (currentId) {
    const response = (await supabase
      .from("generations")
      .select("*")
      .eq("id", currentId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .single()) as { data: Generation | null; error: any };

    if (response.error || !response.data) break;

    lineage.unshift(response.data);
    currentId = response.data.parent_id;
  }

  return lineage;
}

export default async function GenerationDetailPage({ params }: PageProps) {
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

  const lineage = await getLineage(supabase, id);

  const { data: childGenerations } = await supabase
    .from("generations")
    .select("*")
    .eq("parent_id", id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const variant = statusVariant(generation.status);

  return (
    <div className="min-h-screen bg-ve-bg">
      {/* Hero image */}
      <div className="w-full bg-ve-text">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full max-h-[70vh] aspect-square md:aspect-[16/9] overflow-hidden">
            <Image
              src={generation.image_url}
              alt={generation.prompt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <Container className="py-8">
        <PageHeader
          title="画像詳細"
          backHref="/gallery"
          backLabel="ギャラリーに戻る"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: prompt & metadata */}
          <div className="space-y-6 animate-fade-up">
            {/* Prompt quote block */}
            <div className="border-l-4 border-ve-accent pl-4 py-1">
              <p className="text-sm text-ve-text-muted mb-1 font-medium">
                元のプロンプト
              </p>
              <p className="text-ve-text leading-relaxed">
                {generation.prompt}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={variant}>{generation.status}</Badge>
              <span className="text-xs text-ve-text-subtle">
                {new Date(generation.created_at).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right: form */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <PromptForm parentId={generation.id} />
          </div>
        </div>

        {/* Lineage */}
        {lineage.length > 1 && (
          <div className="mt-12">
            <ImageLineage lineage={lineage} currentId={id} />
          </div>
        )}

        {/* Children */}
        <ChildImages generations={childGenerations || []} />
      </Container>
    </div>
  );
}
