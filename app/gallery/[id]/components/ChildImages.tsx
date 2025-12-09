import Link from 'next/link';
import Image from 'next/image';
import type { Generation } from '@/types/database';

interface ChildImagesProps {
  generations: Generation[];
}

export function ChildImages({ generations }: ChildImagesProps) {
  if (generations.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        この画像から生まれた作品（{generations.length}）
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {generations.map((child) => (
          <Link
            key={child.id}
            href={`/gallery/${child.id}`}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={child.image_url}
                alt={child.prompt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-900 line-clamp-2">
                {child.prompt}
              </p>
              <p className="text-xs text-gray-700 mt-1">
                {new Date(child.created_at).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
