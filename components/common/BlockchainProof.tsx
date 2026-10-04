'use client';

import type { ReactNode } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CopyButton from '@components/dashboard/CopyButton';
import { buildAnchorView, explorerName, formatBlockNumber, shortHash, type AnchorState } from '@lib/anchor';
import { useLocale } from '@lib/i18n/LocaleContext';
import type { AnchorMetadata } from '@/types';

export type BlockchainProofProps = {
  anchor?: AnchorMetadata | null;
  /** Legacy flat `transaction_hash` field, used when the backend sends no `anchor` object. */
  transactionHash?: string | null;
  anchorStatus?: string | null;
  verificationStatus?: string | null;
  /** Show the one-line "independently inspectable" note under the explorer button. */
  showExplorerNote?: boolean;
};

// Warning states use a tinted background with normal text colour: DaisyUI's soft warning badge renders yellow
// text on a pale yellow fill, which fails contrast.
const WARNING_BADGE = 'border border-warning/60 bg-warning/20 text-base-content';
const NEUTRAL_BADGE = 'border border-base-300 bg-base-200 text-base-content';
const BADGE_CLASS: Record<AnchorState, string> = {
  confirmed: 'badge-success badge-soft',
  pending: WARNING_BADGE,
  failed: 'badge-error badge-soft',
  not_found: WARNING_BADGE,
  unavailable: NEUTRAL_BADGE,
  mismatch: 'badge-error badge-soft',
  legacy: NEUTRAL_BADGE,
  unknown: NEUTRAL_BADGE,
  none: NEUTRAL_BADGE,
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-base-300 py-3 last:border-b-0">
      <span className="shrink-0 text-xs text-ink-secondary">{label}</span>
      <div className="flex min-w-0 flex-wrap items-center justify-end gap-1 text-right text-xs font-medium text-base-content">
        {children}
      </div>
    </div>
  );
}

/**
 * Network, status, transaction, block and explorer link of one blockchain anchor. Everything shown comes from
 * the backend response (network name, explorer URL); the component only chooses wording per state and never
 * builds an explorer URL itself. Tolerates responses with no `anchor` object (older backend).
 */
export default function BlockchainProof({
  anchor,
  transactionHash,
  anchorStatus,
  verificationStatus,
  showExplorerNote = true,
}: BlockchainProofProps) {
  const { t, locale } = useLocale();
  const p = t.proof;
  const view = buildAnchorView({
    anchor,
    flatTransactionHash: transactionHash,
    anchorStatus,
    verificationStatus,
  });

  const networkLabel =
    view.networkName ??
    (view.isLegacy ? p.legacyNetwork : view.chainId !== null ? `${p.networkFallback} (${view.chainId})` : p.networkFallback);

  const statusLabel: Record<AnchorState, string | null> = {
    confirmed: p.statuses.confirmed,
    pending: p.statuses.pending,
    failed: p.statuses.failed,
    not_found: p.statuses.notFound,
    unavailable: p.statuses.unavailable,
    mismatch: p.statuses.mismatch,
    legacy: p.statuses.legacy,
    unknown: p.statuses.unknown,
    none: null,
  };

  const name = explorerName(view.explorerUrl);
  const explorerLabel = name ? p.viewOn(name) : p.viewOnGeneric;

  return (
    <div data-testid="blockchain-proof" data-anchor-state={view.state}>
      <Row label={p.network}>
        <span data-testid="proof-network">{networkLabel}</span>
        {view.isLegacy ? <span className={`badge badge-sm ${NEUTRAL_BADGE}`}>{p.legacyBadge}</span> : null}
      </Row>

      {statusLabel[view.state] ? (
        <Row label={p.status}>
          <span
            data-testid="proof-status"
            className={`badge h-auto min-h-6 whitespace-normal py-1 text-left font-medium ${BADGE_CLASS[view.state]}`}
          >
            {statusLabel[view.state]}
          </span>
        </Row>
      ) : null}

      {view.transactionHash ? (
        <Row label={p.transaction}>
          <span
            data-testid="proof-tx"
            className="min-w-0 font-mono"
            title={view.transactionHash}
            aria-label={view.transactionHash}
          >
            {shortHash(view.transactionHash)}
          </span>
          <CopyButton value={view.transactionHash} label={p.copyTx} />
        </Row>
      ) : null}

      {view.blockNumber !== null ? (
        <Row label={p.block}>
          <span data-testid="proof-block">{formatBlockNumber(view.blockNumber, locale)}</span>
        </Row>
      ) : null}

      {view.explorerUrl ? (
        <div className="mt-3 flex flex-col gap-2">
          <a
            href={view.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="proof-explorer-link"
            className="btn btn-outline btn-primary btn-sm h-auto min-h-10 w-full justify-center gap-1 whitespace-normal sm:w-auto sm:self-start"
          >
            {explorerLabel}
            <OpenInNewIcon style={{ fontSize: '1rem' }} aria-hidden="true" />
          </a>
          {showExplorerNote ? <p className="text-xs text-ink-secondary">{p.explorerNote}</p> : null}
        </div>
      ) : view.isLegacy ? (
        <p className="mt-3 text-xs text-ink-secondary">{p.legacyNote}</p>
      ) : null}
    </div>
  );
}
