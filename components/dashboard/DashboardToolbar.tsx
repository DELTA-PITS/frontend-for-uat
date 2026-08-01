'use client';

import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import type { Density } from '@components/dashboard/DashboardView';
import { useLocale } from '@lib/i18n/LocaleContext';

export type SortOption = 'newest' | 'oldest' | 'name-asc';

interface DashboardToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  availableTypes: string[];
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  density: Density;
  onDensityChange: (value: Density) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdatedLabel: string;
}

/**
 * Toolbar for the document registry table — search gets its own full-width
 * row (the dominant action), filter/sort/density/refresh sit on a second
 * row so they don't compete visually with search.
 */
export default function DashboardToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  availableTypes,
  sort,
  onSortChange,
  density,
  onDensityChange,
  onRefresh,
  isRefreshing,
  lastUpdatedLabel,
}: DashboardToolbarProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      <label className="input input-bordered flex w-full items-center gap-2">
        <SearchIcon style={{ fontSize: '1.1rem' }} className="text-base-content/50" />
        <input
          type="text"
          className="grow"
          placeholder={t.toolbar.searchPlaceholder}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label={t.toolbar.searchPlaceholder}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="select select-bordered select-sm"
            value={typeFilter}
            onChange={(event) => onTypeFilterChange(event.target.value)}
            aria-label={t.toolbar.allTypes}
          >
            <option value="all">{t.toolbar.allTypes}</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                .{type}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered select-sm"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            aria-label={t.toolbar.newest}
          >
            <option value="newest">{t.toolbar.newest}</option>
            <option value="oldest">{t.toolbar.oldest}</option>
            <option value="name-asc">{t.toolbar.nameAsc}</option>
          </select>

          <div className="join" role="group" aria-label="Density">
            <button
              type="button"
              className={`btn btn-sm join-item ${density === 'comfortable' ? 'btn-active' : ''}`}
              onClick={() => onDensityChange('comfortable')}
              aria-pressed={density === 'comfortable'}
              title={t.toolbar.comfortable}
            >
              <ViewAgendaOutlinedIcon style={{ fontSize: '1.1rem' }} />
            </button>
            <button
              type="button"
              className={`btn btn-sm join-item ${density === 'compact' ? 'btn-active' : ''}`}
              onClick={() => onDensityChange('compact')}
              aria-pressed={density === 'compact'}
              title={t.toolbar.compact}
            >
              <ViewHeadlineIcon style={{ fontSize: '1.1rem' }} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>{t.toolbar.updated} {lastUpdatedLabel}</span>
          <button
            type="button"
            className="btn btn-square btn-sm btn-ghost"
            onClick={onRefresh}
            aria-label={t.toolbar.refresh}
            title={t.toolbar.refresh}
            disabled={isRefreshing}
          >
            <RefreshIcon style={{ fontSize: '1.1rem' }} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}
