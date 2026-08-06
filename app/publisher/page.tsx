import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import PublisherPortalClient from '@components/register/PublisherPortalClient';

// Defense-in-depth: `proxy.ts` already blocks unauthenticated requests to
// this route at the edge, but this check makes sure the page itself never
// renders the publisher form without a valid session even if the proxy
// matcher is ever misconfigured — see _docs/security/session-auth-audit-2026-08-02.md.
// `force-dynamic` also stops this page from being cached, so a logged-out
// visitor can't have it served from cache/back-forward-cache after logout.
export const dynamic = 'force-dynamic';

export default async function PublisherPortalPage() {
  const session = await auth();
  // `session.error` (e.g. refresh token failed) is treated the same as no
  // session at all — a session that can't refresh its access token is not
  // usable, so there's no point rendering the form only to have every
  // submit fail with 401.
  if (!session || session.error) {
    redirect('/');
  }

  return <PublisherPortalClient />;
}
