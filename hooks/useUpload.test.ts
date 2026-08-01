import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const registerFileMock = vi.fn();
const verifyFileMock = vi.fn();
vi.mock('@components/api', () => ({
  registerFile: (...args: unknown[]) => registerFileMock(...args),
  verifyFile: (...args: unknown[]) => verifyFileMock(...args),
  UploadError: class UploadError extends Error {
    response?: unknown;
    constructor(message: string, response?: unknown) {
      super(message);
      this.response = response;
    }
  },
}));

vi.mock('@lib/i18n/LocaleContext', () => ({
  useLocale: () => ({ locale: 'id', t: { uploadErrors: { genericFailure: (op: string) => `Proses ${op} gagal.` } } }),
}));

import { useFileUpload } from './useUpload';
import { readResultPayload } from '@lib/resultPayload';

function makeFile() {
  return new File(['%PDF-1.4'], 'doc.pdf', { type: 'application/pdf' });
}

describe('useFileUpload', () => {
  beforeEach(() => {
    pushMock.mockReset();
    registerFileMock.mockReset();
    verifyFileMock.mockReset();
    window.sessionStorage.clear();
  });

  it('on successful register, stores the payload and navigates to /result/success', async () => {
    registerFileMock.mockResolvedValue({ data: { record_id: 'rec-1' }, statusCode: 200 });

    const { result } = renderHook(() => useFileUpload('register'));
    act(() => result.current.handleFileChange(makeFile()));
    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/result/success'));
    expect(readResultPayload()).toMatchObject({ source: 'register', status: 'success' });
  });

  it('when the backend reports already_existed, treats a register as a failure result', async () => {
    registerFileMock.mockResolvedValue({ data: { already_existed: true }, statusCode: 200 });

    const { result } = renderHook(() => useFileUpload('register'));
    act(() => result.current.handleFileChange(makeFile()));
    await act(async () => {
      await result.current.handleSubmit();
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/result/failure'));
  });

  it('does nothing when submitted with no file selected', async () => {
    const { result } = renderHook(() => useFileUpload('verify'));
    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(verifyFileMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
