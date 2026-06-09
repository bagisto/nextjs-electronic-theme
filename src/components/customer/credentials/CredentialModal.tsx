"use client";

import { Drawer, DrawerContent, DrawerBody, DrawerHeader, DrawerFooter } from "@heroui/drawer";
import { useDisclosure } from "@heroui/react";
import clsx from "clsx";
import { signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { Avatar } from "@heroui/avatar";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { useLazyQuery } from "@apollo/client";
import { useEffect } from "react";
import { GET_CUSTOMER_PROFILE } from "@/graphql/customer/queries/GetCustomerProfile";
import { useCustomToast } from '@/hooks/useToast';
import OpenAuth from "../OpenAuth";
import { isObject } from '@/utils/type-guards';
import { useGuestCartToken } from "@/hooks/useGuestCartToken";
import LoadingDots from "@components/common/icons/LoadingDots";
import { logoutAction } from "@utils/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser, setUser } from "@/store/slices/user-slice";
import { clearCart } from "@/store/slices/cart-slice";
import { EMAIL_REGEX } from "@/utils/constants";
import { getSession } from "next-auth/react";
import { getCookie } from "@utils/useCookie";
import { setCookie } from "@/utils/helper";
import { setLocalStorage } from "@/store/local-storage";
import { useCartDetail } from "@/hooks/useCartDetail";
import { useMergeCart } from "@/hooks/useMergeCart";
import { GUEST_CART_ID, GUEST_CART_TOKEN, IS_GUEST } from "@/utils/constants";
import CompareIcon from "@components/common/icons/CompareIcon";
import { HeartIcon } from "@components/common/icons/HeartIcon";
import { AddressIcon } from "@components/common/icons/AddressIcon";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";

type LoginFormInputs = {
  username: string;
  password: string;
};

export default function CredentialModal({
  children,
  className,
  onClick,
  onClose: onCloseProp,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useCustomToast();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { resetGuestToken } = useGuestCartToken();
  const { getCartDetail } = useCartDetail();
  const { mergeCart } = useMergeCart();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleOpen = () => {
    onOpen();
    if (onClick) {
      onClick();
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange();
    if (!open && onCloseProp) {
      onCloseProp();
    }
  };

  // Login form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isLoginSubmitting },
  } = useForm<LoginFormInputs>({
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Logout form
  const {
    handleSubmit: handleLogoutSubmit,
    formState: { isSubmitting: isLogoutSubmitting },
  } = useForm();

  const { user } = useAppSelector((state) => state.user);
  const session = { user };

  const [fetchCustomerProfile, { data: customerProfileData }] = useLazyQuery(GET_CUSTOMER_PROFILE, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (isOpen && user?.email && !user?.image) {
      fetchCustomerProfile();
    }
  }, [isOpen, user?.email, user?.image, fetchCustomerProfile]);

  useEffect(() => {
    const profile = customerProfileData?.readCustomerProfile;
    if (profile && user) {
      dispatch(setUser({ ...user, image: profile.image }));
    }
   
  }, [customerProfileData]);

  // Login handler
  const onLoginSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
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

      const newSession = await getSession();
      const userToken: string | undefined = newSession?.user?.accessToken;

      if (newSession?.user) {
        dispatch(setUser(newSession.user as any));
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

      handleOpenChange(false);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 100);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong. Please try again.", "danger");
    }
  };

  // Logout handler
  const onLogoutSubmit = async () => {
    try {
      const res = await logoutAction();

      if (!res.success) {
        showToast(res.message, "danger");
      }

      await signOut({
        callbackUrl: "/customer/login",
        redirect: false,
      });

      await resetGuestToken();
      dispatch(clearUser());
      dispatch(clearCart());
      showToast("You are logged out successfully!", "success");
      setTimeout(() => {
        router.push("/customer/login");
        router.refresh();
      }, 100);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Logout failed";
      showToast(message, "danger");
    }
  };

  const innerContent = (onClose?: () => void) => (
    <div className="flex w-full flex-col rounded-md py-4 gap-y-6">
      {isObject(session?.user) ? (
        <>
          <header>
            <div className="flex flex-col gap-3 items-center justify-center">
              <div className="flex gap-3 flex-col items-center">
                <Avatar
                  isBordered
                  showFallback
                  color="default"
                  src={session?.user?.image || undefined}
                  name={session?.user?.name}
                  icon={<OpenAuth className="h-12 w-12 text-white" />}
                  size="lg"
                  className="h-24 w-24 text-large"
                />
                <div className="flex flex-col justify-center items-center gap-1">
                  <h4 className="leading-none dark:text-white text-xl font-bold text-black">
                    {session?.user?.name}
                  </h4>
                  <h5 className="tracking-tight dark:text-white text-sm text-neutral-600 dark:text-neutral-400">
                    {session?.user?.email}
                  </h5>
                </div>
              </div>

              <p className="text-default-500 dark:text-white text-center mt-2">
                Manage Cart, Orders
                <span aria-label="confetti" className="px-2" role="img">
                  🎉
                </span>
              </p>
            </div>
          </header>

          <div className="flex flex-col gap-2">
            
            <Link 
              href="/compare" 
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <CompareIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              <span className="text-sm font-medium">My Comparison</span>
            </Link>
            <Link 
              href="/customer-details?tab=wishlist" 
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <HeartIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              <span className="text-sm font-medium">Wishlist</span>
            </Link>
            <Link 
              href="/customer-details?tab=addresses" 
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-700 cursor-pointer"
            >
              <AddressIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              <span className="text-sm font-medium">Addresses</span>
            </Link>
          </div>

          <footer>
            <div className="flex flex-col gap-3">
              <Link
                href="/customer-details"
                onClick={onClose}
                className="w-full cursor-pointer"
              >
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-xl bg-green-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                >
                  Go to Account
                </button>
              </Link>
              <form onSubmit={handleLogoutSubmit(onLogoutSubmit)} className="flex justify-center">
                <button
                  className={clsx(
                    "rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all duration-200 w-full",
                    isLogoutSubmitting ? " cursor-not-allowed" : " cursor-pointer"
                  )}
                  type="submit"
                >
                  <div className="mx-1 flex items-center justify-center gap-2">
                    {isLogoutSubmitting ? (
                      <>
                        <p>Loading</p>
                        <LoadingDots className="bg-white" />
                      </>
                    ) : (
                      <p className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Log Out
                      </p>
                    )}
                  </div>
                </button>
              </form>
            </div>
          </footer>
        </>
      ) : (
        <>
          {/* Login Form in Drawer */}
          <form
            noValidate
            className="flex flex-col gap-y-4"
            onSubmit={handleSubmit(onLoginSubmit)} >
            {/* Welcome Message */}
            <div className="text-center pb-2">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Welcome Back</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Sign in to continue shopping</p>
            </div>
            {/* Email Input */}
            <div>
              <label
                htmlFor="drawer-login-email"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="drawer-login-email"
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
                  "w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm transition-all duration-200",
                  "focus:outline-none focus:border-green-500 dark:focus:border-green-400",
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
                htmlFor="drawer-login-password"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="drawer-login-password"
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
                  "w-full px-4 py-3 rounded-lg border bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm transition-all duration-200",
                  "focus:outline-none focus:border-green-500 dark:focus:border-green-400",
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

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="drawer-remember-me"
                  className="w-4 h-4 accent-green-500 cursor-pointer"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">
                  Remember me
                </span>
              </label>
              <Link
                className="text-sm text-green-600 dark:text-green-400 underline transition-colors duration-200 cursor-pointer"
                href="/customer/forget-password"
                onClick={onClose}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoginSubmitting}
              className={clsx(
                "w-full rounded-xl bg-green-500 px-5 py-3.5 text-center text-sm font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200",
                isLoginSubmitting ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              )}
            >
              {isLoginSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingDots className="bg-white" /> Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
            <span className="text-sm text-neutral-500">or</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
          </div>

          {/* Sign Up Button */}
          <Link className="w-full cursor-pointer" href="/customer/register" onClick={onClose} aria-label="Go to create account page">
            <button
              className={clsx(
                "w-full rounded-xl bg-neutral-900 px-5 py-3.5 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 transition-all duration-200",
                pathname === "/customer/register"
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              )}
              disabled={pathname === "/customer/register"}
              type="button"
            >
              Create Account
            </button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open account"
        className={clsx(className, "cursor-pointer bg-transparent  hover:bg-white/10 rounded-full transition-colors")}
        onClick={handleOpen}
      >
        {children ? children : <OpenAuth />}
      </button>

      {isDesktop ? (
        <Drawer
          backdrop="transparent"
          hideCloseButton={true}
          classNames={{ base: "z-[70]", wrapper: "z-[70]" }}
          isOpen={isOpen}
          radius="none"
          onOpenChange={handleOpenChange}
        >
          <DrawerContent className="z-[70]">
            {(onClose) => (
              <>
                <DrawerHeader className="xxs:pb-2 pt-16 pb-2  flex flex-col gap-1">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-lg font-semibold">Account</p>
                    <button
                      aria-label="Close account"
                      className="cursor-pointer"
                      onClick={onClose}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </DrawerHeader>

                <DrawerBody className="py-0">
                  {innerContent(onClose)}
                </DrawerBody>

                <DrawerFooter className="flex flex-col gap-1" />
              </>
            )}
          </DrawerContent>
        </Drawer>
      ) : (
        <Drawer
          backdrop="transparent"
          hideCloseButton={true}
          isOpen={isOpen}
          radius="none"
          onOpenChange={handleOpenChange}
        classNames={{
            base: "z-40",
            backdrop: "z-[35] bg-black/50",
            wrapper: "z-40",
          }}
        >
          <DrawerContent
            className="z-40 h-full"
          >
            {(onClose) => (
              <>
                <DrawerHeader className="xxs:pt-[76px] xxs:pb-2 pt-[66px] pb-2 md:pt-[84px] flex flex-col gap-1 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-xl font-semibold">Account</p>
                    <button
                      aria-label="Close account"
                      className="p-2 rounded-full hover:bg-neutral-100 cursor-pointer dark:hover:bg-neutral-800 transition-colors"
                      onClick={onClose}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </DrawerHeader>
 
                <DrawerBody className="flex flex-col justify-start pb-[80px]">
                  {innerContent(onClose)}
                </DrawerBody>

                <DrawerFooter className="flex flex-col gap-1" />
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
