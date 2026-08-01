'use client';

import RuleOutlinedIcon from '@mui/icons-material/Rule';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Lists the file requirements for registration — placed near the upload
 * area on the Register page so publishers know what's expected before
 * they pick a file, reducing failed-submission round trips.
 */
export default function RequirementCard() {
  const { t } = useLocale();

  return (
    <div className="w-full rounded-2xl border border-base-300 bg-base-100 p-5">
      <div className="mb-3 flex items-center gap-2">
        <RuleOutlinedIcon className="text-secondary" style={{ fontSize: '1.2rem' }} />
        <p className="text-xs font-semibold text-base-content">{t.requirement.heading}</p>
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {t.requirement.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-ink-secondary">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
