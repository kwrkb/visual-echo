
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
    // 指定されたノードからのサブツリーを取得
    const treeData = await fetchTreeDataServer(id);

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
            <header className="flex-none p-4 bg-white border-b border-gray-200 z-10 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/tree" className="text-blue-600 hover:underline text-sm">
                        ← Back to Full Tree
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Subtree View</h1>
                </div>
                <div className="text-sm text-gray-500">
                    Root: {id.slice(0, 8)}...
                </div>
            </header>

            <main className="flex-1 min-h-0 relative">
                {treeData.length > 0 ? (
                    <TreeView nodes={treeData} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Node not found or has no visible structure.
                    </div>
                )}
            </main>
        </div>
    );
}
