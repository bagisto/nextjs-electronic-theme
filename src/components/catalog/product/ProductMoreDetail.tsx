import React, { FC } from "react";
import ReviewSection from "../review/ReviewSection";
import ReviewDetail from "../review/ReviewDetail";
import { additionalDataTypes } from "../type";

export const ProductMoreDetails: FC<{
  description: string;
  additionalData: additionalDataTypes[];
  productId: string;
  reviews: any[];
  totalReview: number;
}> = ({ additionalData: _additionalData, reviews, productId, totalReview }) => {
  return (
    <div>
      {/* Reviews */}
      {totalReview > 0 ? (
        <ReviewDetail reviewDetails={reviews} totalReview={totalReview} productId={productId} />
      ) : (
        <ReviewSection productId={productId} />
      )}
    </div>
  );
}
