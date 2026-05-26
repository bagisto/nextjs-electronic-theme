export function ActionsSkeleton() {
  return (
    <div className="flex max-w-fit gap-2 md:gap-4">
      {/* Theme Switch Skeleton */}
      <div className="h-9 w-9 lg:h-11 lg:w-11 animate-pulse rounded-md border border-solid border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" />
      {/* Cart Skeleton */}
      <div className="hidden lg:block lg:h-11 lg:w-11 animate-pulse rounded-md border border-solid border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" />
      {/* UserAccount Skeleton */}
      <div className="hidden lg:block lg:h-11 lg:w-11 animate-pulse rounded-md border border-solid border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800" />
    </div>
  );
}
