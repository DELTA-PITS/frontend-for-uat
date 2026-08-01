'use client';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useLocale } from '@lib/i18n/LocaleContext';

interface PaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Pagination controls for the records table, including a page-size selector
 * and a summary of the current range being shown.
 */
export default function Pagination({
  page,
  pageCount,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t } = useLocale();
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-base-300 pt-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-base-content/70">
        <span>{t.pagination.showing(rangeStart, rangeEnd, totalItems)}</span>
        <select
          className="select select-bordered select-sm"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          aria-label={t.pagination.perPage}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} {t.pagination.perPage}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn btn-sm btn-square btn-ghost border border-base-300"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t.pagination.prev}
        >
          <ChevronLeftIcon style={{ fontSize: '1.1rem' }} />
        </button>
        <span className="whitespace-nowrap text-xs text-ink-secondary">
          {t.pagination.page(page, Math.max(pageCount, 1))}
        </span>
        <button
          type="button"
          className="btn btn-sm btn-square btn-ghost border border-base-300"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label={t.pagination.next}
        >
          <ChevronRightIcon style={{ fontSize: '1.1rem' }} />
        </button>
      </div>
    </div>
  );
}
