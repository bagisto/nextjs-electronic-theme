"use client";

import { useMutation } from "@apollo/client";
import { useCustomToast } from "./useToast";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/slices/cart-slice";
import { CREATE_MERGE_CART } from "@/graphql/cart/mutations/CreateMergeCart";
import { setCookie } from "@/utils/helper";


export function useMergeCart() {
  const { showToast } = useCustomToast();
  const dispatch = useAppDispatch();

  const [mergeCartMutation, { loading: isLoading, error }] = useMutation(CREATE_MERGE_CART);

  const mergeCart = async (token: string, cartId: number) => {
    try {
      const { data } = await mergeCartMutation({
        variables: {
          cartId: Number(cartId),
        },
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const responseData = data?.createMergeCart?.mergeCart;
      if (!responseData) {
        return;
      }

      const returnedCartId = responseData?.id ?? null;

      if (returnedCartId !== null && typeof returnedCartId !== "undefined") {
        setCookie("guest_cart_id", String(returnedCartId));
      }

      dispatch(addItem(responseData));
    } catch (err: any) {
      showToast(err?.message || "Merge cart failed!", "danger");
    }
  };

  return {
    mergeCart,
    isLoading,
    error,
  };
}
