"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import OrderDetailsView from "./OrderDetailsView";
import { NextImage } from "../common/NextImage";
import { useOrders } from "@/hooks/useOrders";
import Pagination from "@/components/catalog/Pagination";
import { ORDERS_ITEMS_PER_PAGE } from "@/utils/constants";

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
        }).toUpperCase();
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
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
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
                My Orders
            </h2>

            {orders.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        You haven&apos;t placed any orders yet.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {orders.map((order: any) => (
                        <div
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-neutral-400">
                                    #{order.incrementId}
                                </span>
                                <span className="px-5 py-1.5 rounded-full text-xs font-bold bg-[#1A1A1A] text-white dark:bg-white dark:text-black uppercase tracking-wide">
                                    {order.status}
                                </span>
                            </div>

                            <div className="border-b border-neutral-100 dark:border-neutral-800 mb-4"></div>

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                    {formatDate(order.createdAt)} - {formatTime(order.createdAt)}
                                </h3>
                                <p className="text-base font-bold text-neutral-900 dark:text-white">
                                    ${parseFloat(order.grandTotal || 0).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {order.items?.edges?.slice(0, 4).map((itemEdge: any, index: number) => {
                                    const imageUrl = itemEdge.node?.product?.baseImageUrl;
                                    if (!imageUrl) return null;
                                    
                                    return (
                                        <div 
                                            key={index} 
                                            className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 flex items-center justify-center p-2"
                                        >
                                            <NextImage
                                                src={imageUrl}
                                                alt={itemEdge.node?.name || "Product image"}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-90"
                                            />
                                        </div>
                                    );
                                })}
                                {order.items?.edges?.length > 4 && (
                                    <div className="ml-1 text-sm font-semibold text-neutral-400">
                                        +{order.items.edges.length - 4} More
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
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


