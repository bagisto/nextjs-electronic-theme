"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const SearchDrawer = dynamic(() => import("./SearchDrawer"), { ssr: false });

export default function SearchButton() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Search Icon Button */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="p-2 text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
        aria-label="Open search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>

      {/* Search Drawer */}
      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
