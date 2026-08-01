import TableSkeleton from '@components/dashboard/TableSkeleton';

/**
 * Route-level loading UI shown by Next.js while the dashboard Server
 * Component fetches records — a skeleton instead of a spinner so the layout
 * feels immediate rather than blocked.
 */
export default function DashboardLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-8 h-16 w-full max-w-xl animate-pulse rounded-lg bg-base-200" />
      <TableSkeleton />
    </main>
  );
}
