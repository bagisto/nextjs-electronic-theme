"use client";

import { useState } from "react";
import ProfileTab from "../../ProfileTab";
import AddressesTab from "../../AddressesTab";
import WishlistContent from "../../WishlistContent";
import OrdersTab from "../../OrdersTab";
import ReviewsTab from "../../ReviewsTab";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { clearUser } from "@/store/slices/user-slice";
import { clearCart } from "@/store/slices/cart-slice";
import { logoutAction } from "@utils/actions";
import { useCustomToast } from '@/hooks/useToast';
import { useGuestCartToken } from "@/hooks/useGuestCartToken";
import { 
    UserIcon, 
    MapPinIcon, 
    HeartIcon, 
    ShoppingBagIcon, 
    StarIcon, 
} from "@heroicons/react/24/outline";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";
import { MobileCustomerLayout } from "./MobileCustomerLayout";
import { DesktopCustomerLayout } from "./DesktopCustomerLayout";

export interface CustomerLayoutProps {
    customerData?: {
        name: string;
        email: string;
        avatar?: string;
    };
    initialTab?: string;
}

export interface CommonLayoutProps {
    customer: { name: string; email: string; avatar?: string };
    navigationItems: any[];
    activeTab: string;
    handleTabChange: (tabId: string) => void;
    handleLogout: () => void;
    isLoggingOut: boolean;
    renderTabContent: () => React.ReactNode;
}

/**
 * MAIN LAYOUT COMPONENT
 */
export default function CustomerLayout({ customerData, initialTab = "profile" }: CustomerLayoutProps) {
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl || initialTab);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { showToast } = useCustomToast();
    const { resetGuestToken } = useGuestCartToken();

    const customer = customerData || {
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "/images/customer-avatar.jpg",
    };

    const navigationItems = [
        { id: "profile", label: "Profile", icon: <UserIcon className="w-6 h-6" /> },
        { id: "addresses", label: "Addresses", icon: <MapPinIcon className="w-6 h-6" /> },
        { id: "wishlist", label: "Wishlist", icon: <HeartIcon className="w-6 h-6" /> },
        { id: "orders", label: "Orders", icon: <ShoppingBagIcon className="w-6 h-6" /> },
        { id: "reviews", label: "Reviews", icon: <StarIcon className="w-6 h-6" /> },
    ];

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const currentParams = new URLSearchParams(searchParams.toString());
        currentParams.set("tab", tabId);
        currentParams.delete("page");
        currentParams.delete("cursor");
        currentParams.delete("before");
        router.replace(`?${currentParams.toString()}`, { scroll: false });
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            const res = await logoutAction();
            if (!res.success) {
                showToast(res.message, "danger");
            }
            await signOut({ callbackUrl: "/customer/login", redirect: false });
            await resetGuestToken();
            dispatch(clearUser());
            dispatch(clearCart());
            showToast("You are logged out successfully!", "success");
            setTimeout(() => {
                router.push("/customer/login");
                router.refresh();
            }, 100);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Logout failed";
            showToast(message, "danger");
            setIsLoggingOut(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileTab />;
            case "addresses": return <AddressesTab />;
            case "wishlist": return <WishlistContent />;
            case "orders": return <OrdersTab />;
            case "reviews": return <ReviewsTab />;
            default: return <WishlistContent />;
        }
    };

    const commonProps = {
        customer,
        navigationItems,
        activeTab,
        handleTabChange,
        handleLogout,
        isLoggingOut,
        renderTabContent
    };

    return (
        <div className="customer-layout-wrapper bg-white dark:bg-neutral-950 min-h-screen">
            {isMobile ? (
                <MobileCustomerLayout {...commonProps} />
            ) : (
                <DesktopCustomerLayout {...commonProps} />
            )}
        </div>
    );
}
