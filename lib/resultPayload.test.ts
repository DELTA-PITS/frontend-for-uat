import { beforeEach, describe, expect, it } from 'vitest';
import { buildResultHref, readResultPayload } from './resultPayload';
import type { ResultPayload } from '../types';

const samplePayload: ResultPayload = {
  source: 'register',
  status: 'success',
  response: { data: { record_id: 'abc-123', content_hash: 'deadbeef' } },
};

describe('buildResultHref', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns a bare /result/<status> href with no payload data in it', () => {
    const href = buildResultHref(samplePayload);
    expect(href).toBe('/result/success');
    expect(href).not.toContain('record_id');
    expect(href).not.toContain('deadbeef');
  });

  it('stores the payload in sessionStorage so it can be read back', () => {
    buildResultHref(samplePayload);
    expect(readResultPayload()).toEqual(samplePayload);
  });
});

describe('readResultPayload', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('returns null when nothing was stored', () => {
    expect(readResultPayload()).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    window.sessionStorage.setItem('pits:resultPayload', '{not json');
    expect(readResultPayload()).toBeNull();
  });

  it('returns null when source is not register/verify', () => {
    window.sessionStorage.setItem('pits:resultPayload', JSON.stringify({ source: 'other', status: 'success' }));
    expect(readResultPayload()).toBeNull();
  });

  it('returns null when status is not success/failure', () => {
    window.sessionStorage.setItem(
      'pits:resultPayload',
      JSON.stringify({ source: 'verify', status: 'pending' }),
    );
    expect(readResultPayload()).toBeNull();
  });
});
