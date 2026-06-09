"use client";

import { NextImage } from "@/components/common/NextImage";
import { CommonLayoutProps } from "./CustomerLayout";
import { InlineSpinner } from "@/components/common/PageLoader";
import { useCustomToast } from "@/hooks/useToast";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ButterflyLogo = () => (
  <svg className="w-18 h-18 text-emerald-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Left Wing */}
    <path d="M50 50 L22 25 L22 75 Z" fill="url(#left-wing-grad-ds)" />
    <path d="M50 50 L34 35 L22 50 L34 65 Z" fill="url(#left-wing-grad-2-ds)" opacity="0.95" />
    {/* Right Wing */}
    <path d="M50 50 L78 25 L78 75 Z" fill="url(#right-wing-grad-ds)" />
    <path d="M50 50 L66 35 L78 50 L66 65 Z" fill="url(#right-wing-grad-2-ds)" opacity="0.95" />
    {/* Antennas / geometric blocks */}
    <rect x="47" y="15" width="6" height="6" fill="#f97316" rx="1" />
    <rect x="55" y="7" width="6" height="6" fill="#ec4899" rx="1" />
    <rect x="39" y="7" width="6" height="6" fill="#f97316" rx="1" />
    <defs>
      <linearGradient id="left-wing-grad-ds" x1="22" y1="25" x2="50" y2="75">
        <stop offset="0%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
      <linearGradient id="left-wing-grad-2-ds" x1="22" y1="50" x2="50" y2="50">
        <stop offset="0%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="right-wing-grad-ds" x1="50" y1="50" x2="78" y2="75">
        <stop offset="0%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#e11d48" />
      </linearGradient>
      <linearGradient id="right-wing-grad-2-ds" x1="50" y1="50" x2="78" y2="50">
        <stop offset="0%" stopColor="#fb923c" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
  </svg>
);

const WaveBanner = () => (
  <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-emerald-50/20 to-white dark:from-neutral-900 dark:to-neutral-950">
    <svg className="w-full h-full opacity-70 dark:opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
      <path d="M0 80 C 320 200, 640 20, 960 160 C 1280 300, 1380 200, 1440 180 L 1440 280 L 0 280 Z" fill="url(#wave-grad-desktop)" opacity="0.06" />
      <path d="M0 130 C 360 40, 720 240, 1080 100 T 1440 160" stroke="url(#wave-stroke-desktop-1)" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      <path d="M0 100 C 400 210, 800 60, 1200 180 T 1440 120" stroke="url(#wave-stroke-desktop-2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
      <defs>
        <linearGradient id="wave-grad-desktop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wave-stroke-desktop-1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a7f3d0" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="wave-stroke-desktop-2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export function DesktopCustomerLayout({
    customer,
    navigationItems,
    activeTab,
    handleTabChange,
    handleLogout,
    isLoggingOut,
    renderTabContent,
    onAvatarUpload,
    isUploadingAvatar,
}: CommonLayoutProps) {
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

    return (
        <div className="desktop-customer-layout">
            <div className="relative">
                <div className="hero-banner relative w-full h-[180px] sm:h-[220px] lg:h-[280px] bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    <WaveBanner />
                </div>
                <div className="absolute left-1/2 -bottom-12 sm:-bottom-14 lg:-bottom-16 -translate-x-1/2 z-10">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-neutral-900 bg-white dark:bg-neutral-800 shadow-lg flex items-center justify-center">
                        {customer.avatar ? (
                            <NextImage 
                                src={customer.avatar} 
                                alt={customer.name} 
                                width={128} 
                                height={128} 
                                className="rounded-full object-cover w-full h-full"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white dark:bg-neutral-800 rounded-full">
                                <ButterflyLogo />
                            </div>
                        )}
                        <label 
                            htmlFor="avatar-upload-desktop" 
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-neutral-900 transition-colors duration-200"
                        >
                            {isUploadingAvatar ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 18.25a2.25 2.25 0 0 1-1.022.58l-3.2.8 1.13-3.197a2.25 2.25 0 0 1 .58-1.022l12.544-12.544ZM16.862 4.487 19.5 7.125" />
                                </svg>
                            )}
                        </label>
                        <input
                            type="file"
                            accept={ALLOWED_IMAGE_TYPES.join(",")}
                            className="hidden"
                            id="avatar-upload-desktop"
                            onChange={handleImageChange}
                            disabled={isUploadingAvatar}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-16 lg:pt-20 pb-6 px-4 text-center border-b border-neutral-100 dark:border-neutral-800">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white break-words">{customer.email}</h1>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/30 mt-2">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified Account
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-8 lg:py-12">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    <aside className="w-full lg:w-72 lg:flex-shrink-0">
                        <nav className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-3 lg:sticky lg:top-24">
                            <ul className="space-y-1">
                                {navigationItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleTabChange(item.id)}
                                            className={`w-full text-left px-4 py-3 rounded-l-xl rounded-r-none cursor-pointer flex items-center justify-between transition-all duration-200 ${
                                                activeTab === item.id
                                                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 font-semibold border-r-4 border-emerald-500"
                                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <span className={activeTab === item.id ? "text-emerald-500" : "text-neutral-400"}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-emerald-600 hover:bg-emerald-50/50 transition-colors ${
                                        isLoggingOut ? "cursor-wait opacity-70" : "cursor-pointer"
                                    }`}
                                >
                                    {isLoggingOut ? (
                                        <InlineSpinner className="border-emerald-200 border-t-emerald-600" />
                                    ) : (
                                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    )}
                                    <span className="text-sm font-semibold">Logout</span>
                                </button>
                            </div>
                        </nav>
                    </aside>
                    <main className="flex-1 min-w-0 bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800">
                        {renderTabContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}