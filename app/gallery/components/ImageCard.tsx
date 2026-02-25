import Link from "next/link";
import Image from "next/image";
import type { Generation } from "@/types/database";

interface ImageCardProps {
  generation: Generation;
}

export function ImageCard({ generation }: ImageCardProps) {
  return (
    <Link
      href={`/gallery/${generation.id}`}
      className="group block bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-ve-md hover:border-ve-border-hover"
    >
      <div className="relative aspect-[3/4] bg-ve-bg-muted overflow-hidden">
        <Image
          src={generation.image_url}
          alt={generation.prompt}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <p className="text-sm text-ve-text line-clamp-2 leading-relaxed">
          {generation.prompt}
        </p>
        <p className="text-xs text-ve-text-subtle mt-2">
          {new Date(generation.created_at).toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}
