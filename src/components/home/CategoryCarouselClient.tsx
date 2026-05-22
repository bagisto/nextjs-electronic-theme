"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Heading } from "@/components/common/Heading";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

interface CategoryCarouselClientProps {
  categories: CategoryItem[];
}

export default function CategoryCarouselClient({
  categories,
}: CategoryCarouselClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>(":scope > a")?.offsetWidth || 280;
    const gap = 20;
    const scrollAmount = (cardWidth + gap) * 2;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full mt-[58px] py-[70px] bg-[#F5F7F9] dark:bg-neutral-900">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <Heading size={{ mobile: "text-xl", laptop: "text-2xl" }}>Popular Categories</Heading>
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                aria-label={`Shop ${category.name} category`}
                className="group shrink-0 w-[240px] sm:w-[260px] md:w-[280px] lg:w-[300px] xl:w-[320px] snap-start"
              >
                <div
                  className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-800 flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-lg"
                  style={{ aspectRatio: "320 / 348" }}
                >
                  <Image
                    src={category.imageUrl}
                    alt={`${category.name} category`}
                    width={320}
                    height={348}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-center text-sm md:text-base font-medium text-neutral-800 dark:text-neutral-200">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll categories right"
              className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 shadow-md text-neutral-700 dark:text-neutral-200 transition-all hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
