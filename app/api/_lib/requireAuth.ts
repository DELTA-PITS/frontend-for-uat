import { NextResponse } from 'next/server';
import { auth } from '@/auth';

type RequireAuthResult = { ok: true; accessToken: string } | { ok: false; response: NextResponse };

/**
 * Single source of truth for "does this API route have a valid Keycloak
 * session". Centralized so every publisher-only route (register, records)
 * enforces it the same way — a new route that forgets to call this fails
 * open by omission, not by a copy-pasted check quietly drifting out of sync.
 */
export async function requireAccessToken(): Promise<RequireAuthResult> {
  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return {
      ok: false,
      response: NextResponse.json({ message: 'Missing Keycloak access token' }, { status: 401 }),
    };
  }

  return { ok: true, accessToken };
}
