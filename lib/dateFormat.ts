import type { Locale } from '@lib/i18n/translations';

/**
 * Formats a date string into "April 16, 2024, 11.30" (or "16 April 2024,
 * 11.30" for Indonesian). Returns the original value when the input cannot
 * be parsed.
 */
export function formatDisplayDateTime(value: string | null, locale: Locale = 'en'): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const localeTag = locale === 'id' ? 'id-ID' : 'en-US';
  const month = date.toLocaleString(localeTag, { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return locale === 'id'
    ? `${day} ${month} ${year}, ${hours}.${minutes}`
    : `${month} ${day}, ${year}, ${hours}.${minutes}`;
}
