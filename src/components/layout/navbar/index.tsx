import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./MobileMenu";
import SearchButton from "./SearchButton";
import CartButton from "@/components/cart/CartButton";
import { IconSkeleton } from "@/components/common/skeleton/IconSkeleton";
import { GET_TREE_CATEGORIES, graphqlRequest } from "@/graphql";
import ThemeSwitcherWrapper from "@components/theme/theme-switch";
import LogoIcon from "@components/common/icons/LogoIcon";
import UserAccount from "@components/customer/credentials";
import MegaMenu from "./MegaMenu";


export default async function Navbar() {
  const data = await graphqlRequest<any>(
    GET_TREE_CATEGORIES,
    { parentId: 1 },
    { tags: ["categories"], life: "days" }
  );

  const categories = data?.treeCategories || [];

  const filteredCategories = categories
    .filter((cat: any) => cat.id !== "1")
    .map((cat: any) => {
      const translation = cat.translation;
      return {
        id: cat.id,
        name: translation?.name || "",
        slug: translation?.slug || "",
        children: cat.children || [],
      };
    })
    .filter((item: any) => item.name && item.slug);

  const menuData = [
    { id: "all", name: "All", slug: "", children: [] },
    ...filteredCategories.slice(0, 5),
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[60]">
        <div className="w-full px-4 md:px-6 lg:px-8 pt-2 md:pt-3">
          <nav className="relative mx-auto rounded-xl bg-neutral-900 dark:bg-neutral-900 px-4 md:px-6 lg:px-8 py-2.5 md:py-3 shadow-lg">
            <div className="flex w-full items-center justify-between max-w-screen-2xl mx-auto">
              <div className="flex items-center gap-3">
                <Suspense fallback={null}>
                  <MobileMenu menu={menuData} />
                </Suspense>
                <Link
                  className="flex h-8 w-auto items-center md:h-9"
                  href="/"
                  aria-label="Go to homepage"
                >
                  <LogoIcon />
                </Link>
              </div>

              <ul className="hidden gap-0.5 text-sm md:flex items-center">
                {menuData.map(
                  (item: { id: string; name: string; slug: string; children: any[] }) => (
                    <li key={item?.id + item?.name} className="relative group/nav">
                      <Link
                        className="font-medium text-neutral-300 hover:text-white px-3 lg:px-4 py-2 rounded-full transition-colors duration-200 hover:bg-white/10 inline-flex items-center gap-1"
                        href={item.slug ? `/${item.slug}` : "/search"}
                        prefetch={true}
                        aria-label={`Browse ${item.name} products`}
                      >
                        {item.name}
                        {item.children && item.children.length > 0 && (
                          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        )}
                      </Link>
                      {item.children && item.children.length > 0 && (
                        <MegaMenu category={item} />
                      )}
                    </li>
                  )
                )}
              </ul>

              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden lg:flex">
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
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
