import type { AnchorMetadata, RawData } from '@/types';

/**
 * UI-level state of a blockchain anchor, derived from whatever the backend reported. The backend is the
 * source of truth for network name and explorer URL; this module only interprets status and sanitises values.
 */
export type AnchorState =
  | 'confirmed'
  | 'pending'
  | 'failed'
  | 'not_found'
  | 'legacy'
  | 'unavailable'
  | 'mismatch'
  | 'unknown'
  | 'none';

/** Chain id of the local Anvil development chain used before public-chain support. */
export const LEGACY_LOCAL_CHAIN_ID = 31337;

const VERIFICATION_STATE: Record<string, AnchorState> = {
  confirmed: 'confirmed',
  pending: 'pending',
  anchor_failed: 'failed',
  transaction_not_found: 'not_found',
  chain_not_available: 'unavailable',
  hash_mismatch: 'mismatch',
  wallet_mismatch: 'mismatch',
  invalid_anchor_payload: 'mismatch',
};

const ANCHOR_STATE: Record<string, AnchorState> = {
  confirmed: 'confirmed',
  pending: 'pending',
  failed: 'failed',
  legacy_local: 'legacy',
};

export type AnchorView = {
  state: AnchorState;
  networkName: string | null;
  chainId: number | null;
  transactionHash: string | null;
  blockNumber: number | null;
  explorerUrl: string | null;
  isLegacy: boolean;
};

function asRecord(value: unknown): RawData | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as RawData) : null;
}

function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function int(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/** Defensive parse of the backend `anchor` object; anything that is not a plain object yields null. */
export function parseAnchor(value: unknown): AnchorMetadata | null {
  const raw = asRecord(value);
  if (!raw) return null;
  return {
    chain_id: int(raw.chain_id),
    network_name: str(raw.network_name),
    anchor_type: str(raw.anchor_type),
    anchor_status: str(raw.anchor_status),
    transaction_hash: str(raw.transaction_hash),
    explorer_url: str(raw.explorer_url),
    explorer_tx_url: str(raw.explorer_tx_url),
    block_number: int(raw.block_number),
    submitted_at: str(raw.submitted_at),
    confirmed_at: str(raw.confirmed_at),
  };
}

/** Only absolute https URLs are rendered as links (a backend value must never become a `javascript:` href). */
export function safeExplorerUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const EXPLORER_NAMES: Array<[suffix: string, name: string]> = [
  ['etherscan.io', 'Etherscan'],
  ['basescan.org', 'Basescan'],
  ['arbiscan.io', 'Arbiscan'],
  ['polygonscan.com', 'Polygonscan'],
];

/** Display name of the explorer taken from the URL's host; null when unknown (caller uses generic wording). */
export function explorerName(url: string | null): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return EXPLORER_NAMES.find(([suffix]) => host === suffix || host.endsWith(`.${suffix}`))?.[1] ?? null;
  } catch {
    return null;
  }
}

export function resolveAnchorState(args: {
  verificationStatus?: string | null;
  anchorStatus?: string | null;
  chainId?: number | null;
}): AnchorState {
  const { verificationStatus, anchorStatus, chainId } = args;
  if (verificationStatus) return VERIFICATION_STATE[verificationStatus] ?? 'unknown';
  if (anchorStatus) {
    const mapped = ANCHOR_STATE[anchorStatus];
    if (mapped) return mapped;
    return chainId === LEGACY_LOCAL_CHAIN_ID ? 'legacy' : 'unknown';
  }
  return 'none';
}

export function buildAnchorView(args: {
  anchor?: AnchorMetadata | null;
  flatTransactionHash?: string | null;
  anchorStatus?: string | null;
  verificationStatus?: string | null;
}): AnchorView {
  const anchor = args.anchor ?? null;
  const chainId = anchor?.chain_id ?? null;
  const state = resolveAnchorState({
    verificationStatus: args.verificationStatus,
    anchorStatus: anchor?.anchor_status ?? args.anchorStatus,
    chainId,
  });
  const isLegacy = state === 'legacy' || chainId === LEGACY_LOCAL_CHAIN_ID;
  const hash = anchor?.transaction_hash ?? args.flatTransactionHash ?? null;
  return {
    state,
    networkName: anchor?.network_name ?? null,
    chainId,
    transactionHash: hash ? (hash.startsWith('0x') ? hash : `0x${hash}`) : null,
    blockNumber: anchor?.block_number ?? null,
    explorerUrl: isLegacy ? null : safeExplorerUrl(anchor?.explorer_tx_url),
    isLegacy,
  };
}

/** `0xeb912fd2…ed19` - for narrow screens; the full value stays available via title / copy. */
export function shortHash(hash: string, head = 8, tail = 4): string {
  const body = hash.startsWith('0x') ? hash.slice(2) : hash;
  if (body.length <= head + tail + 1) return hash;
  return `0x${body.slice(0, head)}…${body.slice(-tail)}`;
}

export function formatBlockNumber(block: number, locale: 'id' | 'en'): string {
  return block.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US');
}
