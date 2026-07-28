import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const BACKEND_RECORDS_URL = process.env.PITS_BACKEND_RECORDS_URL;

export async function GET() {
  if (!BACKEND_RECORDS_URL) {
    return NextResponse.json({ message: 'PITS_BACKEND_RECORDS_URL is not configured' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Missing Keycloak access token' }, { status: 401 });
  }

  const response = await fetch(BACKEND_RECORDS_URL, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => null);
  return NextResponse.json(payload ?? { message: 'Empty backend response' }, { status: response.status });
}
