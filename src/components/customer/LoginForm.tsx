"use client";

import clsx from "clsx";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@components/common/button/Button";
import { EMAIL_REGEX, SIGNIN_IMG } from "@/utils/constants";
import { useCustomToast } from "@/hooks/useToast";
import { useMergeCart } from "@/hooks/useMergeCart";
import { getCookie } from "@utils/useCookie";
import { setCookie } from "@utils/helper";
import { setLocalStorage } from "@/store/local-storage";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/user-slice";
import { useCartDetail } from "@/hooks/useCartDetail";
import { GUEST_CART_ID, GUEST_CART_TOKEN, IS_GUEST } from "@/utils/constants";

type LoginFormInputs = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const { getCartDetail } = useCartDetail();
  const { mergeCart } = useMergeCart();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const guestCartId = getCookie(GUEST_CART_ID);
      const guestCartToken = getCookie(GUEST_CART_TOKEN);

      const result = await signIn("credentials", {
        redirect: false,
        ...data,
        callbackUrl: "/",
      });

      if (!result?.ok) {
        showToast(result?.error || "Invalid login credentials.", "warning");
        return;
      }
      showToast("Welcome! Successfully logged in.", "success");
      setLocalStorage("email", data?.username);

      const session = await getSession();
      const userToken: string | undefined = session?.user?.accessToken;

      if (!userToken) {
        console.warn("No API token available in session after login");
      }

      if (session?.user) {
        dispatch(setUser(session.user as any));
      }

      if (userToken && guestCartId && guestCartToken) {
        try {
          await mergeCart(userToken, parseInt(guestCartId, 10));
          setCookie(GUEST_CART_TOKEN, userToken);
          setCookie(IS_GUEST, "false");
          await getCartDetail();
        } catch (err) {
          console.error("mergeCart failed:", err);
        }
      } else if (userToken) {
        setCookie(GUEST_CART_TOKEN, userToken);
        setCookie(IS_GUEST, "false");
      }
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.", "danger");
    }
  };

  return (
    <div className="overflow-hidden flex w-full items-start max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 justify-between gap-6 lg:gap-10 xl:gap-14 my-10 sm:my-14 lg:my-16 xl:my-20 pt-8">
      {/* Left Side - Form */}
      <div className="flex w-full max-w-full sm:max-w-[420px] lg:max-w-[380px] xl:max-w-[420px] flex-col flex-shrink-0">
        {/* Header Row: Title + Signup Button */}
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Login
          </h2>
          <Link
            href="/customer/register"
            aria-label="Go to create account page"
            className="px-5 py-2 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors duration-200"
          >
            Signup
          </Link>
        </div>

        {/* Form */}
        <form
          noValidate
          className="flex flex-col gap-y-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email Input */}
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="login-email"
              {...register("username", {
                required: "Email is required",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Please enter a valid email.",
                },
              })}
              type="email"
              placeholder="Enter your Email"
              className={clsx(
                "w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm transition-all duration-200",
                "focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400",
                errors.username
                  ? "border-red-500"
                  : "border-neutral-300 dark:border-neutral-600"
              )}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="login-password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 2,
                  message: "Be at least 2 characters long",
                },
              })}
              type="password"
              placeholder="Enter your password"
              className={clsx(
                "w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-sm transition-all duration-200",
                "focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-400",
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

          {/* Remember Me + Forgot Password Row */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="remember-me"
                className="w-4 h-4 accent-neutral-900 dark:accent-white cursor-pointer"
              />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Remember me
              </span>
            </label>
            <Link
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200"
              href="/customer/forget-password"
              aria-label="Go to forgot password page"
            >
              Forgot your Password?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            className="cursor-pointer rounded-full py-3.5 mt-1"
            disabled={isSubmitting}
            loading={isSubmitting}
            title="Login"
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
          alt="Login Image"
          className="object-cover transition duration-300 ease-in-out"
          sizes="(min-width: 1280px) 1008px, (min-width: 1024px) 60vw, 0px"
          src={SIGNIN_IMG}
        />
      </div>
    </div>
  );
}
