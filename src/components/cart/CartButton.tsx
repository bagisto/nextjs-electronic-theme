"use client";

import { useState } from "react";
import CartDrawer from "./CartDrawer";
import { useAppSelector } from "@/store/hooks";
import { useCartDetail } from "@/hooks/useCartDetail";
import CartIcon from "@components/common/icons/CartIcon";

export default function CartButton() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const { isInitialLoading } = useCartDetail();

  const quantity = cartDetail?.cart?.itemsQty || 0;

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
        aria-label={`Open cart with ${quantity} items`}
      >
        <CartIcon/>
        {isInitialLoading ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500/70 rounded-full animate-pulse"
          />
        ) : (
          quantity > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {quantity > 99 ? "99+" : quantity}
            </span>
          )
        )}
      </button>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
