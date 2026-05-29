import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ProductDetailSkeleton,
  RelatedProductSkeleton,
} from "@/components/common/skeleton/ProductSkeleton";
import {
  BASE_SCHEMA_URL,
  baseUrl,
  getImageUrl,
  NOT_IMAGE,
  PRODUCT_TYPE,
} from "@/utils/constants";
import ProductGallery from "@/components/catalog/product/ProductGallery";
import { GET_PRODUCT_BY_URL_KEY, graphqlRequest } from "@/graphql";
import {
  GET_APPOINTMENT_BOOKING_DETAILS,
  GET_TABLE_BOOKING_DETAILS,
  GET_EVENT_BOOKING_DETAILS,
  GET_RENTAL_BOOKING_DETAILS,
  GET_DEFAULT_BOOKING_DETAILS,
} from "@/graphql/catalog/queries/BookingSpecificQueries";
import { isArray } from "@/utils/type-guards";
import { ProductNode } from "@/components/catalog/type";
import { RelatedProductsSection } from "@components/catalog/product/RelatedProductsSection";
import ProductInfo from "@components/catalog/product/ProductInfo";
import { LRUCache } from "@/utils/LRUCache";
import { ProductVariant } from "@/types/category/type";
import { MobileSearchBar } from "@components/layout/navbar/MobileSearch";
import Link from "next/link";
import { ProductTabsWrapper } from "@/components/catalog/product/ProductTabsWrapper";

const productCache = new LRUCache<ProductNode>(100, 10);
export const dynamic = "force-static";

export interface SingleProductResponse {
  product: ProductNode;
}

const BOOKING_SUBTYPE_QUERY_MAP = {
  appointment: GET_APPOINTMENT_BOOKING_DETAILS,
  table: GET_TABLE_BOOKING_DETAILS,
  event: GET_EVENT_BOOKING_DETAILS,
  rental: GET_RENTAL_BOOKING_DETAILS,
  default: GET_DEFAULT_BOOKING_DETAILS,
} as const;

async function getSingleProduct(urlKey: string) {
  const cachedProduct = productCache.get(urlKey);
  if (cachedProduct) {
    return cachedProduct;
  }

  try {
    const dataById = await graphqlRequest<SingleProductResponse>(
      GET_PRODUCT_BY_URL_KEY,
      {
        urlKey: urlKey,
      },
      {
        tags: ["products", `product-${urlKey}`],
        life: "hours",
      }
    );

    let product = dataById?.product || null;

    if (product?.type === "booking") {
      const bookingType = (product as any)?.bookingProducts?.edges?.[0]?.node
        ?.type as keyof typeof BOOKING_SUBTYPE_QUERY_MAP | undefined;
      const bookingQuery = bookingType
        ? BOOKING_SUBTYPE_QUERY_MAP[bookingType]
        : undefined;

      if (bookingQuery) {
        try {
          const bookingData = await graphqlRequest<SingleProductResponse>(
            bookingQuery,
            { urlKey },
            {
              tags: ["products", `product-${urlKey}-${bookingType}`],
              life: "hours",
            }
          );
          const enrichedBooking = (bookingData?.product as any)
            ?.bookingProducts;
          if (enrichedBooking) {
            product = {
              ...product,
              bookingProducts: enrichedBooking,
            } as typeof product;
          }
        } catch (bookingError) {
          if (bookingError instanceof Error) {
            console.error("Error fetching booking sub-type:", {
              message: bookingError.message,
              urlKey,
              bookingType,
            });
          }
        }
      }
    }

    if (product) {
      productCache.set(urlKey, product);
    }
    return product;
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

export default async function ProductPage({
  params,
}: {
  params: Promise<{ urlProduct: string[] }>;
  searchParams: Promise<{ type: string }>;
}) {
  const { urlProduct } = await params;
  const fullPath = urlProduct.join("/");
  const product = await getSingleProduct(fullPath);

  if (!product) return notFound();

  const imageUrl = getImageUrl(product?.baseImageUrl, baseUrl, NOT_IMAGE);
  const productJsonLd = {
    "@context": BASE_SCHEMA_URL,
    "@type": PRODUCT_TYPE,
    name: product?.name,
    description: product?.description,
    sku: product?.sku,
  };

  const reviews = Array.isArray(product?.reviews?.edges)
    ? product?.reviews.edges.map((e) => e.node)
    : [];

  const VariantImages = isArray(product?.variants?.edges)
    ? product?.variants.edges.map((edge: { node: ProductVariant }) => edge.node)
    : [];

  // Prepare images for gallery
  const galleryImages = isArray(VariantImages)
    ? VariantImages.map(
      (image: { baseImageUrl: string; name: unknown }) => ({
        src:
          getImageUrl(image.baseImageUrl, baseUrl, NOT_IMAGE) || "",
        altText: image?.name?.toString() || "",
      })
    )
    : [
      {
        src: imageUrl || "",
        altText: product?.name || "product image",
      },
    ];


  return (
    <>
      <MobileSearchBar />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />

      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10 mt-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          <Link href="/" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Home
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/search" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Products
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-neutral-900 dark:text-white font-medium truncate max-w-[200px]">
            {product?.name}
          </span>
        </nav>

        {/* Product Section - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column - Product Gallery */}
          <div className="order-1">
            <Suspense fallback={<ProductDetailSkeleton />}>
              <ProductGallery images={galleryImages} />
            </Suspense>
          </div>

          {/* Right Column - Product Info */}
          <div className="order-2">
            <Suspense fallback={<ProductDetailSkeleton />}>
              <ProductInfo
                product={product}
                slug={fullPath}
                reviews={reviews}
                totalReview={reviews.length}
              />
            </Suspense>
          </div>
        </div>

        {/* Product Tabs Section - Below the main two-column layout */}
        <ProductTabsWrapper
          product={product}
          reviews={reviews}
          totalReview={reviews.length}
        />
      </div>


      {/* Related Products */}
      <Suspense fallback={<RelatedProductSkeleton />}>
        <RelatedProductsSection fullPath={fullPath} currentProduct={product} />
      </Suspense>
    </>
  );
}
