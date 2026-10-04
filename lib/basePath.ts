/**
 * Sub-path the app is served from ("" for the root deployment, "/sepolia" for the public-chain rehearsal).
 * Set once through NEXT_PUBLIC_BASE_PATH at build time; Next.js applies it to routing, assets, <Link> and router,
 * but NOT to raw fetch() URLs, <img src>, window.location or server-built absolute URLs - those use withBasePath().
 */
export function normalizeBasePath(raw: string | undefined | null): string {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '');
  if (trimmed === '' || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function withBasePath(path: string, basePath: string = BASE_PATH): string {
  if (!basePath || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path;
  return `${basePath}${path.startsWith('/') ? path : `/${path}`}`;
}
