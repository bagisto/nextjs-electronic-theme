import { GET_FILTER_PRODUCTS } from "@/graphql";
import { GET_PRODUCTS, GET_PRODUCTS_PAGINATION } from "@/graphql";
import { generateMetadataForPage, buildProductFilters } from "@/utils/helper";
import { getCategoryFilters } from "@utils/getCategoryFilters";
import { ITEMS_PER_PAGE, SortByFields } from "@/utils/constants";
import { ProductsResponse } from "@/components/catalog/type";
import SearchPageClient from "@/components/theme/search/SearchPageClient";
import { cachedGraphQLRequest } from "@hooks/useCache";

export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const commonSearches = [""];
    const params = [];
    for (const query of commonSearches) {
      const data = await cachedGraphQLRequest<ProductsResponse>(
         "search",
        GET_PRODUCTS,
         {
        query: query,
        first: 1,
        sortKey: "CREATED_AT",
        reverse: true,
      });

      const totalCount = data?.products?.totalCount || 0;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      let cursor: string | undefined;

      for (let i = 0; i < totalPages; i++) {
        const pageParams: { page: string; cursor?: string } = {
          page: String(i + 1),
        };
        if (i > 0 && cursor) {
          pageParams.cursor = cursor;
        }
        params.push(pageParams);
        if (i < totalPages - 1) {
          const pageData = await cachedGraphQLRequest<ProductsResponse>(
            "search",
            GET_PRODUCTS,
            {
              query: query,
              first: ITEMS_PER_PAGE,
              sortKey: "CREATED_AT",
              reverse: true,
              ...(cursor && { after: cursor }),
            },
          );
          cursor = pageData?.products?.pageInfo?.endCursor;
        }
      }
    }

    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const searchQuery = params?.q as string | undefined;

  return generateMetadataForPage("search", {
    title: searchQuery ? `Search: ${searchQuery}` : "Search Products",
    description: searchQuery
      ? `Search results for "${searchQuery}"`
      : "Search for products in our store",
    image: "/search-og.jpg",
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const {
    q: searchValue,
    page,
    cursor,
    before,
  } = (params || {}) as {
    [key: string]: string;
  };

  const currentPage = page ? parseInt(page) - 1 : 0;
  const sortValue = typeof params?.sort === "string" ? params.sort : "name-asc";
  const selectedSort =
    SortByFields.find((s) => s.key === sortValue) || SortByFields[0];
  const afterCursor: string | undefined = cursor;
  const beforeCursor: string | undefined = before;
  const { filterInput, isFilterApplied } = buildProductFilters(params || {});

  let dataPromise;
  if (isFilterApplied) {
    dataPromise = cachedGraphQLRequest<ProductsResponse>(
       "search",
      GET_FILTER_PRODUCTS, {
      query: searchValue,
      filter: filterInput,
      ...(beforeCursor
        ? { last: ITEMS_PER_PAGE, before: beforeCursor }
        : { first: ITEMS_PER_PAGE, after: afterCursor }),
      sortKey: selectedSort.sortKey,
      reverse: selectedSort.reverse,
    });
  } else {
    dataPromise = (async () => {
      let currentAfterCursor = afterCursor;
      if (currentPage > 0 && !afterCursor) {
        const cursorData = await cachedGraphQLRequest<ProductsResponse>(
          "search",
          GET_PRODUCTS_PAGINATION,
          {
            query: searchValue,
            first: currentPage * ITEMS_PER_PAGE,
            sortKey: selectedSort.sortKey,
            reverse: selectedSort.reverse,
          },
        );
        currentAfterCursor = cursorData?.products?.pageInfo?.endCursor;
      }

      return cachedGraphQLRequest<ProductsResponse>("search", GET_PRODUCTS, {
        query: searchValue,
        ...(beforeCursor
          ? { last: ITEMS_PER_PAGE, before: beforeCursor }
          : { first: ITEMS_PER_PAGE, after: currentAfterCursor }),
        sortKey: selectedSort.sortKey,
        reverse: selectedSort.reverse,
      });
    })();
  }

  const [data, { colorFilterData, sizeFilterData, brandFilterData }] =
    await Promise.all([dataPromise, getCategoryFilters()]);

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

  const products = data?.products?.edges?.map((e: any) => e.node) || [];
  const pageInfo = data?.products?.pageInfo;
  const totalCount = data?.products?.totalCount;

  // Use new client component for the new design
  return (
    <SearchPageClient
      products={products}
      totalCount={totalCount || 0}
      currentPage={currentPage}
      itemsPerPage={ITEMS_PER_PAGE}
      pageInfo={pageInfo}
      filterAttributes={filterAttributes}
      searchValue={typeof searchValue === "string" ? searchValue : undefined}
      categoryName="All Products"
    />
  );
}
