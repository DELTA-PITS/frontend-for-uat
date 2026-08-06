'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import StatsCards from '@components/dashboard/StatsCards';
import DashboardToolbar, { type SortOption } from '@components/dashboard/DashboardToolbar';
import RecordsTable from '@components/dashboard/RecordsTable';
import Pagination from '@components/dashboard/Pagination';
import RecordDetailDrawer from '@components/dashboard/RecordDetailDrawer';
import { getFileExtension } from '@lib/fileExtension';
import type { RecordItem } from '@/types/files.types';
import { useLocale } from '@lib/i18n/LocaleContext';

export type Density = 'comfortable' | 'compact';

interface DashboardViewProps {
  /** Full set of registry records fetched server-side for this page load */
  records: RecordItem[];
}

const DEFAULT_PAGE_SIZE = 10;

function formatClock(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}.${minutes}`;
}

/**
 * One-line "is everything okay?" answer shown before the stat tiles —
 * progressive disclosure: give the confident summary first, let staff drill
 * into the stat breakdown and table only if they want more. Hidden when
 * there are no records yet since the empty state below already covers that.
 */
function StatusSummary({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 px-5 py-4">
      <CheckCircleOutlinedIcon className="shrink-0 text-success" style={{ fontSize: '1.4rem' }} />
      <p className="text-sm text-base-content">{label}</p>
    </div>
  );
}

/**
 * Interactive client-side view for the registry dashboard: search, filter,
 * sort, paginate, switch row density, and inspect document detail — all
 * operating on the record set that was already fetched server-side by the
 * dashboard page. Search/filter/sort, the table, and pagination are grouped
 * into a single "Dokumen" card so the toolbar reads as part of the table,
 * not a separate section — the table is the reason staff come to this page.
 */
export default function DashboardView({ records }: DashboardViewProps) {
  const router = useRouter();
  const { t } = useLocale();
  const [isRefreshing, startRefresh] = useTransition();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, [records]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [density, setDensity] = useState<Density>('comfortable');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);

  const availableTypes = useMemo(() => {
    const types = new Set(records.map((record) => getFileExtension(record.filename)));
    return [...types].sort();
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = records.filter((record) => {
      const matchesQuery =
        query.length === 0 ||
        (record.filename ?? '').toLowerCase().includes(query) ||
        record.content_hash.toLowerCase().includes(query) ||
        record.record_id.toLowerCase().includes(query);

      const matchesType = typeFilter === 'all' || getFileExtension(record.filename) === typeFilter;

      return matchesQuery && matchesType;
    });

    result = [...result].sort((a, b) => {
      if (sort === 'name-asc') {
        return (a.filename ?? '').localeCompare(b.filename ?? '');
      }
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return result;
  }, [records, search, typeFilter, sort]);

  // Reset to page 1 whenever the filtered result set changes so users don't land on an empty page.
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, sort, pageSize]);

  const pageCount = Math.max(Math.ceil(filteredRecords.length / pageSize), 1);
  const currentPage = Math.min(page, pageCount);
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex flex-col gap-8">
      <StatusSummary count={records.length} label={t.dashboard.statusSummary(records.length)} />

      <StatsCards records={records} />

      <div className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-card">
        <h2 className="text-base font-semibold text-secondary">{t.table.document}</h2>

        <DashboardToolbar
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          availableTypes={availableTypes}
          sort={sort}
          onSortChange={setSort}
          density={density}
          onDensityChange={setDensity}
          onRefresh={() => startRefresh(() => router.refresh())}
          isRefreshing={isRefreshing}
          lastUpdatedLabel={lastUpdated ? formatClock(lastUpdated) : '—'}
        />

        <RecordsTable
          records={paginatedRecords}
          onSelect={setSelectedRecord}
          density={density}
          hasAnyRecords={records.length > 0}
        />

        {filteredRecords.length > 0 ? (
          <Pagination
            page={currentPage}
            pageCount={pageCount}
            pageSize={pageSize}
            totalItems={filteredRecords.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : null}
      </div>

      <RecordDetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
