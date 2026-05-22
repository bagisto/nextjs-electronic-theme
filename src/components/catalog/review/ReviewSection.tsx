"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AddProductReview from "./AddProductReview";
import { Button } from "@components/common/button/Button";
import { getCookie } from "@utils/useCookie";
import { IS_GUEST } from "@/utils/constants";

interface ReviewSectionProps {
    productId: string;
    reviews?: Array<any>;
    totalReviews?: number;
}

export default function ReviewSection({ productId}: ReviewSectionProps) {
    const [showForm, setShowForm] = useState(false);
    if (showForm) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 rounded-xl">
                <AddProductReview productId={productId} onClose={() => setShowForm(false)} />
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-12 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
            </div>

            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No Reviews Yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-8">
                Be the first to share your experience and help others make an informed decision.
            </p>

            <ReviewButton setShowForm={setShowForm} className="mx-auto" />
        </div>
    );
}

export const ReviewButton = ({setShowForm, className}: {setShowForm: (show: boolean) => void, className?: string}) => {
    const IsGuest = getCookie(IS_GUEST);
    const router = useRouter();
    const handleAddReview = () => {
        if (IsGuest === "true" || IsGuest === null) {
            router.push("/customer/login");
        } else {
            setShowForm(true);
        }
    };

    return (
        <Button
            title="Write a Review"
            onClick={handleAddReview}
            className={`relative inline-flex items-center justify-center gap-2 cursor-pointer h-fit w-auto px-8 py-3 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold transition-all duration-200 ${className}`}
        >
        </Button>
    );
}
