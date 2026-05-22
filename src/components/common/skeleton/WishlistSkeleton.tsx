export default function WishlistSkeleton() {
  return (
    <div className="wishlist-skeleton">
      <div className="flex justify-end mb-6">
        <div className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 sm:items-start"
          >
            <div className="absolute top-4 right-4 z-10">
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>

            <div className="w-full sm:w-32 sm:flex-shrink-0 aspect-square rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

            <div className="flex-1 flex flex-col gap-2 min-w-0 pr-12">
              <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

              <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

              <div className="flex items-center gap-2 mt-1">
                <div className="h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg h-10 w-24">
                  <div className="w-8 h-full flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                  <div className="w-8 h-full flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                  <div className="w-8 h-full flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
                  </div>
                </div>

                <div className="h-10 w-32 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const WishlistContentSkeleton = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-12">
      <div className="flex flex-col items-center gap-4">
        {/* Empty state icon skeleton */}
        <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />

        {/* Title skeleton */}
        <div className="h-6 w-40 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

        {/* Description skeleton */}
        <div className="h-4 w-64 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

        {/* Button skeleton */}
        <div className="mt-4 h-12 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>
    </div>
  );
};
