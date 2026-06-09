
export default function ForgetSkeleton() {
  return (
    <div className="w-full mt-12 sm:mt-0 min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
      <div className="w-full max-w-screen-xl flex items-center gap-8 lg:gap-12 xl:gap-16">

        {/* Left Side - Form Skeleton */}
        <div className="w-full lg:max-w-[420px] xl:max-w-[460px] flex-shrink-0 mx-auto lg:mx-0">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-800 p-5 xs:p-6 sm:p-8 lg:p-0 lg:shadow-none lg:border-none lg:bg-transparent lg:dark:bg-transparent">
            {/* Header skeleton */}
            <div className="h-7 w-48 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded mb-6" />

            {/* Input skeleton */}
            <div className="space-y-4">
              <div>
                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-1.5" />
                <div className="h-11 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              </div>

              {/* Button skeleton */}
              <div className="h-11 w-full bg-neutral-300 dark:bg-neutral-700 rounded-lg mt-1" />

              {/* Security note skeleton */}
              <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded mx-auto mt-2" />
            </div>
          </div>
        </div>

        {/* Right Side - Image Skeleton */}
        <div className="relative hidden lg:block flex-1 min-w-0 rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800" style={{ height: "560px" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent animate-[shimmer_1.6s_infinite]" />
        </div>

      </div>
    </div>
  );
}
