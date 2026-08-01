'use client';

import { useLocale } from '@lib/i18n/LocaleContext';

export type DashboardErrorCode = 'no_backend' | 'no_token' | 'load_failed' | 'conn_failed';

/**
 * Translated error alert for the dashboard's server-side fetch failures.
 * The server component only knows an error *code* (locale is a client-only
 * concern, stored in localStorage) — this component maps that code to the
 * current locale's message.
 */
export default function DashboardErrorAlert({ code }: { code: DashboardErrorCode }) {
  const { t } = useLocale();

  const message = {
    no_backend: t.dashboard.errorNoBackend,
    no_token: t.dashboard.errorNoToken,
    load_failed: t.dashboard.errorLoad,
    conn_failed: t.dashboard.errorConn,
  }[code];

  return <div className="alert alert-error">{message}</div>;
}
