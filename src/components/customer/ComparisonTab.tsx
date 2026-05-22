"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompare } from "@/hooks/useCompare";
import Image from "next/image";
import { InlineSpinner } from "@/components/common/PageLoader";

export default function ComparisonTab() {
    const { compareItems, loading, removeFromCompare  } = useCompare();
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (id: string) => {
        if (removingId) return;
        setRemovingId(id);
        try {
            await removeFromCompare(id);
        } finally {
            setRemovingId(null);
        }
    };

    if (loading) {
        return (
            <div className="comparison-tab">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    Product Comparison
                </h2>
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="comparison-tab">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                Product Comparison
            </h2>

            {compareItems.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        No items in your comparison list.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                    >
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 border-b border-neutral-200 dark:border-neutral-800 min-w-[150px]">
                                    Feature
                                </th>
                                {compareItems?.map((item: any) => (
                                    <th key={item.id} className="p-4 border-b border-neutral-200 dark:border-neutral-800 min-w-[200px]">
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className="w-24 h-24 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center justify-center overflow-hidden">
                                                {item?.product?.baseImageUrl ? (
                                                     <Image
                                                        src={item.product.baseImageUrl}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                        width={96}
                                                        height={96}
                                                    />
                                                ) : (
                                                    <div className="text-xs text-neutral-400">No Image</div>
                                                )}
                                            </div>
                                            <Link href={`/product/${item.product.urlKey}`} className="hover:text-teal-500 transition-colors">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-2">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-neutral-900 dark:text-white">
                                                    {item.product.specialPrice ? `$${item.product.specialPrice}` : `$${item.product.price}`}
                                                </span>
                                                {item.product.specialPrice && item.product.specialPrice < item.product.price && (
                                                    <span className="text-sm text-neutral-400 line-through">
                                                        ${item.product.price}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                className={`text-xs text-red-500 hover:text-red-700 underline inline-flex items-center gap-1.5 ${removingId === item.id ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                                                onClick={() => handleRemove(item.id)}
                                                disabled={removingId === item.id}
                                                aria-busy={removingId === item.id}
                                            >
                                                {removingId === item.id && <InlineSpinner className="h-3 w-3 border-red-200 border-t-red-500" />}
                                                {removingId === item.id ? "Removing..." : "Remove"}
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-4 border-b border-neutral-100 dark:border-neutral-800 font-medium text-neutral-700 dark:text-neutral-300">
                                    Description
                                </td>
                                {compareItems.map((item: any) => (
                                    <td key={item.id} className="p-4 border-b border-neutral-100 dark:border-neutral-800 text-center text-neutral-600 dark:text-neutral-400">
                                        <p className="text-sm line-clamp-3">
                                            {item?.product?.shortDescription || "No description available"}
                                        </p>
                                    </td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-4"></td>
                                {compareItems.map((item: any) => (
                                    <td key={item.id} className="p-4 text-center">
                                        <Link
                                            href={`/product/${item.product.urlKey}`}
                                            className="w-full bg-[#00D9B5] hover:bg-[#00C4A3] text-white py-2 rounded-lg font-medium text-sm transition-colors shadow-sm inline-block text-center"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
