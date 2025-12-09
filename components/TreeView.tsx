
"use client";

import { TreeNode } from "@/types/database";
import TreeNodeComponent from "./TreeNode";
import { useEffect, useRef, useState } from "react";

interface TreeViewProps {
    nodes: TreeNode[];
}

/**
 * 再帰的にツリーを描画するコンポーネント
 * Flexboxを使用して横方向のツリーを構築
 */
const RecursiveTree = ({ nodes }: { nodes: TreeNode[] }) => {
    if (!nodes || nodes.length === 0) return null;

    return (
        <div className="flex flex-col gap-8">
            {nodes.map((node) => (
                <div key={node.id} className="flex flex-row items-center">
                    {/* ノード本体 */}
                    <div className="relative">
                        <TreeNodeComponent node={node} />

                        {/* 子がいる場合、右側に線を伸ばす */}
                        {node.children && node.children.length > 0 && (
                            <div className="absolute top-1/2 left-full h-[2px] w-8 bg-gray-300 -translate-y-1/2" />
                        )}
                    </div>

                    {/* 子ノードグループ */}
                    {node.children && node.children.length > 0 && (
                        <div className="relative flex flex-row">
                            {/* 子ノードへの接続線と分岐 */}
                            {/* 
                  簡単な実装: 左側にpaddingを開けて、縦線を入れる
                  より高度な実装: SVGで曲線を描く
              */}

                            {/* スペーサー（コネクタの長さ分） */}
                            <div className="w-8" />

                            {/* 縦線（分岐）のためのコンテナ - 複雑なため、今回は単純なgapで離して、個別の子レンダリングに任せる */}
                            <div className="relative">
                                {/* 子ノードたち */}
                                <RecursiveTree nodes={node.children} />

                                {/* 縦線: 最初のこの中心から最後の子の中心まで */}
                                {/* CSSで正確に描画するのは難しいので、簡易的に border-left を各子につけるアプローチやSVGが必要
                     今回はシンプルに「階層表示」のみを行う
                 */}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};


/**
 * メインのTreeViewコンポーネント
 * スクロール可能なエリアを提供
 */
export default function TreeView({ nodes }: TreeViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // マウスホイールでのズーム
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY;
                setScale(s => Math.min(Math.max(0.5, s - delta * 0.001), 2));
            }
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-auto bg-slate-50 p-10 cursor-grab active:cursor-grabbing"
            style={{
                backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
                backgroundSize: "20px 20px"
            }}
        >
            <div
                className="min-w-fit min-h-fit origin-top-left transition-transform duration-100 ease-out"
                style={{ transform: `scale(${scale})` }}
            >
                <RecursiveTree nodes={nodes} />
            </div>

            {/* HUD Controls */}
            <div className="fixed bottom-8 right-8 flex gap-2 bg-white/80 backdrop-blur p-2 rounded-lg shadow-lg border border-gray-200">
                <button
                    onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 font-bold"
                >
                    -
                </button>
                <span className="flex items-center text-sm font-mono w-12 justify-center">
                    {Math.round(scale * 100)}%
                </span>
                <button
                    onClick={() => setScale(s => Math.min(2, s + 0.1))}
                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 font-bold"
                >
                    +
                </button>
            </div>
        </div>
    );
}
