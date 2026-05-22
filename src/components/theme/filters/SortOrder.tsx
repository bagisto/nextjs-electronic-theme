"use client";

import { SORT, SortOrderTypes } from "@/utils/constants";
import { createUrl } from "@/utils/helper";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition } from "react";

import ListSortIcon from "@/components/common/icons/ListSortIcon";
import ChevronDownIcon from "@/components/common/icons/ChevronDownIcon";
import { InlineSpinner } from "@/components/common/PageLoader";

const SortOrder: React.FC<{
  sortOrders: SortOrderTypes[];
  title?: string;
}> = ({ sortOrders, title: _title }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const sort = searchParams.get(SORT) || "name-asc";

  const [isOpen, setIsOpen] = useState(false);
  const [pendingValue, setPendingValue] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = sortOrders.find(o => o.value === sort);
  const currentLabel = currentSort?.title || "Sort by";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSortChange = (value: string) => {
    if (isPending) return;
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) newParams.set(SORT, value);
    const newUrl = createUrl(pathname, newParams);
    setPendingValue(value);
    startTransition(() => {
      router.replace(newUrl);
    });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        aria-busy={isPending}
        className={`
          flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border transition-all duration-200
          ${isPending ? "cursor-wait opacity-70" : "cursor-pointer"}
          ${isOpen
            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
            : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
          }
        `}
      >
        {isPending ? <InlineSpinner /> : <ListSortIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
        <span className="text-xs sm:text-sm font-medium hidden sm:inline">{currentLabel}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div 
        className={`absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 transition-all duration-200 ease-out ${
          isOpen 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="py-2">
          <p className="px-3 sm:px-4 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Sort By
          </p>
          {sortOrders.map((order) => {
            const showPendingSpinner = isPending && pendingValue === order.value;
            return (
              <button
                key={order.value}
                onClick={() => handleSortChange(order.value)}
                disabled={isPending}
                aria-busy={showPendingSpinner}
                className={`
                  w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm transition-colors
                  ${isPending ? "cursor-wait" : "cursor-pointer"}
                  ${sort === order.value
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  }
                `}
              >
                <span>{order.title}</span>
                {showPendingSpinner ? (
                  <InlineSpinner className="border-green-200 border-t-green-600" />
                ) : sort === order.value ? (
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SortOrder;
