"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderDetailsView from "./OrderDetailsView";
import { useOrders } from "@/hooks/useOrders";
import Pagination from "@/components/catalog/Pagination";
import { ORDERS_ITEMS_PER_PAGE } from "@/utils/constants";
import {
    ShoppingBagIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function OrdersTab() {
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const { useGetOrders, isLoggedIn } = useOrders();
    const searchParams = useSearchParams();

    const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0;
    const after = searchParams.get("cursor");
    const before = searchParams.get("before");

    const { orders, totalCount, pageInfo, loading } = useGetOrders({
        pageSize: ORDERS_ITEMS_PER_PAGE,
        page: currentPage,
        after,
        before,
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const getStatusColor = (status: string) => {
        const s = (status || "").toLowerCase();
        if (["completed", "complete", "processing", "paid"].includes(s))
            return "bg-green-500";
        if (["pending", "pending_payment", "on_hold"].includes(s))
            return "bg-amber-500";
        if (["canceled", "cancelled", "closed", "fraud"].includes(s))
            return "bg-red-500";
        return "bg-neutral-400";
    };

    if (selectedOrderId) {
        return (
            <div className="orders-tab">
                <OrderDetailsView 
                    orderId={selectedOrderId} 
                    onBack={() => setSelectedOrderId(null)} 
                />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="orders-tab">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    My Orders
                </h2>
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="orders-tab">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    My Orders
                </h2>
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        Please login to view your orders.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-tab">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    My Orders
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Track, view and manage all your orders.
                </p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        You haven&apos;t placed any orders yet.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {orders.map((order: any) => {
                        const itemCount = order.items?.edges?.length || 0;
                        const paymentMethod =
                            order.payment?.methodTitle || "—";
                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ")
                                        setSelectedOrderId(order.id);
                                }}
                                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-green-300 dark:hover:border-green-800 transition-all cursor-pointer"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                    {/* Order identity */}
                                    <div className="flex items-center gap-4 lg:w-[30%] min-w-0">
                                        <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                            <ShoppingBagIcon className="w-6 h-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                                Order #{order.incrementId}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                {formatDate(order.createdAt)} at{" "}
                                                {formatTime(order.createdAt)}
                                            </p>
                                            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${getStatusColor(order.status)}`}
                                                />
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Columns */}
                                    <div className="grid grid-cols-3 gap-3 sm:gap-4 flex-1 lg:px-6 lg:border-l border-neutral-100 dark:border-neutral-800">
                                        <div className="min-w-0">
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                                Items
                                            </p>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
                                                {itemCount} {itemCount === 1 ? "item" : "items"}
                                            </p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                                Total
                                            </p>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1">
                                                ${parseFloat(order.grandTotal || 0).toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                                Payment Method
                                            </p>
                                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mt-1 truncate">
                                                {paymentMethod}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <div className="hidden lg:flex shrink-0 items-center justify-center w-10 h-10 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 group-hover:bg-green-600 group-hover:border-green-600 group-hover:text-white transition-colors">
                                        <ArrowRightIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {orders.length > 0 && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 sm:p-5">
                    <div className="flex shrink-0 items-center justify-center w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                        <ShieldCheckIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Secure &amp; Protected
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                            Your orders and personal information are fully
                            encrypted and secure.
                        </p>
                    </div>
                </div>
            )}

            {totalCount > ORDERS_ITEMS_PER_PAGE && (
                <div className="mt-8">
                    <Pagination
                        itemsPerPage={ORDERS_ITEMS_PER_PAGE}
                        itemsTotal={totalCount}
                        currentPage={currentPage}
                        nextCursor={pageInfo?.endCursor}
                        prevCursor={pageInfo?.startCursor}
                    />
                </div>
            )}
        </div>
    );
}


