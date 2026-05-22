"use client";
import { useState } from "react";
import { ProductMoreDetails } from "./ProductMoreDetail";
import Prose from "@components/theme/search/Prose";
import { ProductData, ProductReviewNode } from "../type";

type TabType = "description" | "specifications" | "reviews";

export function ProductTabs({
  product,
  reviews,
  totalReview,
  productSwatchReview,
}: {
  product: ProductData;
  reviews: ProductReviewNode[];
  totalReview: number;
  productSwatchReview: any;
}) {
  // Extract specifications from product variants attribute values
  const specifications = product?.variants?.edges?.[0]?.node?.attributeValues?.edges?.map(
    (edge: any) => ({
      code: edge?.node?.attribute?.code,
      label: edge?.node?.attribute?.adminName || edge?.node?.attribute?.code,
      value: edge?.node?.value,
    })
  ) || [];

  // Group specifications into two columns
  const leftSpecs = specifications.slice(0, Math.ceil(specifications.length / 2));
  const rightSpecs = specifications.slice(Math.ceil(specifications.length / 2));

  const hasDescription = !!(product?.description && product.description.trim() !== "" && product.description !== "<p></p>");
  const hasSpecifications = specifications.length > 0;

  const tabs: { id: TabType; label: string }[] = [
    ...(hasDescription ? [{ id: "description" as TabType, label: "Description" }] : []),
    ...(hasSpecifications ? [{ id: "specifications" as TabType, label: "Technical Specifications" }] : []),
    { id: "reviews" as TabType, label: `Reviews (${totalReview})` },
  ];

  const [activeTab, setActiveTab] = useState<TabType>(tabs[0]?.id || "reviews");

  const additionalData =
    productSwatchReview?.attributeValues?.edges?.map(
      (e: { node: any }) => e.node
    ) || [];

  return (
    <div className="w-full mt-12">
      {/* Tab Headers */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 md:px-8 py-4 text-base font-medium transition-colors relative whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "text-green-600 dark:text-green-400"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === "description" && (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <Prose html={product?.description ?? ""} />
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
            {specifications.length > 0 ? (
              <>
                <div className="space-y-4">
                  {leftSpecs.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">{spec.label}</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {rightSpecs.map((spec: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm py-3 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-neutral-600 dark:text-neutral-400">{spec.label}</span>
                      <span className="font-medium text-neutral-900 dark:text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-neutral-500 dark:text-neutral-400">
                  No specifications available for this product.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <ProductMoreDetails
            additionalData={additionalData}
            description={product?.description ?? ""}
            reviews={Array.isArray(reviews) ? reviews : []}
            totalReview={totalReview}
            productId={product?.id ?? ""}
          />
        )}
      </div>
    </div>
  );
}
