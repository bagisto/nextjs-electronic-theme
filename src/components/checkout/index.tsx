"use client";
import { useAppSelector } from "@/store/hooks";
import CheckoutSkeleton from "../common/skeleton/CheckoutSkeleton";
import { CartSkeleton } from "../common/skeleton/ProductCartSkeleton";
import CheckoutCart from "./checkout-cart/CheckoutCart";
import Stepper from "./stepper";
import { useEffect } from 'react';
import { useAddressesFromApi } from "@hooks/getAddress";
import { useCartDetail } from "@hooks/useCartDetail";
import { useScrollToTop } from "@hooks/useScrollTo";




interface CheckOutProps {
  step: string;
}

const CheckOut = ({ step }: CheckOutProps) => {
  const { isLoading, getCartDetail } = useCartDetail();
  const { billingAddress, shippingAddress } = useAddressesFromApi(true);
  const cartDetail = useAppSelector((state) => state.cartDetail);
  const cartItems = cartDetail?.cart;
  const selectedShippingRate = cartItems?.selectedShippingRate;
  const selectedShippingRateTitle = cartItems?.selectedShippingRateTitle;
  const selectedPayment = cartItems?.paymentMethod;
  const selectedPaymentTitle = cartItems?.paymentMethodTitle;
  useScrollToTop();

  useEffect(() => {
    getCartDetail();
  }, [getCartDetail]);



  return (
    <>
      <section className="flex flex-col items-start justify-between lg:flex-row lg:justify-between">
        <div className="w-full px-0 py-2 sm:px-4 sm:py-4 lg:w-1/2 xl:pl-16 xl:pr-0">
          {isLoading ? (
            <CheckoutSkeleton />
          ) : (
            <Stepper
              billingAddress={billingAddress}
              currentStep={step}
              selectedPayment={selectedPayment}
              selectedPaymentTitle={selectedPaymentTitle}
              selectedShippingRate={selectedShippingRate}
              selectedShippingRateTitle={selectedShippingRateTitle}
              shippingAddress={shippingAddress}
            />
          )}
        </div>

        <div className="h-full w-full !z-0 justify-self-start border-0 border-l border-none border-black/[10%] dark:border-neutral-700 lg:w-1/2 lg:border-solid">
          {isLoading ? (
            <CartSkeleton className="w-full" />
          ) : (
            <div className="max-h-auto w-full flex-initial flex-shrink-0 flex-grow-0 lg:sticky lg:top-0">
              <CheckoutCart cartItems={cartItems} selectedShippingRate={selectedShippingRate} />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default CheckOut;
