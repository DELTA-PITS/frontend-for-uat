'use client';

import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import SignIn from '@components/auth/SignIn';
import { useLocale } from '@lib/i18n/LocaleContext';

export type DashboardErrorCode = 'no_backend' | 'no_token' | 'load_failed' | 'conn_failed' | 'session_expired';

/**
 * Full-page state for the dashboard's server-side fetch failures — big
 * status-icon badge (same visual language as ResultView's StatusIcon),
 * heading, description, single action, no card border/background. The
 * page renders this INSTEAD of DashboardHeader/DashboardView (see
 * app/dashboard/page.tsx) — none of the dashboard chrome (title, "Register
 * Document" CTA) makes sense to show alongside an error the user can't
 * act on through the dashboard itself. The server component only knows an
 * error *code* (locale is a client-only concern, stored in localStorage) —
 * this component maps that code to the current locale's copy.
 * `session_expired` gets a re-login CTA since it's the one case the user
 * can actually resolve themselves; everything else gets a retry button
 * since a reload is the only self-service option.
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
    <div className="flex min-h-[65vh] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error">
        {isSessionExpired ? (
          <LockClockOutlinedIcon style={{ fontSize: '2.5rem' }} />
        ) : (
          <ErrorOutlineOutlinedIcon style={{ fontSize: '2.5rem' }} />
        )}
      </div>
      <h1 className="text-xl font-bold text-base-content">
        {isSessionExpired ? t.dashboard.errorSessionExpiredTitle : t.dashboard.errorLoadTitle}
      </h1>
      <p className="max-w-sm text-sm text-ink-secondary">{description}</p>
      {isSessionExpired ? (
        <SignIn className="btn btn-primary mt-2">{t.header.signIn}</SignIn>
      ) : (
        <button type="button" onClick={() => window.location.reload()} className="btn mt-2">
          {t.dashboard.retry}
        </button>
      )}
    </div>
  );
}
