import type { ApiResponse } from '@/types/api.types';

export type UploadMode = 'register' | 'verify';

export interface UploadFeedback {
  type: 'success' | 'error';
  message: string;
}

export interface UseFileUploadReturn {
  file: File | null;
  fileName: string | null;
  isUploading: boolean;
  feedback: UploadFeedback
 | null;
  handleFileChange: (selectedFile: File | null) => void;
  handleSubmit: () => Promise<void>;
}

export type RawData = Record<string, unknown>;

export type RegisterData = {
  content_hash: string | null;
  record_id: string | null;
  created_at: string | null;
  transaction_hash: string | null;
  issuer_id: string | null;
  filename: string | null;
};

export type VerifyData = {
  valid: boolean | null;
  content_hash: string | null;
  record_id: string | null;
  created_at: string | null;
  transaction_hash: string | null;
  issuer_id: string | null;
  filename: string | null;
};

export type ResultStatus = 'success' | 'failure';

export interface ResultPayload {
  source: UploadMode;
  status: ResultStatus;
  response?: ApiResponse;
  error?: string;
}
