"use client";

import { useQuery } from "@apollo/client";
import { getCartToken } from "@utils/getCartToken";
import { GET_CHECKOUT_SHIPPING_RATES } from "@/graphql/checkout/queries/GetCheckoutShippingRates";

export const useCheckoutShippingMethods = () => {
  const token = getCartToken();

  const { data, loading: isLoading } = useQuery(GET_CHECKOUT_SHIPPING_RATES, {
    variables: { token: token || "" },
    skip: !token,
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
  });

  return {
    data , 
    isLoading
  }
};
