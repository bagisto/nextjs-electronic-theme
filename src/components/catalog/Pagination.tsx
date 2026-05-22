"use client";

import { createUrl } from "@/utils/helper";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useTransition } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { InlineSpinner } from "@/components/common/PageLoader";

export default function Pagination({
  itemsPerPage,
  itemsTotal,
  currentPage,
  nextCursor,
  prevCursor,
}: {
  itemsPerPage: number;
  itemsTotal: number;
  currentPage: number;
  nextCursor?: string;
  prevCursor?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pageCount = Math.ceil(itemsTotal / itemsPerPage);

  const handlePageClick = (page: number) => {
    if (page < 0 || page >= pageCount) return;
    if (isPending) return;

    const params = new URLSearchParams(currentParams.toString());

    params.set("page", String(page + 1));

    if (page === currentPage + 1 && nextCursor) {
      params.set("cursor", nextCursor);
      params.delete("before");
    } else if (page === currentPage - 1 && prevCursor) {
      params.set("before", prevCursor);
      params.delete("cursor");
    } else {
      params.delete("cursor");
      params.delete("before");
    }

    const newUrl = createUrl(pathname, params);
    startTransition(() => {
      router.replace(newUrl);
    });
  };

  const renderDots = () => {
    const dots = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) {
        dots.push(renderPageButton(i));
      }
    } else {
      const halfMax = Math.floor(maxVisiblePages / 2);
      const start = Math.max(0, currentPage - halfMax);
      const end = Math.min(pageCount, start + maxVisiblePages);

      if (start > 0) {
        dots.push(renderPageButton(0));
        if (start > 1) {
          dots.push(
            <li key="dot-start" className="pagination-dot">...</li>
          );
        }
      }

      for (let i = start; i < end; i++) {
        dots.push(renderPageButton(i));
      }

      if (end < pageCount) {
        if (end < pageCount - 1) {
          dots.push(
            <li key="dot-end" className="pagination-dot">...</li>
          );
        }
        dots.push(renderPageButton(pageCount - 1));
      }
    }

    return dots;
  };

  const renderPageButton = (pageIndex: number) => {
    const isActive = pageIndex === currentPage;
    return (
      <li
        key={pageIndex}
        onClick={() => handlePageClick(pageIndex)}
        className={clsx("rounded-lg", isPending ? "cursor-wait" : "cursor-pointer")}
      >
        <button
          disabled={isPending}
          className={clsx(
            "flex h-10 w-10 items-center justify-center text-sm font-semibold rounded-lg duration-200 transition-all",
            isPending ? "cursor-wait" : "cursor-pointer",
            isActive
              ? "bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white shadow-md"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700",
            isPending && !isActive && "opacity-60",
          )}
          aria-label={`Goto Page ${pageIndex + 1}`}
          aria-current={isActive}
        >
          {pageIndex + 1}
        </button>
      </li>
    );
  };

  return (
    <ul
      className="mx-auto gap-2 text-sm flex justify-center items-center flex-wrap"
      role="navigation"
      aria-label="Pagination"
      aria-busy={isPending}
    >
      <li
        key="prev"
        onClick={() => handlePageClick(currentPage - 1)}
        className={clsx(
          "rounded-lg transition-colors duration-200",
          currentPage > 0 ? (isPending ? "block cursor-wait" : "block cursor-pointer") : ""
        )}
      >
        <button
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 transition-all duration-200",
            currentPage > 0
              ? isPending
                ? "cursor-wait opacity-60 text-neutral-500 dark:text-neutral-500"
                : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              : "cursor-not-allowed opacity-50 text-neutral-400 dark:text-neutral-600"
          )}
          aria-label="Previous page"
          disabled={currentPage <= 0 || isPending}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
      </li>

      {renderDots()}

      <li
        key="next"
        onClick={() => handlePageClick(currentPage + 1)}
        className={clsx(
          "rounded-lg transition-colors duration-200",
          currentPage < pageCount - 1 ? (isPending ? "block cursor-wait" : "block cursor-pointer") : ""
        )}
      >
        <button
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 transition-all duration-200",
            currentPage < pageCount - 1
              ? isPending
                ? "cursor-wait opacity-60 text-neutral-500 dark:text-neutral-500"
                : "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              : "cursor-not-allowed opacity-50 text-neutral-400 dark:text-neutral-600"
          )}
          aria-label="Next page"
          disabled={currentPage >= pageCount - 1 || isPending}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </li>

      {isPending && (
        <li
          key="loading"
          className="flex items-center gap-2 ml-2 text-neutral-500 dark:text-neutral-400 text-xs"
          aria-live="polite"
        >
          <InlineSpinner />
        </li>
      )}
    </ul>
  );
}
