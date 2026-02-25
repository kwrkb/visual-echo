import type { Generation } from "@/types/database";
import { ImageCard } from "./ImageCard";

interface ImageGridProps {
  generations: Generation[];
}

export function ImageGrid({ generations }: ImageGridProps) {
  if (generations.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ve-text-muted text-lg">まだ画像がありません</p>
        <p className="text-ve-text-subtle text-sm mt-2">
          最初の画像を生成して、イマジネーションの樹形図を始めましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {generations.map((generation) => (
        <ImageCard key={generation.id} generation={generation} />
      ))}
    </div>
  );
}
