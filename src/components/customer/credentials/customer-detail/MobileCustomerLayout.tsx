"use client";

import { useState } from "react";
import { NextImage } from "@/components/common/NextImage";
import { useRouter, useSearchParams , usePathname } from "next/navigation";
import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CommonLayoutProps } from "./CustomerLayout";
import { useScrollTo } from "@/hooks";
import { InlineSpinner } from "@/components/common/PageLoader";
import { useCustomToast } from "@/hooks/useToast";
// import { useRouter } from "next/router";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ButterflyLogo = () => (
  <svg className="w-14 h-14 text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Wing */}
    <path d="M50 50 L22 25 L22 75 Z" fill="url(#left-wing-grad-mb)" />
    <path d="M50 50 L34 35 L22 50 L34 65 Z" fill="url(#left-wing-grad-2-mb)" opacity="0.95" />
    {/* Right Wing */}
    <path d="M50 50 L78 25 L78 75 Z" fill="url(#right-wing-grad-mb)" />
    <path d="M50 50 L66 35 L78 50 L66 65 Z" fill="url(#right-wing-grad-2-mb)" opacity="0.95" />
    {/* Antennas / geometric blocks */}
    <rect x="47" y="15" width="6" height="6" fill="#f97316" rx="1" />
    <rect x="55" y="7" width="6" height="6" fill="#ec4899" rx="1" />
    <rect x="39" y="7" width="6" height="6" fill="#f97316" rx="1" />
    <defs>
      <linearGradient id="left-wing-grad-mb" x1="22" y1="25" x2="50" y2="75">
        <stop offset="0%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
      <linearGradient id="left-wing-grad-2-mb" x1="22" y1="50" x2="50" y2="50">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="right-wing-grad-mb" x1="50" y1="50" x2="78" y2="75">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="right-wing-grad-2-mb" x1="50" y1="50" x2="78" y2="50">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
  </svg>
);

const WaveBanner = () => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-emerald-50/20 to-white dark:from-neutral-900 dark:to-neutral-950">
    <svg className="w-full h-full opacity-70 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
      <path d="M0 80 C 320 200, 640 20, 960 160 C 1280 300, 1380 200, 1440 180 L 1440 280 L 0 280 Z" fill="url(#wave-grad-mobile)" opacity="0.06" />
      <path d="M0 130 C 360 40, 720 240, 1080 100 T 1440 160" stroke="url(#wave-stroke-mobile-1)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M0 100 C 400 210, 800 60, 1200 180 T 1440 120" stroke="url(#wave-stroke-mobile-2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <defs>
        <linearGradient id="wave-grad-mobile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wave-stroke-mobile-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="wave-stroke-mobile-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export function MobileCustomerLayout({
  customer,
  navigationItems,
  handleTabChange,
  handleLogout,
  isLoggingOut,
  renderTabContent,
  onAvatarUpload,
  isUploadingAvatar,
}: CommonLayoutProps) {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [isMobileTabOpen, setIsMobileTabOpen] = useState(!!tabFromUrl);
  const router = useRouter();
  const pathname = usePathname() ;
  const scrollTo = useScrollTo();
  const { showToast } = useCustomToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast("Please upload a JPG, PNG, or WebP image", "warning");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast("Image must be smaller than 2MB", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await onAvatarUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  const onTabClick = (id: string) => {
    handleTabChange(id);
    setIsMobileTabOpen(true);
    scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setIsMobileTabOpen(false);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("tab");
    const queryString = currentParams.toString();
    if (queryString) {
      router.replace(`?${queryString}`, { scroll: false });
    } else {
      const hash = window.location.hash;
      router.replace(`${pathname}${hash}`, { scroll: false });
    }
  };

  return (
    <>
      {!isMobileTabOpen ? (
        <div className="animate-fade-in">
          {/* Hero header with avatar */}
          <div className="relative">
            <div className="hero-banner relative w-full h-[150px] xs:h-[170px] sm:h-[200px] bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 overflow-hidden">
              <WaveBanner />
            </div>
            <div className="absolute left-1/2 -bottom-11 -translate-x-1/2 z-10">
              <div className="relative w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900 bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center">
                {customer.avatar ? (
                  <NextImage
                    src={customer.avatar}
                    alt={customer.name}
                    width={96}
                    height={96}
                    className="rounded-full object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white dark:bg-neutral-800 rounded-full">
                    <ButterflyLogo />
                  </div>
                )}
                <label
                  htmlFor="avatar-upload-mobile"
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-neutral-900 transition-colors duration-200"
                >
                  {isUploadingAvatar ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 18.25a2.25 2.25 0 0 1-1.022.58l-3.2.8 1.13-3.197a2.25 2.25 0 0 1 .58-1.022l12.544-12.544ZM16.862 4.487 19.5 7.125" />
                    </svg>
                  )}
                </label>
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  id="avatar-upload-mobile"
                  onChange={handleImageChange}
                  disabled={isUploadingAvatar}
                />
              </div>
            </div>
          </div>

          <div className="pt-14 pb-6 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
            <h1 className="text-lg xs:text-xl font-bold text-neutral-900 dark:text-white break-words">{customer.email}</h1>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 mt-2">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Verified Account
            </div>
          </div>

          {/* Navigation list */}
          <div className="w-full px-4 py-6">
            <nav>
              <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8">
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {navigationItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onTabClick(item.id)}
                        className="w-full flex items-center justify-between py-5 group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300">
                          <span className="text-neutral-500 group-hover:text-emerald-600 transition-colors">{item.icon}</span>
                          <span className="text-lg font-medium">{item.label}</span>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    aria-busy={isLoggingOut}
                    className={`w-full py-4 text-center text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 rounded-xl inline-flex items-center justify-center gap-2 ${isLoggingOut ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                  >
                    {isLoggingOut && <InlineSpinner className="border-red-200 border-t-red-600" />}
                    {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      ) : (
        <div className="tab-detail-view animate-fade-in pt-20">
          {/* Sticky back bar (offset below the fixed navbar) so the account portal is always reachable */}
          <div className="sticky top-16 z-40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-neutral-100 dark:border-neutral-800 px-4 py-3">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Account</span>
            </button>
          </div>
          <div className="w-full px-4 py-6">
            <div className="tab-content-wrapper">{renderTabContent()}</div>
          </div>
        </div>
      )}
    </>
  );
}
