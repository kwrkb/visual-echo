import { PromptForm } from "@/app/gallery/[id]/components/PromptForm";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-ve-bg py-12 flex items-center justify-center relative overflow-hidden">
      {/* Decorative concentric circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
        <svg width="300" height="300" viewBox="0 0 300 300" className="opacity-[0.04]">
          <circle cx="150" cy="150" r="40" stroke="var(--ve-accent)" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="70" stroke="var(--ve-accent)" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="100" stroke="var(--ve-accent)" strokeWidth="1" fill="none" />
          <circle cx="150" cy="150" r="130" stroke="var(--ve-accent)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <Container className="relative">
        <div className="max-w-2xl mx-auto">
          <PageHeader
            title="新しいエコーを始める"
            subtitle="あなたの想像力から、新しいストーリーが始まります"
            backHref="/"
            backLabel="トップに戻る"
          />

          <PromptForm parentId={null} />
        </div>
      </Container>
    </div>
  );
}
