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

interface NewProductsProps {
  title: string;
  description?: string;
  products: BagistoProductInfo[];
}

const NewProductCard = ({ product }: { product: any }) => {
  const { isInWishlist, toggleWishlist } = useWishlist({ skipList: true });
  const { toggleCompare, isInCompare } = useCompare({ skipList: true });
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const [isComparePending, setIsComparePending] = useState(false);

  const imageUrl =
    getImageUrl(product?.baseImageUrl, baseUrl, NOT_IMAGE) || NOT_IMAGE;

  const price =
    product?.type === "configurable" ||
    product?.type === "grouped" ||
    product?.type === "bundle"
      ? product?.minimumPrice
      : product?.price;
  const currency = "USD"; // Default currency
  const hasDiscount =
    product?.compareAtPrice &&
    parseFloat(product.compareAtPrice) > parseFloat(price);

  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlistPending) return;
    setIsWishlistPending(true);
    try {
      await toggleWishlist(product.id);
    } catch {
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
    } catch {
    } finally {
      setIsComparePending(false);
    }
  };

  return (
    <div className="flex flex-col group">
      <div className="relative aspect-[404/439] overflow-hidden rounded-[12px] bg-[#F7F7F8] dark:bg-neutral-900 transition-all duration-300 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700">
        <Link
          href={`/product/${product.urlKey}`}
          className="block w-full h-full"
        >
          <NextImage
            alt={product?.name || "Product image"}
            src={imageUrl}
            width={404}
            height={439}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Wishlist and Compare buttons - Top Left */}
        <div className="absolute left-3 top-3 flex flex-col gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100 z-10">
          <button
            disabled={isWishlistPending}
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${isWishlistPending ? "cursor-wait opacity-70" : "cursor-pointer"} ${
              inWishlist
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            aria-busy={isWishlistPending}
          >
            {isWishlistPending ? (
              <InlineSpinner
                className={inWishlist ? "border-white/40 border-t-white" : ""}
              />
            ) : (
              <WishlistIcon
                className={`w-3.5 h-3.5 ${inWishlist ? "text-white fill-current" : "text-neutral-600 dark:text-neutral-300"}`}
                fill={inWishlist ? "currentColor" : "none"}
              />
            )}
          </button>
          <button
            disabled={isComparePending}
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors ${isComparePending ? "cursor-wait opacity-70" : "cursor-pointer"} ${
              inCompare
                ? "bg-emerald-600"
                : "bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            }`}
            onClick={handleCompareClick}
            aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            aria-busy={isComparePending}
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
                className={`w-3.5 h-3.5 ${
                  inCompare
                    ? "text-white"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              />
            )}
          </button>
        </div>

        <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10 w-9 h-9">
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
          <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>
        )}

        <Link href={`/product/${product.urlKey}`}>
          <h3 className="text-[15px] font-medium text-neutral-800 dark:text-neutral-200 line-clamp-1 md:line-clamp-2 leading-snug hover:text-neutral-900 dark:hover:text-white transition-colors">
            {product?.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1.5">
          {(product?.type === "configurable" ||
            product?.type === "grouped" ||
            product?.type === "bundle") && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {product?.type === "configurable" ? "From" : "Starting at"}
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
          <AddToCartButton
            productType={product.type}
            productId={product.id}
            productUrlKey={product.urlKey}
            isSaleable={product?.isSaleable}
          />
        </div>
      </div>
    </div>
  );
};

const NewProducts: FC<NewProductsProps> = ({ title, products }) => {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8">
        <div className="mb-10">
          <Heading size={{ mobile: "text-xl", laptop: "text-2xl" }}>
            {title}
          </Heading>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product, index) => (
            <NewProductCard key={product.id || index} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewProducts;
