import { describe, expect, it } from 'vitest';
import {
  buildAnchorView,
  explorerName,
  formatBlockNumber,
  parseAnchor,
  resolveAnchorState,
  safeExplorerUrl,
  shortHash,
} from './anchor';

const TX = '0xeb912fd2728dc79330b592684ca687374a882273a43c0a21ccb95719b052ed19';
const SEPOLIA = {
  chain_id: 11155111,
  network_name: 'Ethereum Sepolia',
  anchor_status: 'confirmed',
  transaction_hash: TX,
  explorer_url: 'https://sepolia.etherscan.io',
  explorer_tx_url: `https://sepolia.etherscan.io/tx/${TX}`,
  block_number: 11839743,
};

describe('resolveAnchorState', () => {
  it.each([
    ['confirmed', 'confirmed'],
    ['pending', 'pending'],
    ['anchor_failed', 'failed'],
    ['transaction_not_found', 'not_found'],
    ['chain_not_available', 'unavailable'],
    ['hash_mismatch', 'mismatch'],
    ['wallet_mismatch', 'mismatch'],
    ['invalid_anchor_payload', 'mismatch'],
    ['something_new', 'unknown'],
  ])('verification_status %s -> %s', (status, expected) => {
    expect(resolveAnchorState({ verificationStatus: status })).toBe(expected);
  });

  it('verification_status wins over anchor_status', () => {
    expect(resolveAnchorState({ verificationStatus: 'pending', anchorStatus: 'confirmed' })).toBe('pending');
  });

  it.each([
    ['confirmed', 'confirmed'],
    ['pending', 'pending'],
    ['failed', 'failed'],
    ['legacy_local', 'legacy'],
    ['brand_new_status', 'unknown'],
  ])('anchor_status %s -> %s', (status, expected) => {
    expect(resolveAnchorState({ anchorStatus: status })).toBe(expected);
  });

  it('unknown status on the legacy Anvil chain is still legacy', () => {
    expect(resolveAnchorState({ anchorStatus: 'weird', chainId: 31337 })).toBe('legacy');
  });

  it('no status at all (backend without anchor support) is "none"', () => {
    expect(resolveAnchorState({})).toBe('none');
  });
});

describe('parseAnchor', () => {
  it('returns null for missing / non-object input', () => {
    for (const v of [undefined, null, 'x', 5, [], true]) expect(parseAnchor(v)).toBeNull();
  });

  it('keeps known fields and nulls the wrong types instead of throwing', () => {
    const parsed = parseAnchor({ chain_id: '11155111', block_number: 'x', network_name: 42, explorer_tx_url: ' ' });
    expect(parsed).toMatchObject({ chain_id: null, block_number: null, network_name: null, explorer_tx_url: null });
  });
});

describe('safeExplorerUrl', () => {
  it('accepts https only', () => {
    expect(safeExplorerUrl('https://sepolia.etherscan.io/tx/0x1')).toBe('https://sepolia.etherscan.io/tx/0x1');
    for (const bad of ['http://x.io', 'javascript:alert(1)', 'data:text/html,x', '//x.io', 'not a url', '', null, undefined]) {
      expect(safeExplorerUrl(bad as string | null | undefined)).toBeNull();
    }
  });
});

describe('explorerName', () => {
  it('derives the explorer name from the host, null when unknown', () => {
    expect(explorerName('https://sepolia.etherscan.io/tx/0x1')).toBe('Etherscan');
    expect(explorerName('https://basescan.org/tx/0x1')).toBe('Basescan');
    expect(explorerName('https://scan.example.org/tx/0x1')).toBeNull();
    expect(explorerName('https://evil-etherscan.io.attacker.com/tx/0x1')).toBeNull();
  });
});

describe('buildAnchorView', () => {
  it('Sepolia confirmed exposes network, tx, block and the backend explorer URL', () => {
    const view = buildAnchorView({ anchor: SEPOLIA });
    expect(view).toMatchObject({
      state: 'confirmed',
      networkName: 'Ethereum Sepolia',
      transactionHash: TX,
      blockNumber: 11839743,
      explorerUrl: `https://sepolia.etherscan.io/tx/${TX}`,
      isLegacy: false,
    });
  });

  it('never builds an explorer URL itself when the backend gave none', () => {
    expect(buildAnchorView({ anchor: { ...SEPOLIA, explorer_tx_url: null } }).explorerUrl).toBeNull();
  });

  it('legacy Anvil never gets an explorer link even if one were supplied', () => {
    const view = buildAnchorView({
      anchor: { chain_id: 31337, anchor_status: 'legacy_local', explorer_tx_url: 'https://x.io/tx/0x1' },
    });
    expect(view.isLegacy).toBe(true);
    expect(view.explorerUrl).toBeNull();
    expect(view.state).toBe('legacy');
  });

  it('old backend: no anchor object, flat unprefixed tx hash', () => {
    const view = buildAnchorView({ anchor: null, flatTransactionHash: 'ab'.repeat(32) });
    expect(view.state).toBe('none');
    expect(view.transactionHash).toBe(`0x${'ab'.repeat(32)}`);
    expect(view.networkName).toBeNull();
    expect(view.explorerUrl).toBeNull();
  });

  it('verification status overrides a confirmed anchor_status (e.g. chain not available)', () => {
    expect(buildAnchorView({ anchor: SEPOLIA, verificationStatus: 'transaction_not_found' }).state).toBe('not_found');
  });
});

describe('formatting', () => {
  it('shortens long hashes and leaves short ones alone', () => {
    expect(shortHash(TX)).toBe('0xeb912fd2…ed19');
    expect(shortHash('0x1234')).toBe('0x1234');
  });

  it('formats block numbers per locale', () => {
    expect(formatBlockNumber(11839743, 'en')).toBe('11,839,743');
    expect(formatBlockNumber(11839743, 'id')).toBe('11.839.743');
  });
});
