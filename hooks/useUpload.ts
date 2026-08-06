'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildResultHref } from '@lib/resultPayload';
import { getUploadFailureMessage } from '@lib/uploadErrorMessage';
import { registerFile, verifyFile } from '@components/api';
import type { UploadMode, UseFileUploadReturn, ResultStatus } from '../types/files.types';
import { UploadError } from '@components/api';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Determine the result status based on the upload mode and API response data.
 * @param mode
 * @param data 
 * @returns The result status, which can be 'success' or 'failure', based on the content of the API response data and the upload mode.
 */
function getResultStatus(mode: UploadMode, data: unknown): ResultStatus {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'success';

  if (mode === 'register') {
    return (data as { already_existed?: unknown }).already_existed === true ? 'failure' : 'success';
  }

  return (data as { valid?: unknown }).valid === false ? 'failure' : 'success';
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Custom hook to manage file upload state and actions for both registration and verification modes.
 * @param mode - The upload mode, either 'register' or 'verify'.
 * @returns An object containing the file, file name, upload status, feedback, and handlers for file change and submission.
 * @throws Will throw an error if the upload process encounters an issue, which is caught and handled within the hook.
 */
export function useFileUpload(mode: UploadMode): UseFileUploadReturn {
  const router = useRouter();
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  /**
   * Handle file selection changes, updating the file and file name state accordingly.
   */
  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setFileName(selectedFile?.name ?? null);
  };

  /**
   * Handle the file upload submission process, including API calls, feedback management, and navigation to results page.
   * It manages the upload state and provides user feedback based on the success or failure of the upload operation.
   * In case of an error during the upload, it captures the error details and navigates to a results page with the error information.
   * @returns A promise that resolves when the upload process is complete, regardless of success or failure.
    * @throws Will throw an error if the upload process encounters an issue, which is caught and handled within the function.
   */
  const handleSubmit = async () => {
    if (!file || isUploading) return;

    const startedAt = Date.now();
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', fileName ?? '');

      const response = await (mode === 'register' ? registerFile(formData) : verifyFile(formData));
      const status = getResultStatus(mode, response.data);

      const elapsed = Date.now() - startedAt;
      if (elapsed < 1000) {
        await wait(1000 - elapsed);
      }

      router.push(buildResultHref({ source: mode, status, response }));
    } catch (error) {
      const response = error instanceof UploadError ? error.response : undefined;
      const message = getUploadFailureMessage({
        source: mode,
        response,
        error: error instanceof Error ? error.message : 'Upload failed',
        t,
      });

      const elapsed = Date.now() - startedAt;
      if (elapsed < 1000) {
        await wait(1000 - elapsed);
      }

      router.push(buildResultHref({ source: mode, status: 'failure', response, error: message }));
    } finally {
    }
  };

  return {
    file,
    fileName,
    isUploading,
    feedback: null,
    handleFileChange,
    handleSubmit,
  };
}
