"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GET_CATEGORY_PRODUCTS, graphqlRequest } from "@/graphql";
import Image from "next/image";
import { baseUrl, getImageUrl, NOT_IMAGE } from "@/utils/constants";

interface MegaMenuProps {
  category: {
    id: string;
    name: string;
    slug: string;
    children: any[];
  };
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

async function getCategoryProducts(categoryId: string): Promise<Product[]> {
  try {
    const data = await graphqlRequest<any>(
      GET_CATEGORY_PRODUCTS,
      { categoryId: parseInt(categoryId), pageSize: 4 },
      { life: "hours" }
    );
    return data?.products?.items || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default function MegaMenu({ category }: MegaMenuProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const childCategories = category.children
    ?.filter((child: any) => child.id !== "1")
    ?.map((child: any) => ({
      id: child.id,
      name: child.translation?.name || child.name || "",
      slug: child.translation?.slug || child.slug || "",
      children: child.children || [],
    }))
    ?.filter((item: any) => item.name) || [];

  // Get unique subcategory names for navigation (In Ear, On Ear, etc.)
  const navigationTitles = ["In Ear", "On Ear", "Explore"];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const firstChildId = childCategories[0]?.id;
      if (firstChildId) {
        const prods = await getCategoryProducts(firstChildId);
        setProducts(prods);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [childCategories]);

  if (childCategories.length === 0) return null;

  return (
    <div className="invisible opacity-0 group-hover/nav:visible group-hover/nav:opacity-100 absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-200 z-50">
      {/* Three Column Mega Menu */}
      <div className="w-[900px] max-w-[90vw] rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-3">
          {/* Left Column - Navigation */}
          <div className="col-span-2 p-6 border-r border-neutral-100 dark:border-neutral-800">
            {/* Navigation Lists - Three columns */}
            <div className="grid grid-cols-3 gap-6">
              {navigationTitles.map((title, index) => (
                <div key={title}>
                  {/* Section Title */}
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3 uppercase tracking-wider">
                    {title}
                  </h3>

                  {/* Links */}
                  <ul className="space-y-1">
                    {childCategories.slice(index * 3, index * 3 + 3).map((child: any) => (
                      <li key={child.id}>
                        <Link
                          href={`/${child.slug}`}
                          className="block px-2 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-150"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Browse All Link */}
            <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <Link
                href={`/${category.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Browse All {category.name}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Product Images */}
          <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4 uppercase tracking-wider">
              Featured
            </h3>

            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.url_key}`}
                    className="group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-neutral-900 shadow-sm group-hover:shadow-md transition-shadow">
                      <Image
                        src={getImageUrl(product.base_image_url, baseUrl, NOT_IMAGE) || "/image/placeholder.webp"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-1">
                      {product.name}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <span className="text-sm text-neutral-500">No products</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
