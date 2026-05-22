"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createUrl } from "@/utils/helper";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useMediaQuery } from "@/hooks/useMediaQueryHook";
import { InlineSpinner } from "@/components/common/PageLoader";

export default function Search({
  search = false,
  setSearch,
  onClose,
}: {
  search: boolean;
  setSearch?: (value: boolean) => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState(
    searchParams?.get("q") || ""
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handler = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (searchValue.trim() === "") {
        newParams.delete("q");
      } else {
        newParams.set("q", searchValue);
      }
      if (searchValue) {
        startTransition(() => {
          router.push(createUrl("/search", newParams));
        });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue]);

  useEffect(() => {
    if (search && inputRef.current) {
      const input = inputRef.current;
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [search]);

  const handleSubmit = () => {
    if (isPending) return;
    const newParams = new URLSearchParams(searchParams.toString());
    if (searchValue.trim() === "") {
      newParams.delete("q");
    } else {
      newParams.set("q", searchValue);
    }
    if (searchValue) {
      startTransition(() => {
        router.push(createUrl("/search", newParams));
      });
      onClose?.();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
  <div className={`${isDesktop ? "max-w-[550px]" : ""} relative w-full mx-auto xl:min-w-[516px] outline-none hover:outline-none`}>
      {setSearch && (
        <button
          onClick={() => setSearch(!search)}
          type="button"
          className="absolute bottom-0 left-1 top-0 flex w-9 cursor-pointer items-center justify-center border-r border-neutral-200 dark:border-neutral-700 md:hidden"
        >
          <ArrowLeftIcon className="size-5 stroke-neutral-500" />
        </button>
      )}

      <input
        ref={inputRef}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        className="input w-full rounded-xl border border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 py-2 pl-4 pr-10 text-sm text-white outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 md:pl-4 backdrop-blur-sm"
        name="search"
        placeholder="Search for products..."
        type="text"
      />

      <div
        onClick={handleSubmit}
        role="button"
        aria-busy={isPending}
        className={`absolute bottom-0 right-1 top-0 flex w-9 items-center justify-center ${isPending ? "cursor-wait" : "cursor-pointer"}`}
      >
        {isPending ? (
          <InlineSpinner className="border-neutral-300 border-t-neutral-500" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            className="size-5 stroke-neutral-400 md:stroke-neutral-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            ></path>
          </svg>
        )}
      </div>
    </div>
  );
}
