import { type DocumentNode, type OperationVariables } from "@apollo/client";
import { graphqlRequest, type CacheLifeOption } from "@/lib/graphql-fetch";

export interface PageCacheConfig {
  tags: string[];
  life: CacheLifeOption;
}

/**
 * Cache configuration for different pages and queries
 * Centralized management of cache tags and revalidation times
 */
export const PAGE_CACHE_CONFIG: Record<string, PageCacheConfig> = {
  // Home page
  home: {
    tags: ["home-page"],
    life: "hours",
  },

  // Product pages
  product: {
    tags: ["all-products"],
    life: "hours",
  },

  // Category/Collection pages
  category: {
    tags: ["categories"],
    life: "hours",
  },

  // Static content
  static: {
    tags: ["static-content"],
    life: "days",
  },

  // Search results
  search: {
    tags: ["search-results"],
    life: "hours",
  },
};

/**
 * Helper to get cache config for a specific page
 */
export function getPageCacheConfig(
  page: keyof typeof PAGE_CACHE_CONFIG,
): PageCacheConfig {
  return PAGE_CACHE_CONFIG[page];
}

/**
 * Helper to create dynamic product cache config with specific product identifier
 */
export function getProductCacheConfig(productId: string): PageCacheConfig {
  return {
    tags: ["products", `product-${productId}`],
    life: "hours",
  };
}

/**
 * Helper to create dynamic category cache config with specific category identifier
 */
export function getCategoryCacheConfig(categoryId: string): PageCacheConfig {
  return {
    tags: ["categories", `category-${categoryId}`],
    life: "hours",
  };
}

/**
 * Wrapper hook for graphqlRequest with automatic cache management
 * Usage: const data = await cachedGraphQLRequest('home', query, variables);
 */
export async function cachedGraphQLRequest<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  page: keyof typeof PAGE_CACHE_CONFIG,
  query: DocumentNode,
  variables?: TVariables,
): Promise<TData> {
  const config = getPageCacheConfig(page);
  return graphqlRequest<TData, TVariables>(query, variables, config);
}

/**
 * Wrapper for product-specific queries with dynamic cache tags
 */
export async function cachedProductRequest<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  productId: string,
  query: DocumentNode,
  variables?: TVariables,
): Promise<TData> {
  const config = getProductCacheConfig(productId);
  return graphqlRequest<TData, TVariables>(query, variables, config);
}

/**
 * Wrapper for category-specific queries with dynamic cache tags
 */
export async function cachedCategoryRequest<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  categoryId: string,
  query: DocumentNode,
  variables?: TVariables,
): Promise<TData> {
  const config = getCategoryCacheConfig(categoryId);
  return graphqlRequest<TData, TVariables>(query, variables, config);
}
