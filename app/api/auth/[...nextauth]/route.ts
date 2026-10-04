import { NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { BASE_PATH } from '@lib/basePath';

/**
 * Next.js strips its basePath from the pathname a route handler sees, but Auth.js is configured with the full
 * `${BASE_PATH}/api/auth` (it uses that same value to build the callback/redirect URLs it sends to Keycloak),
 * so for a sub-path deployment the prefix is put back before the request reaches Auth.js. No-op at the root.
 */
function withBasePath(request: NextRequest): NextRequest {
  if (!BASE_PATH) return request;
  const url = new URL(request.url);
  url.pathname = `${BASE_PATH}${url.pathname}`;
  return new NextRequest(url, request);
}

export const GET = (request: NextRequest) => handlers.GET(withBasePath(request));
export const POST = (request: NextRequest) => handlers.POST(withBasePath(request));
