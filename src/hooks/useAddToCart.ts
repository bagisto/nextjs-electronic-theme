import { useCallback } from "react";
import { useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppDispatch } from "@/store/hooks";
import { addItem, clearCart } from "@/store/slices/cart-slice";
import { isObject } from "@utils/type-guards";
import { getCookie } from "@utils/useCookie";
import { useGuestCartToken } from "./useGuestCartToken";
import { IS_GUEST } from "@/utils/constants";
import { getCartToken } from "@/utils/getCartToken";
import { CREATE_ADD_PRODUCT_IN_CART } from "@/graphql/cart/mutations/AddProductToCart";
import { REMOVE_CART_ITEM } from "@/graphql/cart/mutations/RemoveCartItem";
import { UPDATE_CART_ITEM } from "@/graphql/cart/mutations/UpdateCartItems";

interface RemoveCartItemType {
  itemsQty: number;
  itemsCount: number;
  cartToken: string | null;
  isGuest: boolean;
}

interface RemoveCartResponse {
  success: boolean;
  message: string;
  removeCartItem: RemoveCartItemType;
}

/**
 * Hook to manage cart operations: add, remove, and update products.
 * Migrated from TanStack to Apollo Client following best practices.
 */
export const useAddProduct = () => {
  const dispatch = useAppDispatch();
  const { createGuestToken, resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();

  // Apollo Mutations
  const [addProductMutation, { loading: isCartLoading }] = useMutation(CREATE_ADD_PRODUCT_IN_CART);
  const [removeCartItemMutation, { loading: isRemoveLoading }] = useMutation(REMOVE_CART_ITEM);
  const [updateCartItemMutation, { loading: isUpdateLoading }] = useMutation(UPDATE_CART_ITEM);

  const onAddToCart = useCallback(async ({
    productId,
    quantity,
    token: passedToken,
    links,
    booking,
    groupedQty,
    bundleOptions,
    bundleOptionQty,
    bookingNote,
  }: {
    productId: string;
    quantity: number;
    token?: string;
    links?: number[];
    booking?: any;
    groupedQty?: Record<string, number>;
    bundleOptions?: Record<string, string[]>;
    bundleOptionQty?: Record<string, number>;
    bookingNote?: string;
  }) => {
    // Ensure token exists - create if needed
    let token = passedToken || getCartToken();

    if (!token) {
      token = await createGuestToken();

      if (!token) {
        showToast("Failed to create cart session", "danger");
        return;
      }
    }

    const bookingJSON = booking
      ? JSON.stringify(booking)
      : undefined;
    const groupedQtyJSON =
      groupedQty && Object.keys(groupedQty).length
        ? JSON.stringify(groupedQty)
        : undefined;
    const bundleOptionsJSON =
      bundleOptions && Object.keys(bundleOptions).length
        ? JSON.stringify(bundleOptions)
        : undefined;
    const bundleOptionQtyJSON =
      bundleOptionQty && Object.keys(bundleOptionQty).length
        ? JSON.stringify(bundleOptionQty)
        : undefined;

    try {
      const { data } = await addProductMutation({
        variables: {
          productId: parseInt(productId),
          quantity,
          links,
          booking: bookingJSON,
          groupedQty: groupedQtyJSON,
          bundleOptions: bundleOptionsJSON,
          bundleOptionQty: bundleOptionQtyJSON,
          bookingNote: bookingNote ?? "",
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const responseData = data?.createAddProductInCart?.addProductInCart;

      if (!responseData?.success) {
        showToast(responseData?.message || "Error adding to cart", "danger");
        return;
      }

      dispatch(addItem(responseData));
      showToast("Product added to cart successfully", "success");
    } catch (err: any) {
      showToast(err?.message ?? "Error", "danger");
    }
  }, [addProductMutation, createGuestToken, showToast, dispatch]);

  const onAddToRemove = useCallback(async (cartItemId: string) => {
    const token = getCartToken();

    try {
      const { data } = await removeCartItemMutation({
        variables: {
          cartItemId: parseInt(cartItemId),
        },
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createRemoveCartItem as RemoveCartResponse | undefined;

      if (isObject(responseData)) {
        const message = responseData?.message || "Cart item removed successfully";
        dispatch(addItem(responseData?.removeCartItem as any));
        showToast(message, "warning");

        if (!responseData?.removeCartItem?.itemsQty) {
          dispatch(clearCart());

          const isGuest = getCookie(IS_GUEST);
          if (isGuest === "true") {
            resetGuestToken();
          }
        }
      } else {
        showToast("Something went wrong", "warning");
      }
    } catch (error: any) {
      showToast(error?.message as string, "danger");
    }
  }, [removeCartItemMutation, resetGuestToken, showToast, dispatch]);

  const onUpdateCart = useCallback(async ({
    cartItemId,
    quantity,
  }: {
    cartItemId: number;
    quantity: number;
  }) => {
    if (quantity < 1) {
      showToast("Quantity must be at least 1", "warning");
      return;
    }

    const token = getCartToken();

    try {
      const { data } = await updateCartItemMutation({
        variables: {
          cartItemId,
          quantity,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createUpdateCartItem?.updateCartItem;

      if (isObject(responseData)) {
        dispatch(addItem(responseData as any));
      } else {
        showToast("Something went wrong!", "warning");
      }
    } catch (error: any) {
      showToast(error?.message as string, "danger");
    }
  }, [updateCartItemMutation, showToast, dispatch]);

  return {
    onAddToCart,
    onAddToRemove,
    onUpdateCart,
    isCartLoading,
    isRemoveLoading,
    isUpdateLoading,
  };
};
