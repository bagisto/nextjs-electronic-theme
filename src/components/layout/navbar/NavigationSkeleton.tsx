export function NavigationSkeleton() {
  return (
    <ul className="hidden gap-0.5 text-sm md:flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="px-3 lg:px-4 py-2">
          <div className="h-4 w-14 animate-pulse rounded bg-neutral-700" />
        </li>
      ))}
    </ul>
  );
}
