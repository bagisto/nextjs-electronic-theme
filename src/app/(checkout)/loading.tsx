export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-white" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading checkout...</p>
      </div>
    </div>
  );
}
