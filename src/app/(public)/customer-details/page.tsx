"use client";

import { Suspense } from "react";
import CustomerLayout from "@components/customer/credentials/customer-detail/CustomerLayout";
import { useAppSelector } from "@/store/hooks";
import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";

const TAB_LABELS: Record<string, string> = {
  profile: "Profile",
  addresses: "Addresses",
  wishlist: "Wishlist",
  orders: "Orders",
  reviews: "Reviews",
};

function CustomerDetailContent() {
  const { user } = useAppSelector((state) => state.user);
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";

  const customerData = {
    name: user?.name || "Guest User",
    email: user?.email || "",
    avatar: user?.image || undefined,
  };

  const tabLabel = TAB_LABELS[initialTab] || "Account";

  return (
    <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8 py-6">
      <Breadcrumb items={[
        { name: "Home", href: "/" },
        { name: "Account", href: "/customer-details" },
        { name: tabLabel, href: `/customer-details?tab=${initialTab}` },
      ]} />
      <CustomerLayout
        customerData={customerData}
        initialTab={initialTab}
      />
    </div>
  );
}

export default function CustomerDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-neutral-950" />}>
      <CustomerDetailContent />
    </Suspense>
  );
}