
import { CartCheckoutPageSkeleton } from "@/components/common/skeleton/CheckoutSkeleton";
import ShippingMethod from "./ShippingMethod";
import { FC } from "react";
import { SelectedShippingRateType } from "@/types/checkout/type";
import { useCheckoutShippingMethods } from "@hooks/useCheckoutShippingMethods";

const Shipping: FC<{
  selectedShippingRate?: SelectedShippingRateType;
  currentStep?: string;
}> = ({ selectedShippingRate, currentStep }) => {
   const { data , isLoading} = useCheckoutShippingMethods()

  if (isLoading && !data) {
    return <CartCheckoutPageSkeleton />;
  }
  return (
    <ShippingMethod
      shippingMethod={data?.collectionShippingRates}
      selectedShippingRate={selectedShippingRate}
      methodDesc={selectedShippingRate?.methodDescription}
      currentStep={currentStep}
    />
  );
};

export default Shipping;
