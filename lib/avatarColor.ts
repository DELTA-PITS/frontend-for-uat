import { C } from '@lib/colors';

const PALETTE = Object.values(C);

/**
 * Deterministically maps an arbitrary ID string (e.g. a Keycloak UUID) to a
 * color from the shared palette, so the same ID always renders with the same
 * color across the app — useful as a visual stand-in when no human-readable
 * name is available for that ID.
 */
export function getColorForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
