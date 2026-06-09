"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { EMAIL_REGEX, FORGET_PASSWORD_IMG } from "@/utils/constants";
import { useCustomToast } from "@/hooks/useToast";
import { recoverPassword } from "@utils/actions";
import { IconEmail, IconLock } from "@components/common/icons/FormIcons";

type ForgetPasswordInputs = {
  email: string;
};

const inputBase = clsx(
  "w-full py-2.5 sm:py-3 rounded-lg border bg-white dark:bg-neutral-900",
  "text-neutral-900 dark:text-white text-sm transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
);

const labelBase = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5";

export default function ForgetPasswordForm() {
  const { showToast } = useCustomToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgetPasswordInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<ForgetPasswordInputs> = async (data) => {
    setLoading(true);

    try {
      const result = await recoverPassword({
        email: data?.email,
      });

      // Show success/error API response
      if (result.success) {
        showToast(result.success.msg, "success");
      } else if (result.errors?.apiRes) {
        showToast(result.errors.apiRes?.msg, "danger");
      }

      // Field-specific errors
      if (result.errors?.email) {
        showToast(
          Array.isArray(result.errors.email)
            ? result.errors.email[0]
            : result.errors.email,
          "danger"
        );
      }
    } catch {
      showToast("Something went wrong. Please try again later.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mt-12 sm:mt-0 min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-screen-xl flex items-center gap-8 lg:gap-12 xl:gap-16">

        {/* Left Side - Form */}
        <div className="w-full lg:max-w-[420px] xl:max-w-[460px] flex-shrink-0 mx-auto lg:mx-0">
          {/* Card wrapper on mobile */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">

            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-6">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                  Recover Password 👋
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Enter your email address to recover your account password
                </p>
              </div>
              <Link
                href="/customer/login"
                aria-label="Go to sign in page"
                className="flex-shrink-0 self-start px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-600 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 whitespace-nowrap"
              >
                Remember it?{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sign in</span>
              </Link>
            </div>

            <form noValidate className="flex flex-col gap-y-3 sm:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div>
                <label htmlFor="forget-email" className={labelBase}>Email address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <IconEmail />
                  </span>
                  <input
                    id="forget-email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: { value: EMAIL_REGEX, message: "Please enter a valid email." },
                    })}
                    type="email"
                    placeholder="demo@gmail.com"
                    className={clsx(inputBase, "pl-10 pr-4", errors.email ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full py-2.5 sm:py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading || isSubmitting ? "Resetting..." : "Reset Password"}
              </button>

              {/* Security note */}
              <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                <IconLock />
                Your data is secure and encrypted
              </p>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden lg:block flex-1 min-w-0 rounded-2xl overflow-hidden" style={{ height: "560px" }}>
          <Image
            fill
            priority
            alt="Forget Password Illustration"
            className="object-cover"
            sizes="(min-width: 1280px) 908px, (min-width: 1024px) 60vw, 0px"
            src={FORGET_PASSWORD_IMG}
          />
        </div>

      </div>
    </div>
  );
}
