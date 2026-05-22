import { useMutation, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useCustomToast } from "./useToast";
import { getCartToken } from "@utils/getCartToken";
import { setCookie } from "@utils/helper";
import { useGuestCartToken } from './useGuestCartToken';
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/slices/cart-slice";
import { ORDER_ID, IS_GUEST } from "@/utils/constants";
import { isObject } from "@utils/type-guards";
import { getCookie } from "@utils/useCookie";
import { CREATE_CHECKOUT_ADDRESS } from "@/graphql/checkout/mutations/CreateCheckoutAddress";
import { GET_CHECKOUT_ADDRESSES } from "@/graphql/checkout/queries/GetCheckoutAddress";
import { GET_CHECKOUT_SHIPPING_RATES } from "@/graphql/checkout/queries/GetCheckoutShippingRates";
import { CREATE_CHECKOUT_SHIPPING_METHODS } from "@/graphql/checkout/mutations/CreateCheckoutShippingMethod";
import { CREATE_CHECKOUT_PAYMENT_METHODS } from "@/graphql/checkout/mutations/CreateCheckoutPaymentMethod";
import { CREATE_CHECKOUT_ORDER } from "@/graphql/checkout/mutations/CreateCheckoutOrder";
import { useCartDetail } from "./useCartDetail";

export interface InputDataTypes {
  input: {
    productId: number;
    quantity: number;
    isBuyNow: boolean;
  };
}

export const useCheckout = () => {
  const router = useRouter();
  const { resetGuestToken } = useGuestCartToken();
  const { showToast } = useCustomToast();
  const dispatch = useDispatch();
  const { getCartDetail } = useCartDetail();

  // Apollo Mutations/Queries
  const [saveAddressMutation, { loading: isLoadingToSave }] = useMutation(CREATE_CHECKOUT_ADDRESS, {
    refetchQueries: [{ query: GET_CHECKOUT_ADDRESSES }]
  });
  const [getShippingRatesQuery, { loading: isLoadingToGetShippingMethods }] = useLazyQuery(GET_CHECKOUT_SHIPPING_RATES);
  const [saveShippingMutation, { loading: isSaving }] = useMutation(CREATE_CHECKOUT_SHIPPING_METHODS);
  const [savePaymentMutation, { loading: isPaymentLoading }] = useMutation(CREATE_CHECKOUT_PAYMENT_METHODS);
  const [placeOrderMutation, { loading: isPlaceOrder }] = useMutation(CREATE_CHECKOUT_ORDER);

  const saveCheckoutAddress = async (input: any) => {
    const token = getCartToken();
    try {
      const { data } = await saveAddressMutation({
        variables: {
          ...input,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createCheckoutAddress?.checkoutAddress;

      if (responseData?.success) {
        showToast(responseData?.message || "Address saved successfully", "success");
        getCartDetail();
        router.replace("/checkout?step=shipping");
      } else {
        showToast(responseData?.message || "Failed to save address", "warning");
      }
    } catch (error: any) {
      showToast(error?.message || "Error saving address", "danger");
    }
  };

  const handleGetShippingRates = async () => {
    const token = getCartToken();
    try {
      const { data } = await getShippingRatesQuery({
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
        fetchPolicy: "network-only",
      });

      const rates = data?.collectionShippingRates;
      if (Array.isArray(rates) && rates.length > 0) {
        showToast("Shipping rates loaded", "success");
      } else {
        showToast("No shipping rates found", "warning");
      }
      return { data: rates };
    } catch (error: any) {
      showToast(error?.message || "Something went wrong", "danger");
      throw error;
    }
  };

  const saveCheckoutShipping = async (input: any) => {
    const token = getCartToken();
    try {
      const { data } = await saveShippingMutation({
        variables: {
          shippingMethod: input,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createCheckoutShippingMethod?.checkoutShippingMethod;

      if (responseData?.success) {
        showToast(responseData?.message || "Shipping method saved", "success");
        getCartDetail();
        router.replace("/checkout?step=payment");
      } else {
        showToast(responseData?.message || "Failed to save shipping method", "warning");
      }
    } catch (error: any) {
      showToast(error?.message || "Error saving shipping method", "danger");
    }
  };

  const saveCheckoutPayment = async (input: any) => {
    const token = getCartToken();
    try {
      const { data } = await savePaymentMutation({
        variables: {
          paymentMethod: input,
        },
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createCheckoutPaymentMethod?.checkoutPaymentMethod;

      if (responseData?.success) {
        showToast(responseData?.message || "Payment method saved", "success");
        getCartDetail();
        router.replace("/checkout?step=review");
      } else {
        showToast(responseData?.message || "Failed to save payment method", "warning");
      }
    } catch (error: any) {
      showToast(error?.message || "Error saving payment method", "danger");
    }
  };

  const SavePlaceOrder = async () => {
    const token = getCartToken();
    try {
      const { data } = await placeOrderMutation({
        context: {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        },
      });

      const responseData = data?.createCheckoutOrder?.checkoutOrder;

      if (isObject(responseData) && responseData.orderId) {
        showToast("Order Placed Successfully!", "success");
        setCookie(ORDER_ID, responseData.orderId as string);
        dispatch(clearCart());
        
        const isGuest = getCookie(IS_GUEST);
        if (isGuest === "true") {
          await resetGuestToken();
        }
        
        router.replace("/success");
      } else {
        showToast("Failed to place order", "warning");
      }
    } catch (error: any) {
      showToast(error?.message || "Error placing order", "danger");
    }
  };

  return {
    isLoadingToSave,
    saveCheckoutAddress,
    isSaving,
    saveCheckoutShipping,
    isPaymentLoading,
    saveCheckoutPayment,
    SavePlaceOrder,
    isPlaceOrder,
    handleGetShippingRates,
    isLoadingToGetShippingMethods,
  };
};
