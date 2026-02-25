import Image from "next/image";
import Link from "next/link";
import type { Generation } from "@/types/database";

interface ImageLineageProps {
  lineage: Generation[];
  currentId?: string;
}

export function ImageLineage({ lineage, currentId }: ImageLineageProps) {
  if (lineage.length === 0) {
    return null;
  }

  const lastId = currentId ?? lineage[lineage.length - 1]?.id;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-ve-text mb-4">
        系譜（{lineage.length}世代）
      </h2>

      {/* Horizontal film strip */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-2 min-w-min">
          {lineage.map((gen, index) => {
            const isCurrent = gen.id === lastId;
            return (
              <div key={gen.id} className="flex items-center">
                <Link
                  href={`/gallery/${gen.id}`}
                  className={`relative shrink-0 block rounded-xl overflow-hidden transition-all duration-200 hover:scale-105 ${
                    isCurrent
                      ? "ring-2 ring-ve-accent ring-offset-2"
                      : "ring-1 ring-ve-border hover:ring-ve-border-hover"
                  }`}
                  aria-label={`世代 ${index + 1}: ${gen.prompt}`}
                >
                  <div className="relative w-16 h-16 bg-ve-bg-muted">
                    <Image
                      src={gen.image_url}
                      alt={gen.prompt}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  {/* Generation badge */}
                  <span
                    className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full ${
                      isCurrent
                        ? "bg-ve-accent text-white"
                        : "bg-ve-bg-muted text-ve-text-muted"
                    }`}
                  >
                    {index + 1}
                  </span>
                </Link>

                {/* Connector arrow */}
                {index < lineage.length - 1 && (
                  <svg
                    width="20"
                    height="12"
                    viewBox="0 0 20 12"
                    fill="none"
                    className="shrink-0 mx-1 text-ve-border"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 6H16M16 6L12 2M16 6L12 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
