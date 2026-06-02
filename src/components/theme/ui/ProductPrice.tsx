import { Price } from "@/components/theme/ui/Price";

/**
 * Shared product price renderer used across listing cards, compare and wishlist.
 *
 * Mirrors the price logic of ProductCard:
 * - configurable/grouped/bundle products show a "From"/"Starting at" prefix
 *   (the caller is expected to pass the product's minimum price as `price`).
 * - simple products with a special price show the special price with the
 *   regular price struck through.
 * - products with a higher `compareAtPrice` show the discounted price with the
 *   compare-at price struck through.
 * - everything else shows the plain price.
 */
export default function ProductPrice({
  type,
  currency = "USD",
  price,
  specialPrice,
  compareAtPrice,
  className = "",
}: {
  type?: string;
  currency?: string;
  price: string;
  specialPrice?: string;
  compareAtPrice?: string;
  className?: string;
}) {
  const hasDiscount =
    !!compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price);

  const isRangePrice =
    type === "configurable" || type === "grouped" || type === "bundle";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isRangePrice && (
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          {type === "configurable" ? "From" : "Starting at"}
        </span>
      )}
      {type === "simple" && specialPrice ? (
        <>
          <Price
            amount={specialPrice}
            className="text-base font-bold text-neutral-900 dark:text-white"
            currencyCode={currency}
          />
          <Price
            amount={price}
            className="text-sm text-neutral-400 dark:text-neutral-500 line-through"
            currencyCode={currency}
          />
        </>
      ) : hasDiscount ? (
        <>
          <Price
            amount={price}
            className="text-base font-bold text-neutral-900 dark:text-white"
            currencyCode={currency}
          />
          <Price
            amount={compareAtPrice || price}
            className="text-sm text-neutral-400 dark:text-neutral-500 line-through"
            currencyCode={currency}
          />
        </>
      ) : (
        <Price
          amount={price}
          className="text-base font-bold text-neutral-900 dark:text-white"
          currencyCode={currency}
        />
      )}
    </div>
  );
}
