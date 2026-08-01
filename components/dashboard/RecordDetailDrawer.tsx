'use client';

import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CloseIcon from '@mui/icons-material/Close';
import SummaryRow from '@components/common/SummaryRow';
import CopyButton from '@components/dashboard/CopyButton';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { formatDisplayDateTime } from '@lib/dateFormat';
import { getFileIconConfig } from '@lib/fileIcon';
import type { RecordItem } from '@/types/files.types';
import { useLocale } from '@lib/i18n/LocaleContext';

interface RecordDetailDrawerProps {
  record: RecordItem | null;
  onClose: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-base-content/70">{children}</p>;
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-base-300 pb-3 dark:border-gray-500">
      <span className="shrink-0 text-xs font-medium text-base-content/70">{label}</span>
      <div className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 break-all text-right font-mono text-xs text-base-content">{value}</span>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  );
}

/**
 * Detail panel for a single registry record — a right-side drawer on
 * desktop/tablet (keeps the document table visible and in context behind
 * it, useful when comparing against neighboring rows), and a bottom sheet
 * on mobile (easier to reach with a thumb than a full-height side panel on
 * a small screen).
 */
export default function RecordDetailDrawer({ record, onClose }: RecordDetailDrawerProps) {
  const { t, locale } = useLocale();

  if (!record) return null;

  const { Icon: FileIcon, color: fileColor } = getFileIconConfig(record.filename ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
      <button
        type="button"
        aria-label={t.drawer.close}
        className="absolute inset-0 cursor-default bg-black/30 transition-opacity duration-200 starting:opacity-0"
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-2xl border-t border-base-300 bg-base-100 p-6 shadow-2xl transition-transform duration-200 ease-out starting:translate-y-full sm:h-full sm:max-h-none sm:w-full sm:max-w-md sm:rounded-t-none sm:border-t-0 sm:border-l sm:starting:translate-x-full sm:starting:translate-y-0 lg:max-w-lg xl:max-w-xl">
        <div className="mx-auto mb-2 h-1.5 w-12 shrink-0 rounded-full bg-base-300 sm:hidden" />
        <div className="mb-2 flex items-start gap-3">
          <FileIcon style={{ fontSize: '1.8rem', color: fileColor }} className="mt-1 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h3 className="break-words text-lg font-bold text-secondary">
              {record.filename ?? t.table.unknownFile}
            </h3>
            <span className="badge badge-success badge-soft mt-1 gap-1 font-medium">
              <VerifiedOutlinedIcon style={{ fontSize: '0.9rem' }} />
              {t.drawer.verified}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.drawer.close}
            className="rounded-md p-1 text-ink-muted hover:bg-base-200 hover:text-base-content"
          >
            <CloseIcon style={{ fontSize: '1.3rem' }} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <SectionLabel>{t.drawer.document}</SectionLabel>
          <SummaryRow
            icon={<DescriptionOutlinedIcon />}
            label={t.drawer.fileType}
            value={record.content_type ?? t.drawer.unknown}
          />
          <SummaryRow
            icon={<CalendarMonthOutlinedIcon />}
            label={t.drawer.registered}
            value={formatDisplayDateTime(record.created_at, locale)}
          />
          <SummaryRow
            icon={<ApartmentOutlinedIcon />}
            label={t.drawer.issuer}
            value={record.issuer_id.trim().length > 0 ? record.issuer_id : null}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <SectionLabel>{t.drawer.blockchainProof}</SectionLabel>
          <SummaryRow icon={<LinkOutlinedIcon />} label={t.drawer.network} value="Ethereum" />
          <div className="flex items-center gap-2 text-xs text-base-content/70">
            <BadgeOutlinedIcon style={{ fontSize: '1.1rem' }} />
            {t.drawer.recordId}: <span className="font-mono text-xs">{record.record_id}</span>
          </div>
          <HashRow label={t.drawer.contentHash} value={record.content_hash} />
          <HashRow label={t.drawer.txHash} value={record.transaction_hash} />
        </div>

        <button type="button" onClick={onClose} className="btn btn-block mt-8">
          {t.drawer.close}
        </button>
      </div>
    </div>
  );
}
