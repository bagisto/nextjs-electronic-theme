"use client";

import { useState } from "react";
import { NextImage } from "@/components/common/NextImage";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowLeftIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { UserIcon as UserSolidIcon } from "@heroicons/react/24/solid";
import { COMMON_IMG } from "@utils/constants";
import { CommonLayoutProps } from "./CustomerLayout";
import { useScrollTo } from "@/hooks";
import { InlineSpinner } from "@/components/common/PageLoader";



export function MobileCustomerLayout({
    customer,
    navigationItems,
    handleTabChange,
    handleLogout,
    isLoggingOut,
    renderTabContent
}: CommonLayoutProps) {
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [isMobileTabOpen, setIsMobileTabOpen] = useState(!!tabFromUrl);
    const router = useRouter();
    const scrollTo = useScrollTo();

    const onTabClick = (id: string) => {
        handleTabChange(id);
        setIsMobileTabOpen(true);
        scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBack = () => {
        setIsMobileTabOpen(false);
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.delete("tab");
        router.replace(`?${currentParams.toString()}`, { scroll: false });
    };

    return (
        <div className="mobile-customer-layout">
            {/* Header Banner & Profile Section */}
            <div className="relative">
                <div className="hero-banner relative w-full h-[160px] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <NextImage
                        src={COMMON_IMG}
                        alt="Hero banner"
                        width={800}
                        height={160}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 z-10">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 shadow-xl">
                        {customer.avatar ? (
                            <NextImage src={customer.avatar} alt={customer.name} width={96} height={96} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                <UserSolidIcon className="w-12 h-12 text-neutral-300 dark:text-neutral-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 pb-6 text-center border-b border-neutral-100 dark:border-neutral-800">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{customer.name}</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{customer.email}</p>
            </div>

            <div className="px-4 py-6">
                {!isMobileTabOpen ? (
                    <nav className="animate-fade-in">
                        <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {navigationItems.map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => onTabClick(item.id)}
                                        className="w-full flex items-center cursor-pointer justify-between py-5 group transition-colors"
                                    >
                                        <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300">
                                            <span className="text-neutral-500 group-hover:text-green-600 transition-colors">{item.icon}</span>
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
                    </nav>
                ) : (
                    <div className="tab-detail-view animate-fade-in">
                        <button
                            onClick={handleBack}
                            className="flex items-center cursor-pointer gap-2 mb-6 text-neutral-600 dark:text-neutral-400 font-medium"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>Back to Account</span>
                        </button>
                        <div className="tab-content-wrapper">
                            {renderTabContent()}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}