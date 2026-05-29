"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useCustomToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { COUNTRIES, EMAIL_REGEX, SIGNUP_IMG } from "@utils/constants";
import { createUser } from "@utils/actions";
import CustomDropdown from "@/components/common/form/CustomDropdown";
import {
  IconUser,
  IconUserPlus,
  IconEmail,
  IconPhone,
  IconGlobe,
  IconLock,
  IconEye,
  IconEyeOff,
} from "@components/common/icons/FormIcons";

export type RegisterInputs = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  password: string;
  passwordConfirmation: string;
};

const inputBase = clsx(
  "w-full py-2.5 sm:py-3 rounded-lg border bg-white dark:bg-neutral-900",
  "text-neutral-900 dark:text-white text-sm transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
);

const labelBase = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5";

export default function RegistrationForm() {
  const router = useRouter();
  const { showToast } = useCustomToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<RegisterInputs> = async (data) => {
    if (data.password !== data.passwordConfirmation) {
      showToast("The Passwords do not match.", "warning");
      return;
    }

    const nameParts = data.firstName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    await createUser({ ...data, firstName, lastName })
      .then((res) => {
        if (res?.success) {
          showToast("User created successfully", "success");
          router.replace("/customer/login");
        } else {
          showToast(res?.error?.message || "Failed to create user", "warning");
        }
      })
      .catch((error) => {
        showToast(error.message || "An error occurred", "warning");
      });
  };

  return (
    <div className="w-full mt-12 sm:mt-0 min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-screen-xl flex items-center gap-8 lg:gap-12 xl:gap-16">

        {/* Left Side - Form */}
        <div className="w-full lg:max-w-[520px] xl:max-w-[560px] flex-shrink-0 mx-auto lg:mx-0">
          {/* Card wrapper on mobile */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">

            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-3 mb-5 sm:mb-6">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span className="truncate">Create your account</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    <IconUserPlus />
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Join us and start your journey today
                </p>
              </div>
              <Link
                href="/customer/login"
                aria-label="Go to login page"
                className="flex-shrink-0 self-start px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-600 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 whitespace-nowrap"
              >
                Have an account?{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Login</span>
              </Link>
            </div>

            <form noValidate className="flex flex-col gap-y-3 sm:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div>
                <label htmlFor="signup-name" className={labelBase}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <IconUser />
                  </span>
                  <input
                    id="signup-name"
                    {...register("firstName", {
                      required: "Name is required",
                      pattern: { value: /^[a-zA-Z\s]+$/, message: "Name can only contain letters" },
                    })}
                    type="text"
                    placeholder="Enter your name"
                    className={clsx(inputBase, "pl-10 pr-4", errors.firstName ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>

              {/* Email + Phone */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label htmlFor="signup-email" className={labelBase}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <IconEmail />
                    </span>
                    <input
                      id="signup-email"
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

                <div className="flex-1 min-w-0">
                  <label htmlFor="signup-phone" className={labelBase}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <IconPhone />
                    </span>
                    <input
                      id="signup-phone"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: { value: /^[0-9+\-\s()]{7,15}$/, message: "Enter a valid phone number" },
                      })}
                      type="tel"
                      placeholder="Enter phone number"
                      className={clsx(inputBase, "pl-10 pr-4", errors.phone ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="signup-country" className={labelBase}>
                  Country <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-[13px] z-10 text-emerald-500 pointer-events-none">
                    <IconGlobe />
                  </span>
                  <Controller
                    control={control}
                    name="country"
                    rules={{ required: "Please select your country" }}
                    defaultValue=""
                    render={({ field }) => (
                      <CustomDropdown
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        options={COUNTRIES.map((c) => ({ value: c, label: c }))}
                        placeholder="Select your country"
                        ariaLabel="Country"
                        invalid={!!errors.country}
                        className="[&>button]:pl-10"
                      />
                    )}
                  />
                </div>
                {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country.message}</p>}
              </div>

              {/* Password + Confirm Password */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 min-w-0">
                  <label htmlFor="signup-password" className={labelBase}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <IconLock />
                    </span>
                    <input
                      id="signup-password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: { value: 8, message: "At least 8 characters" },
                        validate: (val) => {
                          if (!/[A-Z]/.test(val)) return "Need one uppercase letter";
                          if (!/[a-z]/.test(val)) return "Need one lowercase letter";
                          if (!/[0-9]/.test(val)) return "Need one number";
                          if (/\s/.test(val)) return "No spaces allowed";
                          return true;
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className={clsx(inputBase, "pl-10 pr-10", errors.password ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div className="flex-1 min-w-0">
                  <label htmlFor="signup-confirm-password" className={labelBase}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                      <IconLock />
                    </span>
                    <input
                      id="signup-confirm-password"
                      {...register("passwordConfirmation", { required: "Please confirm your password" })}
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      className={clsx(inputBase, "pl-10 pr-10", errors.passwordConfirmation ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                    />
                    <button
                      type="button"
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      {showConfirm ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  {errors.passwordConfirmation && <p className="mt-1 text-xs text-red-500">{errors.passwordConfirmation.message}</p>}
                </div>
              </div>

              {/* Password hint */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-emerald-500 flex-shrink-0">
                  <IconLock />
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Use 8 or more characters with a mix of letters, numbers &amp; symbols.
                </p>
              </div>

              {/* Sign up Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? "Creating account..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden lg:block flex-1 min-w-0 rounded-2xl overflow-hidden" style={{ height: "560px" }}>
          <Image
            fill
            priority
            alt="Sign Up Image"
            className="object-cover"
            sizes="(min-width: 1280px) 1008px, (min-width: 1024px) 60vw, 0px"
            src={SIGNUP_IMG}
          />
        </div>

      </div>
    </div>
  );
}
