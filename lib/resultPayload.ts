import type { ResultPayload } from "@/types";


const QUERY_KEY = 'payload';

export function buildResultHref(payload: ResultPayload) {
  return `/result/${payload.status}?${QUERY_KEY}=${encodeURIComponent(JSON.stringify(payload))}`;
}

export function parseResultPayload(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<ResultPayload>;
    if (!parsed || (parsed.source !== 'register' && parsed.source !== 'verify')) return null;
    if (parsed.status !== 'success' && parsed.status !== 'failure') return null;
    return parsed as ResultPayload;
  } catch {
    return null;
  }
}
