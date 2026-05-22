"use client";

import { Button } from "@components/common/button/Button";
import { ReviewIcon } from "@components/common/icons/ReviewIcon";
import { GridTileImage } from "@components/theme/ui/grid/Tile";
import { formatDate, getInitials, getReviews } from "@/utils/helper";
import { isArray } from "@/utils/type-guards";
import { Avatar } from "@heroui/react";
import clsx from "clsx";
import { FC, useState } from "react";
import { ReviewDetailProps } from "../type";
import { ReviewButton } from "./ReviewSection";
import AddProductReview from "./AddProductReview";
import StarIcon from "@/components/common/icons/StarIcon";
import CloseIcon from "@/components/common/icons/CloseIcon";
import { StarRating } from "@/components/common/StarRating";

const ReviewDetail: FC<ReviewDetailProps> = ({ reviewDetails, totalReview, productId }) => {
  const [visibleCount, _setVisibleCount] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  if (!Array.isArray(reviewDetails) || reviewDetails.length === 0) {
    return (
      <div className="py-16">
        {/* Modern No Reviews State */}
        <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-neutral-100 mb-6">
            <ReviewIcon />
          </div>

          <h2 className="text-2xl font-bold  mb-3">
            Customer Reviews
          </h2>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            No reviews yet. Be the first to share your experience and help others make an informed decision.
          </p>

          <ReviewButton setShowForm={setShowForm} className="mx-auto" />
        </div>

        {/* Review Form Section */}
        {showForm && (
          <div className="mt-8 bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 mb-6">Write a Review</h3>
            <AddProductReview productId={productId} onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>
    );
  }

  const { reviewAvg, ratingCounts } = getReviews(reviewDetails);

  // Calculate percentages for rating bars
  const totalRatings = Object.values(ratingCounts).reduce((sum: number, val) => sum + (val as number), 0) as number;
  const ratingPercentages: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  Object.entries(ratingCounts).forEach(([star, count]) => {
    const starNum = parseInt(star, 10);
    ratingPercentages[starNum] = totalRatings > 0
      ? Math.round(((count as number) / totalRatings) * 100)
      : 0;
  });

  // Get reviews to display
  const displayedReviews = showAllReviews ? reviewDetails : reviewDetails.slice(0, visibleCount);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-8">
        Customer Reviews ({totalReview})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Rating Summary (approx 320px) */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl p-6 border border-neutral-200 sticky top-4">
            {/* Average Rating */}
            <div className="text-center mb-6">
              <span className="text-6xl font-bold block">
                {reviewAvg.toFixed(1)}
              </span>
              <div className="flex justify-center gap-1 my-3">
                <StarRating rating={reviewAvg} size="w-6 h-6" />
              </div>
              <span className="text-neutral-500">Based on {totalReview} reviews</span>
            </div>

            {/* Rating Distribution Bars */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = ratingPercentages[star];
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <StarIcon
                        className={clsx(
                          "w-4 h-4",
                          star === 5 ? "fill-green-500 text-green-500" :
                          star === 4 ? "fill-green-400 text-green-400" :
                          star === 3 ? "fill-yellow-400 text-yellow-400" :
                          star === 2 ? "fill-orange-400 text-orange-400" :
                          "fill-red-400 text-red-400"
                        )}
                      />
                      <span className="text-sm text-neutral-600">{star}</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-300",
                          star === 5 ? "bg-green-500" :
                          star === 4 ? "bg-green-400" :
                          star === 3 ? "bg-yellow-400" :
                          star === 2 ? "bg-orange-400" : "bg-red-400"
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-500 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Write Review Button */}
            <div className="mt-8">
              <ReviewButton setShowForm={setShowForm} className="w-full justify-center" />
            </div>
          </div>
        </div>

        {/* Right Column - Reviews List & Form (approx 720px) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Review Form (shown when button clicked) */}
          {showForm && (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900">Write a Review</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <AddProductReview productId={productId} onClose={() => setShowForm(false)} />
            </div>
          )}

          {/* Existing Reviews */}
          {displayedReviews.map(
            (
              { name, title, comment, createdAt, rating, images, customer },
              index
            ) => (
              <div
                key={index}
                className="rounded-2xl p-6 border border-neutral-200 hover:shadow-md transition-shadow duration-200"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      className="h-10 w-10 min-w-[40px]"
                      name={getInitials(name)}
                      src={customer?.imageUrl}
                    />
                    <div>
                      <h4 className="font-semibold">
                        {name}
                      </h4>
                      <p className="text-sm text-neutral-500">
                        {formatDate(createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex gap-0.5">
                    <StarRating rating={rating} size="w-4 h-4" />
                  </div>
                </div>

                {/* Review Title */}
                {title && (
                  <h4 className="font-bold text-lg mb-3">
                    {title}
                  </h4>
                )}

                {/* Review Images Gallery */}
                {isArray(images) && images.length > 0 && (
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {images.map((img) => (
                      <GridTileImage
                        key={img.reviewId}
                        fill
                        alt={`${img.reviewId}-review`}
                        className="rounded-lg h-20 w-20 object-cover flex-shrink-0"
                        src={img.url}
                      />
                    ))}
                  </div>
                )}

                {/* Review Comment */}
                <p className=" leading-relaxed mb-4">
                  {comment}
                </p>

                {/* Translate Link */}
                <button className="text-sm text-blue-500 hover:text-blue-600 underline">
                  Translate Review
                </button>
              </div>
            )
          )}

          {/* Load More Button */}
          {reviewDetails.length > visibleCount && !showAllReviews && (
            <div className="flex justify-center pt-4">
              <Button
                title="Load More Reviews"
                onClick={() => {
                  setShowAllReviews(true);
                }}
                className="px-8"
              />
            </div>
          )}

          {/* Show Less Button */}
          {showAllReviews && reviewDetails.length > visibleCount && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowAllReviews(false)}
                className="text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                Show less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
