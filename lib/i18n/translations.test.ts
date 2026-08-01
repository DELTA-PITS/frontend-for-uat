import { describe, expect, it } from 'vitest';
import { translations } from './translations';

/** Recursively collects the key path of every leaf (non-object) value. */
function collectLeafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return [prefix];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('translations dictionary', () => {
  it('has the exact same set of keys in id and en', () => {
    const idKeys = collectLeafPaths(translations.id).sort();
    const enKeys = collectLeafPaths(translations.en).sort();

    expect(enKeys).toEqual(idKeys);
  });

  // `dropzone.titleRest` is deliberately '' in both locales (the copy was
  // shortened to a single line) — everything else should be non-empty.
  const ALLOWED_EMPTY = new Set(['dropzone.titleRest']);

  it('has non-empty string values for every leaf (no placeholder gaps)', () => {
    for (const locale of ['id', 'en'] as const) {
      for (const path of collectLeafPaths(translations[locale])) {
        if (ALLOWED_EMPTY.has(path)) continue;
        const value = path
          .split('.')
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], translations[locale]);
        if (typeof value === 'function') continue;
        expect(typeof value === 'string' && value.trim().length > 0, `${locale}.${path} should be a non-empty string`).toBe(
          true,
        );
      }
    }
  });
});
