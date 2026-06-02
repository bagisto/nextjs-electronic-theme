"use client";
import { Price } from "@/components/theme/ui/Price";
import { AddToCart } from "@/components/cart/AddToCart";
import { VariantSelector } from "./VariantSelector";
import { useState } from "react";
import { getVariantInfo } from "@/hooks/useVariantInfo";
import { useSearchParams } from "next/navigation";
import { ProductData, ProductReviewNode } from "../type";
import { safeCurrencyCode, safePriceValue, safeParse } from "@utils/helper";
import { StarRating } from "@/components/common/StarRating";

import CheckIcon from "@/components/common/icons/CheckIcon";
import LightningIcon from "@/components/common/icons/LightningIcon";
import ReturnIcon from "@/components/common/icons/ReturnIcon";
import WhatsAppIcon from "@/components/common/icons/WhatsAppIcon";
import XIcon from "@/components/common/icons/XIcon";
import CopyIcon from "@/components/common/icons/CopyIcon";
import { InfoItem } from "@/components/common/InfoItem";
import { SocialButton } from "@/components/common/button/SocialButton";
import { FaceBookIcon } from "@components/common/icons";
import type { ShippingInfoItem } from "@/utils/bagisto-client";
import type { ReactNode } from "react";

import { useToast } from "@/providers/ToastProvider";

const SHIPPING_INFO_ICON_CLASS = "w-5 h-5 text-green-500 mt-0.5 shrink-0";
const SHIPPING_INFO_ICONS: Record<string, ReactNode> = {
  check: <CheckIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "icon-check": <CheckIcon className={SHIPPING_INFO_ICON_CLASS} />,
  shipping: <CheckIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "free-shipping": <CheckIcon className={SHIPPING_INFO_ICON_CLASS} />,
  lightning: <LightningIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "icon-lightning": <LightningIcon className={SHIPPING_INFO_ICON_CLASS} />,
  delivery: <LightningIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "fast-delivery": <LightningIcon className={SHIPPING_INFO_ICON_CLASS} />,
  return: <ReturnIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "icon-return": <ReturnIcon className={SHIPPING_INFO_ICON_CLASS} />,
  returns: <ReturnIcon className={SHIPPING_INFO_ICON_CLASS} />,
  "easy-returns": <ReturnIcon className={SHIPPING_INFO_ICON_CLASS} />,
};

function resolveShippingIcon(key: string | undefined, index: number): ReactNode {
  if (key && SHIPPING_INFO_ICONS[key]) return SHIPPING_INFO_ICONS[key];
  const fallbacks = [
    <CheckIcon key="c" className={SHIPPING_INFO_ICON_CLASS} />,
    <LightningIcon key="l" className={SHIPPING_INFO_ICON_CLASS} />,
    <ReturnIcon key="r" className={SHIPPING_INFO_ICON_CLASS} />,
  ];
  return fallbacks[index % fallbacks.length];
}

export function ProductDescription({
  product,
  reviews,
  totalReview,
  productSwatchReview,
  shippingInfo,
}: {
  product: ProductData;
  slug: string;
  reviews: ProductReviewNode[];
  totalReview: number;
  productSwatchReview: any;
  shippingInfo?: ShippingInfoItem[];
}) {
  const { addToast } = useToast();
  const priceValue = safePriceValue(product);
  const currencyCode = safeCurrencyCode(product);
  const configurableProductIndexData = (safeParse(
    productSwatchReview?.combinations
  ) || []) as never[];
  const searchParams = useSearchParams();
  const [userInteracted, setUserInteracted] = useState(false);

  const superAttributes = productSwatchReview?.superAttributeOptions
    ? safeParse(productSwatchReview.superAttributeOptions)
    : productSwatchReview?.superAttributes?.edges?.map(
      (e: { node: any }) => e.node
    ) || [];

  const variantInfo = getVariantInfo(
    product?.type === "configurable",
    searchParams.toString(),
    superAttributes,
    productSwatchReview?.combinations
  );

  // Calculate discount percentage
  const specialPrice = product?.specialPrice ? Number(product?.specialPrice) : null;
  const originalPrice = Number(priceValue);
  const discountPercent = specialPrice && originalPrice > specialPrice
    ? Math.round(((originalPrice - specialPrice) / originalPrice) * 100)
    : 0;

  // Get average rating from reviews
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum: number, r: ProductReviewNode) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  // Social share handlers
  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Check out this product: ${product?.name}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`);
  };

  const handleFacebookShare = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };

  const handleTwitterShare = () => {
    const url = window.location.href;
    const text = `Check out this product: ${product?.name}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`);
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        addToast({
          message: "Link copied to clipboard!",
          type: "success",
          duration: 3000
        });
      } else {
        // Fallback for non-secure contexts or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          addToast({
            message: "Link copied to clipboard!",
            type: "success",
            duration: 3000
          });
        } else {
          throw new Error("Unable to copy");
        }
      }
    } catch (error) {
      console.error("Failed to copy link:", error);
      addToast({
        message: "Failed to copy link. Please try again.",
        type: "danger",
        duration: 3000
      });
    }
  };

  // Extract brand from product - get from attributeValues
  const specifications = product?.variants?.edges?.[0]?.node?.attributeValues?.edges?.map(
    (edge: any) => ({
      code: edge?.node?.attribute?.code,
      label: edge?.node?.attribute?.adminName || edge?.node?.attribute?.code,
      value: edge?.node?.value,
    })
  ) || [];

  // Find brand in specifications
  const brandSpec = specifications.find((s: any) =>
    s.code?.toLowerCase()?.includes('brand') ||
    s.label?.toLowerCase()?.includes('brand') ||
    s.code?.toLowerCase()?.includes('manufacturer')
  );
  const brandName = brandSpec?.value?.toUpperCase();

  return (
    <div className="w-full">
      {/* Brand Name - Small uppercase, light gray */}
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
        {brandName}
      </p>

      {/* Product Title - Large bold H1, 2-line wrap */}
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2">
        {product?.name}
      </h1>

      {/* Stock Badge - Green rounded pill, white text */}
      {/* <div className="mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
          IN STOCK
        </span>
      </div> */}

      {/* Rating Row - 5 stars with rating text */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5">
          <StarRating
            rating={averageRating}
            enablePartial={true}
            size="w-4 h-4"
            emptyClass="fill-neutral-300 dark:fill-neutral-600"
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            ({totalReview} {totalReview > 1 ? "Ratings" : "Rating"})
          </span>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="flex flex-wrap items-baseline gap-3 mb-6">
        {/* Current Price - Bold, large */}
        {product?.type === "simple" ? (
          <>
            <Price
              amount={String(product?.minimumPrice)}
              currencyCode={currencyCode}
              className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white"
            />
            {specialPrice && specialPrice < originalPrice && (
              <>
                <Price
                  amount={String(originalPrice)}
                  currencyCode={currencyCode}
                  className="text-xl text-neutral-400 line-through dark:text-neutral-500"
                />
                {/* Discount Badge - Green rounded pill */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-500 text-white">
                  -{discountPercent}%
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <Price
              amount={String(specialPrice || priceValue)}
              currencyCode={currencyCode}
              className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white"
            />
            {specialPrice && specialPrice < originalPrice && (
              <>
                <Price
                  amount={String(originalPrice)}
                  currencyCode={currencyCode}
                  className="text-xl text-neutral-400 line-through dark:text-neutral-500"
                />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-500 text-white">
                  -{discountPercent}%
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Description Paragraph - Medium gray, comfortable line height, 3-4 lines */}
      <div className="mb-6">
        <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-4">
          {product?.description?.replace(/<[^>]*>/g, '') || "No description available."}
        </p>
      </div>

      {/* Product Attributes - Dynamic from API */}
      {specifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {specifications.slice(0, 5).map((spec: any, index: number) => (
            <div key={index} className="flex items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="text-sm text-neutral-400 w-32">{spec.label}</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{spec.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Variant Selectors */}
      <div className="mb-6">
        <VariantSelector
          variants={variantInfo?.variantAttributes}
          setUserInteracted={setUserInteracted}
          possibleOptions={variantInfo.possibleOptions}
        />
      </div>



      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <AddToCart
          index={configurableProductIndexData}
          productId={product?.id || ""}
          productSwatchReview={productSwatchReview}
          userInteracted={userInteracted}
          downloadableLinks={product?.downloadableLinks}
          downloadableSamples={product?.downloadableSamples}
          bookingProducts={(product as any)?.bookingProducts || productSwatchReview?.bookingProducts}
          groupedProducts={(product as any)?.groupedProducts}
          bundleOptions={(product as any)?.bundleOptions}
          basePrice={Number(priceValue) || 0}
          currencyCode={currencyCode}
        />
      </div>

      <div className="flex items-center gap-3">
        <p className="text-base font-medium text-neutral-700 dark:text-neutral-300">Share:</p>
        <div className="flex gap-3">
          <SocialButton
            onClick={handleWhatsAppShare}
            className="bg-green-500 text-white hover:bg-green-600"
            label="Share on WhatsApp"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </SocialButton>
          <SocialButton
            onClick={handleFacebookShare}
            className="bg-blue-600 text-white hover:bg-blue-700"
            label="Share on Facebook"
          >
            <FaceBookIcon className="w-5 h-5" />
          </SocialButton>
          <SocialButton
            onClick={handleTwitterShare}
            className="bg-black text-white hover:bg-neutral-800"
            label="Share on Twitter"
          >
            <XIcon className="w-5 h-5" />
          </SocialButton>
          <SocialButton
            onClick={handleCopyLink}
            className="bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
            label="Copy link"
          >
            <CopyIcon className="w-5 h-5" />
          </SocialButton>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8 mt-8 ">

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-5">
          <h3 className="text-base font-semibold mb-4 text-neutral-900 dark:text-white">Shipping Info</h3>
          <div className="flex flex-col md:flex-row gap-3">
            {shippingInfo && shippingInfo.length > 0 ? (
              shippingInfo.map((item, index) => (
                <InfoItem
                  key={`${item.title}-${index}`}
                  icon={resolveShippingIcon(item.icon, index)}
                  title={item.title}
                  subtitle={item.subtitle ?? ""}
                />
              ))
            ) : (
              <>
                <InfoItem
                  icon={<CheckIcon className={SHIPPING_INFO_ICON_CLASS} />}
                  title="Free Shipping"
                  subtitle="On orders over $50"
                />
                <InfoItem
                  icon={<LightningIcon className={SHIPPING_INFO_ICON_CLASS} />}
                  title="Fast Delivery"
                  subtitle="2-3 business days"
                />
                <InfoItem
                  icon={<ReturnIcon className={SHIPPING_INFO_ICON_CLASS} />}
                  title="Easy Returns"
                  subtitle="30-day return policy"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

