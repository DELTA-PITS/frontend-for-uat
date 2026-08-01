'use client';

import { useEffect, useState } from 'react';
import { getFileSize } from '@lib/fileSizeCalc';
import { computeSha256 } from '@lib/hashFile';
import CopyButton from '@components/dashboard/CopyButton';
import { useLocale } from '@lib/i18n/LocaleContext';

interface MetadataCardProps {
  file: File | null;
}

function Cell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="truncate font-mono text-xs text-base-content">{value}</span>
    </div>
  );
}

/**
 * Live summary of the currently selected file, shown alongside the upload
 * card on the Register page so the page doesn't feel empty before submit —
 * and so the publisher can double-check exactly what they're about to
 * commit permanently to the blockchain. The SHA-256 shown here is computed
 * client-side (Web Crypto) purely for preview; the backend independently
 * recomputes it on submit.
 */
export default function MetadataCard({ file }: MetadataCardProps) {
  const { t } = useLocale();
  const [hash, setHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  useEffect(() => {
    if (!file) {
      setHash(null);
      return;
    }
    let cancelled = false;
    setIsHashing(true);
    computeSha256(file)
      .then((result) => {
        if (!cancelled) setHash(result);
      })
      .finally(() => {
        if (!cancelled) setIsHashing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  const hashDisplay = !file
    ? t.metadata.empty
    : isHashing
      ? t.metadata.hashing
      : hash
        ? `${hash.slice(0, 16)}…${hash.slice(-12)}`
        : t.metadata.empty;

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl rounded-xl border border-base-300 bg-base-100 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">{t.metadata.heading}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Cell label={t.metadata.name} value={file?.name ?? t.metadata.empty} />
        <Cell label={t.metadata.size} value={file ? getFileSize(file) : t.metadata.empty} />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ink-muted">{t.metadata.hash}</span>
          <div className="flex items-center gap-1">
            <span className="truncate font-mono text-xs text-base-content">{hashDisplay}</span>
            {hash ? <CopyButton value={hash} label={t.metadata.hash} /> : null}
          </div>
        </div>
        <Cell
          label={t.metadata.status}
          value={
            <span className={file ? 'text-primary' : 'text-ink-muted'}>
              {file ? t.metadata.ready : t.metadata.waiting}
            </span>
          }
        />
      </div>
    </div>
  );
}
