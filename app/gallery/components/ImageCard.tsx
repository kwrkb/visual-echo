import Link from 'next/link';
import Image from 'next/image';
import type { Generation } from '@/types/database';

interface ImageCardProps {
  generation: Generation;
}

export function ImageCard({ generation }: ImageCardProps) {
  return (
    <Link
      href={`/gallery/${generation.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={generation.image_url}
          alt={generation.prompt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-900 line-clamp-2">
          {generation.prompt}
        </p>
        <p className="text-xs text-gray-700 mt-2">
          {new Date(generation.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>
    </Link>
  );
}
