'use client';

import Link from 'next/link';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Translated page header for the dashboard. Split out from the server
 * component page so the static title/subtitle/CTA can react to the
 * client-side locale toggle, while data fetching stays server-side.
 */
export default function DashboardHeader() {
  const { t } = useLocale();

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-[2rem] font-bold text-secondary">{t.dashboard.title}</h1>
        <p className="mt-2 text-ink-secondary">{t.dashboard.subtitle}</p>
      </div>
      <Link className="btn btn-primary w-full sm:w-auto" href="/publisher">
        {t.dashboard.registerCta}
      </Link>
    </div>
  );
}
