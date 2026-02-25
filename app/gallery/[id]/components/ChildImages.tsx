import Link from "next/link";
import Image from "next/image";
import type { Generation } from "@/types/database";
import { Badge } from "@/components/ui/Badge";

interface ChildImagesProps {
  generations: Generation[];
}

export function ChildImages({ generations }: ChildImagesProps) {
  if (generations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold text-ve-text">
          この画像から生まれた作品
        </h2>
        <Badge variant="accent">{generations.length}</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generations.map((child) => (
          <Link
            key={child.id}
            href={`/gallery/${child.id}`}
            className="group block bg-ve-surface rounded-2xl border border-ve-border shadow-ve-sm overflow-hidden transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-ve-md hover:border-ve-border-hover"
          >
            <div className="relative aspect-square bg-ve-bg-muted overflow-hidden">
              <Image
                src={child.image_url}
                alt={child.prompt}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-ve-text line-clamp-2 leading-relaxed">
                {child.prompt}
              </p>
              <p className="text-xs text-ve-text-subtle mt-1">
                {new Date(child.created_at).toLocaleDateString("ja-JP", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
