import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PublisherPortalClient from '@components/register/PublisherPortalClient';

// Defense-in-depth: `middleware.ts` already blocks unauthenticated requests
// to this route at the edge, but this check makes sure the page itself never
// renders the publisher form without a session even if the middleware
// matcher is ever misconfigured — see _docs/security/session-auth-audit-2026-08-02.md.
// `force-dynamic` also stops this page from being cached, so a logged-out
// visitor can't have it served from cache/back-forward-cache after logout.
export const dynamic = 'force-dynamic';

export default async function PublisherPortalPage() {
  const session = await auth();
  if (!session) {
    redirect('/');
  }

  return <PublisherPortalClient />;
}
