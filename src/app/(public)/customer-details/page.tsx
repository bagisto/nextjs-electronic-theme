"use client";

import { Suspense } from "react";
import CustomerLayout from "@components/customer/credentials/customer-detail/CustomerLayout";
import { useAppSelector } from "@/store/hooks";
import { useWishlist } from "@/hooks/useWishlist";
import { useSearchParams } from "next/navigation";

function CustomerDetailContent() {
  const { user } = useAppSelector((state) => state.user);
  const { wishlistItems } = useWishlist();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const customerData = {
    name: user?.name || "Guest User",
    email: user?.email || "",
    avatar: user?.image || undefined,
  };

  return (
    <CustomerLayout
      customerData={customerData}
      wishlistItems={wishlistItems}
      initialTab={initialTab}
    />
  );
}

export default function CustomerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-neutral-950" />}>
      <CustomerDetailContent />
    </Suspense>
  );
}