"use client";

import { useQuery } from "@apollo/client";
import { getCartToken } from "@utils/getCartToken";
import { GET_CHECKOUT_PAYMENT_METHODS } from "@/graphql/checkout/queries/GetCheckoutPaymentMethods";

export const useCheckoutPaymentMethods = () => {
  const token = getCartToken();

   const { data, loading: isLoading } = useQuery(GET_CHECKOUT_PAYMENT_METHODS, {
    variables: { token: token || "" },
    skip: !token,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  return {
    data,
    isLoading
  }
};
