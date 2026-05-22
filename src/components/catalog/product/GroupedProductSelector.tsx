"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@/utils/constants";
import Image from "next/image";

export type GroupedEdge = {
  node: {
    id: string;
    qty?: number;
    sortOrder?: number;
    associatedProduct: {
      id: string;
      name?: string;
      sku?: string;
      price?: string | number;
      formattedPrice?: string;
      specialPrice?: string;
      formattedSpecialPrice?: string;
      baseImageUrl?: string;
      isSaleable?: string | boolean | number;
      maxQty?: number;
    };
  };
};

interface Props {
  groupedProducts: { edges: GroupedEdge[] } | null | undefined;
  quantities: Record<string, number>;
  onQuantityChange: (productId: string, qty: number) => void;
}

const extractId = (id: string) => String(id).split("/").pop() || id;

export function GroupedProductSelector({
  groupedProducts,
  quantities,
  onQuantityChange,
}: Props) {
  const edges = groupedProducts?.edges || [];
  if (!edges.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
        Products in this group
      </h3>
      <div className="space-y-3">
        {edges.map((edge) => {
          const assoc = edge.node.associatedProduct;
          const pid = extractId(assoc.id);
          const qty = quantities[pid] ?? 1;
          const imgSrc = getImageUrl(assoc.baseImageUrl, baseUrl, NOT_IMAGE);
          const outOfStock =
            assoc.isSaleable === false ||
            assoc.isSaleable === 0 ||
            assoc.isSaleable === "" ||
            assoc.isSaleable === "0";
          const maxQty =
            typeof assoc.maxQty === "number" ? assoc.maxQty : undefined;
          const overLimit = maxQty != null && qty > maxQty;

          return (
            <div
              key={edge.node.id}
              className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${
                outOfStock
                  ? "border-neutral-200 dark:border-neutral-700 opacity-60"
                  : overLimit
                  ? "border-red-300 dark:border-red-700"
                  : "border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {imgSrc && (
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={imgSrc}
                      alt={assoc.name || "product"}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {assoc.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {assoc.formattedSpecialPrice || assoc.formattedPrice}
                  </p>
                  {outOfStock && (
                    <p className="text-xs font-semibold text-red-500 mt-0.5">
                      Out of stock
                    </p>
                  )}
                  {!outOfStock && overLimit && maxQty != null && (
                    <p className="text-xs font-semibold text-red-500 mt-0.5">
                      Only {maxQty} available
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                  outOfStock ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <button
                  type="button"
                  disabled={outOfStock}
                  aria-label={`Decrease quantity for ${assoc.name}`}
                  onClick={() =>
                    !outOfStock && onQuantityChange(pid, Math.max(0, qty - 1))
                  }
                  className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="min-w-[2.5rem] text-center font-medium text-neutral-900 dark:text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  disabled={outOfStock}
                  aria-label={`Increase quantity for ${assoc.name}`}
                  onClick={() => !outOfStock && onQuantityChange(pid, qty + 1)}
                  className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
