export interface ApiResponse {
  statusCode?: number;
  message?: string;
  data?: unknown;
  backend?: unknown;
  error?: string;
  backendStatusText?: string;
}