"use client";

import ShoppingCartIcon from "@components/common/icons/ShoppingCartIcon";
import clsx from "clsx";
import Link from "next/link";
import { useAddProduct } from "@/hooks/useAddToCart";
import { useAppSelector } from "@/store/hooks";
import { useCustomToast } from "@/hooks/useToast";
import { Loading } from "@components/common/skeleton/Loading";
import QuickViewIcon from "@components/common/icons/QuickViewIcon";

export default function AddToCartButton({
  productType,
  productUrlKey,
  productId,
  isSaleable,
  isIconOnly = false,
}: {
  productType?: string;
  productId: string;
  productUrlKey: string;
  isSaleable?: string;
  isIconOnly?: boolean;
}) {
  const { isCartLoading, onAddToCart } = useAddProduct();
  const { showToast } = useCustomToast();
  const { user } = useAppSelector((state) => state.user);
  const session = { user };

  const handleAddToCart = () => {
    if (!isSaleable || isSaleable === "") {
      showToast("This product is out of stock", "warning");
      return;
    }

    onAddToCart({
      productId: productId.split("/").pop() || "",
      quantity: 1,
      token: session?.user?.token ?? undefined,
    });
  };

  const buttonClasses = isIconOnly
    ? "flex items-center justify-center cursor-pointer transition-colors"
    : "flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200";

  const themeClasses = "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-md";
  const disabledClasses = "cursor-wait opacity-60 hover:opacity-60 bg-neutral-300 dark:bg-neutral-700 text-neutral-500";

  // Icon only button (for floating cart button)
  if (isIconOnly) {
    if (productType !== "simple") {
      // Configurable products - show eye icon to navigate to product
      return (
        <Link
          aria-disabled="true"
          aria-label={productUrlKey}
          rel="prefetch"
          prefetch={true}
          href={`/product/${productUrlKey}`}
          type="button"
          className={clsx(buttonClasses, "w-full h-full rounded-full", themeClasses)}
        >
          <QuickViewIcon className="w-5 h-5" />
        </Link>
      );
    }

    // Simple products - show add to cart icon - use div to avoid nested button issues
    return (
      <div
        aria-disabled={isCartLoading || !isSaleable || isSaleable === ""}
        aria-label={productUrlKey}
        className={clsx(buttonClasses, "rounded-full w-full h-full", {
          [themeClasses]: isSaleable && isSaleable !== "",
          [disabledClasses]: isCartLoading || !isSaleable || isSaleable === "",
        })}
        role="button"
        onClick={handleAddToCart}
        tabIndex={0}
      >
        {isCartLoading ? (
          <Loading />
        ) : (
          <ShoppingCartIcon className="size-5 stroke-current stroke-[1.5]" />
        )}
      </div>
    );
  }

  // Full button (with text)
  return productType !== "simple" ? (
    <Link
      aria-disabled="true"
      aria-label={productUrlKey}
      rel="prefetch"
      prefetch={true}
      className={clsx(buttonClasses, "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100", {
        "hover:opacity-90": true,
      })}
      href={`/product/${productUrlKey}`}
      type="submit"
    >
      <ShoppingCartIcon className="size-4 stroke-current stroke-[1.5]" />
      <span>Add to Cart</span>
    </Link>
  ) : (
    <button
      aria-disabled={isCartLoading || !isSaleable || isSaleable === ""}
      aria-label={productUrlKey}
      className={clsx(buttonClasses, {
        "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100": isSaleable && isSaleable !== "",
        [disabledClasses]: isCartLoading || !isSaleable || isSaleable === "",
      })}
      type="button"
      onClick={handleAddToCart}
    >
      {isCartLoading ? (
        <Loading />
      ) : (
        <>
          <ShoppingCartIcon className="size-4 stroke-current stroke-[1.5]" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  );
}
