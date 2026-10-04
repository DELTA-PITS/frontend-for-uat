import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import RecordDetailDrawer from './RecordDetailDrawer';
import { LocaleProvider } from '@lib/i18n/LocaleContext';
import { installMemoryStorage } from '@lib/testStorage';
import { CANONICAL_EXPLORER_URL, fixtures } from '@lib/anchorFixtures';
import type { RecordItem } from '@/types';

function renderDrawer(record: Partial<RecordItem> & Record<string, unknown>, locale: 'id' | 'en' = 'en') {
  window.localStorage.setItem('pits-locale', locale);
  return render(
    <LocaleProvider>
      <RecordDetailDrawer record={record as RecordItem} onClose={() => {}} />
    </LocaleProvider>,
  );
}

beforeEach(() => installMemoryStorage());
afterEach(cleanup);

const text = () => document.body.textContent ?? '';

describe('RecordDetailDrawer blockchain proof', () => {
  it('Sepolia record: network, Confirmed, explorer link, verified badge, no testnet-lokal wording', () => {
    renderDrawer(fixtures.sepoliaConfirmed as never);
    expect(screen.getByTestId('proof-network').textContent).toBe('Ethereum Sepolia');
    expect(screen.getByTestId('proof-status').textContent).toBe('Confirmed');
    expect((screen.getByTestId('proof-explorer-link') as HTMLAnchorElement).href).toBe(CANONICAL_EXPLORER_URL);
    expect(text()).toContain('Successfully verified on the blockchain');
    expect(text()).not.toMatch(/Testnet|cannot be verified via Etherscan/);
  });

  it('Anvil legacy record: Legacy badge, no explorer, no verified badge', () => {
    renderDrawer(fixtures.anvilLegacy as never);
    expect(text()).toContain('Legacy');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
    expect(text()).not.toContain('Successfully verified on the blockchain');
  });

  it('pending record is not badged as verified', () => {
    renderDrawer(fixtures.sepoliaPending as never);
    expect(screen.getByTestId('proof-status').textContent).toBe('Awaiting blockchain confirmation');
    expect(text()).not.toContain('Successfully verified on the blockchain');
  });

  it('record from an old backend (no anchor fields) keeps the verified badge and shows no network claim', () => {
    renderDrawer(fixtures.oldBackend as never);
    expect(text()).toContain('Successfully verified on the blockchain');
    expect(screen.getByTestId('proof-network').textContent).toBe('Blockchain network');
    expect(screen.queryByTestId('proof-explorer-link')).toBeNull();
  });

  it('Indonesian labels', () => {
    renderDrawer(fixtures.sepoliaConfirmed as never, 'id');
    expect(text()).toContain('Bukti Blockchain');
    expect(text()).toContain('Jaringan');
    expect(text()).toContain('Transaksi');
    expect(text()).toContain('Blok');
    expect(text()).toContain('Lihat di Etherscan');
  });
});
