import { FilledIcon } from '@components/common/FilledIcon';
interface SummaryRowProps {
  /** The icon to display alongside the label */
  icon: React.ReactNode;
  /** The description or title of the data */
  label: string;
  /** The actual data to display. Displays 'N/A' if null */
  value: string | null;
}

/**
 * Renders a key-value data row with an icon, a label, and a formatted value.
 * 
 * @param icon - The icon to display alongside the label.
 * @param label - The description or title of the data.
 * @param value - The actual data to display. Displays 'N/A' if null.
 * 
 * @returns The summary row.
 */
export default function SummaryRow({
  icon,
  label,
  value,
}: SummaryRowProps) {
  return (
    <div className="flex flex-row items-start justify-between gap-1 pb-3 border-b border-base-300 dark:border-gray-500">
      <span className="flex text-base items-center font-semibold text-secondary gap-3 shrink-0">
        <FilledIcon icon={icon} />
        {label}:
      </span>
      <span className="text-base text-right text-base-content break-all min-w-0 pt-1">
        {value ?? 'N/A'}
      </span>
    </div>
  );
}


