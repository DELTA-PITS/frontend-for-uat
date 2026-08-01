const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export type ParseUploadResult =
  | { ok: true; file: File; filename: string }
  | { ok: false; status: 400 | 413 | 415; message: string };

/**
 * Parses and validates the file upload from a multipart form request.
 * Mirrors the client-side Dropzone constraints (PDF only, 20 MB max) so a
 * request that bypasses the browser UI (curl, a modified client) can't
 * push an oversized or non-PDF file to the backend.
 */
export async function parseUpload(request: Request): Promise<ParseUploadResult> {
  const formData = await request.formData();
  const file = formData.get('file');
  const filename = formData.get('filename');

  if (!(file instanceof File) || typeof filename !== 'string') {
    return { ok: false, status: 400, message: 'Invalid upload payload' };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, message: 'File size exceeds the 20 MB limit' };
  }

  const hasPdfExtension = filename.toLowerCase().endsWith('.pdf');
  const hasPdfType = file.type === '' || file.type === 'application/pdf';
  if (!hasPdfExtension || !hasPdfType) {
    return { ok: false, status: 415, message: 'Only PDF files are supported' };
  }

  return { ok: true, file, filename };
}
