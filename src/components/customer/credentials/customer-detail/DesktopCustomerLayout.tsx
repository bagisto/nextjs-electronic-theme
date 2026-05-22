"use client";

import { NextImage } from "@/components/common/NextImage";
import { UserIcon as UserSolidIcon } from "@heroicons/react/24/solid";
import { COMMON_IMG } from "@utils/constants";
import { CommonLayoutProps } from "./CustomerLayout";
import { InlineSpinner } from "@/components/common/PageLoader";




export function DesktopCustomerLayout({
    customer,
    navigationItems,
    activeTab,
    handleTabChange,
    handleLogout,
    isLoggingOut,
    renderTabContent
}: CommonLayoutProps) {
    return (
        <div className="desktop-customer-layout">
            <div className="relative">
                <div className="hero-banner relative w-full h-[280px] bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <NextImage
                        src={COMMON_IMG}
                        alt="Hero banner"
                        width={1400}
                        height={280}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute left-1/2 -bottom-12 -translate-x-1/2 z-10">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-700 shadow-xl">
                        {customer.avatar ? (
                            <NextImage src={customer.avatar} alt={customer.name} width={128} height={128} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                                <UserSolidIcon className="w-16 h-16 text-neutral-300 dark:text-neutral-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 pb-6 text-center border-b border-neutral-100 dark:border-neutral-800">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{customer.name}</h1>
                <p className="text-base text-neutral-500 dark:text-neutral-400 mt-1">{customer.email}</p>
            </div>

            <div className="container mx-auto px-6 py-12">
                <div className="flex gap-8">
                    <aside className="w-72 flex-shrink-0">
                        <nav className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-3 sticky top-24">
                            <ul className="space-y-1">
                                {navigationItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => handleTabChange(item.id)}
                                            className={`w-full text-left px-4 py-3.5 rounded-xl cursor-pointer flex items-center gap-4 transition-all duration-200 ${activeTab === item.id
                                                    ? "bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 font-semibold shadow-md"
                                                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                }`}
                                        >
                                            <span>{item.icon}</span>
                                            <span className="text-sm tracking-wide uppercase font-bold">{item.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    aria-busy={isLoggingOut}
                                    className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors ${isLoggingOut ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                                >
                                    {isLoggingOut && <InlineSpinner className="border-red-200 border-t-red-600" />}
                                    <span className="text-sm font-bold tracking-wide">{isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}</span>
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