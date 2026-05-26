import Link from "next/link";
import { Suspense } from "react";
import LogoIcon from "@components/common/icons/LogoIcon";
import { CategoriesMenu } from "./CategoriesMenu";
import { CartAndUserActions } from "./CartAndUserActions";
import { NavigationSkeleton } from "./NavigationSkeleton";
import { ActionsSkeleton } from "./ActionsSkeleton";
import { NavbarErrorBoundary } from "@/components/error/ErrorBoundary";

export default function Navbar() {
  return (
    <NavbarErrorBoundary>
      <header className="fixed top-0 left-0 right-0 z-[60]">
        <div className="w-full px-4 md:px-6 lg:px-8 pt-2 md:pt-3">
          <nav className="relative mx-auto rounded-xl bg-neutral-900 dark:bg-neutral-900 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 shadow-lg">
            <div className="flex w-full items-center justify-between max-w-screen-2xl mx-auto">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Link
                  className="flex h-8 w-auto items-center md:h-9"
                  href="/"
                  aria-label="Go to homepage"
                >
                  <LogoIcon />
                </Link>
              </div>

              {/* Categories (server-fetched; also mounts the mobile bottom bar + drawer) */}
              <Suspense fallback={<NavigationSkeleton />}>
                <CategoriesMenu />
              </Suspense>

              {/* Search, Auth & Cart */}
              <Suspense fallback={<ActionsSkeleton />}>
                <CartAndUserActions />
              </Suspense>
            </div>
          </nav>
        </div>
      </header>
    </NavbarErrorBoundary>
  );
}
