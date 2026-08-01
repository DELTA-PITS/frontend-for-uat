'use client';

import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import EmptyState from '@components/common/EmptyState';
import { getFileIconConfig } from '@lib/fileIcon';
import { formatDisplayDateTime } from '@lib/dateFormat';
import { getColorForId } from '@lib/avatarColor';
import type { Density } from '@components/dashboard/DashboardView';
import type { RecordItem } from '@/types/files.types';
import { useLocale } from '@lib/i18n/LocaleContext';
import type { Dictionary } from '@lib/i18n/translations';

interface RecordsTableProps {
  records: RecordItem[];
  onSelect: (record: RecordItem) => void;
  density: Density;
  /** Whether the registry has any records at all, before search/filter was applied */
  hasAnyRecords: boolean;
}

function truncateId(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function PublisherBadge({ issuerId, t }: { issuerId: string; t: Dictionary }) {
  const isKnown = issuerId.trim().length > 0;
  return (
    <div className="flex items-center gap-2 min-w-0" title={isKnown ? issuerId : t.drawer.unknown}>
      <span
        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${isKnown ? '' : 'bg-base-300'}`}
        style={isKnown ? { backgroundColor: getColorForId(issuerId) } : undefined}
        aria-hidden="true"
      />
      <span className={`truncate font-mono text-xs ${isKnown ? 'text-base-content/80' : 'italic text-base-content/60'}`}>
        {isKnown ? truncateId(issuerId) : t.table.unknownPublisher}
      </span>
    </div>
  );
}

function VerifiedBadge({ t }: { t: Dictionary }) {
  return (
    <span className="badge badge-success badge-soft gap-1 whitespace-nowrap font-medium">
      <VerifiedOutlinedIcon style={{ fontSize: '0.9rem' }} />
      {t.table.onChain}
    </span>
  );
}

function RecordsEmptyState({ hasAnyRecords, t }: { hasAnyRecords: boolean; t: Dictionary }) {
  return (
    <EmptyState
      icon={<InsertDriveFileOutlinedIcon style={{ fontSize: '3rem' }} className="text-base-content/30" />}
      title={hasAnyRecords ? t.table.emptyFilteredTitle : t.table.emptyAllTitle}
      description={hasAnyRecords ? t.table.emptyFilteredBody : t.table.emptyAllBody}
      action={{ label: t.table.registerCta, href: '/publisher' }}
    />
  );
}

/**
 * Renders the registry records list: a table on wider screens and a stacked
 * card layout on small screens. Content and transaction hashes are
 * deliberately not shown as always-visible columns — they are secondary
 * verification detail available in the row's detail modal, not the primary
 * scanning surface for staff browsing hundreds of documents.
 */
export default function RecordsTable({ records, onSelect, density, hasAnyRecords }: RecordsTableProps) {
  const { t, locale } = useLocale();

  if (records.length === 0) {
    return <RecordsEmptyState hasAnyRecords={hasAnyRecords} t={t} />;
  }

  const rowPadding = density === 'compact' ? 'py-2' : 'py-4';

  return (
    <>
      {/* Desktop / tablet table */}
      <div className="hidden overflow-x-auto rounded-xl border border-base-300 bg-base-100 md:block">
        <table className="table">
          <thead>
            <tr className="bg-base-200 text-xs font-semibold uppercase tracking-wide text-base-content/80">
              <th>{t.table.document}</th>
              <th>{t.table.registered}</th>
              <th>{t.table.publisher}</th>
              <th>{t.table.status}</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const { Icon: FileIcon, color } = getFileIconConfig(record.filename ?? '');
              return (
                <tr
                  key={record.record_id}
                  className="cursor-pointer hover:bg-base-200"
                  onClick={() => onSelect(record)}
                >
                  <td className={`max-w-md ${rowPadding}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <FileIcon
                        style={{ fontSize: density === 'compact' ? '1.3rem' : '1.7rem', color }}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-base-content" title={record.filename ?? undefined}>
                          {record.filename ?? t.table.unknownFile}
                        </p>
                        {density === 'comfortable' ? (
                          <p className="truncate text-xs text-base-content/60">
                            {record.content_type ?? t.table.unknownType}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className={`whitespace-nowrap text-xs text-base-content/80 ${rowPadding}`}>
                    {formatDisplayDateTime(record.created_at, locale)}
                  </td>
                  <td className={`max-w-[10rem] ${rowPadding}`}>
                    <PublisherBadge issuerId={record.issuer_id} t={t} />
                  </td>
                  <td className={rowPadding}>
                    <VerifiedBadge t={t} />
                  </td>
                  <td className={`text-right text-base-content/40 ${rowPadding}`}>
                    <ChevronRightIcon style={{ fontSize: '1.2rem' }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {records.map((record) => {
          const { Icon: FileIcon, color } = getFileIconConfig(record.filename ?? '');
          return (
            <button
              key={record.record_id}
              type="button"
              onClick={() => onSelect(record)}
              className="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileIcon style={{ fontSize: '1.6rem', color }} className="shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-base-content">
                    {record.filename ?? t.table.unknownFile}
                  </p>
                  <p className="truncate text-xs text-base-content/60">
                    {formatDisplayDateTime(record.created_at, locale)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <PublisherBadge issuerId={record.issuer_id} t={t} />
                <VerifiedBadge t={t} />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
