export default function PageLoader({ label = "" }: { label?: string }) {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-teal-500 dark:border-neutral-800 dark:border-t-teal-500" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
      </div>
    </div>
  );
}

export function InlineSpinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-teal-500 dark:border-neutral-800 dark:border-t-teal-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
