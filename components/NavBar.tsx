"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/tree", label: "Tree" },
  { href: "/create", label: "Create" },
] as const;

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-14 border-b border-ve-border/60 bg-ve-surface/80 backdrop-blur-md"
      aria-label="メインナビゲーション"
    >
      <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-ve-text hover:text-ve-accent transition-colors"
        >
          Visual Echo
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-ve-accent bg-ve-accent-light"
                    : "text-ve-text-muted hover:text-ve-text hover:bg-ve-bg-muted"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
