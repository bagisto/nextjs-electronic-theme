"use client";

import { CartCheckoutPageSkeleton } from "@/components/common/skeleton/CheckoutSkeleton";
import PaymentMethod from "./PaymentMethod";
import { FC } from "react";
import { useCheckoutPaymentMethods } from "@hooks/useCheckoutPaymentMethods";

const Payment: FC<{
  selectedPayment?: {
    method: string;
    methodTitle?: string;
  };
  currentStep?: string;
}> = ({ selectedPayment, currentStep }) => {
  
  const { data , isLoading} = useCheckoutPaymentMethods()

  if (isLoading && !data) return <CartCheckoutPageSkeleton />;

  return (
    <PaymentMethod
      methods={data?.collectionPaymentMethods}
      selectedPayment={selectedPayment as any}
      currentStep={currentStep}
    />
  );
};

export default Payment;
