import { createClient } from "@/lib/supabase/server";
import { ImageGrid } from "../components/ImageGrid";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default async function AllGalleryPage() {
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
          <PageHeader
            title="全ての作品"
            backHref="/gallery"
            backLabel="ギャラリーに戻る"
          />
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-ve-error">エラーが発生しました</p>
            <p className="text-ve-error text-sm mt-2">{error.message}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ve-bg py-12">
      <Container>
        <PageHeader
          title="全ての作品"
          subtitle={`生成された全ての画像`}
          backHref="/gallery"
          backLabel="ギャラリーに戻る"
          actions={
            <>
              <Badge variant="accent">{allGenerations?.length || 0}枚</Badge>
              <Button href="/create" variant="secondary" size="sm">
                新規作成
              </Button>
              <Button href="/tree" size="sm">
                ツリー表示
              </Button>
            </>
          }
        />

        <ImageGrid generations={allGenerations || []} />
      </Container>
    </div>
  );
}
