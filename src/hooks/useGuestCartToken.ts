"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_CART_TOKEN } from "@/graphql/cart/mutations/CreateCartToken";
import { GUEST_CART_ID, GUEST_CART_TOKEN, IS_GUEST } from "@/utils/constants";
import { encodeJWT, decodeJWT } from "@/utils/jwt-cookie";
import { setCookie, deleteCookie, getNativeCookie } from "@utils/useCookie";

let tokenCreated = false;
let tokenPromise: Promise<string | null> | null = null;

/**
 * Hook to manage guest cart tokens and sessions.
 * Migrated from TanStack to Apollo Client following best practices.
 */
export const useGuestCartToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);
  const isResettingRef = useRef(false);

  // Use the standard mutation hook from Apollo
  const [createTokenMutation] = useMutation(CREATE_CART_TOKEN);

  const createGuestToken = useCallback(async (): Promise<string | null> => {
    // Return existing in-flight promise to avoid duplicate calls
    if (tokenPromise) return tokenPromise;

    tokenPromise = (async () => {
      if (tokenCreated) {
        // Return existing raw token from cookie if already created
        const cookieVal = getNativeCookie(GUEST_CART_TOKEN);
        if (cookieVal) {
          const isGuest = getNativeCookie(IS_GUEST) !== "false";
          const decoded = decodeJWT<{ sessionToken: string }>(cookieVal, isGuest);
          return decoded?.sessionToken ?? null;
        }
        return null;
      }

      tokenCreated = true;

      try {
        const { data } = await createTokenMutation();

        const cart = data?.createCartToken?.cartToken;
        if (!cart) {
          tokenCreated = false;
          return null;
        }

        const newToken = encodeJWT({
          sessionToken: cart.cartToken || cart.sessionToken,
          cartId: cart.id,
          isGuest: cart.isGuest,
        });
        const newCartId = Number(cart.id);

        setCookie(GUEST_CART_TOKEN, newToken);
        setCookie(GUEST_CART_ID, String(newCartId));
        setCookie(IS_GUEST, String(cart?.isGuest));

        // State and return should be the RAW token
        const rawToken = cart.cartToken || cart.sessionToken;
        setToken(rawToken);
        setCartId(newCartId);
        return rawToken;
      } catch (e) {
        console.error("Error creating guest token:", e);
        tokenCreated = false;
        return null;
      } finally {
        tokenPromise = null;
      }
    })();

    return tokenPromise;
  }, [createTokenMutation]);

  const resetGuestToken = useCallback(async () => {
    if (isResettingRef.current) return;
    isResettingRef.current = true;

    try {
      tokenCreated = false;
      // delete old session data
      deleteCookie(GUEST_CART_TOKEN);
      deleteCookie(GUEST_CART_ID);

      await createGuestToken();
    } finally {
      isResettingRef.current = false;
    }
  }, [createGuestToken]);

  // Handle initial hydration from cookies
  useEffect(() => {
    const cookieToken = getNativeCookie(GUEST_CART_TOKEN);

    if (cookieToken) {
      const isGuest = getNativeCookie(IS_GUEST) !== "false";
      const decoded = decodeJWT<{
        sessionToken: string;
        cartId: number;
        isGuest: boolean;
      }>(cookieToken, isGuest);

      if (decoded) {
        setToken(decoded.sessionToken);
        setCartId(decoded.cartId);
      }
    }

    setIsReady(true);
  }, []);

  return {
    token,
    cartId,
    isReady,
    createGuestToken,
    resetGuestToken,
    deleteCookie,
  };
};
