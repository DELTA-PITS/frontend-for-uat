interface TableSkeletonProps {
  /** Number of placeholder rows to render. Defaults to 10. */
  rows?: number;
}

/**
 * Pulsing placeholder shown while the dashboard's document list is loading,
 * shaped roughly like the real table rows so the layout doesn't jump once
 * data arrives.
 */
export default function TableSkeleton({ rows = 10 }: TableSkeletonProps) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Memuat dokumen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="h-32 flex-1 animate-pulse rounded-2xl border border-base-300 bg-base-200" />
        <div className="grid grid-cols-3 gap-3 lg:w-80 lg:grid-cols-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl border border-base-300 bg-base-200" />
          ))}
        </div>
      </div>

      <div className="h-11 w-full animate-pulse rounded-lg border border-base-300 bg-base-200 sm:max-w-md" />

      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-base-300 px-4 py-4 last:border-b-0"
          >
            <div className="h-6 w-6 shrink-0 animate-pulse rounded bg-base-300" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-1/3 animate-pulse rounded bg-base-300" />
              <div className="h-2.5 w-1/5 animate-pulse rounded bg-base-300" />
            </div>
            <div className="h-3 w-24 animate-pulse rounded bg-base-300" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-base-300" />
          </div>
        ))}
      </div>
    </div>
  );
}
