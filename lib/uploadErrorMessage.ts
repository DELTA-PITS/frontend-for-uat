import type { UploadMode } from '@/types';
import type { ApiResponse } from '@/types/api.types';
import type { Dictionary } from '@lib/i18n/translations';

type FailureMessageArgs = {
  source: UploadMode;
  response?: ApiResponse;
  error?: string;
  t: Dictionary;
};

function asData(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function getOperationLabel(source: UploadMode, t: Dictionary) {
  return source === 'register' ? t.uploadErrors.operationRegister : t.uploadErrors.operationVerify;
}

function getCommonHttpFailureMessage(statusCode: number, source: UploadMode, t: Dictionary) {
  const operation = getOperationLabel(source, t);
  const e = t.uploadErrors;

  switch (statusCode) {
    case 400:
      return e.invalidRequest(operation);
    case 401:
      return e.unauthorized;
    case 403:
      return e.forbidden;
    case 404:
      return e.notFound;
    case 408:
      return e.timeout(operation);
    case 409:
      return source === 'register' ? e.alreadyRegistered : e.conflict(operation);
    case 413:
      return e.tooLarge;
    case 415:
      return e.unsupportedType;
    case 422:
      return e.unprocessable(operation);
    case 429:
      return e.tooManyRequests;
    case 500:
      return e.serverError;
    case 502:
      return e.badGateway;
    case 503:
      return e.unavailable;
    case 504:
      return e.gatewayTimeout;
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

export function getUploadFailureMessage({ source, response, error, t }: FailureMessageArgs) {
  if (source === 'register' && isAlreadyRegistered(response)) {
    return t.uploadErrors.alreadyRegistered;
  }

  if (response?.statusCode) {
    const commonMessage = getCommonHttpFailureMessage(response.statusCode, source, t);
    if (commonMessage) return commonMessage;
  }

  if (response?.backendStatusText?.toLowerCase() === 'unauthorized') {
    return t.uploadErrors.unauthorized;
  }

  if (hasText(error)) return error.trim();
  if (hasText(response?.error)) return response.error.trim();
  if (hasText(response?.message)) return response.message.trim();

  return t.uploadErrors.genericFailure(getOperationLabel(source, t));
}
