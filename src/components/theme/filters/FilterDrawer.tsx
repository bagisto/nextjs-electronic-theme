"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { createUrl } from "@/utils/helper";
import { PAGE, QUERY } from "@/utils/constants";
import CloseIcon from "@/components/common/icons/CloseIcon";
import ChevronDownIcon from "@/components/common/icons/ChevronDownIcon";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";
import { InlineSpinner } from "@/components/common/PageLoader";

interface FilterAttribute {
  id: string;
  code: string;
  adminName: string;
  options: {
    id: string;
    adminName: string;
  }[];
}

interface FilterDrawerProps {
  filterAttributes: FilterAttribute[];
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterDrawer({ filterAttributes, isOpen, onClose }: FilterDrawerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize expanded sections with useMemo
  const initialExpanded = useMemo(() => {
    const expanded: Record<string, boolean> = {};
    filterAttributes.forEach((attr) => {
      expanded[attr.code] = true;
    });
    return expanded;
  }, [filterAttributes]);

  // Initialize filters from URL
  const initialFilters = useMemo(() => {
    const filters: Record<string, Set<string>> = {};
    filterAttributes.forEach((attr) => {
      const values = searchParams.get(attr.code)?.split(",") || [];
      filters[attr.code] = new Set(values.filter(Boolean));
    });
    return filters;
  }, [filterAttributes, searchParams]);

  // Temporary state for filters in the drawer
  const [tempFilters, setTempFilters] = useState<Record<string, Set<string>>>(initialFilters);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(initialExpanded);
  const [brandSearch, setBrandSearch] = useState("");
  const [isApplying, startApplyTransition] = useTransition();
  const [isClearing, startClearTransition] = useTransition();

  // Sync temp state with URL when drawer opens
  if (isOpen) {
    const newFilters: Record<string, Set<string>> = {};
    filterAttributes.forEach((attr) => {
      const values = searchParams.get(attr.code)?.split(",") || [];
      newFilters[attr.code] = new Set(values.filter(Boolean));
    });

    // Only update if different
    if (JSON.stringify(newFilters) !== JSON.stringify(tempFilters)) {
      setTempFilters(newFilters);
    }
  }

  const handleFilterChange = (code: string, value: string, checked: boolean) => {
    setTempFilters((prev) => {
      const current = prev[code] || new Set();
      const updated = new Set(current);
      if (checked) {
        updated.add(value);
      } else {
        updated.delete(value);
      }
      return { ...prev, [code]: updated };
    });
  };

  const applyFilters = () => {
    if (isApplying || isClearing) return;
    const newParams = new URLSearchParams(searchParams.toString());

    Object.entries(tempFilters).forEach(([code, values]) => {
      if (values.size > 0) {
        newParams.set(code, Array.from(values).join(","));
      } else {
        newParams.delete(code);
      }
    });

    // Reset to page 1 when applying filters
    newParams.delete(PAGE);

    const newUrl = createUrl(pathname, newParams);
    startApplyTransition(() => {
      router.replace(newUrl);
      onClose();
    });
  };

  const clearAllFilters = () => {
    if (isApplying || isClearing) return;
    const q = searchParams.get(QUERY);
    const sort = searchParams.get("sort");
    const newParams = new URLSearchParams();

    if (q) newParams.set(QUERY, q);
    if (sort) newParams.set("sort", sort);

    startClearTransition(() => {
      router.replace(createUrl(pathname, newParams));
      setTempFilters({});
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleSection = (code: string) => {
    setExpandedSections((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const hasActiveFilters = Object.values(tempFilters).some((v) => v.size > 0);

  // Get unique brands from filter attributes
  const brandAttribute = filterAttributes.find((attr) => attr.code === "brand");
  const filteredBrands = brandAttribute?.options.filter((opt) =>
    opt.adminName.toLowerCase().includes(brandSearch.toLowerCase())
  ) || [];

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const commonContent = (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Filters</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <CloseIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
        </button>
      </div>

      {hasActiveFilters && (
        <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={clearAllFilters}
            disabled={isClearing || isApplying}
            aria-busy={isClearing}
            className={`text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors inline-flex items-center gap-2 ${isClearing ? "cursor-wait opacity-70" : "cursor-pointer"}`}
          >
            {isClearing && <InlineSpinner />}
            {isClearing ? "Clearing..." : "Clear all filters"}
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto px-6 py-6`}>
        {filterAttributes.map((attr) => (
          <div key={attr.id} className="mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-6 last:border-0">
            <button
              onClick={() => toggleSection(attr.code)}
              className="flex items-center justify-between w-full mb-3 cursor-pointer"
            >
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                {attr.adminName}
              </h3>
              <ChevronDownIcon
                className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${expandedSections[attr.code] ? "rotate-180" : ""}`}
              />
            </button>

            {expandedSections[attr.code] && (
              <div className="space-y-3">
                {attr.code === "brand" && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-500"
                    />
                  </div>
                )}

                {attr.code === "color" && (
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleFilterChange(attr.code, option.id, !tempFilters[attr.code]?.has(option.id))}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all hover:scale-110 ${
                          tempFilters[attr.code]?.has(option.id)
                            ? "border-neutral-900 dark:border-white ring-2 ring-neutral-900 dark:ring-white ring-offset-2"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                        style={{ backgroundColor: option.adminName.toLowerCase() }}
                        title={option.adminName}
                      />
                    ))}
                  </div>
                )}

                {(attr.code === "brand" || attr.code === "size" || attr.code === "category") && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {(attr.code === "brand" ? filteredBrands : attr.options).map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={tempFilters[attr.code]?.has(option.id) || false}
                          onChange={(e) => handleFilterChange(attr.code, option.id, e.target.checked)}
                          className="w-4 h-4 cursor-pointer  rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-600 dark:focus:ring-neutral-500"
                        />
                        <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                          {option.adminName}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {attr.code === "price" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-500"
                      />
                      <span className="text-neutral-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-600 dark:focus:ring-neutral-500"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
              In Stock Only
            </span>
          </label>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 cursor-pointer py-3 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={applyFilters}
            disabled={isApplying || isClearing}
            aria-busy={isApplying}
            className={`flex-1 px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors inline-flex items-center justify-center gap-2 ${isApplying ? "cursor-wait opacity-80" : "cursor-pointer"}`}
          >
            {isApplying && <InlineSpinner className="border-white/40 border-t-white dark:border-neutral-400 dark:border-t-neutral-900" />}
            {isApplying ? "Applying..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <>
        <div
          className={`fixed inset-0 bg-black/50 z-[65] transition-opacity duration-300 ease-in-out cursor-pointer ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
          {commonContent}
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-[105] transition-opacity duration-300 ease-in-out cursor-pointer ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 z-[110] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        {commonContent}
      </div>
    </>
  );
}
