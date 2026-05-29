"use client";

import clsx from "clsx";
import { getSession, signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { EMAIL_REGEX, SIGNIN_IMG, GUEST_CART_ID, GUEST_CART_TOKEN, IS_GUEST } from "@/utils/constants";
import { useCustomToast } from "@/hooks/useToast";
import { useMergeCart } from "@/hooks/useMergeCart";
import { getCookie } from "@utils/useCookie";
import { setCookie } from "@utils/helper";
import { setLocalStorage } from "@/store/local-storage";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/user-slice";
import { useCartDetail } from "@/hooks/useCartDetail";
import { IconEmail, IconLock, IconEye, IconEyeOff } from "@components/common/icons/FormIcons";

type LoginFormInputs = {
  username: string;
  password: string;
};

const inputBase = clsx(
  "w-full py-2.5 sm:py-3 rounded-lg border bg-white dark:bg-neutral-900",
  "text-neutral-900 dark:text-white text-sm transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
);

const labelBase = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const { getCartDetail } = useCartDetail();
  const { mergeCart } = useMergeCart();
  const [showPassword, setShowPassword] = useState(false);

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
                  Welcome back 👋
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Login to your account to continue shopping
                </p>
              </div>
              <Link
                href="/customer/register"
                aria-label="Go to create account page"
                className="flex-shrink-0 self-start px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-600 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-200 whitespace-nowrap"
              >
                New here?{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Sign up</span>
              </Link>
            </div>

            <form noValidate className="flex flex-col gap-y-3 sm:gap-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className={labelBase}>Email address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <IconEmail />
                  </span>
                  <input
                    id="login-email"
                    {...register("username", {
                      required: "Email is required",
                      pattern: { value: EMAIL_REGEX, message: "Please enter a valid email." },
                    })}
                    type="email"
                    placeholder="demo@gmail.com"
                    className={clsx(inputBase, "pl-10 pr-4", errors.username ? "border-red-500" : "border-neutral-300 dark:border-neutral-600")}
                  />
                </div>
                {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className={labelBase}>Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <IconLock />
                  </span>
                  <input
                    id="login-password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 2, message: "Be at least 2 characters long" },
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

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">Remember me</span>
                </label>
                <Link
                  href="/customer/forget-password"
                  aria-label="Go to forgot password page"
                  className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:underline transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 sm:py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>

              {/* Security note */}
              <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
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
            alt="Login Image"
            className="object-cover"
            sizes="(min-width: 1280px) 908px, (min-width: 1024px) 60vw, 0px"
            src={SIGNIN_IMG}
          />
        </div>

      </div>
    </div>
  );
}
