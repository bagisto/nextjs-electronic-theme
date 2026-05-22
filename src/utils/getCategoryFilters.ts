import { cache } from "react";
import {
  GET_FILTER_OPTIONS,
  GET_TREE_CATEGORIES,
  graphqlRequest,
} from "@/graphql";
import { ProductFilterAttributeResponse } from "@components/catalog/type";
import { TreeCategoriesResponse } from "@/types/theme/category-tree";

/**
 * Fetches category tree and product filter options (color, size, brand)
 * Used across category pages, search pages, and collection pages
 */
export const getCategoryFilters = cache(async () => {
  const [treeData, colorFilterData, sizeFilterData, brandFilterData] = await Promise.all([
    graphqlRequest<TreeCategoriesResponse>(
      GET_TREE_CATEGORIES,
      { parentId: 1 },
      { tags: ["categories"], life: "days" }
    ),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/23", locale: "en" }, { tags: ["filters"], life: "days" }),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/24", locale: "en" }, { tags: ["filters"], life: "days" }),
    graphqlRequest<ProductFilterAttributeResponse>(GET_FILTER_OPTIONS, { id: "/api/admin/attributes/25", locale: "en" }, { tags: ["filters"], life: "days" }),
  ]);

  return { treeData, colorFilterData, sizeFilterData, brandFilterData };
});
