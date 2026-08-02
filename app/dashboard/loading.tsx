import TableSkeleton from '@components/dashboard/TableSkeleton';
import PageContainer from '@components/layout/PageContainer';

/**
 * Route-level loading UI shown by Next.js while the dashboard Server
 * Component fetches records — a skeleton instead of a spinner so the layout
 * feels immediate rather than blocked.
 */
export default function DashboardLoading() {
  return (
    <PageContainer variant="wide" className="py-8 sm:py-10">
      <div className="mb-8 h-16 w-full max-w-xl animate-pulse rounded-lg bg-base-200" />
      <TableSkeleton />
    </PageContainer>
  );
}
