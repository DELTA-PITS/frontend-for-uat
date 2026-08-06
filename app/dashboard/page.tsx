import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import DashboardView from '@components/dashboard/DashboardView';
import DashboardHeader from '@components/dashboard/DashboardHeader';
import DashboardErrorAlert, { type DashboardErrorCode } from '@components/dashboard/DashboardErrorAlert';
import PageContainer from '@components/layout/PageContainer';
import type { RecordItem } from '@/types/files.types';
import type { Session } from 'next-auth';

// Defense-in-depth: `middleware.ts` already blocks unauthenticated requests
// to this route at the edge, but this check makes sure the page itself never
// renders the dashboard shell without a session even if the middleware
// matcher is ever misconfigured — see _docs/security/session-auth-audit-2026-08-02.md.
// `force-dynamic` also stops this page from being cached, so a logged-out
// visitor can't have it served from cache/back-forward-cache after logout.
export const dynamic = 'force-dynamic';

const BACKEND_RECORDS_URL = process.env.PITS_BACKEND_RECORDS_URL;

async function fetchRecords(session: Session | null): Promise<{ records: RecordItem[]; errorCode: DashboardErrorCode | null }> {
  if (!BACKEND_RECORDS_URL) {
    return { records: [], errorCode: 'no_backend' };
  }

  if (session?.error) {
    // Refresh token failed (expired/revoked) — `session.accessToken` may still
    // hold a stale value at this point, so this check must come before the
    // truthiness check below or we'd send a dead token to the backend and
    // surface a confusing generic "failed to load" instead of "log in again".
    return { records: [], errorCode: 'session_expired' };
  }
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
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  const { records, errorCode } = await fetchRecords(session);

  if (errorCode) {
    // No DashboardHeader here on purpose — "Registered Documents" title and
    // the "Register Document" CTA don't make sense next to a state the user
    // can't act on through the dashboard (expired session, unreachable
    // backend, etc).
    return (
      <PageContainer variant="wide" className="py-8 sm:py-10">
        <DashboardErrorAlert code={errorCode} />
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="wide" className="py-8 sm:py-10">
      <DashboardHeader />
      <DashboardView records={records} />
    </PageContainer>
  );
}
