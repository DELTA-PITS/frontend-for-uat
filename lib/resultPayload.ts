import type { ResultPayload } from '@/types';

const STORAGE_KEY = 'pits:resultPayload';

/**
 * Stores the result payload (hash, record ID, transaction hash) in
 * sessionStorage instead of the URL — this data shouldn't end up in the
 * browser's address bar, history, or server access logs. Returns a bare
 * `/result/<status>` href; the result page reads the payload back via
 * `readResultPayload()`.
 */
export function buildResultHref(payload: ResultPayload) {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // sessionStorage unavailable (private browsing, quota) — the result
      // page falls back to its no-payload state, which it already handles.
    }
  }

  return `/result/${payload.status}`;
}

export function readResultPayload(): ResultPayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ResultPayload>;
    if (!parsed || (parsed.source !== 'register' && parsed.source !== 'verify')) return null;
    if (parsed.status !== 'success' && parsed.status !== 'failure') return null;
    return parsed as ResultPayload;
  } catch {
    return null;
  }
}
