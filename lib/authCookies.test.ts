import { describe, expect, it } from 'vitest';
import { buildScopedCookies } from './authCookies';

describe('buildScopedCookies', () => {
  it('root deployment keeps the Auth.js defaults', () => {
    expect(buildScopedCookies('', true)).toBeUndefined();
  });

  it('sub-path deployment: distinct names, scoped to the sub-path, secure prefix over https', () => {
    const cookies = buildScopedCookies('/sepolia', true)!;
    const all = Object.values(cookies);
    expect(new Set(all.map((c) => c.name)).size).toBe(all.length);
    for (const c of all) {
      expect(c.name.startsWith('__Secure-sepolia.authjs.')).toBe(true);
      expect(c.options).toMatchObject({ path: '/sepolia', httpOnly: true, sameSite: 'lax', secure: true });
    }
    // must never collide with the root app's cookie names
    expect(cookies.sessionToken.name).not.toBe('__Secure-authjs.session-token');
    expect(cookies.csrfToken.name).not.toContain('__Host-');
  });

  it('plain http (local) has no __Secure- prefix', () => {
    expect(buildScopedCookies('/sepolia', false)!.sessionToken).toMatchObject({
      name: 'sepolia.authjs.session-token',
      options: { secure: false },
    });
  });
});
