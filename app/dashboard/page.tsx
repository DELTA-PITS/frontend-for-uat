import { auth } from '@/auth';
import DashboardView from '@components/dashboard/DashboardView';
import DashboardHeader from '@components/dashboard/DashboardHeader';
import DashboardErrorAlert, { type DashboardErrorCode } from '@components/dashboard/DashboardErrorAlert';
import PageContainer from '@components/layout/PageContainer';
import type { RecordItem } from '@/types/files.types';

const BACKEND_RECORDS_URL = process.env.PITS_BACKEND_RECORDS_URL;

async function fetchRecords(): Promise<{ records: RecordItem[]; errorCode: DashboardErrorCode | null }> {
  if (!BACKEND_RECORDS_URL) {
    return { records: [], errorCode: 'no_backend' };
  }

  const session = await auth();
  if (!session?.accessToken) {
    return { records: [], errorCode: 'no_token' };
  }

  try {
    const response = await fetch(BACKEND_RECORDS_URL, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return { records: [], errorCode: 'load_failed' };
    }
    return { records: payload?.records ?? [], errorCode: null };
  } catch {
    return { records: [], errorCode: 'conn_failed' };
  }
}

export default async function DashboardPage() {
  const { records, errorCode } = await fetchRecords();

  return (
    <PageContainer as="main" variant="wide" className="py-8 sm:py-10">
      <DashboardHeader />

      {errorCode ? <DashboardErrorAlert code={errorCode} /> : <DashboardView records={records} />}
    </PageContainer>
  );
}
