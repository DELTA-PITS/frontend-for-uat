'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import PageContainer from '@components/layout/PageContainer';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * One-time confirmation banner shown on the Verify page right after logout
 * (`/?loggedOut=1`, set by `app/api/auth/logout/route.ts`) — previously
 * logout gave no feedback at all when every redirect happened to succeed,
 * leaving users unsure whether they were actually signed out.
 */
export default function LogoutBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = searchParams.get('loggedOut') === '1' && !dismissed;

  useEffect(() => {
    if (searchParams.get('loggedOut') === '1') {
      // Strip the query param so refreshing the page doesn't re-show the banner.
      router.replace('/', { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!shouldShow) return null;

  return (
    <div className="w-full bg-success/10">
      <PageContainer variant="content" className="py-3">
        <div className="flex items-center justify-between gap-3 text-sm text-success">
          <span className="flex items-center gap-2">
            <CheckCircleOutlinedIcon style={{ fontSize: '1.1rem' }} />
            {t.header.loggedOutMessage}
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t.drawer.close}
            className="rounded-md p-1 hover:bg-success/10"
          >
            <CloseIcon style={{ fontSize: '1rem' }} />
          </button>
        </div>
      </PageContainer>
    </div>
  );
}
