/**
 * Computes the SHA-256 hex digest of a File entirely client-side (Web Crypto API).
 * Purely informational — the backend independently recomputes the hash on
 * submit, this is only shown to the user as a preview before they submit.
 */
export async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
