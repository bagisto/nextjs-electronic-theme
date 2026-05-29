"use client";

import { useState, useMemo } from "react";
import dynamicImport from "next/dynamic";
import Grid from "@/components/theme/ui/grid/Grid";
import NotFound from "@/components/theme/search/not-found";
import { isArray } from "@/utils/type-guards";
import SortOrder from "@/components/theme/filters/SortOrder";
import { COMMON_IMG, SortByFields } from "@/utils/constants";
import FilterDrawer from "@/components/theme/filters/FilterDrawer";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

const Pagination = dynamicImport(
  () => import("@/components/catalog/Pagination")
);
const ProductGridItems = dynamicImport(
  () => import("@/components/catalog/product/ProductGridItems")
);

interface FilterAttribute {
  id: string;
  code: string;
  adminName: string;
  options: {
    id: string;
    adminName: string;
  }[];
}

interface SearchPageClientProps {
  products: any[];
  totalCount: number;
  currentPage: number;
  itemsPerPage: number;
  pageInfo?: {
    startCursor?: string;
    endCursor?: string;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  filterAttributes: FilterAttribute[];
  searchValue?: string;
  categoryName?: string;
  categoryDescription?: string;
  categoryBanner?: string;
}

// Filter Icon Component
const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

export default function SearchPageClient({
  products,
  totalCount,
  currentPage,
  itemsPerPage,
  pageInfo,
  filterAttributes,
  searchValue,
  categoryName = "All Products",
  categoryBanner = COMMON_IMG,
  categoryDescription = "",
}: SearchPageClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchParams = useSearchParams();

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    searchParams.forEach((value: string, key: string) => {
      if (key !== "q" && key !== "page" && key !== "sort") {
        count += value.split(",").length;
      }
    });
    return count;
  }, [searchParams]);



  return (
    <>
      <MobileSearchBar />

      {/* Breadcrumb */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-3 mt-5">
        <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 dark:text-white font-medium">{categoryName}</span>
        </nav>
      </div>

      {/* Category Banner */}
      {categoryBanner && (
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 mb-4">
          <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800">
              <Image
                src={COMMON_IMG}
                alt={categoryName}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          {categoryDescription && (
            <div className="mt-4">
              <div
                dangerouslySetInnerHTML={{ __html: categoryDescription as string }}
                className="text-neutral-900 dark:text-white"
              />
            </div>
          )}
        </div>
      )}

      {/* Section Header - Modern Toolbar */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                {searchValue ? `Search: "${searchValue}"` : categoryName}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {totalCount} Products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button - Modern style with badge */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all  cursor-pointer duration-200
                ${activeFilterCount > 0
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600"
                }
              `}
            >
              <FilterIcon />
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-green-500 text-white rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <SortOrder sortOrders={SortByFields} title="Sort by" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {!isArray(products) && (
        <NotFound
          msg={`${searchValue
            ? `There are no products that match: ${searchValue}`
            : "There are no products available"
            } `}
        />
      )}

      {isArray(products) ? (
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 pb-12">
          <Grid
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          >
            <ProductGridItems products={products} />
          </Grid>
        </div>
      ) : null}

      {/* Pagination */}
      {isArray(products) && totalCount > itemsPerPage && (
        <nav
          aria-label="Collection pagination"
          className="py-8"
        >
          <Pagination
            itemsPerPage={itemsPerPage}
            itemsTotal={totalCount}
            currentPage={currentPage}
            nextCursor={pageInfo?.endCursor}
            prevCursor={pageInfo?.startCursor}
          />
        </nav>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        filterAttributes={filterAttributes}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
}
