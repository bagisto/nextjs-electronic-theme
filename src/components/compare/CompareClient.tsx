"use client";

import { useState } from "react";
import { useCompare } from "@/hooks/useCompare";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, HomeIcon, ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { useAddProduct } from "@/hooks/useAddToCart";
import { productRequiresOptions } from "@/utils/addToCartValidation";
import { InlineSpinner } from "@/components/common/PageLoader";

export default function CompareClient() {
    const router = useRouter();
    const { onAddToCart } = useAddProduct();
    const { compareItems, loading, removeFromCompare } = useCompare();
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [addingToCartId, setAddingToCartId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const handleRemove = async (id: string) => {
        if (removingId) return;
        setRemovingId(id);
        try {
            await removeFromCompare(id);
        } finally {
            setRemovingId(null);
        }
    };

    const handleAddToCart = async (product: { id: string; type?: string; urlKey?: string }) => {
        if (productRequiresOptions(product.type) && product.urlKey) {
            router.push(`/product/${product.urlKey}`);
            return;
        }
        if (addingToCartId) return;
        setAddingToCartId(product.id);
        try {
            const CompareId = product.id.split("/").pop() || "";
            await onAddToCart({ productId: CompareId?.toString(), quantity: 1 });
        } finally {
            setAddingToCartId(null);
        }
    };

    const handleDeleteAll = async () => {
        if (isDeletingAll) return;
        setIsDeletingAll(true);
        try {
            for (const item of compareItems) {
                await removeFromCompare(item.id);
            }
        } finally {
            setIsDeletingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 md:py-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs md:text-sm text-neutral-500 mb-6 md:mb-8">
                <Link href="/" className="hover:text-neutral-900 transition-colors">
                    <HomeIcon className="w-4 h-4" />
                </Link>
                <ChevronRightIcon className="w-3 h-3" />
                <span className=" font-medium whitespace-nowrap">Product Compare</span>
            </nav>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white hidden sm:block invisible">Product Comparison</h1>
                {compareItems.length > 0 && (
                    <button
                        onClick={handleDeleteAll}
                        disabled={isDeletingAll}
                        aria-busy={isDeletingAll}
                        className={`bg-neutral-900 dark:bg-neutral-800 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-md flex items-center gap-2 ml-auto sm:ml-0 ${isDeletingAll ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                    >
                        {isDeletingAll && <InlineSpinner className="border-white/40 border-t-white" />}
                        {isDeletingAll ? "Deleting..." : "Delete All"}
                    </button>
                )}
            </div>

            {compareItems.length === 0 ? (
                <div className="text-center py-16 md:py-24 bg-neutral-50 dark:bg-neutral-900 rounded-2xl md:rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 px-6">
                    <div className="mb-4 text-neutral-300">
                        <TrashIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold mb-2 dark:text-white">Your comparison list is empty</h2>
                    <p className="text-sm md:text-base text-neutral-500 mb-6 max-w-xs mx-auto">Looks like you haven&apos;t added anything to compare yet.</p>
                    <Link
                        href="/"
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity inline-block text-sm cursor-pointer"
                    >
                        Go Shopping
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto comparison-container border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-sm">
                    <table className="w-full border-collapse border-spacing-0">
                        <thead>
                            <tr>
                                <th className="sticky-col min-w-[140px] md:min-w-[200px] p-4 md:p-6 text-left font-bold text-base md:text-lg text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 z-20">
                                    {/* Empty corner header */}
                                </th>
                                {compareItems.map((item: any) => {
                                    const { id, product } = item;
                                    const { 
                                        name, 
                                        baseImageUrl, 
                                        price, 
                                        specialPrice, 
                                        urlKey 
                                    } = product || {};
                                    
                                    return (
                                        <th key={id} className="min-w-[352px] md:min-w-[368px] p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 relative align-top bg-white dark:bg-neutral-950">
                                            <div className="product-card text-left w-[320px] relative">
                                                <div className="image-wrapper relative w-[320px] h-[348px] bg-neutral-50 dark:bg-neutral-900 rounded-xl md:rounded-2xl overflow-hidden mb-4 group ring-1 ring-neutral-100 dark:ring-neutral-800 mx-auto">
                                                    <Link href={`/product/${urlKey}`} className="block w-full h-full">
                                                        <Image 
                                                            src={baseImageUrl || "/placeholder-product.png"} 
                                                            alt={name || "Product"}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </Link>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleRemove(id);
                                                        }}
                                                        disabled={removingId === id || isDeletingAll}
                                                        aria-busy={removingId === id || isDeletingAll}
                                                        className={`absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 dark:bg-neutral-800/90 p-2 md:p-2.5 rounded-full shadow-lg border border-neutral-100 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-all z-10 backdrop-blur-sm ${removingId === id || isDeletingAll ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                                                        title="Remove from comparison"
                                                    >
                                                        {removingId === id || isDeletingAll ? (
                                                            <InlineSpinner className="border-red-200 border-t-red-500" />
                                                        ) : (
                                                            <TrashIcon className="w-4 h-4 md:w-5 md:h-5" />
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                        disabled={addingToCartId === product?.id}
                                                        aria-busy={addingToCartId === product?.id}
                                                        className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 bg-white dark:bg-neutral-800 p-2 md:p-2.5 rounded-full shadow-lg border border-neutral-100 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors z-10 ${addingToCartId === product?.id ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                                                        title="Add to cart"
                                                    >
                                                        {addingToCartId === product?.id ? (
                                                            <InlineSpinner />
                                                        ) : (
                                                            <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 text-neutral-900 dark:text-white" />
                                                        )}
                                                    </button>
                                                </div>
                                                
                                                <Link href={`/product/${urlKey}`} className="block group">
                                                    <h3 className="text-sm md:text-base font-bold text-neutral-900 dark:text-white line-clamp-2 mb-2 leading-tight h-10 md:h-12 group-hover:text-primary transition-colors">
                                                        {name}
                                                    </h3>
                                                </Link>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base md:text-lg font-bold text-neutral-900 dark:text-white">
                                                        ${specialPrice || price}
                                                    </span>
                                                    {specialPrice && (
                                                        <span className="text-xs md:text-sm text-neutral-400 line-through">
                                                            ${price}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Customer Ratings */}
                            <tr>
                                <td className="sticky-col p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 z-10 text-xs md:text-sm">
                                    Customer Ratings
                                </td>
                                {compareItems.map((item: any) => {
                                    const reviews = item.product?.reviews?.edges || [];
                                    const avgRating = reviews.length > 0
                                        ? reviews.reduce((acc: number, { node }: any) => acc + (node?.rating || 0), 0) / reviews.length
                                        : 0;

                                    return (
                                        <td key={item.id} className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                            <div className="flex items-center gap-0.5 md:gap-1 mb-1">
                                                {reviews.length > 0 ? (
                                                    <>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <StarIcon
                                                                key={star}
                                                                className={`w-3 h-3 md:w-4 md:h-4 ${star <= Math.round(avgRating) ? "text-neutral-900 dark:text-white" : "text-neutral-200 dark:text-neutral-700"}`}
                                                            />
                                                        ))}
                                                        <span className="text-[10px] md:text-xs text-neutral-400 ml-2 whitespace-nowrap">({reviews.length} {reviews.length > 1 ? 'Reviews' : 'Review'})</span>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] md:text-xs text-neutral-400 ml-2 whitespace-nowrap">No reviews</span>
                                                )}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Short Description */}
                            <tr>
                                <td className="sticky-col p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-white bg-white dark:bg-neutral-950 z-10 text-xs md:text-sm">
                                    Short Description
                                </td>
                                {compareItems.map((item: any) => (
                                    <td key={item.id} className="p-4 md:p-6 border-b border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs md:text-sm bg-white dark:bg-neutral-950 align-top">
                                        <div 
                                            className="line-clamp-6 leading-relaxed" 
                                            dangerouslySetInnerHTML={{ __html: item.product?.shortDescription || "No description available" }} 
                                        />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
                .comparison-container::-webkit-scrollbar {
                    height: 6px;
                }
                .comparison-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .comparison-container::-webkit-scrollbar-thumb {
                    background: #e5e5e5;
                    border-radius: 10px;
                }
                .dark .comparison-container::-webkit-scrollbar-thumb {
                    background: #333;
                }
                .sticky-col {
                    position: sticky;
                    left: 0;
                    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.05);
                }
                .dark .sticky-col {
                    box-shadow: 4px 0 8px -4px rgba(0,0,0,0.2);
                }
                @media (max-width: 768px) {
                    .sticky-col {
                        min-width: 120px;
                        font-size: 11px;
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
}
