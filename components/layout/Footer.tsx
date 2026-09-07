'use client';

import { APP_VERSION } from '@lib/version';
import { useLocale } from '@lib/i18n/LocaleContext';

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="py-4 text-center text-xs text-base-content/50">
      {t.footer.appName} &middot; v{APP_VERSION}
    </footer>
  );
}
