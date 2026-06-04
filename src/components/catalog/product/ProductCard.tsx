"use client";

import Link from "next/link";
import { useState } from "react";
import Grid from "@/components/theme/ui/grid/Grid";
import AddToCartButton from "@/components/theme/ui/AddToCartButton";
import { NextImage } from "@/components/common/NextImage";
import ProductPrice from "@/components/theme/ui/ProductPrice";
import WishlistIcon from "@/components/common/icons/WishlistIcon";
import CompareIcon from "@/components/common/icons/CompareIcon";
import RatingStarIcon from "@/components/common/icons/RatingStarIcon";
import { InlineSpinner } from "@/components/common/PageLoader";

import { useWishlist } from "@/hooks/useWishlist";
import { useCompare } from "@/hooks/useCompare";

export default function ProductCard({
  currency,
  price,
  specialPrice,
  imageUrl,
  product,
  priority = false,
}: {
  currency: string;
  price: string;
  specialPrice?: string;
  imageUrl: string;
  product: {
    urlKey: string;
    name: string;
    id: string;
    type: string;
    isSaleable?: string;
    brand?: string;
    compareAtPrice?: string;
    reviews?: { edges?: Array<{ node?: { rating?: number | string } }> };
  };
  priority?: boolean;
}) {
  const reviewEdges = product?.reviews?.edges || [];
  const reviewCount = reviewEdges.length;
  const averageRating =
    reviewCount > 0
      ? reviewEdges.reduce(
          (sum, edge) => sum + Number(edge?.node?.rating ?? 0),
          0,
        ) / reviewCount
      : 0;
  const roundedRating = Math.round(averageRating);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isComparePending, setIsComparePending] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist({ skipList: true });
  const { toggleCompare, isInCompare } = useCompare({ skipList: true });

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleWishlistClick = async () => {
    if (isWishlistPending) return;
    setIsWishlistPending(true);
    try {
      await toggleWishlist(product.id);
    } catch {
    } finally {
      setIsWishlistPending(false);
    }
  };

  const handleCompareClick = async () => {
    if (isComparePending) return;
    setIsComparePending(true);
    try {
      await toggleCompare(product.id);
    } catch {
    } finally {
      setIsComparePending(false);
    }
  };
  return (
    <Grid.Item key={product.id} className="animate-fadeIn flex flex-col">
      <div
        className="group relative overflow-hidden rounded-2xl bg-[#F7F7F8] dark:bg-neutral-900 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/product/${product.urlKey}`}
          aria-label={`View ${product.name}`}
        >
          <div className="aspect-square overflow-hidden flex items-center justify-center bg-transparent">
            <NextImage
              alt={product?.name || "Product image"}
              src={imageUrl}
              width={353}
              height={353}
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              priority={priority}
              className={`w-full h-full object-contain transition duration-500 ease-in-out group-hover:scale-105`}
            />
          </div>
        </Link>

        <div
          className={`absolute left-3 top-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
        >
          <button
            disabled={isWishlistPending}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${isWishlistPending ? "cursor-wait opacity-70" : "cursor-pointer"} ${
              inWishlist
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-busy={isWishlistPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWishlistClick();
            }}
          >
            {isWishlistPending ? (
              <InlineSpinner
                className={inWishlist ? "border-white/40 border-t-white" : ""}
              />
            ) : (
              <WishlistIcon
                className={`w-4 h-4 ${inWishlist ? "text-white fill-current" : "text-neutral-600 dark:text-neutral-300"}`}
                fill={inWishlist ? "currentColor" : "none"}
              />
            )}
          </button>
          <button
            disabled={isComparePending}
            className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${isComparePending ? "cursor-wait opacity-70" : "cursor-pointer"} ${
              inCompare
                ? "bg-emerald-500"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            aria-busy={isComparePending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCompareClick();
            }}
          >
            {isComparePending ? (
              <InlineSpinner
                className={
                  inCompare
                    ? "border-white/40 border-t-white dark:border-neutral-300 dark:border-t-neutral-900"
                    : ""
                }
              />
            ) : (
              <CompareIcon
                className={`w-4 h-4 ${
                  inCompare
                    ? "text-white"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              />
            )}
          </button>
        </div>

        <div
          className={`absolute bottom-3 right-3 transition-all duration-300 w-10 h-10 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        >
          <AddToCartButton
            productType={product.type}
            productId={product.id}
            productUrlKey={product.urlKey}
            isSaleable={product?.isSaleable}
            isIconOnly={true}
          />
        </div>
      </div>

      <div className="pt-3 pb-2 px-1">
        {product?.brand && (
          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.urlKey}`}>
          <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1 md:line-clamp-2 leading-snug hover:text-neutral-900 dark:hover:text-white transition-colors mt-1">
            {product?.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <RatingStarIcon
              key={star}
              className={`w-3.5 h-3.5 ${star <= roundedRating ? "text-yellow-400" : "text-neutral-200 dark:text-neutral-700"}`}
            />
          ))}
          <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-1">
            ({reviewCount})
          </span>
        </div>

        <ProductPrice
          type={product?.type}
          currency={currency}
          price={price}
          specialPrice={specialPrice}
          compareAtPrice={product?.compareAtPrice}
          className="mt-1.5"
        />

        <div className="mt-3 md:hidden">
          <AddToCartButton
            productType={product.type}
            productId={product.id}
            productUrlKey={product.urlKey}
            isSaleable={product?.isSaleable}
          />
        </div>
      </div>
    </Grid.Item>
  );
}
