'use client';

import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Trust-building card shown below the upload card on the public Verify
 * page. Framed around "why this system can be trusted" rather than a bare
 * checklist of file constraints — public visitors care more about
 * legitimacy than technical specs.
 */
export default function TipsCard() {
  const { t } = useLocale();

  return (
    <div className="mt-6 w-full rounded-2xl border border-base-300 bg-base-100 p-5">
      <p className="mb-3 text-xs font-semibold text-base-content">{t.tips.heading}</p>
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {t.tips.items.map((reason) => (
          <li key={reason} className="flex items-start gap-2 text-xs text-ink-secondary">
            <CheckCircleOutlinedIcon className="mt-0.5 shrink-0 text-primary" style={{ fontSize: '1.1rem' }} />
            {reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
