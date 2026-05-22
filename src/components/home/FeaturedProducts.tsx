"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { BagistoProductInfo } from "@/types/types";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@utils/constants";
import { Price } from "@/components/theme/ui/Price";
import AddToCartButton from "@/components/theme/ui/AddToCartButton";
import { NextImage } from "@/components/common/NextImage";
import WishlistIcon from "@/components/common/icons/WishlistIcon";
import CompareIcon from "@/components/common/icons/CompareIcon";
import { InlineSpinner } from "@/components/common/PageLoader";
import { useWishlist } from "@/hooks/useWishlist";
import { useCompare } from "@/hooks/useCompare";
import { Heading } from "@/components/common/Heading";

interface FeaturedProductsProps {
  title: string;
  description?: string;
  products: BagistoProductInfo[];
}

const FeaturedProductCard = ({ product }: { product: any }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toggleCompare, isInCompare } = useCompare();
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isComparePending, setIsComparePending] = useState(false);

  const imageUrl = getImageUrl(product?.baseImageUrl, baseUrl, NOT_IMAGE) || NOT_IMAGE;

  const price = product?.type === "configurable" ? product?.minimumPrice : product?.price;
  const currency = "USD"; // Default currency
  const hasDiscount = product?.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(price);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlistPending) return;
    setIsWishlistPending(true);
    try {
      await toggleWishlist(product.id);
    } finally {
      setIsWishlistPending(false);
    }
  };

  const handleCompareClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isComparePending) return;
    setIsComparePending(true);
    try {
      await toggleCompare(product.id);
    } finally {
      setIsComparePending(false);
    }
  };

  return (
    <div className="flex flex-col group">
      <div className="relative aspect-[544/592] overflow-hidden rounded-[12px] bg-[#F7F7F8] dark:bg-neutral-900 transition-all duration-300 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
        <Link href={`/product/${product.urlKey}`} className="block w-full h-full">
          <NextImage
            alt={product?.name || "Product image"}
            src={imageUrl}
            width={544}
            height={592}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist and Compare buttons - Top Left */}
        <div className="absolute left-3 top-3 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10">
          <button
            disabled={isWishlistPending}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${isWishlistPending ? "cursor-wait opacity-70" : "cursor-pointer"} ${inWishlist
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-busy={isWishlistPending}
          >
            {isWishlistPending ? (
              <InlineSpinner className={inWishlist ? "border-white/40 border-t-white" : ""} />
            ) : (
              <WishlistIcon
                className={`w-4 h-4 ${inWishlist ? "text-white fill-current" : "text-neutral-600 dark:text-neutral-300"}`}
                fill={inWishlist ? "currentColor" : "none"}
              />
            )}
          </button>
          <button
            disabled={isComparePending}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${isComparePending ? "cursor-wait opacity-70" : "cursor-pointer"} ${inCompare
                ? "bg-emerald-600 dark:bg-white"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
            onClick={handleCompareClick}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            aria-busy={isComparePending}
          >
            {isComparePending ? (
              <InlineSpinner className={inCompare ? "border-white/40 border-t-white dark:border-neutral-300 dark:border-t-neutral-900" : ""} />
            ) : (
              <CompareIcon className={`w-4 h-4 ${inCompare
                ? "text-white dark:text-neutral-900"
                : "text-neutral-600 dark:text-neutral-300"
                }`} />
            )}
          </button>
        </div>

        <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-10 h-10">
          <AddToCartButton
            productType={product.type}
            productId={product.id || ""}
            productUrlKey={product.urlKey || ""}
            isSaleable={product?.isSaleable}
            isIconOnly={true}
          />
        </div>
      </div>

      <div className="pt-3 pb-2 px-1 text-left">
        {product?.brand && (
          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.urlKey}`}>
          <h3 className="text-[17px] font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1 md:line-clamp-2 leading-snug hover:text-neutral-900 dark:hover:text-white transition-colors mt-1">
            {product?.name}
          </h3>
        </Link>

        {/* Rating stars - matching ProductCard mt-2 */}
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          {product?.type === "configurable" && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              From
            </span>
          )}
          {product?.type === "simple" && product.specialPrice ? (
            <>
              <Price
                amount={String(product.specialPrice)}
                className="text-base font-bold text-neutral-900 dark:text-white"
                currencyCode={currency}
              />
              <Price
                amount={String(price)}
                className="text-sm text-neutral-400 dark:text-neutral-500 line-through"
                currencyCode={currency}
              />
            </>
          ) : hasDiscount ? (
            <>
              <Price
                amount={String(price)}
                className="text-base font-bold text-neutral-900 dark:text-white"
                currencyCode={currency}
              />
              <Price
                amount={String(product?.compareAtPrice || price)}
                className="text-sm text-neutral-400 dark:text-neutral-500 line-through"
                currencyCode={currency}
              />
            </>
          ) : (
            <Price
              amount={String(price)}
              className="text-base font-bold text-neutral-900 dark:text-white"
              currencyCode={currency}
            />
          )}
        </div>

        <div className="mt-3 md:hidden">
          <AddToCartButton productType={product.type} productId={product.id} productUrlKey={product.urlKey} isSaleable={product?.isSaleable} />
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts: FC<FeaturedProductsProps> = ({ title, products }) => {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8">
        <div className="mb-10">
          <Heading size={{ mobile: "text-xl", laptop: "text-2xl" }}>{title}</Heading>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-12">
          {products.map((product, index) => (
            <FeaturedProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
