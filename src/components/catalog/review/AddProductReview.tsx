"use client";

import { useState } from "react";
import { Textarea } from "@heroui/react";
import { AddRatingStar } from "./AddRatingStar";
import { Button } from "@components/common/button/Button";
import { useCustomToast } from "@/hooks/useToast";
import { useProductReview } from "@/hooks/useProductReview";
import { useAppSelector } from "@/store/hooks";
import Image from "next/image";

import { CreateProductReviewInput } from "@/types/review";
import { AddUploadImage } from "@components/common/icons/AddUploadImage";

export default function AddProductReview({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string>("[]");
  const [reviewInfo, setReviewInfo] = useState({
    title: "",
    comment: "",
    rating: 0,
  });
  const { showToast } = useCustomToast();
  const { createProductReview, isLoading } = useProductReview();
  const { user } = useAppSelector((state) => state.user);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        setImagePreview(base64Data);
        
        const attachmentsArray = [base64Data];
        setAttachments(JSON.stringify(attachmentsArray));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewInfo.rating === 0) {
      showToast("Please select a rating", "warning");
      return;
    }

    try {
      const input: CreateProductReviewInput = {
        productId: Number(productId.split("/").pop()),
        title: reviewInfo.title,
        comment: reviewInfo.comment,
        rating: reviewInfo.rating,
        name: user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`
          : "Guest User",
        email: user?.email || "guest@mail.com",
        attachments: attachments,
      };
      await createProductReview(input);
      setReviewInfo({
        title: "",
        comment: "",
        rating: 0,
      });
      setImageFile(null);
      setImagePreview(null);
      setAttachments("[]");
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      showToast("Failed to submit review. Please try again.", "danger");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto p-4 md:p-6 rounded-xl relative"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image Upload */}
        <div className="space-y-4">
          {imagePreview ? (
            <div className="border-2 w-[120px] h-auto max-h-[120px] border-dashed border-gray-300  rounded-xl text-center transition-colors hover:border-primary-500">
              <div className="space-y-3">
                <div className="relative mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 w-32 h-32 rounded-xl p-6 text-center transition-colors hover:border-primary-500">
              <div>
                <label
                  htmlFor="file-upload"
                  className="mx-auto flex cursor-pointer flex-col items-center justify-center gap-2"
                >
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full">
                    <AddUploadImage />
                  </div>

                  <div className="text-sm text-center">
                    <span className="font-medium">Add Image</span>
                  </div>

                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
          )}
          {imageFile && <p className="text-sm">{imageFile}</p>}
        </div>

        {/* Right Column - Review Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium  mb-1">
              Your Rating
            </label>
            <AddRatingStar
              value={reviewInfo.rating}
              onChange={(value) =>
                setReviewInfo((prev) => ({ ...prev, rating: value }))
              }
              size="size-7"
              className="mt-1"
            />
          </div>

          <Textarea
            label="Title"
            placeholder="Enter review title"
            labelPlacement="outside"
            value={reviewInfo.title}
            onChange={(e) =>
              setReviewInfo((prev) => ({ ...prev, title: e.target.value }))
            }
            minRows={1}
            maxRows={1}
            variant="bordered"
            classNames={{
              input: "text-base",
              label: "text-sm font-medium",
            }}
          />

          <Textarea
            label="Description"
            placeholder="Write your detailed review"
            labelPlacement="outside"
            value={reviewInfo.comment}
            onChange={(e) =>
              setReviewInfo((prev) => ({ ...prev, comment: e.target.value }))
            }
            minRows={5}
            variant="bordered"
            classNames={{
              input: "text-base",
              label: "text-sm font-medium",
            }}
          />

          <Button
            title={isLoading ? "Submitting..." : "Submit Review"}
            type="submit"
            disabled={isLoading}
            className="w-full mt-4"
          />
        </div>
      </div>
    </form>
  );
}
