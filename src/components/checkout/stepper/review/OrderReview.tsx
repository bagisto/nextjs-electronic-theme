"use client";
import { useForm } from "react-hook-form";
import {
  AddressDataTypes,
} from "@/types/types";
import { isObject } from "@/utils/type-guards";
import { useCheckout } from "@/hooks/useCheckout";
import { ProceedToCheckout } from "../ProceedToCheckout";
export default function OrderReview({
  selectedPaymentTitle,
  shippingAddress,
  billingAddress,
  selectedShipping : _selectedShipping,
  selectedShippingRateTitle,
  isShippingRequired = true,
}: {
  selectedPaymentTitle?: string;
  shippingAddress?: AddressDataTypes;
  billingAddress?: AddressDataTypes;
  selectedShipping?: string;
  selectedShippingRateTitle?: string;
  isShippingRequired?: boolean;
}) {
  const { isPlaceOrder, SavePlaceOrder } = useCheckout();
  const { handleSubmit } = useForm();
  const onSubmit = () => {
    SavePlaceOrder();
  };

  return (
    <div className="mt-4 flex-col mb-20 sm:mb-0">
      <div className="relative">
        {isObject(shippingAddress) && (
          <table className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
            <tbody>
              <tr className="">
                <td className="py-4 text-neutral-600 dark:text-neutral-400">Contact</td>
                <th
                  className="break-all px-6 py-4 font-medium text-neutral-900 dark:text-white"
                  scope="row"
                >
                  {shippingAddress?.email}
                </th>
              </tr>
              <tr className="">
                <td className="py-4 text-neutral-600 dark:text-neutral-400">Billing to</td>
                <th
                  className="break-all px-6 py-4 font-medium text-neutral-900 dark:text-white"
                  scope="row"
                >
                  {billingAddress?.firstName}, {billingAddress?.lastName},{" "}
                  {billingAddress?.address}, {billingAddress?.city},{" "}
                  {billingAddress?.state}, {billingAddress?.postcode},{" "}
                  {billingAddress?.country}
                </th>
              </tr>
              {isShippingRequired && (
                <>
                  <tr className="">
                    <td className="py-4 text-neutral-600 dark:text-neutral-400">Ship to</td>
                    <th
                      className="break-all px-6 py-4 font-medium text-neutral-900 dark:text-white"
                      scope="row"
                    >
                      {shippingAddress?.firstName}, {shippingAddress?.lastName},{" "}
                      {shippingAddress?.address}, {shippingAddress?.city},{" "}
                      {shippingAddress?.state}, {shippingAddress?.postcode},{" "}
                      {shippingAddress?.country}
                    </th>
                  </tr>
                  <tr className="">
                    <td className="py-4 text-neutral-600 dark:text-neutral-400">Method</td>
                    <th
                      className="break-all px-6 py-4 font-medium text-neutral-900 dark:text-white"
                      scope="row"
                    >
                      {selectedShippingRateTitle}
                    </th>
                  </tr>
                </>
              )}
              <tr className="">
                <td className="py-4 text-neutral-600 dark:text-neutral-400">Payment</td>
                <th
                  className="break-all px-6 py-4 font-medium text-neutral-900 dark:text-white"
                  scope="row"
                >
                  {selectedPaymentTitle}
                </th>
              </tr>
            </tbody>
          </table>
        )}
      </div>
      <div className="flex flex-col gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="justify-self-end">
            <ProceedToCheckout
              buttonName="Place Order"
              pending={isPlaceOrder}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
