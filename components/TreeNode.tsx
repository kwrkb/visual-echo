"use client";

import Image from "next/image";
import { TreeNode } from "@/types/database";
import Link from "next/link";
import { statusBorderClass } from "@/lib/ui/status";

interface TreeNodeProps {
  node: TreeNode;
}

export default function TreeNodeComponent({ node }: TreeNodeProps) {
  const statusColor = statusBorderClass(node.status);

  return (
    <Link
      href={`/gallery/${node.id}`}
      className="group relative block w-48 shrink-0 transition-all duration-200 hover:-translate-y-1 z-10"
      aria-label={`${node.prompt || "Generated Image"} - ${node.status}`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border-2 bg-ve-surface shadow-ve-sm transition-all duration-200 hover:shadow-ve-md ${statusColor}`}
      >
        <div className="aspect-[3/4] relative bg-ve-bg-muted">
          {node.status === "pending" ? (
            <div className="flex h-full flex-col items-center justify-center text-ve-warning gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-ve-warning/30 animate-ripple" />
              <span className="text-xs font-medium">生成中...</span>
            </div>
          ) : node.status === "failed" ? (
            <div className="flex h-full flex-col items-center justify-center text-ve-error gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-xs font-medium">生成失敗</span>
            </div>
          ) : node.image_url ? (
            <Image
              src={node.image_url}
              alt={node.prompt || "Generated Image"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ve-text-subtle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col justify-end p-3">
            <p className="text-white text-xs line-clamp-3 font-medium">
              {node.prompt}
            </p>
            <div className="mt-2 text-[10px] text-white/60">
              {new Date(node.created_at)
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "/")}
            </div>
          </div>
        </div>
      </div>

      {/* Connection dots */}
      <div className="absolute top-1/2 -right-3 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-ve-accent ring-2 ring-ve-surface" />
      <div className="absolute top-1/2 -left-3 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-ve-border ring-2 ring-ve-surface" />
    </Link>
  );
}
