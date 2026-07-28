import type { ApiResponse } from '@/types';

/**
 * Custom error class for handling upload-related errors.
 * It extends the built-in Error class and includes an optional response property to store additional details about the API response that caused the error.
 * This allows for more informative error handling in the context of file uploads, providing insights into what went wrong during the upload process.
 */
export class UploadError extends Error {
  response?: ApiResponse;

  constructor(message: string, response?: ApiResponse) {
    super(message);
    this.name = 'UploadError';
    this.response = response;
  }
}

/**
 * Helper function to submit a file upload request to the specified URL with the given FormData.
 * It handles the response, parsing it as JSON if possible, and throws an UploadError if the response is not successful.
 * @param url 
 * @param formData 
 * @returns A promise that resolves to the API response if the upload is successful, or throws an UploadError if it fails.
 * @throws Will throw an UploadError if the response is not successful, containing details about the failure.
 */
async function submit(url: string, formData: FormData): Promise<ApiResponse> {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();
  const payload = (responseText
    ? (() => {
        try {
          return JSON.parse(responseText) as ApiResponse;
        } catch {
          return { message: responseText } as ApiResponse;
        }
      })()
    : {}) as ApiResponse;

  payload.statusCode = response.status;

  if (!response.ok) {
    const backendMessage =
      typeof payload.backend === 'string'
        ? payload.backend
        : payload.backend && typeof payload.backend === 'object' && 'raw' in payload.backend
          ? String((payload.backend as { raw?: unknown }).raw ?? '')
          : '';

    const details = [payload.message, payload.error, backendMessage, payload.backendStatusText]
      .filter(Boolean)
      .join(' | ');

    throw new UploadError(details || `Upload failed (HTTP ${response.status})`, payload);
  }

  return payload;
}

/**
 * Function to handle file registration by submitting the file data to the '/api/register' endpoint.
 * It utilizes the submit helper function to perform the API call and manage the response.
 * @param formData
 * @returns A promise that resolves to the API response if the registration is successful, or throws an UploadError if it fails.
 */
export async function registerFile(formData: FormData) {
  return submit('/api/register', formData);
}

/**
 * Function to handle file verification by submitting the file data to the '/api/verify' endpoint.
 * It utilizes the submit helper function to perform the API call and manage the response.
 * @param formData 
 * @returns A promise that resolves to the API response if the verification is successful, or throws an UploadError if it fails.
 */
export async function verifyFile(formData: FormData) {
  return submit('/api/verify', formData);
}
