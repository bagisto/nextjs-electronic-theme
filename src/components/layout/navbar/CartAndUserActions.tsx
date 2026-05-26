import { Suspense } from "react";
import CartButton from "@/components/cart/CartButton";
import UserAccount from "@components/customer/credentials";
import ThemeSwitcherWrapper from "@components/theme/theme-switch";
import { IconSkeleton } from "@/components/common/skeleton/IconSkeleton";
import SearchButton from "./SearchButton";

// Adapted from v3: this project resolves auth on the client (CredentialModal),
// so there is no server-side session/profile fetch here. Search uses this
// project's earlier SearchButton + SearchDrawer (icon opens a full drawer).
export function CartAndUserActions() {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <div className="flex">
        <SearchButton />
      </div>
      <Suspense fallback={<IconSkeleton />}>
        <div className="hidden lg:flex">
          <UserAccount />
        </div>
      </Suspense>
      <div className="hidden lg:flex">
        <CartButton />
      </div>
      <div className="flex">
        <ThemeSwitcherWrapper />
      </div>
    </div>
  );
}
