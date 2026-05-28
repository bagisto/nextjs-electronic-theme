import { FC } from "react";
import { AddressDataTypes } from "@/types/types";
import OrderReview from "./OrderReview";

export const Review: FC<{
  selectedPaymentTitle?: string;
  shippingAddress?: AddressDataTypes;
  billingAddress?: AddressDataTypes;
  selectedShippingRate?: string;
  selectedShippingRateTitle?: string;
  isShippingRequired?: boolean;
}> = ({
  selectedPaymentTitle,
  shippingAddress,
  billingAddress,
  selectedShippingRate,
  selectedShippingRateTitle,
  isShippingRequired = true,
}) => {
  return (
    <OrderReview
      billingAddress={billingAddress}
      selectedPaymentTitle={selectedPaymentTitle}
      selectedShipping={selectedShippingRate}
      selectedShippingRateTitle={selectedShippingRateTitle}
      shippingAddress={shippingAddress}
      isShippingRequired={isShippingRequired}
    />
  );
};

export default Review;
