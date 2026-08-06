import { describe, expect, it } from 'vitest';
import { getUploadFailureMessage } from './uploadErrorMessage';
import { translations } from './i18n/translations';
import type { ApiResponse } from '../types/api.types';

const t = translations.id;

describe('getUploadFailureMessage', () => {
  it('prioritizes the already-registered case for register, over the generic 409 message', () => {
    const response = { statusCode: 409, data: { already_existed: true } } as unknown as ApiResponse;
    expect(getUploadFailureMessage({ source: 'register', response, t })).toBe(t.uploadErrors.alreadyRegistered);
  });

  it('maps known HTTP status codes to their dedicated message', () => {
    const response = { statusCode: 413 } as ApiResponse;
    expect(getUploadFailureMessage({ source: 'register', response, t })).toBe(t.uploadErrors.tooLarge);
  });

  it('maps 409 for verify to the generic conflict message (not already-registered)', () => {
    const response = { statusCode: 409 } as ApiResponse;
    expect(getUploadFailureMessage({ source: 'verify', response, t })).toBe(t.uploadErrors.conflict(t.uploadErrors.operationVerify));
  });

  it('falls back to the raw error string when there is no matching status code', () => {
    expect(getUploadFailureMessage({ source: 'register', error: 'Network down', t })).toBe('Network down');
  });

  it('falls back to the generic failure message when nothing else applies', () => {
    expect(getUploadFailureMessage({ source: 'verify', t })).toBe(
      t.uploadErrors.genericFailure(t.uploadErrors.operationVerify),
    );
  });

  it('treats an unrecognized status code as no match and falls through to response.message', () => {
    const response = { statusCode: 999, message: 'Odd backend status' } as ApiResponse;
    expect(getUploadFailureMessage({ source: 'verify', response, t })).toBe('Odd backend status');
  });
});
