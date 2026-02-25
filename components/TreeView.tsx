"use client";

import { TreeNode } from "@/types/database";
import TreeNodeComponent from "./TreeNode";
import { useEffect, useRef, useState } from "react";

interface TreeViewProps {
  nodes: TreeNode[];
}

const RecursiveTree = ({ nodes }: { nodes: TreeNode[] }) => {
  if (!nodes || nodes.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {nodes.map((node) => (
        <div key={node.id} className="flex flex-row items-center">
          <div className="relative">
            <TreeNodeComponent node={node} />
            {node.children && node.children.length > 0 && (
              <div className="absolute top-1/2 left-full h-[2px] w-8 bg-ve-border -translate-y-1/2" />
            )}
          </div>

          {node.children && node.children.length > 0 && (
            <div className="relative flex flex-row">
              <div className="w-8" />
              <div className="relative">
                <RecursiveTree nodes={node.children} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function TreeView({ nodes }: TreeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY;
        setScale((s) => Math.min(Math.max(0.5, s - delta * 0.001), 2));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto bg-ve-bg p-10 cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `radial-gradient(var(--ve-accent) 0.5px, transparent 0.5px)`,
        backgroundSize: "24px 24px",
        backgroundPosition: "0 0",
        opacity: 1,
      }}
    >
      <div
        className="min-w-fit min-h-fit origin-top-left transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
        <RecursiveTree nodes={nodes} />
      </div>

      {/* Zoom controls */}
      <div className="fixed bottom-8 right-8 flex items-center gap-1 bg-ve-surface/80 backdrop-blur-md p-1.5 rounded-xl shadow-ve-md border border-ve-border">
        <button
          onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ve-bg-muted text-ve-text-muted hover:text-ve-text transition-colors font-bold"
          aria-label="ズームアウト"
        >
          -
        </button>
        <span className="flex items-center text-xs font-mono w-10 justify-center text-ve-text-muted">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((s) => Math.min(2, s + 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ve-bg-muted text-ve-text-muted hover:text-ve-text transition-colors font-bold"
          aria-label="ズームイン"
        >
          +
        </button>
      </div>
    </div>
  );
}
