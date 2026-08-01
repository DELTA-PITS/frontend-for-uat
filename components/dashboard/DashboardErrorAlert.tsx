'use client';

import SignIn from '@components/auth/SignIn';
import { useLocale } from '@lib/i18n/LocaleContext';

export type DashboardErrorCode = 'no_backend' | 'no_token' | 'load_failed' | 'conn_failed' | 'session_expired';

/**
 * Translated error alert for the dashboard's server-side fetch failures.
 * The server component only knows an error *code* (locale is a client-only
 * concern, stored in localStorage) — this component maps that code to the
 * current locale's message. `session_expired` gets a re-login CTA since it's
 * the one case the user can actually resolve themselves.
 */
export default function DashboardErrorAlert({ code }: { code: DashboardErrorCode }) {
  const { t } = useLocale();

  if (code === 'session_expired') {
    return (
      <div className="alert alert-error flex items-center justify-between gap-3">
        <span>{t.dashboard.errorSessionExpired}</span>
        <SignIn className="btn btn-sm">{t.header.signIn}</SignIn>
      </div>
    );
  }

  const message = {
    no_backend: t.dashboard.errorNoBackend,
    no_token: t.dashboard.errorNoToken,
    load_failed: t.dashboard.errorLoad,
    conn_failed: t.dashboard.errorConn,
  }[code];

  return <div className="alert alert-error">{message}</div>;
}
