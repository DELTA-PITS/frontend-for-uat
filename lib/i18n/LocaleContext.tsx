'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Locale, type Dictionary } from '@lib/i18n/translations';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = 'pits-locale';

/**
 * App-wide language provider. Persists the chosen locale (id/en) to
 * localStorage so it survives navigation and reloads. Defaults to 'id'
 * during SSR/first paint to avoid hydration mismatches, then syncs from
 * localStorage on mount.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'id' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

/** Access the current locale, its translation dictionary, and a setter to switch language. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
