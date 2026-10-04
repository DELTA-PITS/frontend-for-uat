import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BlockchainProof from './BlockchainProof';
import { LocaleProvider } from '@lib/i18n/LocaleContext';
import { installMemoryStorage } from '@lib/testStorage';
import { CANONICAL_EXPLORER_URL, CANONICAL_TX, fixtures } from '@lib/anchorFixtures';
import type { AnchorMetadata } from '@/types';

type Fixture = { anchor?: unknown; transaction_hash?: string; anchor_status?: string; verification_status?: string };

function renderProof(f: Fixture, locale: 'id' | 'en' = 'en') {
  window.localStorage.setItem('pits-locale', locale);
  return render(
    <LocaleProvider>
      <BlockchainProof
        anchor={f.anchor as AnchorMetadata | undefined}
        transactionHash={f.transaction_hash}
        anchorStatus={f.anchor_status}
        verificationStatus={f.verification_status}
      />
    </LocaleProvider>,
  );
}

beforeEach(() => installMemoryStorage());
afterEach(cleanup);

const text = () => document.body.textContent ?? '';

describe('BlockchainProof', () => {
  it('Sepolia confirmed: network from backend, status, tx, block, Etherscan link from backend URL', () => {
    renderProof(fixtures.sepoliaConfirmed);
    expect(screen.getByTestId('proof-network').textContent).toBe('Ethereum Sepolia');
    expect(screen.getByTestId('proof-status').textContent).toBe('Confirmed');
    expect(screen.getByTestId('proof-tx').getAttribute('title')).toBe(CANONICAL_TX);
    expect(screen.getByTestId('proof-block').textContent).toBe('11,839,743');
    const link = screen.getByTestId('proof-explorer-link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(CANONICAL_EXPLORER_URL);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toContain('View on Etherscan');
    expect(text()).toContain('independently inspected');
    expect(text()).not.toMatch(/Testnet Lokal|Local Testnet/);
  });

  it('Indonesian wording', () => {
    renderProof(fixtures.sepoliaConfirmed, 'id');
    // provider syncs the stored locale in an effect, which RTL flushes before the assertions below
    expect(screen.getByTestId('proof-status').textContent).toBe('Terkonfirmasi');
    expect(screen.getByTestId('proof-explorer-link').textContent).toContain('Lihat di Etherscan');
    expect(screen.getByTestId('proof-block').textContent).toBe('11.839.743');
  });

  it('pending: not presented as verified, still links to the transaction', () => {
    renderProof(fixtures.sepoliaPending);
    expect(screen.getByTestId('proof-status').textContent).toBe('Awaiting blockchain confirmation');
    expect(screen.getByTestId('blockchain-proof').getAttribute('data-anchor-state')).toBe('pending');
    expect(screen.queryByTestId('proof-block')).toBeNull();
  });

  it('failed', () => {
    renderProof(fixtures.sepoliaFailed);
    expect(screen.getByTestId('proof-status').textContent).toBe('Blockchain anchoring failed');
  });

  it('transaction_not_found renders without crashing and without an explorer link', () => {
    renderProof(fixtures.transactionNotFound);
    expect(screen.getByTestId('proof-status').textContent).toBe('Blockchain transaction not found');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
  });

  it('Anvil legacy: neutral label, Legacy badge, no Etherscan', () => {
    renderProof(fixtures.anvilLegacy);
    expect(screen.getByTestId('proof-network').textContent).toBe('Local development chain (Anvil)');
    expect(text()).toContain('Legacy');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
    expect(text()).not.toContain('Etherscan');
    expect(text()).toContain('cannot be publicly verified');
  });

  it('chain_not_available shows the legacy-network message', () => {
    renderProof(fixtures.chainNotAvailable);
    expect(screen.getByTestId('proof-status').textContent).toBe(
      'The legacy blockchain network is not available for public verification.',
    );
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
  });

  it('old backend (no anchor object): generic network, no status, no link, no crash', () => {
    renderProof(fixtures.oldBackend);
    expect(screen.getByTestId('proof-network').textContent).toBe('Blockchain network');
    expect(screen.queryByTestId('proof-status')).toBeNull();
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
    expect(screen.getByTestId('proof-tx').getAttribute('title')).toBe(`0x${fixtures.oldBackend.transaction_hash}`);
    expect(text()).not.toMatch(/Testnet|Etherscan/);
  });

  it('unknown status degrades to a neutral label', () => {
    renderProof(fixtures.unknownStatus);
    expect(screen.getByTestId('proof-status').textContent).toBe('Unrecognised status');
  });

  it('refuses a non-https explorer URL from the backend', () => {
    renderProof({
      anchor: { ...fixtures.sepoliaConfirmed.anchor, explorer_tx_url: 'javascript:alert(1)' },
    });
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
  });

  it('long transaction hash is shortened visually (no horizontal overflow on 375px)', () => {
    renderProof(fixtures.sepoliaConfirmed);
    expect(screen.getByTestId('proof-tx').textContent).toBe('0xeb912fd2…ed19');
  });

  it('empty / garbage anchor object does not crash', () => {
    renderProof({ anchor: {} });
    renderProof({ anchor: 'oops' as unknown });
    expect(screen.getAllByTestId('proof-network').length).toBe(2);
  });
});
