export default function OrderDetailsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-xl animate-pulse"></div>
                <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
            
            {/* Tab navigation skeleton */}
            <div className="flex gap-2">
                <div className="h-12 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                <div className="h-12 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
            </div>
            
            {/* Tab content skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex justify-between">
                            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Order items skeleton */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4">
                    <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex gap-4">
                            <div className="h-16 w-16 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                                <div className="h-4 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Totals skeleton */}
            <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-3">
                    <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                    <div className="h-6 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                </div>
            </div>
            
            {/* Address section skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                        <div className="h-20 w-full bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}



export function OrderDetailInvoicesSkeleton(){
    return (
          <div className="space-y-4">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse"></div>
                                </div>
                                <div className="h-10 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-lg animate-pulse"></div>
                            </div>
                        ))}
                    </div>
    )
}
