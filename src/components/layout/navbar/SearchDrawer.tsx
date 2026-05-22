"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createUrl } from "@/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { graphqlRequest, GET_PRODUCTS } from "@/graphql";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";

interface SearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: string;
  name: string;
  url_key: string;
  base_image_url: string;
  price_range: {
    minimum_price: {
      regular_price: {
        value: number;
        currency: string;
      };
    };
  };
}

export default function SearchDrawer({ isOpen, onClose }: SearchDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [iconColor, setIconColor] = useState("text-neutral-400");

  // Fetch products from API
  const fetchProducts = async (query: string) => {
    if (!query || query.length < 2) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await graphqlRequest<any>(
        GET_PRODUCTS,
        {
          query: query,
          first: 8,
        },
        { life: "minutes" }
      );

      const items = data?.products?.edges?.map((edge: any) => edge.node) || [];
      setProducts(items);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    // Change icon color to black when typing
    setIconColor(value.length > 0 ? "text-neutral-900" : "text-neutral-400");

    // Debounce API call
    const timeoutId = setTimeout(() => {
      fetchProducts(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchValue("");
      setProducts([]);
      setIconColor("text-neutral-400");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (searchValue.trim()) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set("q", searchValue);
      router.push(createUrl("/search", newParams));
      onClose();
      setSearchValue("");
      setProducts([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleProductClick = () => {
    onClose();
    setSearchValue("");
    setProducts([]);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const commonContent = (
    <>
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Search</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-neutral-500"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Field */}
      <div className="px-6 py-4">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products..."
            className="w-full px-4 py-3 pr-12 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-500 focus:border-transparent"
            autoComplete="off"
          />
          <button
            onClick={handleSubmit}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 ${iconColor} hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer`}
            aria-label="Search"
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
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-100 dark:border-neutral-800" />

      {/* Scrollable Content */}
      <div className={`overflow-y-auto ${isDesktop ? 'h-[calc(100vh-180px)] py-4' : 'h-full py-6'} px-6`}>
        {/* Loading State */}
        {isLoading && (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-green-500 rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Products Section - Show when there are results */}
        {!isLoading && products.length > 0 && (
          <div className="py-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">Products</h3>
            <div className="space-y-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.url_key}`}
                  onClick={handleProductClick}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <div className="relative w-[72px] h-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {product.base_image_url ? (
                      <Image
                        src={product.base_image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-neutral-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        ${product.price_range?.minimum_price?.regular_price?.value?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State - Show when no search yet */}
        {!isLoading && searchValue.length === 0 && (
          <div className="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p className="text-neutral-500 dark:text-neutral-400">
              Start typing to search products
            </p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && searchValue.length >= 2 && products.length === 0 && (
          <div className="py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <p className="text-neutral-500 dark:text-neutral-400">
              No products found for &quot;{searchValue}&quot;
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Try different keywords
            </p>
          </div>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <>
        <div
          className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer ${
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
        <div
          className={`fixed right-0 top-0 z-50 h-full w-full max-w-[420px] bg-white dark:bg-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Search drawer"
        >
          {commonContent}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop - with smooth transition */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer - with smooth slide transition */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-[420px] bg-white dark:bg-neutral-900 shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Search drawer"
      >
        <div className="flex flex-col h-full xxs:pt-[60px] pt-[50px] md:pt-[68px] lg:pt-24 pb-[64px]">
          {commonContent}
        </div>
      </div>
    </>
  );
}
