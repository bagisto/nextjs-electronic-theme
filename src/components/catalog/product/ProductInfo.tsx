
import { ProductData, ProductReviewNode } from "../type";
import { ProductDescription } from "./ProductDescription";
import { getProductWithSwatchAndReview } from "@/hooks/getProductSwatchAndReview";
import { getShippingInfo } from "@/utils/bagisto-client";

export default async function ProductInfo({
  product,
  slug,
  reviews,
  totalReview,
}: {
  product: ProductData;
  slug: string;
  reviews: ProductReviewNode[];
  totalReview: number;
}) {
  const [productSwatchReview, shippingInfo] = await Promise.all([
    getProductWithSwatchAndReview(slug),
    getShippingInfo(),
  ]);

  return (
    <ProductDescription
      product={product}
      productSwatchReview={productSwatchReview}
      slug={slug}
      reviews={reviews}
      totalReview={totalReview}
      shippingInfo={shippingInfo}
    />
  );
}
