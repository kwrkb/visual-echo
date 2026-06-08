import { createClient } from "@/lib/supabase/server";
import { sample } from "@/lib/sample";
import { ImageGrid } from "./components/ImageGrid";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: allGenerations, error } = await supabase
    .from("generations")
    .select("*")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-ve-bg py-12">
        <Container>
          <PageHeader title="ギャラリー" />
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-ve-error">エラーが発生しました</p>
            <p className="text-ve-error text-sm mt-2">{error.message}</p>
          </div>
        </Container>
      </div>
    );
  }

  // 全件から 3 件を一様ランダムに選ぶ（部分 Fisher-Yates）
  // Uint32Array のサイズを k=3 に固定するため、件数が増えても QuotaExceededError にならない
  const displayGenerations = sample(allGenerations ?? [], 3);

  return (
    <div className="min-h-screen bg-ve-bg py-12">
      <Container>
        <PageHeader
          title="ギャラリー"
          subtitle="AI が生成した画像の連鎖を探索しましょう（ランダムで3枚表示中）"
          actions={
            <Button href="/gallery/all" size="md">
              全て表示
            </Button>
          }
        />

        <ImageGrid generations={displayGenerations} />
      </Container>
    </div>
  );
}
