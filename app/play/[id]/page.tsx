import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Container } from '@/components/ui/Container';
import { BlindPromptForm } from './components/BlindPromptForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: generation, error } = await supabase
    .from('generations')
    .select('id, image_url, status')
    .eq('id', id)
    .eq('status', 'completed')
    .single();

  if (error || !generation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ve-bg">
      {/* 画像のみ表示（プロンプト・系譜は非表示） */}
      <div className="w-full bg-ve-text">
        <div className="max-w-4xl mx-auto">
          <div className="relative w-full aspect-square md:aspect-[4/3] overflow-hidden">
            <Image
              src={generation.image_url}
              alt="この画像を説明してください"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <Container className="py-8">
        <div className="max-w-lg mx-auto animate-fade-up">
          <BlindPromptForm parentId={generation.id} />
        </div>
      </Container>
    </div>
  );
}
