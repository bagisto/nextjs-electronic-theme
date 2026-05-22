"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { RecoverPasswordFormState } from "@components/customer/types";
import { Button } from "@components/common/button/LoadingButton";
import { userSubscribe } from "@utils/actions";
import { useCustomToast } from "@/hooks/useToast";
import { EMAIL_REGEX } from "@utils/constants";

type FormValues = {
  email: string;
};

const Subscribe = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: "onSubmit" });
  const { showToast } = useCustomToast();

  const [status, setStatus] = useState<
    RecoverPasswordFormState["errors"] | null
  >(null);

  const onSubmit = async (data: FormValues) => {
    setStatus(null);
    const formData = new FormData();

    formData.append("email", data.email);
    setLoading(true);
    const result = await userSubscribe(undefined as any, formData);

    setStatus(result?.errors || null);
    if (result?.errors?.apiRes?.status) {
      reset();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status) {
      setTimeout(() => {
        setStatus(null);
      }, 3500);
    }
    if (status?.email) {
      showToast(status?.email[0], "warning");
    }
    if (status?.apiRes?.status === false) {
      showToast(status?.apiRes?.msg, "warning");
    }
    if (status?.apiRes?.status === true) {
      showToast("Successfully Subscribed", "success");
    }
  }, [status]);

  return (
    <form
      noValidate
      className="mt-8 lg:mt-0 w-full relative"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-3">
        <h3 className="mb-1 text-sm font-bold text-neutral-900 dark:text-white">Stay Updated</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Get exclusive offers, new arrivals, and more.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-2">
        <input
          type="email"
          aria-label="Email Address"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: EMAIL_REGEX,
              message: "Enter a valid email",
            },
          })}
          className={clsx(
            "flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            errors.email || status?.email
              ? "border-red-500 dark:border-red-500"
              : "border-neutral-200 dark:border-neutral-700"
          )}
          placeholder="Enter your email"
        />
        <Button
          className={clsx(
            "relative flex font-semibold px-6 py-2.5 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white text-sm transition-all duration-200",
            {
              "hover:opacity-90": !isSubmitting,
              "cursor-not-allowed opacity-50": isSubmitting,
            }
          )}
          disabled={loading || isSubmitting}
          loading={loading || isSubmitting}
          title="Subscribe"
          type="submit"
        />
      </div>

      {errors.email && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {errors.email.message}
        </p>
      )}
    </form>
  );
};

export default Subscribe;
