import { Metadata } from "next";
import { notFound } from "next/navigation";
import { isArray } from "@/utils/type-guards";
import Grid from "@components/theme/ui/grid/Grid";
import FilterList from "@components/theme/filters/FilterList";
import SortOrder from "@components/theme/filters/SortOrder";
import MobileFilter from "@components/theme/filters/MobileFilter";
import ProductGridItems from "@components/catalog/product/ProductGridItems";
import Pagination from "@components/catalog/Pagination";
import { ProductsResponse } from "@components/catalog/type";
import {
  GET_FILTER_PRODUCTS,
  GET_TREE_CATEGORIES,
  graphqlRequest,
} from "@/graphql";
import { ITEMS_PER_PAGE, SortByFields } from "@utils/constants";
import { CategoryDetail } from "@components/theme/search/CategoryDetail";
import { Suspense } from "react";
import FilterListSkeleton from "@components/common/skeleton/FilterSkeleton";
import { TreeCategoriesResponse } from "@/types/theme/category-tree";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import { extractNumericId, findCategoryBySlug, buildProductFilters } from "@utils/helper";
import { getCategoryFilters } from "@utils/getCategoryFilters";
import { cachedGraphQLRequest } from "@hooks/useCache";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const { collection: categorySlug } = await params;

  const treeData = await cachedGraphQLRequest<TreeCategoriesResponse>(
    "category",
    GET_TREE_CATEGORIES,
    { parentId: 1 },
  );

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  const translation = categoryItem.translation;

  return {
    title: translation?.metaTitle || translation?.name,
    description: translation?.description || `${translation?.name} products`,
  };
}

export default async function CategoryPage({
  searchParams,
  params,
}: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { collection: categorySlug } = await params;
  const resolvedParams = await searchParams;

  const { treeData, colorFilterData, sizeFilterData, brandFilterData } = await getCategoryFilters();

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, categorySlug);

  if (!categoryItem) return notFound();

  const numericId = extractNumericId(categoryItem.id);

  const {
    q: searchValue,
    page,
    cursor,
    before,
  } = (resolvedParams || {}) as {
    [key: string]: string;
  };

  const currentPage = page ? parseInt(page) - 1 : 0;
  const sortValue = resolvedParams?.sort || "name-asc";
  const selectedSort =
    SortByFields.find((s) => s.key === sortValue) || SortByFields[0];

  const { filterInput: baseFilterInput } = buildProductFilters(resolvedParams || {});

  const filterObject: Record<string, string> = {};

  if (numericId) {
    filterObject.category_id = numericId;
  }

  if (baseFilterInput) {
    try {
      const baseFilters = JSON.parse(baseFilterInput);
      Object.assign(filterObject, baseFilters);
    } catch {
    }
  }

  const filterInput = JSON.stringify(filterObject);
  const [data] = await Promise.all([
    graphqlRequest<ProductsResponse>(GET_FILTER_PRODUCTS, {
      query: searchValue || "",
      filter: filterInput,
      ...(before
        ? { last: ITEMS_PER_PAGE, before: before }
        : { first: ITEMS_PER_PAGE, after: cursor }),
      sortKey: selectedSort.sortKey,
      reverse: selectedSort.reverse,
    }),
  ]);

  const filterAttributes = [
    colorFilterData?.attribute,
    sizeFilterData?.attribute,
    brandFilterData?.attribute,
  ]
    .filter(Boolean)
    .map((attr) => ({
      id: attr.id,
      code: attr.code,
      adminName: attr.code.toUpperCase(),
      options: attr.options.edges.map((o) => ({
        id: o.node.id,
        adminName: o.node.adminName,
      })),
    }));

  const products = data?.products?.edges?.map((e) => e.node) || [];
  const pageInfo = data?.products?.pageInfo;
  const totalCount = data?.products?.totalCount;
  const translation = categoryItem.translation;

  return (
    <>
      <MobileSearchBar />
      <section className="min-h-screen bg-white dark:bg-neutral-950">
        <Suspense fallback={<FilterListSkeleton />}>
          <CategoryDetail
            categoryItem={{ description: translation?.description ?? "", name: translation?.name ?? "" }}
          />
        </Suspense>

        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-8">
          <div className="my-8 hidden gap-6 md:flex md:items-baseline md:justify-between">
            <div className="w-64">
              <FilterList filterAttributes={filterAttributes} />
            </div>
            <div className="flex-1">
              <div className="flex justify-end mb-6">
                <SortOrder sortOrders={SortByFields} title="Sort by" />
              </div>

              {isArray(products) && products.length > 0 ? (
                <Grid className="grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  <ProductGridItems products={products} />
                </Grid>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="text-neutral-500 dark:text-neutral-400">No products found in this category.</p>
                </div>
              )}

              {isArray(products) && (totalCount > ITEMS_PER_PAGE || pageInfo?.hasNextPage) && (
                <nav
                  aria-label="Collection pagination"
                  className="my-12 flex justify-center"
                >
                  <Pagination
                    itemsPerPage={ITEMS_PER_PAGE}
                    itemsTotal={totalCount || 0}
                    currentPage={currentPage}
                    nextCursor={pageInfo?.endCursor}
                    prevCursor={pageInfo?.startCursor}
                  />
                </nav>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-4 py-6 mb-6">
              <MobileFilter filterAttributes={filterAttributes} />
              <SortOrder sortOrders={SortByFields} title="Sort by" />
            </div>

            {isArray(products) && products.length > 0 ? (
              <Grid className="grid-cols-2 gap-4">
                <ProductGridItems products={products} />
              </Grid>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300">
                <p className="text-neutral-500">No products found.</p>
              </div>
            )}

            {isArray(products) && (totalCount > ITEMS_PER_PAGE || pageInfo?.hasNextPage) && (
              <nav aria-label="Collection pagination" className="my-8 flex justify-center">
                <Pagination
                  itemsPerPage={ITEMS_PER_PAGE}
                  itemsTotal={totalCount || 0}
                  currentPage={currentPage}
                  nextCursor={pageInfo?.endCursor}
                  prevCursor={pageInfo?.startCursor}
                />
              </nav>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
