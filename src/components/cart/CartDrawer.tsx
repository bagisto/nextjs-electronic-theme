"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { Price } from "../theme/ui/Price";
import { NOT_IMAGE } from "@/utils/constants";
import { createUrl, safeParse } from "@/utils/helper";
import { useCartDetail } from "@/hooks/useCartDetail";
import { useAddProduct } from "@/hooks/useAddToCart";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type MerchandiseSearchParams = {
  [key: string]: string;
};

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { getCartDetail, isInitialLoading } = useCartDetail();
  const { onAddToRemove, onUpdateCart } = useAddProduct();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const cart = Array.isArray(cartDetail?.cart?.items?.edges)
    ? cartDetail?.cart?.items?.edges
    : [];
  const cartObj: any = cartDetail?.cart ?? {};

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [loadingDirection, setLoadingDirection] = useState<'decrease' | 'increase' | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-cart-menu]")) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleCheckout = () => {
    if (cart.length > 0) {
      router.push("/checkout?step=address");
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openMenuId) {
          setOpenMenuId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, openMenuId]);

  useEffect(() => {
    if (isOpen) {
      const isLaptopScreen = window.innerWidth >= 1024;
      if (isLaptopScreen) {
        document.body.style.overflow = "hidden";
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);



  const handleUpdateQuantity = async (cartItemId: string, currentQty: number, delta: number) => {
    const newQty = Number(currentQty) + delta;
    if (!Number.isFinite(newQty) || newQty < 1) return;

    setLoadingItemId(cartItemId);
    setLoadingDirection(delta > 0 ? 'increase' : 'decrease');
    try {
      await onUpdateCart({ cartItemId: Number(cartItemId), quantity: newQty });
      await getCartDetail();
    } catch (err) {
      console.error("Failed to update cart item:", err);
    } finally {
      setLoadingItemId(null);
      setLoadingDirection(null);
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    setOpenMenuId(null);
    setRemovingItemId(cartItemId);
    try {
      await onAddToRemove(cartItemId);
      await getCartDetail();
    } catch (err) {
      console.error("Failed to remove cart item:", err);
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-[420px] bg-white dark:bg-neutral-900 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-6 py-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-neutral-900 dark:text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mx-6 border-b border-neutral-100 dark:border-neutral-800" />

        <div className="flex-1 overflow-y-auto px-6">
          {isInitialLoading && cart.length === 0 ? (
            <ul className="space-y-6 py-6" aria-label="Loading cart items">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex gap-4 animate-pulse">
                  <div className="w-[110px] h-[110px] flex-shrink-0 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="h-9 w-28 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-6 w-6 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mb-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Your cart is empty</p>
              <p className="text-neutral-500 dark:text-neutral-400">Add items to your cart to see them here</p>
            </div>
          ) : (
            <ul className="space-y-6 py-6">
              {cart.map((item: any, i: number) => {
                const merchandiseSearchParams = {} as MerchandiseSearchParams;
                const merchandiseUrl = createUrl(
                  `/product/${item?.node.productUrlKey}`,
                  new URLSearchParams(merchandiseSearchParams)
                );
                const baseImage: any = safeParse(item?.node?.baseImage);
                const itemId: string = String(item?.node?.id);
                const isItemLoading = loadingItemId === itemId;
                const isItemRemoving = removingItemId === itemId;
                const isItemLoadingDecrease = isItemLoading && loadingDirection === 'decrease';
                const isItemLoadingIncrease = isItemLoading && loadingDirection === 'increase';

                const currencyCode = (cartObj as any)?.currencyCode || "USD";
                const itemType = item?.node?.type;
                const canChangeQty = item?.node?.canChangeQty !== false;
                const isBookingNeedsReselect =
                  itemType === "booking" && !canChangeQty;

                return (
                  <li key={i} className="flex gap-4 group">
                    <Link
                      href={merchandiseUrl}
                      onClick={onClose}
                      className="relative w-[110px] h-[110px] flex-shrink-0 rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-800"
                    >
                      <Image
                        alt={item?.node?.name || "Product"}
                        src={baseImage?.small_image_url || NOT_IMAGE}
                        fill
                        sizes="110px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <Link
                          href={merchandiseUrl}
                          onClick={onClose}
                          className="text-sm cursor-pointer text-neutral-900 dark:text-white line-clamp-2 hover:opacity-80 transition-opacity"
                        >
                          {item?.node?.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Price
                            amount={item?.node?.price}
                            className="text-base text-neutral-900 dark:text-white"
                            currencyCode={currencyCode}
                          />
                          {item?.node?.basePrice && item?.node?.basePrice !== item?.node?.price && (
                            <Price
                              amount={item?.node?.basePrice}
                              className="text-sm text-neutral-400 line-through font-medium"
                              currencyCode={currencyCode}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {isBookingNeedsReselect ? (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                              Qty {item?.node?.quantity}
                            </span>
                            <Link
                              href={merchandiseUrl}
                              onClick={onClose}
                              className="text-sm font-semibold text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 underline-offset-2 hover:underline"
                            >
                              Edit booking
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Qty</span>
                            <div className="flex items-center h-9 px-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                              <button
                                onClick={() => handleUpdateQuantity(itemId, item?.node?.quantity, -1)}
                                disabled={isItemLoading || isItemRemoving || item?.node?.quantity <= 1}
                                className="w-7 h-7 flex items-center cursor-pointer justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors disabled:opacity-30"
                                aria-label="Decrease quantity"
                              >
                                {isItemLoadingDecrease ? (
                                  <div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                                  </svg>
                                )}
                              </button>
                              <span className="w-8 text-center text-sm text-neutral-900 dark:text-white">
                                {item?.node?.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(itemId, item?.node?.quantity, 1)}
                                disabled={isItemLoading || isItemRemoving}
                                className="w-7 h-7 flex items-center cursor-pointer justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors disabled:opacity-30"
                                aria-label="Increase quantity"
                              >
                                {isItemLoadingIncrease ? (
                                  <div className="w-3 h-3 border border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleRemoveItem(itemId)}
                          disabled={isItemRemoving}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-all hover:scale-110 disabled:opacity-50 cursor-pointer"
                          aria-label="Remove item"
                        >
                          {isItemRemoving ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-neutral-500 dark:text-neutral-400">Subtotal</span>
              <Price
                amount={cartObj?.grandTotal}
                className="text-lg font-semibold text-neutral-900 dark:text-white"
                currencyCode={(cartObj as any)?.currencyCode || "USD"}
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full h-14 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 cursor-pointer hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:bg-neutral-300 disabled:cursor-not-allowed font-bold text-lg rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>

              <button
                onClick={onClose}
                className="w-full h-12 cursor-pointer text-center text-sm font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center justify-center"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
