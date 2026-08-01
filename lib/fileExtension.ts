/**
 * Extracts the lowercase file extension from a filename, without the leading dot.
 * Returns 'unknown' when the filename is missing or has no extension.
 */
export function getFileExtension(filename: string | null): string {
  if (!filename) return 'unknown';
  const parts = filename.split('.');
  if (parts.length < 2) return 'unknown';
  return (parts.pop() ?? 'unknown').toLowerCase();
}
