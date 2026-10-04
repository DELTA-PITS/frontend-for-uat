/** Backend response fixtures for blockchain-anchor UI states (shapes mirror the real Sepolia rehearsal API). */
export const CANONICAL_HASH = '613171c873064a79d01805ba70f1cb5f4460800e46e83b8728d6bbf32b6adde9';
export const CANONICAL_TX = '0xeb912fd2728dc79330b592684ca687374a882273a43c0a21ccb95719b052ed19';
export const CANONICAL_EXPLORER_URL = `https://sepolia.etherscan.io/tx/${CANONICAL_TX}`;

const baseRecord = {
  record_id: '1b752465-a85e-4ae1-ba2e-812d0a83b16f',
  content_hash: CANONICAL_HASH,
  transaction_hash: CANONICAL_TX.slice(2), // the backend stores/echoes it without 0x
  issuer_id: 'e5100f48-caeb-4cb9-a094-d3b534c7adaa',
  filename: 'pits-sepolia-canonical.pdf',
  content_type: 'application/pdf',
  created_at: '2026-10-04 03:25:19.886495+00:00',
};

const sepoliaAnchor = {
  chain_id: 11155111,
  network_name: 'Ethereum Sepolia',
  anchor_type: 'calldata-v1',
  anchor_status: 'confirmed',
  transaction_hash: CANONICAL_TX,
  explorer_url: 'https://sepolia.etherscan.io',
  explorer_tx_url: CANONICAL_EXPLORER_URL,
  block_number: 11839743,
  submitted_at: '2026-10-04 03:25:21.981641+00:00',
  confirmed_at: '2026-10-04 03:25:24.712918+00:00',
};

export const fixtures = {
  sepoliaConfirmed: {
    valid: true,
    ...baseRecord,
    anchor_status: 'confirmed',
    anchor: sepoliaAnchor,
    verification_status: 'confirmed',
  },
  sepoliaPending: {
    valid: false,
    ...baseRecord,
    anchor_status: 'pending',
    anchor: { ...sepoliaAnchor, anchor_status: 'pending', block_number: null, confirmed_at: null },
    verification_status: 'pending',
  },
  sepoliaFailed: {
    valid: false,
    ...baseRecord,
    anchor_status: 'failed',
    anchor: { ...sepoliaAnchor, anchor_status: 'failed' },
    verification_status: 'anchor_failed',
  },
  transactionNotFound: {
    valid: false,
    ...baseRecord,
    anchor_status: 'legacy_local',
    anchor: {
      chain_id: 31337,
      network_name: 'Local development chain (Anvil)',
      anchor_type: 'calldata-v1',
      anchor_status: 'legacy_local',
      transaction_hash: `0x${'98f4fac17e'.padEnd(64, '0')}`,
      explorer_url: null,
      explorer_tx_url: null,
      block_number: null,
    },
    verification_status: 'transaction_not_found',
  },
  anvilLegacy: {
    valid: true,
    ...baseRecord,
    anchor_status: 'legacy_local',
    anchor: {
      chain_id: 31337,
      network_name: 'Local development chain (Anvil)',
      anchor_type: 'calldata-v1',
      anchor_status: 'legacy_local',
      transaction_hash: CANONICAL_TX,
      explorer_url: null,
      explorer_tx_url: null,
      block_number: 12,
    },
    verification_status: 'confirmed',
  },
  chainNotAvailable: {
    valid: false,
    ...baseRecord,
    anchor_status: 'legacy_local',
    anchor: {
      chain_id: 31337,
      network_name: 'Local development chain (Anvil)',
      anchor_status: 'legacy_local',
      transaction_hash: CANONICAL_TX,
      explorer_url: null,
      explorer_tx_url: null,
    },
    verification_status: 'chain_not_available',
  },
  oldBackend: {
    valid: true,
    ...baseRecord,
    created_at: '2026-09-06 18:34:36.812536+00:00',
  },
  unknownStatus: {
    valid: false,
    ...baseRecord,
    anchor_status: 'quantum_pending',
    anchor: { ...sepoliaAnchor, anchor_status: 'quantum_pending' },
    verification_status: 'quantum_pending',
  },
} as const;
