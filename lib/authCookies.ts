/**
 * Auth.js cookie names/paths for a sub-path deployment. The rehearsal app (/sepolia) shares its host with the
 * root app, and Auth.js cookies default to path "/" with fixed names: without this, signing in on one would
 * overwrite - and effectively sign out - the other. Each cookie gets its own name and is scoped to the sub-path,
 * so the browser never even sends it to the root app. Returns undefined for the root deployment (Auth.js defaults).
 */
type CookieOptions = { httpOnly: boolean; sameSite: 'lax'; path: string; secure: boolean };
type NamedCookie = { name: string; options: CookieOptions };

export function buildScopedCookies(basePath: string, secure: boolean) {
  if (!basePath) return undefined;
  const prefix = secure ? '__Secure-' : '';
  const cookie = (suffix: string): NamedCookie => ({
    name: `${prefix}${basePath.slice(1).replace(/\W+/g, '-')}.authjs.${suffix}`,
    options: { httpOnly: true, sameSite: 'lax', path: basePath, secure },
  });
  return {
    sessionToken: cookie('session-token'),
    callbackUrl: cookie('callback-url'),
    csrfToken: cookie('csrf-token'),
    pkceCodeVerifier: cookie('pkce.code_verifier'),
    state: cookie('state'),
    nonce: cookie('nonce'),
  };
}
