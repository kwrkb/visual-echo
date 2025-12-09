
import { fetchTreeDataServer } from "@/lib/queries/tree";
import TreeView from "@/components/TreeView";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Imagination Tree - Visual Echo',
    description: 'Explore the branching paths of visual imagination.',
};

export default async function TreePage() {
    // 全てのルートノードとその子孫を取得
    const treeData = await fetchTreeDataServer(null);

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
            <header className="flex-none p-4 bg-white border-b border-gray-200 z-10 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/gallery/all" className="text-blue-600 hover:underline text-sm font-medium">
                        ← ギャラリーに戻る
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Imagination Tree</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Showing all generation paths
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                <TreeView nodes={treeData} />
            </main>
        </div>
    );
}
