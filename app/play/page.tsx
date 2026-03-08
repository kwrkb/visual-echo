import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRandomLeaf } from '@/lib/queries/leaves';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export const dynamic = 'force-dynamic';

export default async function PlayPage() {
  const supabase = await createClient();
  const leaf = await getRandomLeaf(supabase);

  if (leaf) {
    redirect(`/play/${leaf.id}`);
  }

  // リーフがない場合（画像が1枚もない場合）
  return (
    <div className="min-h-screen bg-ve-bg flex items-center justify-center">
      <Container>
        <div className="max-w-md mx-auto text-center animate-fade-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ve-accent-light flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="text-ve-accent"
            >
              <path
                d="M16 4v8M16 20v8M4 16h8M20 16h8"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-ve-text mb-2">
            まだ画像がありません
          </h1>
          <p className="text-sm text-ve-text-muted mb-8">
            最初の画像を作成して、連鎖を始めましょう。
          </p>
          <Button href="/create" size="lg">
            最初の画像を作る
          </Button>
        </div>
      </Container>
    </div>
  );
}
