"use client";

import {
  Drawer,
  DrawerBody,
  DrawerContent,
} from "@heroui/drawer";
import { useDisclosure } from "@heroui/react";
import Link from "next/link";
import BottomNavbar from "./BottomNavbar";
import { MobileSearchBar } from "./MobileSearch";
import { useState } from "react";




export default function MobileMenu({ menu }: { menu: any }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeTab, setActiveTab] = useState<
    "home" | "category" | "cart" | "account" | null
  >(null);


  return (
    <>
      <BottomNavbar
        onMenuOpen={onOpen}
        setActiveTab={setActiveTab}
        activeTab={activeTab} />

      <Drawer
        backdrop="transparent"
        hideCloseButton
        isOpen={isOpen}
        radius="none"
        placement="left"
        onOpenChange={(open) => {
          onOpenChange();
          if (!open) {
            setActiveTab(null);
          }
        }}
        classNames={{
          base: "z-40",
          backdrop: "z-[35]",
          wrapper: "z-40",
        }}
      >
        <DrawerContent
          className="
            z-40 bg-white dark:bg-neutral-950
            h-full
          "
        >
          {(onClose) => (
            <>
              <DrawerBody className="px-4 xxs:pt-[76px] xxs:pb-[80px] pt-[66px] pb-[80px] md:pt-[84px] overflow-y-auto bg-white dark:bg-neutral-950">
                <MobileSearchBar onClose={onClose} />
                <h1 className="text-2xl text-neutral-900 dark:text-white px-2 font-bold mt-4"> Categories </h1>
                <ul className="flex w-full flex-col">
                  {menu.map((item: any) => (
                    <li
                      key={item.id + item.name}
                      className="px-2 py-3 text-lg text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200 font-medium"
                    >
                      <Link
                        href={item.slug ? `/${item.slug}` : "/search"}
                        aria-label={`${item?.name}`}
                        onClick={onClose}
                        className="cursor-pointer"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
