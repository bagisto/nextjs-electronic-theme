import { ProductsSection } from "./ProductsSection";
import { CompareProductsSection } from "./CompareProductsSection";
import { getRelatedProduct } from "@/hooks/getRelatedProduct";

export async function RelatedProductsSection({
  fullPath,
  currentProduct,
}: {
  fullPath: string;
  currentProduct: any;
}) {
  const fetchRelatedProducts = await getRelatedProduct(fullPath) as any;

  const relatedProducts = fetchRelatedProducts?.relatedProducts?.edges
    ? fetchRelatedProducts.relatedProducts.edges.map((e: any) => e.node)
    : [];

  return (
    <>
      <CompareProductsSection
        currentProduct={currentProduct}
      />
        
      <ProductsSection
        title="You may also like"
        description="Discover the latest trends! Fresh products just added—shop new styles, tech, and essentials before they're gone."
        products={relatedProducts}
      />
    </>
  );
}