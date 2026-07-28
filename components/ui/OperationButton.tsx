import { ReactNode } from 'react';

interface OperationButtonProps {
  /** Button click handler */
  onClick: () => void;
  /** Button label text */
  label: string;
  /** Icon displayed before the label */
  icon?: ReactNode;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * A unified button component used across operation flows (upload, results, etc.)
 * Ensures consistent sizing, typography, and styling.
 * @param onClick - Handler called when the button is clicked
 * @param label - The text label displayed on the button
 * @param icon - Optional icon element rendered before the label
 * @param disabled - Whether the button is in a disabled state
 * @param className - Additional CSS classes for variant styling
 */
export default function OperationButton({ onClick, label, icon, disabled, className }: OperationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn w-full h-fit flex items-center justify-center rounded-md shadow-md transition-all ${className ?? ''}`.trim()}
    >
      {icon}
      <span className="leading-none translate-y-px mb-0.5 font-bold text-lg p-3">
        {label}
      </span>
    </button>
  );
}
