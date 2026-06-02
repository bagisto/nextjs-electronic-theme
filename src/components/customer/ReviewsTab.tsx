"use client";

import { NextImage } from "@/components/common/NextImage";
import { useCustomerReviews } from "@/hooks/useCustomerReviews";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/catalog/Pagination";
import { REVIEWS_ITEMS_PER_PAGE } from "@/utils/constants";

export default function ReviewsTab() {
    const searchParams = useSearchParams();

    const currentPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) - 1 : 0;
    const after = searchParams.get("cursor");
    const before = searchParams.get("before");

    const { reviews, totalCount, pageInfo, loading, error } = useCustomerReviews({
        pageSize: REVIEWS_ITEMS_PER_PAGE,
        page: currentPage,
        after,
        before,
    });


    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                        key={star}
                        className={`w-5 h-5 ${star <= rating ? "text-yellow-400" : "text-neutral-300 dark:text-neutral-700"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="reviews-tab">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    My Reviews
                </h2>
                <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="reviews-tab">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                    My Reviews
                </h2>
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 text-center">
                    <p className="text-red-500">Failed to load reviews. Please try again.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reviews-tab">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    My Reviews
                </h2>
                
            </div>

            {reviews.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12 text-center">
                    <p className="text-neutral-500 dark:text-neutral-400">
                        You havent written any reviews yet.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-6 py-2 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review: any) => (
                        <div
                            key={review.id}
                            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                {review.productImage && (
                                    <div className="w-20 h-20 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                                        <NextImage
                                            src={review.productImage}
                                            alt={review.productName}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link 
                                                href={`/product/${review.productUrlKey}`}
                                                className="text-lg font-semibold text-neutral-900 dark:text-white hover:text-teal-500 transition-colors"
                                            >
                                                {review.productName}
                                            </Link>
                                            <div className="mt-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {review.title && (
                                        <h4 className="mt-3 font-medium text-neutral-900 dark:text-white">
                                            {review.title}
                                        </h4>
                                    )}
                                    
                                    {review.comment && (
                                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                            {review.comment}
                                        </p>
                                    )}
                                    
                                    <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">
                                        {review.date}
                                        {review.verified && " • Verified Purchase"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalCount > REVIEWS_ITEMS_PER_PAGE && (
                <div className="mt-8">
                    <Pagination
                        itemsPerPage={REVIEWS_ITEMS_PER_PAGE}
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
