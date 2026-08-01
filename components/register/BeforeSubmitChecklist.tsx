'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Rendered inside the upload card, just above the submit button, on the
 * Register page only — makes the permanence of the action explicit before
 * the publisher commits. Styled as a calm informational notice rather than
 * a warning: the publisher is performing a routine, authorized institutional
 * action, not something risky that needs alarming.
 */
export default function BeforeSubmitChecklist() {
  const { t } = useLocale();

  return (
    <div className="mb-4 flex w-full items-start gap-3 rounded-lg border border-info/30 bg-info/5 p-4">
      <InfoOutlinedIcon className="mt-0.5 shrink-0 text-info" style={{ fontSize: '1.1rem' }} />
      <div>
        <p className="text-xs font-semibold text-base-content">{t.beforeSubmit.heading}</p>
        <p className="mt-1 text-xs text-ink-secondary">{t.beforeSubmit.body}</p>
      </div>
    </div>
  );
}
