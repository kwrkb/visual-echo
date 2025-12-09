
"use client";

import Image from "next/image";
import { TreeNode } from "@/types/database";
import Link from "next/link";

interface TreeNodeProps {
    node: TreeNode;
    isRoot?: boolean;
}

export default function TreeNodeComponent({ node }: TreeNodeProps) {
    // ステータスに応じたボーダーカラー
    const statusColor =
        node.status === "completed"
            ? "border-green-500 shadow-green-200"
            : node.status === "failed"
                ? "border-red-500 shadow-red-200"
                : "border-yellow-500 shadow-yellow-200";

    return (
        <Link href={`/gallery/${node.id}`} className="group relative block w-48 shrink-0 transition-transform hover:scale-105 z-10">
            <div
                className={`relative overflow-hidden rounded-xl border-4 bg-white shadow-lg transition-all hover:shadow-xl ${statusColor}`}
            >
                <div className="aspect-[3/4] relative bg-gray-100">
                    {/* 画像表示 */}
                    {node.image_url ? (
                        <Image
                            src={node.image_url}
                            alt={node.prompt || "Generated Image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 200px"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                            <span className="text-2xl">📷</span>
                        </div>
                    )}

                    {/* オーバーレイ（ホバー時） */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex flex-col justify-end p-3">
                        <p className="text-white text-xs line-clamp-3 font-medium">
                            {node.prompt}
                        </p>
                        <div className="mt-2 text-[10px] text-gray-300">
                            {new Date(node.created_at).toISOString().split('T')[0].replace(/-/g, '/')}
                        </div>
                    </div>
                </div>
            </div>

            {/* 接続ポイント（右側） */}
            <div className="absolute top-1/2 -right-3 h-3 w-3 -translate-y-1/2 rounded-full bg-gray-400 ring-2 ring-white" />

            {/* 接続ポイント（左側 - 親がいる場合のみ使用されるが、コンポーネントとしては常に用意しておくと便利） */}
            <div className="absolute top-1/2 -left-3 h-3 w-3 -translate-y-1/2 rounded-full bg-gray-400 ring-2 ring-white" />
        </Link>
    );
}
