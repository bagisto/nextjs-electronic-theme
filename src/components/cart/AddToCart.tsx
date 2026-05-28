"use client";

import { MinusIcon, PlusIcon, MapPinIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { ConfigurableProductIndexData } from "@/types/types";
import { useAddProduct } from "@/hooks/useAddToCart";
import { getVariantInfo } from "@/hooks/useVariantInfo";
import { useCustomToast } from "@/hooks/useToast";
import { safeParse } from "@utils/helper";
import { useWishlist } from "@/hooks/useWishlist";
import { useCompare } from "@/hooks/useCompare";
import { Loading } from "@components/common/skeleton/Loading";
import { GroupedProductSelector } from "@/components/catalog/product/GroupedProductSelector";
import { BundleProductSelector } from "@/components/catalog/product/BundleProductSelector";
import { DownloadableProductSelector } from "@/components/catalog/product/DownloadableProductSelector";
import {
  BookingProductSelector,
  type BookingSelection,
  type BookingSlotMeta,
} from "@/components/catalog/product/BookingProductSelector";
import { validateAddToCart } from "@/utils/addToCartValidation";

const extractId = (id: string | number) => {
  const parts = String(id).split("/");
  return parts[parts.length - 1] || String(id);
};

function SubmitButton({
  pending,
  isSaleable,
  type,
  hasBookingProduct,
}: {
  pending: boolean;
  isSaleable: unknown;
  type: string;
  hasBookingProduct: boolean;
}) {
  const buttonClasses =
    "relative flex w-full cursor-pointer h-12 items-center justify-center rounded-xl bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:text-white dark:hover:bg-green-600 px-6 py-3 tracking-wide text-white font-semibold text-base transition-all duration-200";
  const disabledClasses = "cursor-wait opacity-60";

  const treatSaleable =
    type === "booking" && hasBookingProduct
      ? true
      : !(
          isSaleable === false ||
          isSaleable === 0 ||
          isSaleable === "" ||
          isSaleable === "0" ||
          isSaleable == null
        );

  if (!treatSaleable) {
    return (
      <button
        aria-disabled
        aria-label="Out of stock"
        type="button"
        disabled
        className={clsx(
          buttonClasses,
          " opacity-50 !cursor-not-allowed bg-neutral-400"
        )}
      >
        <ShoppingCartIcon className="w-5 h-5 mr-2" />
        Out of Stock
      </button>
    );
  }

  return (
    <button
      aria-disabled={pending}
      aria-label="Add to cart"
      type="submit"
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
        [disabledClasses]: pending,
      })}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (pending) e.preventDefault();
      }}
    >
      {pending ? (
        <Loading />
      ) : (
        <>
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          Add To Cart
        </>
      )}
    </button>
  );
}

export function AddToCart({
  productSwatchReview,
  index,
  productId,
  userInteracted,
  downloadableLinks: directDownloadableLinks,
  downloadableSamples: directDownloadableSamples,
  bookingProducts: directBookingProducts,
  groupedProducts: directGroupedProducts,
  bundleOptions: directBundleOptions,
  basePrice,
  currencyCode,
}: {
  productSwatchReview: any;
  productId: string;
  index: ConfigurableProductIndexData[];
  userInteracted: boolean;
  downloadableLinks?: any;
  downloadableSamples?: any;
  bookingProducts?: any;
  groupedProducts?: any;
  bundleOptions?: any;
  basePrice?: number;
  currencyCode?: string;
}) {
  const isSaleable = productSwatchReview?.isSaleable || "";
  const { onAddToCart, isCartLoading } = useAddProduct();
  const { isInWishlist, toggleWishlist, toggling } = useWishlist();
  const { toggleCompare, isInCompare, creating } = useCompare();
  const { showToast } = useCustomToast();

  const [optimisticWishlist, setOptimisticWishlist] = useState<boolean | null>(null);
  const [optimisticCompare, setOptimisticCompare] = useState<boolean | null>(null);

  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const [ticketQtys, setTicketQtys] = useState<Record<string, number>>({});
  const [groupedQuantities, setGroupedQuantities] = useState<
    Record<string, number>
  >({});
  const [bundleSelections, setBundleSelections] = useState<
    Record<string, string[]>
  >({});
  const [bundleQuantities, setBundleQuantities] = useState<
    Record<string, number>
  >({});
  const [bookingSelection, setBookingSelection] =
    useState<BookingSelection>(null);
  const [bookingNote, setBookingNote] = useState("");
  const [slotMeta, setSlotMeta] = useState<BookingSlotMeta>({
    loading: false,
    noSlotsForDate: false,
    selectedSlotQty: null,
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");

  const { handleSubmit, setValue, control, register } = useForm({
    defaultValues: {
      quantity: 1,
      isBuyNow: false,
    },
  });

  const quantity = useWatch({
    control,
    name: "quantity",
  });

  const increment = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Number(quantity) + 1);
  };

  const decrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue("quantity", Math.max(1, Number(quantity) - 1));
  };

  const handleTicketQtyChange = (ticketId: string | number, change: number) => {
    setTicketQtys((prev) => {
      const k = String(ticketId);
      return { ...prev, [k]: Math.max(1, (prev[k] ?? 1) + change) };
    });
  };

  const searchParams = useSearchParams();
  const type = productSwatchReview?.type;

  const superAttributes = productSwatchReview?.superAttributeOptions
    ? safeParse(productSwatchReview.superAttributeOptions)
    : productSwatchReview?.superAttributes?.edges?.map(
      (e: { node: any }) => e.node,
    ) || [];

  const isConfigurable = superAttributes.length > 0;

  const { productid: selectedVariantId, Instock: checkStock } = getVariantInfo(
    isConfigurable,
    searchParams.toString(),
    superAttributes,
    JSON.stringify(index),
  );
  const buttonStatus = !!selectedVariantId;

  const downloadableLinks =
    directDownloadableLinks || productSwatchReview?.downloadableLinks || null;
  const downloadableSamples =
    directDownloadableSamples ||
    productSwatchReview?.downloadableSamples ||
    null;
  const bookingProductsContainer =
    directBookingProducts || productSwatchReview?.bookingProducts || null;
  const bookingInfo =
    bookingProductsContainer?.edges?.[0]?.node || null;
  const groupedProducts =
    directGroupedProducts || productSwatchReview?.groupedProducts || null;
  const bundleOptions =
    directBundleOptions || productSwatchReview?.bundleOptions || null;

  const groupedDefaults: Record<string, number> = {};
  for (const edge of groupedProducts?.edges || []) {
    const pid = extractId(edge.node.associatedProduct.id);
    groupedDefaults[pid] =
      edge.node.qty && edge.node.qty > 0 ? edge.node.qty : 1;
  }
  const effectiveGroupedQuantities: Record<string, number> = {
    ...groupedDefaults,
    ...groupedQuantities,
  };

  const ticketDefaults: Record<string, number> = {};
  if (bookingInfo?.type === "event") {
    for (const edge of bookingInfo?.eventTickets?.edges || []) {
      ticketDefaults[String(edge.node._id)] = 1;
    }
  }
  const effectiveTicketQtys: Record<string, number> = {
    ...ticketDefaults,
    ...ticketQtys,
  };

  const toggleLink = (linkId: string | number) => {
    const numericId =
      typeof linkId === "number"
        ? linkId
        : parseInt(extractId(linkId), 10);
    setSelectedLinks((prev) =>
      prev.includes(numericId)
        ? prev.filter((id) => id !== numericId)
        : [...prev, numericId]
    );
  };

  const handleGroupedQtyChange = (pid: string, qty: number) => {
    setGroupedQuantities((prev) => ({ ...prev, [pid]: qty }));
  };

  const saleableGroupedIds = useMemo(() => {
    const set = new Set<string>();
    for (const edge of groupedProducts?.edges || []) {
      const assoc = edge.node?.associatedProduct;
      if (!assoc) continue;
      const oos =
        assoc.isSaleable === false ||
        assoc.isSaleable === 0 ||
        assoc.isSaleable === "" ||
        assoc.isSaleable === "0";
      if (!oos) set.add(extractId(assoc.id));
    }
    return set;
  }, [groupedProducts]);

  const bundleTotal = useMemo(() => {
    let sum = basePrice || 0;
    for (const optEdge of bundleOptions?.edges || []) {
      const optId = extractId(optEdge.node.id);
      const selected = bundleSelections[optId] || [];
      for (const pEdge of optEdge.node.bundleOptionProducts?.edges || []) {
        const pid = extractId(pEdge.node.id);
        if (!selected.includes(pid)) continue;
        const price = Number(pEdge.node.product?.price) || 0;
        const qty = bundleQuantities[pid] || pEdge.node.qty || 1;
        sum += price * qty;
      }
    }
    return sum;
  }, [bundleOptions, bundleSelections, bundleQuantities, basePrice]);

  const validation = validateAddToCart({
    type,
    isSaleable,
    quantity: Number(quantity) || 0,
    isConfigurable,
    selectedVariantId: selectedVariantId ?? null,
    variantInStock: isConfigurable ? checkStock !== false : undefined,
    selectedLinks,
    groupedProducts,
    groupedQuantities: effectiveGroupedQuantities,
    bundleOptions,
    bundleSelections,
    bundleQuantities,
    bundleTotal,
    basePrice,
    bookingInfo,
    bookingSelection,
    bookingNote,
    ticketQtys: effectiveTicketQtys,
    slotsLoading: slotMeta.loading,
    noSlotsForDate: slotMeta.noSlotsForDate,
    selectedSlotQty: slotMeta.selectedSlotQty,
  });

  const actionWithVariant = async () => {
    setSubmitted(true);
    if (!validation.ok) {
      const msg = validation.message || "Please complete your selection.";
      setSubmitError(msg);
      showToast(msg, validation.toastColor || "warning");
      return;
    }
    setSubmitError("");

    const currentQty = Math.max(1, Number(quantity) || 1);

    const pid =
      type === "configurable"
        ? String(selectedVariantId)
        : (String(productId).split("/").pop() ?? "");

    let bookingPayload: any = undefined;
    if (type === "booking") {
      if (bookingInfo?.type === "event") {
        bookingPayload = { qty: effectiveTicketQtys };
      } else {
        bookingPayload = bookingSelection;
      }
    }

    let groupedQty: Record<string, number> | undefined;
    if (type === "grouped") {
      groupedQty = Object.fromEntries(
        Object.entries(effectiveGroupedQuantities).filter(
          ([id, q]) => q > 0 && saleableGroupedIds.has(id)
        )
      );
    }

    let bundleOptionsPayload: Record<string, string[]> | undefined;
    let bundleOptionQtyPayload: Record<string, number> | undefined;
    if (type === "bundle") {
      bundleOptionsPayload = Object.fromEntries(
        Object.entries(bundleSelections).filter(
          ([, ids]) => ids && ids.length > 0
        )
      );
      const selectedProductIds = new Set<string>(
        Object.values(bundleOptionsPayload).flat()
      );
      const userDefinedIds = new Set<string>();
      for (const optEdge of bundleOptions?.edges || []) {
        for (const pEdge of optEdge.node.bundleOptionProducts?.edges || []) {
          if (pEdge.node.isUserDefined) {
            userDefinedIds.add(extractId(pEdge.node.id));
          }
        }
      }
      bundleOptionQtyPayload = Object.fromEntries(
        Array.from(selectedProductIds)
          .filter((id) => userDefinedIds.has(id))
          .map((id) => [id, bundleQuantities[id] || 1])
      );
    }

    const parentQuantity =
      type === "grouped" ||
      (type === "booking" && bookingInfo?.type === "event")
        ? 1
        : currentQty;

    onAddToCart({
      productId: pid,
      quantity: parentQuantity,
      links: type === "downloadable" ? selectedLinks : undefined,
      booking: bookingPayload,
      groupedQty,
      bundleOptions: bundleOptionsPayload,
      bundleOptionQty: bundleOptionQtyPayload,
      bookingNote: type === "booking" ? bookingNote || "" : "",
    });
  };

  const hideQuantity =
    type === "grouped" ||
    (type === "booking" && bookingInfo?.type === "event");

  return (
    <div className={clsx("flex flex-col gap-4 w-full")}>
      {type === "booking" && bookingInfo && (
        <div className="space-y-6 bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700">
          {bookingInfo.location && (
            <div className="flex gap-3">
              <div className="bg-white dark:bg-neutral-700 p-2 rounded-lg shadow-sm h-fit">
                <MapPinIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">Location</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{bookingInfo.location}</p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingInfo.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400 mt-1 inline-block"
                >
                  View on Map
                </a>
              </div>
            </div>
          )}

          {(bookingInfo.availableFrom || bookingInfo.availableTo) && (
            <div className="flex gap-3">
              <div className="bg-white dark:bg-neutral-700 p-2 rounded-lg shadow-sm h-fit">
                <CalendarIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-0.5">Available</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {bookingInfo.availableFrom &&
                    new Date(bookingInfo.availableFrom).toLocaleString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  {bookingInfo.availableTo && " - "}
                  {bookingInfo.availableTo &&
                    new Date(bookingInfo.availableTo).toLocaleString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </p>
              </div>
            </div>
          )}

          <BookingProductSelector
            bookingProduct={bookingInfo}
            ticketQuantities={effectiveTicketQtys}
            onTicketQuantityChange={handleTicketQtyChange}
            selection={bookingSelection}
            onSelectionChange={setBookingSelection}
            bookingNote={bookingNote}
            onBookingNoteChange={setBookingNote}
            onSlotMetaChange={setSlotMeta}
          />
        </div>
      )}

      {type === "grouped" && (
        <GroupedProductSelector
          groupedProducts={groupedProducts}
          quantities={effectiveGroupedQuantities}
          onQuantityChange={handleGroupedQtyChange}
        />
      )}

      {type === "bundle" && (
        <BundleProductSelector
          bundleOptions={bundleOptions}
          basePrice={basePrice || 0}
          currencyCode={currencyCode || "USD"}
          selections={bundleSelections}
          quantities={bundleQuantities}
          onSelectionsChange={setBundleSelections}
          onQuantitiesChange={setBundleQuantities}
        />
      )}

      {type === "downloadable" && (
        <DownloadableProductSelector
          downloadableLinks={downloadableLinks}
          downloadableSamples={downloadableSamples}
          selectedLinks={selectedLinks}
          onToggleLink={toggleLink}
        />
      )}

      {!checkStock && type === "configurable" && userInteracted && (
        <div className="gap-1 px-2 py-1 font-bold text-red-500">
          <h1>NO STOCK AVAILABLE</h1>
        </div>
      )}

      {!hideQuantity && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Qty:</span>
          <div className="flex items-center rounded-lg border-2 border-neutral-200 dark:border-neutral-700">
            <button
              aria-label="Decrease quantity"
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              onClick={decrement}
            >
              <MinusIcon className="h-4 w-4" />
            </button>

            <input
              type="hidden"
              {...register("quantity", { valueAsNumber: true })}
            />

            <div className="flex h-10 min-w-[3rem] items-center justify-center px-3 font-medium text-neutral-900 dark:text-white">
              {quantity}
            </div>

            <button
              aria-label="Increase quantity"
              type="button"
              className="flex h-10 w-10 cursor-pointer items-center justify-center text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              onClick={increment}
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {submitted && !validation.ok && (
        <p className="text-sm text-red-500">
          {validation.message || submitError}
        </p>
      )}

      <div className="flex items-center gap-6 border-t border-b border-neutral-200 dark:border-neutral-700 py-4 mb-6">
        {(() => {
          const cleanedProductId = String(productId).split("/").pop() ?? "";
          const targetId = type === "configurable" ? String(selectedVariantId) : cleanedProductId;
          const serverWishlisted = isInWishlist(targetId);
          const isWishlisted = optimisticWishlist !== null ? optimisticWishlist : serverWishlisted;
          const isDisabled = type === "configurable" && !buttonStatus;

          return (
            <button
              onClick={async (e) => {
                e.preventDefault();
                if (isDisabled || toggling) return;
                const next = !isWishlisted;
                setOptimisticWishlist(next);
                try {
                  await toggleWishlist(targetId);
                } catch {
                  setOptimisticWishlist(!next);
                } finally {
                  setOptimisticWishlist(null);
                }
              }}
              disabled={isDisabled || toggling}
              className={clsx(
                "flex items-center gap-2 text-sm transition-colors",
                isWishlisted
                  ? "text-red-500 hover:text-red-600 cursor-pointer font-medium"
                  : "text-neutral-500 hover:text-neutral-700 cursor-pointer dark:text-neutral-400 dark:hover:text-neutral-200",
                (isDisabled || toggling) && "opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-500"
              )}
            >
              {toggling ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-300 border-t-red-500" />
              ) : (
                <svg
                  className={clsx("w-5 h-5", isWishlisted && "fill-current")}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
              {toggling ? "Updating..." : (isWishlisted ? "In Wishlist" : "Add to Wishlist")}
            </button>
          );
        })()}

        {(() => {
          const cleanedProductId = String(productId).split("/").pop() ?? "";
          const targetId = type === "configurable" ? String(selectedVariantId) : cleanedProductId;
          const serverCompared = isInCompare(targetId);
          const isCompared = optimisticCompare !== null ? optimisticCompare : serverCompared;
          const isDisabled = type === "configurable" && !buttonStatus;

          return (
            <button
              onClick={async (e) => {
                e.preventDefault();
                if (isDisabled || creating) return;
                const next = !isCompared;
                setOptimisticCompare(next);
                try {
                  await toggleCompare(targetId);
                } catch {
                  setOptimisticCompare(!next);
                } finally {
                  setOptimisticCompare(null);
                }
              }}
              disabled={isDisabled || creating}
              className={clsx(
                "flex items-center gap-2 text-sm transition-colors",
                isCompared
                  ? "text-emerald-600 hover:text-emerald-700 cursor-pointer font-medium dark:text-emerald-500 dark:hover:text-emerald-400"
                  : "text-neutral-500 hover:text-neutral-700 cursor-pointer dark:text-neutral-400 dark:hover:text-neutral-200",
                (isDisabled || creating) && "opacity-50 cursor-not-allowed text-neutral-400 dark:text-neutral-500"
              )}
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-neutral-300 border-t-emerald-600" />
              ) : (
                <svg className={clsx("w-5 h-5", isCompared && "fill-current")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              {creating ? "Updating..." : (isCompared ? "In Compare" : "Add to Compare")}
            </button>
          );
        })()}
      </div>

      <form onSubmit={handleSubmit(actionWithVariant)}>
        <SubmitButton
          pending={isCartLoading}
          isSaleable={isSaleable}
          type={type || ""}
          hasBookingProduct={!!bookingInfo}
        />
      </form>
    </div>
  );
}
