'use client';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { FilledIcon } from '@components/common/FilledIcon';
import type { RecordItem } from '@/types/files.types';
import { useLocale } from '@lib/i18n/LocaleContext';

interface StatsCardsProps {
  /** Full, unfiltered set of records used to compute summary statistics */
  records: RecordItem[];
}

/**
 * Four equal-height operational stat tiles — Total, Publisher, This Month,
 * Status. Deliberately NOT a dominant hero metric: a dashboard is a
 * workspace, not a presentation page, so stats stay compact and the
 * document table (the thing staff actually came here for) gets the visual
 * weight instead.
 */
export default function StatsCards({ records }: StatsCardsProps) {
  const { t } = useLocale();
  const now = new Date();
  const registeredThisMonth = records.filter((record) => {
    const date = new Date(record.created_at);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;

  const issuerCount = new Set(records.map((record) => record.issuer_id)).size;

  const stats = [
    { icon: <DescriptionOutlinedIcon />, label: t.stats.total, value: records.length.toLocaleString(t.locale) },
    { icon: <ApartmentOutlinedIcon />, label: t.stats.publisher, value: issuerCount.toLocaleString(t.locale) },
    {
      icon: <CalendarMonthOutlinedIcon />,
      label: t.stats.thisMonth,
      value: registeredThisMonth.toLocaleString(t.locale),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4"
        >
          <FilledIcon icon={stat.icon} className="text-lg" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-ink-secondary">{stat.label}</p>
            <p className="text-lg font-bold text-secondary">{stat.value}</p>
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4 md:col-span-3 xl:col-span-1">
        <FilledIcon icon={<CheckCircleOutlinedIcon />} className="text-lg bg-success/10 text-success" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-ink-secondary">{t.stats.status}</p>
          <p className="text-lg font-bold text-success">{t.stats.normal}</p>
        </div>
      </div>
    </div>
  );
}
