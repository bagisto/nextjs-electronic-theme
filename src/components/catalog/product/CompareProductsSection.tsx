"use client";

import React, { FC, useState } from "react";
import Image from "next/image";
import { ProductNode } from "../type";
import { getImageUrl, baseUrl, NOT_IMAGE } from "@/utils/constants";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/24/solid";
import { useCompare } from "@/hooks/useCompare";
import { useAppSelector } from "@/store/hooks";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";
import { calculateAverageRating } from "@utils/helper";
import { Shimmer } from "@/components/common/Shimmer";

interface CompareProductsSectionProps {
    currentProduct: ProductNode;
}


export const CompareProductsSection: FC<CompareProductsSectionProps> = ({
    currentProduct,
}) => {
    const { compareItems, loading } = useCompare();
    const { user } = useAppSelector((state) => state.user);
    const isLoggedIn = !!user?.email;
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [isImageLoaded, setIsImageLoaded] = useState<boolean[]>([]);
    
    const handleImageLoad = (index: number) => {
        setIsImageLoaded(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
        });
    };
    // Get comparison products from the compare hook
    const comparisonProducts = compareItems?.map((item: any) => item?.product) || [];

    // If no compare items, don't render
    if (!isLoggedIn || comparisonProducts.length === 0) {
        return null;
    }

    const productsToCompare = [
        { ...currentProduct, isCurrent: true, label: "This item" },
        ...comparisonProducts.slice(0, 3).map((p: any) => ({
            ...p,
            isCurrent: false,
            label: "Compare"
        }))
    ];

    // Show loading state when fetching compare items
    if (loading) {
        return (
            <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-neutral-900 dark:text-white">
                    Compare with similar itemss
                </h2>
                <div className="flex items-center justify-center p-8 md:p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
            </div>
        );
    }

    // Comparison rows based on available product fields
    const comparisonRows = [
        { label: "Customer Ratings", key: "ratings" },
        { label: "SKU", key: "sku" },
        { label: "Description", key: "shortDescription" },
    ];

    return (
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-neutral-900 dark:text-white">
                Compare with similar items
            </h2>

            <div className="overflow-x-auto custom-scrollbar border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        height: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #e5e5e5;
                        border-radius: 10px;
                    }
                    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #333;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #00D9B5;
                    }
                `}</style>                <table className={`w-full text-left border-collapse ${isMobile ? "min-w-[600px]" : "min-w-[1000px]"}`}>
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                            <th className={`p-4 md:p-6 sticky left-0 z-20 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 ${isMobile ? "w-32 min-w-[128px]" : "w-1/5 min-w-[240px]"}`}>
                                <span className="text-xs md:text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Features</span>
                            </th>
                            {productsToCompare.map((product, idx) => (
                                <th key={idx} className={`p-4 md:p-6 vertical-top bg-white dark:bg-neutral-900 ${isMobile ? "w-64 min-w-[256px]" : "w-[360px] min-w-[360px]"} ${idx === 0 ? "bg-green-50/10 dark:bg-green-900/5" : ""}`}>
                                    <span className={`text-[10px] md:text-xs font-bold uppercase mb-3 md:mb-4 block ${product.isCurrent ? "text-green-600 dark:text-green-400" : "text-neutral-400"}`}>
                                        {product.label}
                                    </span>
                                    <Link
                                     href={`/product/${product.urlKey}`}
                                     className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 line-clamp-2 mb-2 md:mb-3 min-h-[32px] md:min-h-[40px] leading-relaxed transition-colors"
                                 >
                                    <div className={`relative mb-4 md:mb-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg md:rounded-xl overflow-hidden group ${isMobile ? "w-full aspect-[4/5]" : "w-[320px] h-[348px]"}`}>
                                        {!isImageLoaded[idx] && (
                                            <Shimmer className="absolute inset-0 z-10" rounded="lg" />
                                        )}
                                        <Image
                                            src={getImageUrl(product.baseImageUrl, baseUrl, NOT_IMAGE) as string}
                                            alt={product.name || ""}
                                            width={320}
                                            height={348}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onLoad={() => handleImageLoad(idx)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                        <button className="absolute cursor-pointer bottom-2 md:bottom-3 right-2 md:right-3 p-2 md:p-2.5 bg-white dark:bg-neutral-800 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-green-500 hover:text-white border border-neutral-100 dark:border-neutral-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                        </Link>
                                    <Link
                                        href={`/product/${product.urlKey}`}
                                        className="text-xs md:text-sm font-semibold text-neutral-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 line-clamp-2 mb-2 md:mb-3 min-h-[32px] md:min-h-[40px] leading-relaxed transition-colors"
                                    >
                                        {product.name}
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg md:text-xl font-bold text-neutral-900 dark:text-white">
                                            ${product.price}
                                        </span>
                                        {product.specialPrice && product.specialPrice !== "0" && (
                                            <span className="text-xs md:text-sm text-neutral-400 line-through decoration-neutral-300">
                                                ${product.specialPrice}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {comparisonRows.map((row, rowIdx) => (
                            <tr
                                key={rowIdx}
                                className="border-b border-neutral-100 dark:border-neutral-800/60 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group"
                            >
                                <td className="p-4 md:p-6 text-xs md:text-sm font-semibold text-neutral-700 dark:text-neutral-300 sticky left-0 z-10 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800/40">
                                    {row.label}
                                </td>
                                {productsToCompare.map((product, prodIdx) => {
                                    let value: React.ReactNode = "-";

                                    if (row.key === "ratings") {
                                        const avgRating = calculateAverageRating(product.reviews);
                                        const reviewCount = product.reviews?.edges?.length || 0;

                                        if (reviewCount > 0) {
                                            value = (
                                                <div className="flex flex-col gap-1 md:gap-1.5">
                                                    <div className="flex text-amber-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <StarIcon
                                                                key={i}
                                                                className={`h-3 w-3 md:h-4 md:w-4 ${i < Math.floor(avgRating) ? "fill-current" : "text-neutral-200 dark:text-neutral-700"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] md:text-xs font-medium text-neutral-500">
                                                        {avgRating} ({reviewCount})
                                                    </span>
                                                </div>
                                            );
                                        } else {
                                            value = (
                                                <span className="text-[10px] md:text-xs text-neutral-400">No reviews</span>
                                            );
                                        }
                                    } else if (row.key === "sku") {
                                        value = (
                                            <span className="text-xs md:text-sm font-medium text-neutral-900 dark:text-neutral-200">
                                                {product.sku || "-"}
                                            </span>
                                        );
                                    } else if (row.key === "shortDescription") {
                                        value = (
                                            <span className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                                {product.shortDescription || "-"}
                                            </span>
                                        );
                                    }

                                    return (
                                        <td key={prodIdx} className={`p-4 md:p-6 text-xs md:text-sm align-middle ${prodIdx === 0 ? "bg-green-50/5 dark:bg-green-900/5" : ""}`}>
                                            {value}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
