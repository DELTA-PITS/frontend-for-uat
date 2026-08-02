'use client';

import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import SignIn from '@components/auth/SignIn';
import { useLocale } from '@lib/i18n/LocaleContext';

export type DashboardErrorCode = 'no_backend' | 'no_token' | 'load_failed' | 'conn_failed' | 'session_expired';

/**
 * Full-width empty-state card for the dashboard's server-side fetch
 * failures — mirrors EmptyState's icon/title/description/action shape
 * (not reusing EmptyState directly since this needs a sign-in form action,
 * not a plain link) so it reads as a normal part of the page instead of a
 * raw alert banner sitting under the header. The server component only
 * knows an error *code* (locale is a client-only concern, stored in
 * localStorage) — this component maps that code to the current locale's
 * copy. `session_expired` gets a re-login CTA since it's the one case the
 * user can actually resolve themselves; everything else gets a retry
 * button since a reload is the only self-service option.
 */
export default function DashboardErrorAlert({ code }: { code: DashboardErrorCode }) {
  const { t } = useLocale();
  const isSessionExpired = code === 'session_expired';

  const description = {
    no_backend: t.dashboard.errorNoBackend,
    no_token: t.dashboard.errorNoToken,
    load_failed: t.dashboard.errorLoad,
    conn_failed: t.dashboard.errorConn,
    session_expired: t.dashboard.errorSessionExpired,
  }[code];

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-error/20 bg-error/5 px-6 py-20 text-center shadow-card">
      {isSessionExpired ? (
        <LockClockOutlinedIcon className="text-error" style={{ fontSize: '2.5rem' }} />
      ) : (
        <ErrorOutlineOutlinedIcon className="text-error" style={{ fontSize: '2.5rem' }} />
      )}
      <h3 className="text-base font-semibold text-base-content">
        {isSessionExpired ? t.dashboard.errorSessionExpiredTitle : t.dashboard.errorLoadTitle}
      </h3>
      <p className="max-w-sm text-sm text-base-content/70">{description}</p>
      {isSessionExpired ? (
        <SignIn className="btn btn-primary btn-sm mt-2">{t.header.signIn}</SignIn>
      ) : (
        <button type="button" onClick={() => window.location.reload()} className="btn btn-sm mt-2">
          {t.dashboard.retry}
        </button>
      )}
    </div>
  );
}
