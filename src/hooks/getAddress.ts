"use client"

import { CheckoutAddressNode, MappedCheckoutAddress } from "@/types/checkout/type";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { AddressDataTypes } from "@/types/types";
import { useAddress } from "./useCheckoutAddress";

export const useAddressesFromApi = (autoFetch: boolean = false): {
  billingAddress: MappedCheckoutAddress | null;
  shippingAddress: MappedCheckoutAddress | null;
  getAddresses: () => Promise<void>;
} => {
  const { addresses: data, getAddresses } = useAddress();
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const address = data;

  const reduxBilling = cartDetail?.billingAddress;
  const reduxShipping = cartDetail?.shippingAddress;

  useEffect(() => {
    if (autoFetch && !address.length && !reduxBilling && !reduxShipping) {
      getAddresses();
    }
  }, [autoFetch, address.length, reduxBilling, reduxShipping, getAddresses]);

  if (!Array.isArray(address) && !reduxBilling && !reduxShipping)
    return { billingAddress: null, shippingAddress: null, getAddresses };

  const billingNode = address.find((a: CheckoutAddressNode) => a?.addressType === "cart_billing");

  const shippingNode = address.find((a: CheckoutAddressNode) => a?.addressType === "cart_shipping");

  const mapNode = (
    node?: CheckoutAddressNode | AddressDataTypes
  ): MappedCheckoutAddress | null =>
    node
      ? {
        firstName: node.firstName,
        lastName: node.lastName,
        companyName: node.companyName,
        address: node.address,
        city: node.city,
        state: node.state,
        country: node.country,
        postcode: node.postcode,
        email: node.email,
        phone: node.phone,
      }
      : null;

  return {
    billingAddress: reduxBilling ? mapNode(reduxBilling) : mapNode(billingNode),
    shippingAddress: reduxShipping ? mapNode(reduxShipping) : mapNode(shippingNode),
    getAddresses,
  };
};
