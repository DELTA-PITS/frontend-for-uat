import { NextResponse } from 'next/server';
import { parseUpload } from '../_lib/parseUpload';

const BACKEND_VERIFY_URL = process.env.PITS_BACKEND_VERIFY_URL;

/**
 * API route handler for processing file verification requests. It receives a file upload request, extracts the file, and forwards it to the backend verification endpoint. The handler manages the response from the backend, returning appropriate success or error messages based on the outcome of the verification process. It ensures that necessary environment variables are configured and handles any exceptions that may occur during the request processing.
 * @param request 
 * @returns A NextResponse object containing the result of the verification request, including success or error messages and relevant data from the backend response.
 */
export async function POST(request: Request) {
  try {
    if (!BACKEND_VERIFY_URL) {
      return NextResponse.json({ message: 'PITS_BACKEND_VERIFY_URL is not configured' }, { status: 503 });
    }

    const upload = await parseUpload(request);
    if (!upload.ok) return NextResponse.json({ message: upload.message }, { status: upload.status });

    const formData = new FormData();
    formData.append('file', upload.file);

    const backendResponse = await fetch(BACKEND_VERIFY_URL, { method: 'POST', body: formData });
    const backendText = await backendResponse.text();
    const backendPayload = backendText
      ? (() => {
          try {
            return JSON.parse(backendText);
          } catch {
            return { raw: backendText };
          }
        })()
      : null;

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: 'Verify request failed',
          backend: backendPayload,
          backendStatusText: backendResponse.statusText,
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(
      {
        message: 'Verify request succeeded',
        data: backendPayload,
      },
      { status: backendResponse.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Verify request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
