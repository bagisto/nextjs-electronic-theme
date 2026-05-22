import { FC } from "react";

export default function FilterListSkeleton() {
  return (
    <div className="flex w-full flex-auto items-center gap-x-4 sm:max-w-md">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="w-full md:min-w-48">
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-1/2 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-full rounded-lg bg-neutral-100 dark:bg-neutral-900" />
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: 2 }).map((__, chipIdx) => (
                <div
                  key={chipIdx}
                  className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const SortOrderSkeleton: FC = () => {
  return (
    <section className="flex w-full flex-1 items-center gap-x-2.5 sm:max-w-[15.625rem]">
      <div className="hidden h-4 w-24 animate-pulse rounded-lg bg-neutral-200 md:block dark:bg-neutral-800" />
      <div className="h-10 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
    </section>
  );
};
export const ProductCardSkeleton: FC = () => {
  return (
    <div className="flex animate-pulse flex-col gap-y-3">
      <div className="group relative overflow-hidden rounded-xl">
        <div className="aspect-square w-full rounded-xl bg-neutral-200 dark:bg-neutral-800" />
        <div className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <div className="px-1">
        <div className="mb-3 h-5 w-3/4 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-1/3 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
};

export const ServiceContentSkeleton: FC = () => {
  return (
    <div className="mx-auto my-12 w-full md:my-20 md:max-w-4xl">
      <div className="flex items-center justify-center gap-6 max-lg:flex-wrap max-md:grid max-md:grid-cols-2 max-md:gap-x-2.5 max-md:text-center md:gap-10 lg:gap-20">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex animate-pulse flex-col items-center justify-center gap-3 max-md:gap-2.5 max-sm:px-2"
          >
            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="mt-2.5 h-4 w-36 rounded bg-gray-300 max-md:mt-0 max-md:w-32 max-sm:w-24 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
};
