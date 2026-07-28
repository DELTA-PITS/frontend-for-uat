import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { parseUpload } from '../_lib/parseUpload';

const BACKEND_REGISTER_URL = process.env.PITS_BACKEND_REGISTER_URL;
const DEFAULT_ISSUER_ID = 'e99aef26-88f2-4e24-8934-3cd3ac27b439';


/**
 * API route handler for processing file registration requests. It receives a file upload request, extracts the file and relevant information, and forwards it to the backend registration endpoint. The handler also manages the response from the backend, returning appropriate success or error messages based on the outcome of the registration process. It ensures that necessary environment variables are configured and handles any exceptions that may occur during the request processing.
 * @param request 
 * @returns A NextResponse object containing the result of the registration request, including success or error messages and relevant data from the backend response.
 */
export async function POST(request: Request) {
  try {
    if (!BACKEND_REGISTER_URL) {
      return NextResponse.json({ message: 'PITS_BACKEND_REGISTER_URL is not configured' }, { status: 503 });
    }

    const session = await auth();
    const accessToken = session?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ message: 'Missing Keycloak access token' }, { status: 401 });
    }

    const issuerId = process.env.PITS_ISSUER_ID ?? DEFAULT_ISSUER_ID;
    const upload = await parseUpload(request);
    if (!upload) return NextResponse.json({ message: 'Invalid upload payload' }, { status: 400 });

    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('filename', upload.filename);
    formData.append('issuer_id', issuerId);

    const backendResponse = await fetch(BACKEND_REGISTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
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
          message: 'Register request failed',
          backend: backendPayload,
          backendStatusText: backendResponse.statusText,
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(
      {
        message: 'Register request succeeded',
        data: backendPayload,
      },
      { status: backendResponse.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Register request failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
