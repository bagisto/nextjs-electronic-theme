"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import BottomNavbar from "./BottomNavbar";
import { useState } from "react";
import { useBodyScrollLock } from "@utils/hooks/useBodyScrollLock";

export default function MobileMenu({ menu }: { menu: any }) {
  const [activeTab, setActiveTab] = useState<
    "home" | "category" | "cart" | "account" | null
  >("home");

  const isOpen = activeTab === "category";

  useBodyScrollLock(isOpen);

  const handleClose = () => {
    setActiveTab(null);
  };

  return (
    <>
      <BottomNavbar
        onMenuOpen={() => setActiveTab("category")}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-transparent lg:hidden"
              style={{ top: "64px", bottom: "64px" }}
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 z-50 w-full max-w-[448px] border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black lg:hidden drawer-scrollbar-hidden"
              style={{
                top: "64px",
                bottom: "64px",
                width: "100%",
                maxWidth: "448px",
                height: "calc(100dvh - 128px)",
              }}
            >
              <div className="h-full overflow-y-auto px-4 py-4 drawer-scrollbar-hidden">

                <h1 className="mt-4 px-2 text-2xl font-semibold text-black dark:text-white">
                  Category
                </h1>

                <ul className="mt-2 flex w-full flex-col drawer-scrollbar-hidden">
                  {menu.map((item: any) => (
                    <li
                      key={item.id + item.name}
                      className="p-2 text-xl text-black dark:text-white"
                    >
                      <Link
                        href={item.slug ? `/${item.slug}` : "/search"}
                        aria-label={`${item?.name}`}
                        onClick={handleClose}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
