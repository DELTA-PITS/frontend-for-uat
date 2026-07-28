import type { UploadMode } from '@/types';
import type { ApiResponse } from '@/types/api.types';

type FailureMessageArgs = {
  source: UploadMode;
  response?: ApiResponse;
  error?: string;
};

function asData(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getOperationLabel(source: UploadMode) {
  return source === 'register' ? 'registration' : 'verification';
}

function getDefaultFailureMessage(source: UploadMode) {
  return `The ${getOperationLabel(source)} process failed.`;
}

function getCommonHttpFailureMessage(statusCode: number, source: UploadMode) {
  const operation = getOperationLabel(source);

  switch (statusCode) {
    case 400:
      return `The ${operation} request was invalid. Please check the file and try again.`;
    case 401:
      return 'Only registered publishers can register documents. Please sign in with a registered publisher account and retry.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested service was not found. Please try again later.';
    case 408:
      return `The ${operation} request timed out. Please retry.`;
    case 409:
      return source === 'register'
        ? 'Registration failed because the file is already registered in PITS.'
        : `The ${operation} request conflicts with the current server state.`;
    case 413:
      return 'The uploaded file is too large. Please select a smaller file.';
    case 415:
      return 'This file type is not supported.';
    case 422:
      return `The ${operation} request could not be processed. Please verify the file and retry.`;
    case 429:
      return 'Too many requests were sent. Please wait a moment and try again.';
    case 500:
      return 'The server encountered an internal error. Please try again later.';
    case 502:
      return 'The upstream service returned an invalid response. Please try again.';
    case 503:
      return 'The service is temporarily unavailable. Please try again later.';
    case 504:
      return 'The service took too long to respond. Please try again later.';
    default:
      return null;
  }
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isAlreadyRegistered(response?: ApiResponse) {
  const data = asData(response?.data);
  const backend = asData(response?.backend);

  return data.already_existed === true || backend.already_existed === true;
}

export function getUploadFailureMessage({ source, response, error }: FailureMessageArgs) {
  if (source === 'register' && isAlreadyRegistered(response)) {
    return 'Registration failed because the file is already registered in PITS.';
  }

  if (response?.statusCode) {
    const commonMessage = getCommonHttpFailureMessage(response.statusCode, source);
    if (commonMessage) return commonMessage;
  }

  if (response?.backendStatusText?.toLowerCase() === 'unauthorized') {
    return 'Only registered publishers can register documents. Please sign in with a registered publisher account and retry.';
  }

  if (hasText(error)) return error.trim();
  if (hasText(response?.error)) return response.error.trim();
  if (hasText(response?.message)) return response.message.trim();

  return getDefaultFailureMessage(source);
}