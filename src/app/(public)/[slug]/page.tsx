import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ProductFilterAttributeResponse,
  ProductsResponse,
} from "@components/catalog/type";
import {
  GET_FILTER_PRODUCTS,
  graphqlRequest,
} from "@/graphql";
import { COMMON_IMG, ITEMS_PER_PAGE, SortByFields } from "@utils/constants";
import { extractNumericId, findCategoryBySlug, buildProductFilters } from "@utils/helper";
import { getPage } from "@utils/bagisto-client";
import { getCategoryFilters } from "@utils/getCategoryFilters";
import SearchPageClient from "@/components/theme/search/SearchPageClient";

const RESERVED_PATHS = [
  "api",
  "search",
  "product",
  "customer",
  "checkout",
  "success",
  "error",
  "admin",
  "404",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Don't handle reserved paths
  if (RESERVED_PATHS.includes(slug)) {
    return notFound();
  }

  // First, try to find a category with this slug
  const { treeData } = await getCategoryFilters();

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, slug);

  // If category found, return category metadata
  if (categoryItem) {
    const translation = categoryItem.translation;
    return {
      title: translation?.metaTitle || translation?.name,
      description: translation?.description || `${translation?.name} products`,
    };
  }

  // If not a category, try to find a CMS page
  const page = await getPage({ urlKey: slug });
  if (page?.length) {
    const pageData = page?.[0]?.translation;
    return {
      title: pageData?.pageTitle,
    };
  }

  return notFound();
}

export default async function SlugPage({
  searchParams,
  params,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedParams = await searchParams;

  // Don't handle reserved paths
  if (RESERVED_PATHS.includes(slug)) {
    return notFound();
  }

  const { treeData, colorFilterData, sizeFilterData, brandFilterData } = await getCategoryFilters();

  const categories = treeData?.treeCategories || [];
  const categoryItem = findCategoryBySlug(categories, slug);

  if (categoryItem) {
    return <CategoryPLP
      categoryItem={categoryItem}
      colorFilterData={colorFilterData}
      sizeFilterData={sizeFilterData}
      brandFilterData={brandFilterData}
      resolvedParams={resolvedParams}
    />;
  }

  const page = await getPage({ urlKey: slug });
  if (page?.length) {
    const pageData = page?.[0]?.translation;
    const updatedAt = page?.[0]?.updatedAt;

    // Stable date formatting
    const formattedDate = updatedAt
      ? new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(updatedAt))
      : "";

    return (
      <div
        className="container mx-auto px-4 md:px-6 pb-12 md:pb-20 lg:pb-24"
        style={{ paddingTop: '106px' }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-10 text-neutral-900 dark:text-white">
            {pageData?.pageTitle}
          </h1>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none 
              prose-p:leading-relaxed prose-p:text-neutral-600 dark:prose-p:text-neutral-300
              prose-headings:text-neutral-900 dark:prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: pageData?.htmlContent || "" }}
          />
          {formattedDate && (
            <div className="mt-16">
              <p className="text-sm italic text-neutral-500 dark:text-neutral-400">
                {`This document was last updated on ${formattedDate}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return notFound();
}

async function CategoryPLP({
  categoryItem,
  colorFilterData,
  sizeFilterData,
  brandFilterData,
  resolvedParams,
}: {
  categoryItem: any;
  colorFilterData: ProductFilterAttributeResponse;
  sizeFilterData: ProductFilterAttributeResponse;
  brandFilterData: ProductFilterAttributeResponse;
  resolvedParams: { [key: string]: string | string[] | undefined } | undefined;
}) {
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
    }, {
      tags: ["categories", `category-${numericId}`],
      life: "minutes",
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

  const categoryBanner = categoryItem.logoPath || COMMON_IMG;
  const categoryName = translation?.name || "";
  const categoryDescription = translation?.description || "";

  // Use SearchPageClient for pixel-perfect PLP design
  return (
    <SearchPageClient
      products={products}
      totalCount={totalCount || 0}
      currentPage={currentPage}
      itemsPerPage={ITEMS_PER_PAGE}
      pageInfo={pageInfo}
      filterAttributes={filterAttributes}
      searchValue={undefined}
      categoryName={categoryName}
      categoryDescription={categoryDescription}
      categoryBanner={categoryBanner}
    />
  );
}
