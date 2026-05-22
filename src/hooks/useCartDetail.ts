"use client";

import { useMutation } from "@apollo/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cart-slice";
import { useCallback, useEffect, useState } from "react";
import { GET_CART_ITEM } from "@/graphql";
import { getCartToken } from "@/utils/getCartToken";

let cartFetchPromise: Promise<void> | null = null;
let hasHydrated = false;
const hydrationListeners = new Set<() => void>();

const notifyHydrated = () => {
  hasHydrated = true;
  hydrationListeners.forEach((cb) => cb());
};

export function useCartDetail() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cartDetail.cart);
  const [hydrated, setHydrated] = useState(hasHydrated);

  const [getCartDetailMutation, { data, loading: isLoading, error }] =
    useMutation(GET_CART_ITEM, {
      onCompleted: (response) => {
        const cartData = response?.createReadCart?.readCart;
        if (cartData) {
          dispatch(addItem(cartData));
        }
      },
      onError: (err) => {
        console.error("Cart detail error:", err);
      },
    });

  const getCartDetail = useCallback(async () => {
    const token = getCartToken();
    if (!token) {
      if (!hasHydrated) notifyHydrated();
      return;
    }

    if (cartFetchPromise) {
      await cartFetchPromise;
      return;
    }

    cartFetchPromise = (async () => {
      try {
        await getCartDetailMutation();
      } finally {
        if (!hasHydrated) notifyHydrated();
        cartFetchPromise = null;
      }
    })();

    await cartFetchPromise;
  }, [getCartDetailMutation]);

  useEffect(() => {
    if (hasHydrated) {
      if (!hydrated) setHydrated(true);
      return;
    }
    const listener = () => setHydrated(true);
    hydrationListeners.add(listener);
    return () => {
      hydrationListeners.delete(listener);
    };
  }, [hydrated]);

  useEffect(() => {
    if (!cart && !cartFetchPromise && !hasHydrated) {
      getCartDetail();
    }
  }, [cart, getCartDetail]);

  const hasToken = typeof window !== "undefined" && !!getCartToken();
  const isInitialLoading = !hydrated && hasToken;

  return {
    cartData: cart || data?.createReadCart?.readCart,
    getCartDetail,
    isLoading: isLoading || isInitialLoading,
    isInitialLoading,
    error,
  };
}
