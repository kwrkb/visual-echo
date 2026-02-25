import { fetchTreeDataServer } from "@/lib/queries/tree";
import TreeView from "@/components/TreeView";
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Imagination Tree - Visual Echo",
  description: "Explore the branching paths of visual imagination.",
};

export default async function TreePage() {
  const treeData = await fetchTreeDataServer(null);

  return (
    <div className="h-[calc(100dvh-3.5rem)] w-screen overflow-hidden flex flex-col">
      <header
        className="flex-none h-14 px-4 sm:px-6 bg-ve-surface/80 backdrop-blur-md border-b border-ve-border/60 z-10 flex justify-between items-center"
        aria-label="ツリーページヘッダー"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/gallery/all"
            className="text-sm text-ve-text-muted hover:text-ve-accent transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ギャラリー
          </Link>
          <h1 className="text-lg font-semibold text-ve-text">
            Imagination Tree
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ve-text-subtle hidden sm:block">
            全ての生成パスを表示中
          </span>
          <Button href="/create" size="sm">
            新規作成
          </Button>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative">
        <TreeView nodes={treeData} />
      </main>
    </div>
  );
}
