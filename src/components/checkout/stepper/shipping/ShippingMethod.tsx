"use client";

import { FieldValues, useForm, Controller } from "react-hook-form";
import { cn, Radio, RadioGroup } from "@heroui/react";
import { useState } from "react";
import { ProceedToCheckout } from "../ProceedToCheckout";
import { CustomRadioProps, ShippingMethodType } from "@components/checkout/type";
import { useDispatch } from "react-redux";
import { updateCart } from "@/store/slices/cart-slice";
import { useCheckout } from "@hooks/useCheckout";
import { useCustomToast } from "@hooks/useToast";


export default function ShippingMethod({
  shippingMethod,
  selectedShippingRate,
  currentStep
}: {
  shippingMethod?: ShippingMethodType[];
  selectedShippingRate?: any;
  methodDesc?: string;
  currentStep?: string;
}) {
  const { isSaving, saveCheckoutShipping } = useCheckout();
  const { showToast } = useCustomToast();
  const [isOpen, setIsOpen] = useState(currentStep !== "shipping");

  const [prevValues, setPrevValues] = useState({ currentStep, selectedShippingRate });

  if (currentStep !== prevValues.currentStep || selectedShippingRate !== prevValues.selectedShippingRate) {
    setPrevValues({ currentStep, selectedShippingRate });
    if (currentStep === "shipping") {
      setIsOpen(false);
    } else if (selectedShippingRate) {
      setIsOpen(true);
    }
  }
  const { control, handleSubmit } = useForm({
    mode: "onSubmit",
    defaultValues: {
      method: selectedShippingRate ?? "",
    },
  });
  const selectedMethodTitle = shippingMethod?.find(
    (method) => method.method === selectedShippingRate
  )?.label;
  const selectedMethodPrice = shippingMethod?.find(
    (method) => method.method === selectedShippingRate
  )?.price;

  const dispatch = useDispatch();
  const onSubmit = async (data: FieldValues) => {
    if (!data?.method) {
      showToast("Please Choose the Shipping Method", "warning");
      return;
    }
    try {
      const selectedRate = shippingMethod?.find(m => m.method === data.method);
      if (selectedRate) {
        dispatch(updateCart({
          shippingMethod: selectedRate?.method || "",
          selectedShippingRate: selectedRate?.method || "",
          selectedShippingRateTitle: selectedRate?.label || "",
        }));
      }
      await saveCheckoutShipping(data?.method);
    } catch {
      showToast("Failed to save shipping method. Please try again.");
    }
  };


  return (
    <div>
      {(selectedShippingRate) ? (
        isOpen ? (
          <>
            <div className="mt-4  justify-between hidden sm:flex">
              <div className="flex">
                <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
                  Shipping Method
                </p>
                <p className="text-base font-normal">{selectedMethodTitle} (${selectedMethodPrice})</p>
              </div>
              <div className="flex">
                <button
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                  className="cursor-pointer text-base font-normal text-black/[60%] underline dark:text-neutral-300"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="mt-4 block sm:hidden flex flex-col justify-between sm:flex-row relative  ">
              <div className="flex justify-between  flex-1 wrap">
                <p className="w-auto text-base font-normal text-black/60 dark:text-white/60 sm:w-[192px]">
                  Shipping Method
                </p>
                <p className="text-base font-normal">{selectedMethodTitle} (${selectedMethodPrice})</p>
              </div>

              <button
                onClick={() => {
                  setIsOpen(!isOpen);
                }}
                className="cursor-pointer absolute right-0  text-base font-normal text-black/[60%] underline dark:text-neutral-300"
                style={{ top: "-36px" }}
              >
                Change
              </button>
            </div>
          </>

        ) : (
          <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5">
              {Array.isArray(shippingMethod) && (
                <Controller
                  control={control}
                  name="method"
                  render={({ field }) => (
                    <RadioGroup
                      {...field}
                      label=""
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      {shippingMethod.map((method: any) => (
                        <CustomRadio
                          key={method?.code}
                          className="inset-0 my-1 border border-solid border-neutral-300 dark:border-neutral-500"
                          description={"$" + method?.price}
                          value={method?.method}
                        >
                          <span className="text-neutral-700 dark:text-white">
                            {method?.label}
                          </span>
                        </CustomRadio>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}
            </div>

            <div className="my-6 justify-self-end">
              <ProceedToCheckout buttonName="Next" pending={isSaving} />
            </div>
          </form>
        )
      ) : (
        <form className="mt-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            {Array.isArray(shippingMethod) && (
              <Controller
                control={control}
                name="method"
                render={({ field }) => {
                  return (
                    <RadioGroup
                      {...field}
                      label=""
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                    >
                      {shippingMethod.map((method : any) => (
                        <CustomRadio
                          key={method?.code}
                          className="inset-0 my-1 border border-solid border-neutral-300 dark:border-neutral-500"
                          description={"$" + method?.price}
                          value={method?.method}
                        >
                          <span className="text-neutral-700 dark:text-white">
                            {method?.label}
                          </span>
                        </CustomRadio>
                      ))}
                    </RadioGroup>
                  )
                }}
              />
            )}
          </div>

          <div className="my-6 justify-self-end">
            <ProceedToCheckout buttonName="Next" pending={isSaving} />
          </div>
        </form>
      )}
    </div>
  );
}

const CustomRadio = (props: CustomRadioProps) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-transparent hover:bg-transparent items-center",
          "flex-row items-baseline max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary"
        ),
        hiddenInput: "peer absolute h-0 w-0 opacity-0",
      }}
    >
      {children}
    </Radio>
  );
};
