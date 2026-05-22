"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { ProductMoreDetails } from "./ProductMoreDetail";
import { ProductData, ProductReviewNode } from "../type";
import DocumentIcon from "@/components/common/icons/DocumentIcon";

type TabId = "description" | "specifications" | "reviews";

export function ProductTabsWrapper({
  product,
  reviews,
  totalReview,
}: {
  product: ProductData;
  reviews: ProductReviewNode[];
  totalReview: number;
}) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<TabId, HTMLButtonElement>>(new Map());

  const variantSpecs = product?.variants?.edges?.[0]?.node?.attributeValues?.edges?.map(
    (edge: any) => ({
      code: edge?.node?.attribute?.code,
      label: edge?.node?.attribute?.adminName || edge?.node?.attribute?.code,
      value: edge?.node?.value,
    })
  ) || [];

  const productSpecs = (product as any)?.attributeValues?.edges?.map(
    (edge: any) => ({
      code: edge?.node?.attribute?.code,
      label: edge?.node?.attribute?.adminName || edge?.node?.attribute?.code,
      value: edge?.node?.value,
    })
  ) || [];

  const specifications = [...variantSpecs];
  productSpecs.forEach((ps: any) => {
    if (!specifications.find(vs => vs.code === ps.code)) {
      specifications.push(ps);
    }
  });
  const hasDescription = !!(product?.description && product.description.trim() !== "" && product.description !== "<p></p>");
  const hasSpecifications = specifications.length > 0;

  const leftSpecs = specifications.slice(
    0,
    Math.ceil(specifications.length / 2)
  );
  const rightSpecs = specifications.slice(
    Math.ceil(specifications.length / 2)
  );

  // Parse description into table rows
  const descriptionRows = useMemo(() => {
    const desc = product?.description;
    if (!desc || typeof desc !== "string") return [];

    // Try to parse as JSON if it looks like JSON
    try {
      const trimmed = desc.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}") ||
          trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any, index: number) => ({
            attribute: item.attribute || item.key || `Attribute ${index + 1}`,
            value: item.value || item.val || "",
          }));
        } else if (parsed && typeof parsed === "object") {
          return Object.entries(parsed).map(([key, value]) => ({
            attribute: key,
            value: value !== null && value !== undefined ? String(value) : "",
          }));
        }
      }
    } catch {
      // Not valid JSON, continue to plain text parsing
    }

    // Parse as plain text: split by newline, then by first colon
    return desc
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          return {
            attribute: line.substring(0, colonIndex).trim(),
            value: line.substring(colonIndex + 1).trim(),
          };
        }
        return {
          attribute: line,
          value: "",
        };
      });
  }, [product?.description]);

  const tabs: { id: TabId; label: string }[] = [
    ...(hasDescription ? [{ id: "description" as TabId, label: "Description" }] : []),
    ...(hasSpecifications ? [{ id: "specifications" as TabId, label: "Technical Specifications" }] : []),
    { id: "reviews" as TabId, label: `Reviews (${totalReview})` },
  ];

  const [activeTab, setActiveTab] = useState<TabId>(tabs[0]?.id || "reviews");

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeBtn = tabRefs.current.get(activeTab);
    if (activeBtn && tabsRef.current) {
      const containerRect = tabsRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div className="w-full mt-16">
      {/* Tab Header */}
      <div className="relative border-b border-neutral-200 dark:border-neutral-700">
        <div
          ref={tabsRef}
          className="flex overflow-x-auto scrollbar-hide -mb-px"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 md:px-8 py-4 text-sm md:text-base cursor-pointer font-semibold whitespace-nowrap transition-colors duration-200 ${activeTab === tab.id
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Animated underline indicator */}
        <span
          className="absolute bottom-0 h-[2px] bg-neutral-900 dark:bg-white transition-all duration-300 ease-in-out"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
      </div>

      {/* Tab Content */}
      <div className="pt-8 pb-4">
        {/* Description */}
        {activeTab === "description" && (
          <div className="animate-in fade-in duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Attribute
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200 dark:bg-neutral-900 dark:divide-neutral-800">
                  {descriptionRows.length > 0 ? (
                    descriptionRows.map((row, index) => (
                      <tr key={index} className={`${index % 2 === 0 ? "bg-neutral-50 dark:bg-neutral-800/50" : "bg-white dark:bg-neutral-900"}`}>
                        <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                          {row.attribute}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                          {row.value}
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Sample data for verification
                    <tr>
                      <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                        Sample Attribute
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700 dark:text-neutral-300">
                        Sample Value
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Specifications */}
        {activeTab === "specifications" && (
          <div className="animate-in fade-in duration-300">
            {specifications.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Left Column */}
                  <div>
                    {leftSpecs.map((spec: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-5 py-4 ${index % 2 === 0
                            ? "bg-neutral-50 dark:bg-neutral-800/50"
                            : "bg-white dark:bg-neutral-900"
                          } ${index < leftSpecs.length - 1
                            ? "border-b border-neutral-100 dark:border-neutral-800"
                            : ""
                          }`}
                      >
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {spec.label}
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-700">
                    {rightSpecs.map((spec: any, index: number) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-5 py-4 ${index % 2 === 0
                            ? "bg-neutral-50 dark:bg-neutral-800/50"
                            : "bg-white dark:bg-neutral-900"
                          } ${index < rightSpecs.length - 1
                            ? "border-b border-neutral-100 dark:border-neutral-800"
                            : ""
                          }`}
                      >
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {spec.label}
                        </span>
                        <span className="text-sm font-medium text-neutral-900 dark:text-white text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <DocumentIcon
                  className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-4"
                />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  No specifications available for this product.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === "reviews" && (
          <div className="animate-in fade-in duration-300">
            <ProductMoreDetails
              description={product?.description ?? ""}
              additionalData={[]}
              productId={product?.id ?? ""}
              reviews={reviews}
              totalReview={totalReview}
            />
          </div>
        )}
      </div>
    </div>
  );
}