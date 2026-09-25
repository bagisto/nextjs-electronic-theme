"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import type { BreadcrumbItem } from "@/utils/helper";

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items || items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.href + index} className="flex items-center gap-2">
            {isLast ? (
              <span className="text-neutral-900 dark:text-white font-medium truncate max-w-[200px]">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {item.name}
              </Link>
            )}
            {!isLast && (
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-neutral-400" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
