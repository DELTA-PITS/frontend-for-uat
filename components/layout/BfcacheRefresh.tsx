'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * `force-dynamic` on `/publisher` and `/dashboard` stops those pages from
 * being cached server-side, but some browsers can still restore an old
 * render from the back/forward cache (bfcache) when the user hits Back —
 * `event.persisted` is true in that case. When that happens, force a
 * server round-trip (`router.refresh()`) so a session that ended in the
 * meantime (e.g. logout) is reflected immediately instead of showing the
 * stale page until some other interaction triggers a refetch.
 */
export default function BfcacheRefresh() {
  const router = useRouter();

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh();
      }
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [router]);

  return null;
}
