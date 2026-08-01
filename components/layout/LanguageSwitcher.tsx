'use client';

import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Simple ID/EN toggle. Two buttons rather than a dropdown — only two
 * options exist, so a dropdown would just add an extra click.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex shrink-0 items-center rounded-md border border-base-300 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLocale('id')}
        aria-pressed={locale === 'id'}
        className={`rounded-l-md px-2 py-1.5 transition-colors ${locale === 'id' ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'
          }`}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`rounded-r-md px-2 py-1.5 transition-colors ${locale === 'en' ? 'bg-primary text-primary-content' : 'text-base-content hover:bg-base-200'
          }`}
      >
        EN
      </button>
    </div>
  );
}
