import { FilledIcon } from './FilledIcon';
/**
 * SummaryRow component that renders a label and its corresponding value in a formatted manner.
 * It is used to display key-value pairs of registration or verification data, providing a
 * clear and concise presentation of the information. If the value is null, it displays 'N/A'
 * to indicate that the information is not available.
 *
 * @param icon - A React node representing the icon to display alongside the label
 * @param label - A string that describes the data
 * @param value - A string or null that represents the actual data to be shown. If null, displays 'N/A'
 * @returns A React component that renders a formatted row with an icon, label, and value
 */
export default function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
        <p className="flex flex-row items-center justify-between pb-7 border-b border-base-300">
            <span className="flex text-lg items-center font-semibold text-secondary gap-3">
                <FilledIcon icon={icon} />
                {label}:
            </span>
            <span className="text-base text-center sm:text-right text-base-content text-lg">{value ?? 'N/A'}</span>
        </p>
        );
        }
  
