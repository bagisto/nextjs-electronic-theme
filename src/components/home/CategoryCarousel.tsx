import { FC } from "react";
import { GET_HOME_CATEGORIES } from "@/graphql/catalog/queries/HomeCategories";
import { NOT_IMAGE } from "@/utils/constants";
import CategoryCarouselClient from "./CategoryCarouselClient";
import { cachedGraphQLRequest } from "@hooks/useCache";

interface CategoryCarouselProps {
  options: {
    filters: Record<string, any>;
  };
}

const CategoryCarousel: FC<CategoryCarouselProps> = async ({
  options: _options,
}) => {
  try {
    const data = await cachedGraphQLRequest<any>(
       "home",
      GET_HOME_CATEGORIES,
      {},
    );

    const categories =
      data?.categories?.edges?.map((edge: any) => edge.node) || [];

    const topCategories = categories
      .filter((category: any) => category.id !== "1")
      .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
      .slice(1, 8);

    if (!topCategories.length) return null;

    const items = topCategories.map((category: any) => ({
      id: category.id,
      name: category.translation.name,
      slug: category.translation.slug,
      imageUrl: category.logoUrl || NOT_IMAGE,
    }));

    return <CategoryCarouselClient categories={items} />;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return null;
  }
};

export default CategoryCarousel;
