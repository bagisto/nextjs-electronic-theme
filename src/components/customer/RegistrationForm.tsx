"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useCustomToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { EMAIL_REGEX, SIGNUP_IMG } from "@utils/constants";
import { createUser } from "@utils/actions";
import { Button } from "@components/common/button/Button";
import CustomDropdown from "@/components/common/form/CustomDropdown";

export type RegisterInputs = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  password: string;
  passwordConfirmation: string;
};

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland",
  "France", "Germany", "Ghana", "Greece", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kenya",
  "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Romania", "Russia", "Saudi Arabia", "Singapore", "South Africa",
  "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand",
  "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Vietnam",
];

export default function RegistrationForm() {
  const router = useRouter();
  const { showToast } = useCustomToast();

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

    // Split name into firstName / lastName for the API
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

  const inputBase =
    "w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm transition-all duration-200 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400";

  const labelBase =
    "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5";

  return (
    <div className="overflow-hidden flex w-full items-start max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 justify-between gap-6 lg:gap-10 xl:gap-14 my-10 sm:my-14 lg:my-16 xl:my-20 pt-8">
      {/* Left Side - Form */}
      <div className="flex w-full max-w-full sm:max-w-[420px] lg:max-w-[380px] xl:max-w-[420px] flex-col flex-shrink-0">
        {/* Header Row: Title + Login Button */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Signup
          </h2>
          <Link
            href="/customer/login"
            aria-label="Go to login page"
            className="px-5 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors duration-200"
          >
            Login
          </Link>
        </div>

        {/* Form */}
        <form
          noValidate
          className="flex flex-col gap-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Name (full width) */}
          <div>
            <label htmlFor="signup-name" className={labelBase}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="signup-name"
              {...register("firstName", {
                required: "Name is required",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Name can only contain letters",
                },
              })}
              type="text"
              placeholder="Enter your name"
              className={clsx(
                inputBase,
                errors.firstName
                  ? "border-red-500"
                  : "border-neutral-300 dark:border-neutral-600"
              )}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Email + Phone side by side */}
          <div className="flex lg:flex-row flex-col gap-3">
            <div className="flex-1 min-w-0">
              <label htmlFor="signup-email" className={labelBase}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: EMAIL_REGEX,
                    message: "Please enter a valid email.",
                  },
                })}
                type="email"
                placeholder="Enter your email"
                className={clsx(
                  inputBase,
                  errors.email
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label htmlFor="signup-phone" className={labelBase}>
                Phone No. <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-phone"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9+\-\s()]{7,15}$/,
                    message: "Enter a valid phone number",
                  },
                })}
                type="tel"
                placeholder="Enter your phone number"
                className={clsx(
                  inputBase,
                  errors.phone
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Country dropdown (full width) */}
          <div>
            <label htmlFor="signup-country" className={labelBase}>
              Country <span className="text-red-500">*</span>
            </label>
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
                />
              )}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-500">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* Password + Confirm Password side by side */}
          <div className="flex lg:flex-row flex-col gap-3">
            <div className="flex-1 min-w-0">
              <label htmlFor="signup-password" className={labelBase}>
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "At least 8 characters",
                  },
                  validate: (val) => {
                    if (!/[A-Z]/.test(val))
                      return "Need one uppercase letter";
                    if (!/[a-z]/.test(val))
                      return "Need one lowercase letter";
                    if (!/[0-9]/.test(val)) return "Need one number";
                    if (/\s/.test(val)) return "No spaces allowed";
                    return true;
                  },
                })}
                type="password"
                placeholder="Enter your password"
                className={clsx(
                  inputBase,
                  errors.password
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <label htmlFor="signup-confirm-password" className={labelBase}>
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="signup-confirm-password"
                {...register("passwordConfirmation", {
                  required: "Please confirm your password",
                })}
                type="password"
                placeholder="Confirm your password"
                className={clsx(
                  inputBase,
                  errors.passwordConfirmation
                    ? "border-red-500"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
              />
              {errors.passwordConfirmation && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.passwordConfirmation.message}
                </p>
              )}
            </div>
          </div>

          {/* Signup Button */}
          <Button
            className="cursor-pointer rounded-full py-3.5 mt-1"
            disabled={isSubmitting}
            loading={isSubmitting}
            title="Signup"
            type="submit"
          />
        </form>
      </div>

      {/* Right Side - Image */}
      <div
        className="relative hidden lg:block flex-1 min-w-0 rounded-2xl overflow-hidden"
        style={{
          width: "100%",
          maxWidth: "1008px",
          height: "571px",
        }}
      >
        <Image
          fill
          priority
          alt="Sign Up Image"
          className="object-cover transition duration-300 ease-in-out"
          sizes="(min-width: 1280px) 1008px, (min-width: 1024px) 60vw, 0px"
          src={SIGNUP_IMG}
        />
      </div>
    </div>
  );
}
