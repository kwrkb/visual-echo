import Image from 'next/image';
import Link from 'next/link';
import type { Generation } from '@/types/database';

interface ImageLineageProps {
  lineage: Generation[];
}

export function ImageLineage({ lineage }: ImageLineageProps) {
  if (lineage.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        この画像に至る系譜（{lineage.length}世代）
      </h2>

      <div className="relative">
        {/* 縦線 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />

        <div className="space-y-6">
          {lineage.map((gen, index) => (
            <div key={gen.id} className="relative flex items-start gap-6">
              {/* 世代番号 */}
              <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              {/* 画像カード */}
              <Link
                href={`/gallery/${gen.id}`}
                className="flex-1 group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={gen.image_url}
                      alt={gen.prompt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="128px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 line-clamp-3 mb-2">
                      {gen.prompt}
                    </p>
                    <p className="text-xs text-gray-700">
                      {new Date(gen.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
