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

/** Anchor lifecycle states written by the backend; unknown future values must still be tolerated. */
export type AnchorStatus = 'confirmed' | 'pending' | 'failed' | 'legacy_local';

/** Outcomes of POST /verify and GET /verify/{hash} when `valid` is false (or "confirmed" when true). */
export type VerificationStatus =
  | 'confirmed'
  | 'pending'
  | 'anchor_failed'
  | 'hash_mismatch'
  | 'wallet_mismatch'
  | 'invalid_anchor_payload'
  | 'transaction_not_found'
  | 'chain_not_available';

/**
 * Blockchain anchor metadata. Every field is optional/nullable: responses from the backend that predates
 * multi-chain support carry no `anchor` object at all, and `status` strings may be values this build does not know.
 */
export type AnchorMetadata = {
  chain_id?: number | null;
  network_name?: string | null;
  anchor_type?: string | null;
  anchor_status?: AnchorStatus | (string & {}) | null;
  transaction_hash?: string | null;
  explorer_url?: string | null;
  explorer_tx_url?: string | null;
  block_number?: number | null;
  submitted_at?: string | null;
  confirmed_at?: string | null;
};

export type RegisterData = {
  content_hash: string | null;
  record_id: string | null;
  created_at: string | null;
  transaction_hash: string | null;
  issuer_id: string | null;
  filename: string | null;
  anchor: AnchorMetadata | null;
  anchor_status: string | null;
};

export type VerifyData = {
  valid: boolean | null;
  content_hash: string | null;
  record_id: string | null;
  created_at: string | null;
  transaction_hash: string | null;
  issuer_id: string | null;
  filename: string | null;
  anchor: AnchorMetadata | null;
  anchor_status: string | null;
  verification_status: string | null;
};

export type ResultStatus = 'success' | 'failure';

export interface ResultPayload {
  source: UploadMode;
  status: ResultStatus;
  response?: ApiResponse;
  error?: string;
}

export type RecordItem = {
  record_id: string;
  filename: string | null;
  content_hash: string;
  transaction_hash: string;
  issuer_id: string;
  content_type: string | null;
  created_at: string;
  anchor?: AnchorMetadata | null;
  anchor_status?: string | null;
};
