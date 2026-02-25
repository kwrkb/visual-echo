import { fetchTreeDataServer } from "@/lib/queries/tree";
import TreeView from "@/components/TreeView";
import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Tree Node ${id} - Visual Echo`,
  };
}

export default async function TreeNodePage({ params }: Props) {
  const { id } = await params;
  const treeData = await fetchTreeDataServer(id);

  return (
    <div className="h-[calc(100dvh-3.5rem)] w-screen overflow-hidden flex flex-col">
      <header
        className="flex-none h-14 px-4 sm:px-6 bg-ve-surface/80 backdrop-blur-md border-b border-ve-border/60 z-10 flex justify-between items-center"
        aria-label="サブツリーページヘッダー"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/tree"
            className="text-sm text-ve-text-muted hover:text-ve-accent transition-colors inline-flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            全体ツリー
          </Link>
          <h1 className="text-lg font-semibold text-ve-text">
            サブツリー表示
          </h1>
        </div>
        <span className="text-xs text-ve-text-subtle font-mono">
          {id.slice(0, 8)}...
        </span>
      </header>

      <main className="flex-1 min-h-0 relative">
        {treeData.length > 0 ? (
          <TreeView nodes={treeData} />
        ) : (
          <div className="flex items-center justify-center h-full text-ve-text-muted">
            ノードが見つかりませんでした
          </div>
        )}
      </main>
    </div>
  );
}
