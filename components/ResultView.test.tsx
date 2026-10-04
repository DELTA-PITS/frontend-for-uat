import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import ResultView from './ResultView';
import { LocaleProvider } from '@lib/i18n/LocaleContext';
import { installMemoryStorage } from '@lib/testStorage';
import { CANONICAL_EXPLORER_URL, fixtures } from '@lib/anchorFixtures';

function renderResult(source: 'register' | 'verify', status: 'success' | 'failure', data: unknown, locale: 'id' | 'en' = 'en') {
  window.localStorage.setItem('pits-locale', locale);
  window.sessionStorage.setItem('pits:resultPayload', JSON.stringify({ source, status, response: { data } }));
  return render(
    <LocaleProvider>
      <ResultView status={status} />
    </LocaleProvider>,
  );
}

beforeEach(() => installMemoryStorage());
afterEach(cleanup);

const text = () => document.body.textContent ?? '';

describe('ResultView - verification', () => {
  it('Sepolia confirmed: verified copy + proof + Etherscan link to the canonical tx', () => {
    renderResult('verify', 'success', fixtures.sepoliaConfirmed);
    expect(text()).toContain('Document Verified');
    expect(text()).toContain('The SHA-256 hash of this document matches a blockchain anchor');
    expect(text()).toContain('only proves document integrity, not the truth of its content');
    expect(screen.getByTestId('proof-network').textContent).toBe('Ethereum Sepolia');
    expect(screen.getByTestId('proof-block').textContent).toBe('11,839,743');
    expect((screen.getByTestId('proof-explorer-link') as HTMLAnchorElement).href).toBe(CANONICAL_EXPLORER_URL);
    expect(text()).not.toMatch(/Testnet Lokal|Local Testnet/);
  });

  it('Anvil legacy that still verifies: no Etherscan', () => {
    renderResult('verify', 'success', fixtures.anvilLegacy);
    expect(text()).toContain('Document Verified');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
    expect(text()).toContain('Local development chain (Anvil)');
  });

  it('old backend response (no anchor) still renders as before, without a network claim', () => {
    renderResult('verify', 'success', fixtures.oldBackend);
    expect(text()).toContain('Document Verified');
    expect(screen.getByTestId('proof-network').textContent).toBe('Blockchain network');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
  });

  it('pending is shown as awaiting confirmation, never as verified', () => {
    renderResult('verify', 'failure', fixtures.sepoliaPending);
    expect(screen.getByTestId('verify-unverified')).toBeTruthy();
    expect(text()).toContain('Awaiting Blockchain Confirmation');
    expect(text()).not.toContain('Document Verified');
    expect(text()).not.toContain('Document Not Found');
  });

  it('failed anchoring', () => {
    renderResult('verify', 'failure', fixtures.sepoliaFailed);
    expect(text()).toContain('Blockchain Anchoring Failed');
  });

  it('transaction_not_found: explanatory copy, not "document not found", no crash', () => {
    renderResult('verify', 'failure', fixtures.transactionNotFound);
    expect(text()).toContain('Blockchain Transaction Not Found');
    expect(text()).toContain('no longer available on its original network');
    expect(text()).not.toContain('Document Not Found');
    expect(text()).not.toMatch(/corrupt/i);
  });

  it('transaction_not_found in Indonesian', () => {
    renderResult('verify', 'failure', fixtures.transactionNotFound, 'id');
    expect(text()).toContain('Transaksi Blockchain Tidak Ditemukan');
    expect(text()).toContain('sudah tidak tersedia pada jaringan asalnya');
  });

  it('chain_not_available', () => {
    renderResult('verify', 'failure', fixtures.chainNotAvailable);
    expect(text()).toContain('Blockchain Network Unavailable');
    expect(text()).toContain('not available for public verification');
  });

  it('unknown verification status falls back to the plain not-found page without crashing', () => {
    renderResult('verify', 'failure', fixtures.unknownStatus);
    expect(text()).toContain('Document Not Found');
  });

  it('a hash that was never registered keeps the original not-found page', () => {
    renderResult('verify', 'failure', { valid: false, content_hash: 'f'.repeat(64) });
    expect(text()).toContain('Document Not Found');
    expect(screen.queryByTestId('blockchain-proof')).toBeNull();
  });
});

describe('ResultView - registration', () => {
  it('confirmed registration shows the proof with an explorer link', () => {
    renderResult('register', 'success', { ...fixtures.sepoliaConfirmed, stored: true, already_existed: false });
    expect(text()).toContain('Registration Successful');
    expect(screen.getByTestId('proof-network').textContent).toBe('Ethereum Sepolia');
    expect(screen.getByTestId('proof-explorer-link')).toBeTruthy();
  });

  it('pending registration does not claim a permanent blockchain record', () => {
    renderResult('register', 'success', { ...fixtures.sepoliaPending, stored: true, already_existed: false });
    expect(text()).toContain('awaiting confirmation');
    expect(text()).not.toContain('permanently recorded');
  });
});
