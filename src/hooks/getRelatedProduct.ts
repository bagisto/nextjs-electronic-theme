import { GET_RELATED_PRODUCTS, graphqlRequest } from "@/graphql";
import { SingleProductResponse } from "@/types/category/type";

 export async function getRelatedProduct(urlKey: string) {
    try {
      const dataById = await graphqlRequest<SingleProductResponse>(
        GET_RELATED_PRODUCTS,
        {
          urlKey: urlKey,
          first: 4,
        },
        {
          tags: ["related-products", `product-${urlKey}`],
          life: "hours",
        }
      );

      return dataById?.product || null;
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching product:", {
          message: error.message,
          urlKey,
          graphQLErrors: (error as unknown as Record<string, unknown>)
            .graphQLErrors,
        });
      }
      return null;
    }
  }