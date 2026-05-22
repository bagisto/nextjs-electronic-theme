"use client";

import { useState } from "react";
import { NextImage } from "@/components/common/NextImage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/hooks/useWishlist";
import { TrashIcon } from "@components/common/icons/TrashIcon";
import WishlistSkeleton from "@/components/common/skeleton/WishlistSkeleton";
import { InlineSpinner } from "@/components/common/PageLoader";
import { productRequiresOptions } from "@/utils/addToCartValidation";

interface WishlistItemProps {
    item: {
        id: string;
        product: {
            id: string;
            sku: string;
            type: string;
            isSaleable?: string;
            name: string;
            urlKey: string;
            price: string;
            specialPrice?: string;
            baseImageUrl: string;
            brand?: string;
        };
    };
    onRemove?: (id: string) => void;
    onAddToCart?: (item: WishlistItemProps["item"], quantity: number) => void;
    isAddingToCart?: boolean;
    isRemoving?: boolean;
}

function WishlistItem({ item, onRemove, onAddToCart, isAddingToCart, isRemoving }: WishlistItemProps) {
    const [quantity, setQuantity] = useState(1);
    const { product } = item;

    const handleDecrement = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleIncrement = () => {
        setQuantity(quantity + 1);
    };

    const regularPrice = parseFloat(product.price);
    const salePrice = product.specialPrice ? parseFloat(product.specialPrice) : null;
    const isSaleable = product.isSaleable === undefined || product.isSaleable; // Default to true if undefined

    return (
        <div className="wishlist-item group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-start transition-all duration-200 hover:shadow-lg">

            <button
                onClick={() => onRemove?.(item.id)}
                disabled={isRemoving}
                aria-busy={isRemoving}
                className={`absolute top-4 right-4 z-10 p-2 rounded-full border dark:border-neutral-700 text-red-500 border-red-500 bg-red-50 transition-colors dark:bg-neutral-800 ${isRemoving ? "cursor-wait opacity-60" : "cursor-pointer"}`}
                aria-label="Remove from wishlist"
            >
                {isRemoving ? <InlineSpinner className="border-red-200 border-t-red-500" /> : <TrashIcon />}
            </button>

            <div className="w-full sm:w-32 sm:flex-shrink-0 aspect-square rounded-lg cursor-pointer overflow-hidden bg-neutral-100 dark:bg-neutral-800 relative">
                <Link href={`/product/${product.urlKey}`} className="block w-full h-full">
                    <NextImage
                        src={product.baseImageUrl}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain"
                    />
                </Link>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-w-0 pr-12">
                {product.brand && (
                    <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                        {product.brand}
                    </p>
                )}

                <Link href={`/product/${product.urlKey}`} className="hover:underline">
                    <h3 className="text-base font-medium text-neutral-900 dark:text-white leading-snug line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-neutral-900 dark:text-white">
                        ${salePrice ? salePrice.toFixed(2) : regularPrice.toFixed(2)}
                    </span>
                    {salePrice && (
                        <span className="text-sm text-neutral-400 line-through">
                            ${regularPrice.toFixed(2)}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3">
                    {isSaleable && (
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 h-10">
                            <button
                                onClick={handleDecrement}
                                className="w-8 h-full flex items-center  cursor-pointer justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                                type="button"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-neutral-900 dark:text-white">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                className="w-8 h-full flex items-center cursor-pointer justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition"
                                type="button"
                            >
                                +
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => onAddToCart?.(item, quantity)}
                        disabled={!isSaleable || isAddingToCart}
                        aria-busy={isAddingToCart}
                        className={`h-10 px-6 rounded-full font-medium text-sm flex items-center gap-2 transition-all ${isSaleable
                                ? isAddingToCart
                                    ? "bg-[#00D9B5]/80 text-white cursor-wait"
                                    : "bg-[#00D9B5] hover:bg-[#00C4A3] text-white shadow-sm hover:shadow-md active:scale-95 cursor-pointer"
                                : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed"
                            }`}
                    >
                        {isAddingToCart ? (
                            <InlineSpinner className="border-white/40 border-t-white" />
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        )}
                        {isAddingToCart ? "Adding..." : isSaleable ? "Add to Cart" : "Out of Stock"}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface WishlistContentProps {
    items?: any[];
    isLoading?: boolean;
}

export default function WishlistContent({ items, isLoading }: WishlistContentProps) {
    const router = useRouter();
    const { removeFromWishlist, moveItemToCart, movingToCart, loading: wishlistLoading } = useWishlist();
    const [addingId, setAddingId] = useState<string | null>(null);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const wishlistItems = items || [];

    const isLoadingData = isLoading ?? wishlistLoading;

    if (isLoadingData) {
        return <WishlistSkeleton />;
    }

    const handleRemoveFromWishlist = async (id: string) => {
        if (removingId) return;
        setRemovingId(id);
        try {
            await removeFromWishlist(id);
        } finally {
            setRemovingId(null);
        }
    };

    const handleDeleteAll = async () => {
        if (isDeletingAll) return;
        setIsDeletingAll(true);
        try {
            for (const item of wishlistItems) {
                await removeFromWishlist(item.id);
            }
        } finally {
            setIsDeletingAll(false);
        }
    };

    const handleAddToCart = async (item: any, quantity: number) => {
        const product = item?.product;
        if (productRequiresOptions(product?.type) && product?.urlKey) {
            router.push(`/product/${product.urlKey}`);
            return;
        }
        const moveWishlistToCart = Number(item.id.split("/").pop());
        setAddingId(item.id);
        try {
            await moveItemToCart(moveWishlistToCart, Number(quantity));
        } finally {
            setAddingId(null);
        }
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <svg className="w-10 h-10 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                        Your Wishlist is Empty
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
                        Save your favorite items to your wishlist and shop them anytime.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-3 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-content">
            {wishlistItems.length > 0 && (
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleDeleteAll}
                        disabled={isDeletingAll}
                        aria-busy={isDeletingAll}
                        className={`bg-neutral-900 dark:bg-neutral-800 text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-all shadow-md flex items-center gap-2 ${isDeletingAll ? "cursor-wait opacity-70" : "cursor-pointer"}`}
                    >
                        {isDeletingAll && <InlineSpinner className="border-white/40 border-t-white" />}
                        {isDeletingAll ? "Deleting..." : "Delete All"}
                    </button>
                </div>
            )}
            <div className="space-y-4">
                {wishlistItems.map((item: any, index: number) => (
                    <WishlistItem
                        key={`${item.id}-${index}`}
                        item={item}
                        onRemove={handleRemoveFromWishlist}
                        onAddToCart={handleAddToCart}
                        isAddingToCart={movingToCart && addingId === item.id}
                        isRemoving={removingId === item.id || isDeletingAll}
                    />
                ))}
            </div>
        </div>
    );
}

