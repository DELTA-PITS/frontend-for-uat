import { ReactNode } from 'react';

interface OperationButtonProps {
  /** Callback function when the button is clicked */
  onClick: () => void;
  /** The text label displayed inside the button */
  label: string;
  /** Optional icon element rendered before the label text */
  icon?: ReactNode;
  /** Disables click actions and applies visual disabled styling */
  disabled?: boolean;
  /** Additional CSS class names for styling customization */
  className?: string;
}

/**
 * A standardized button component designed for operation workflows.
 * @param onClick - Callback function when the button is clicked.
 * @param label - The text label displayed inside the button.
 * @param icon - Optional icon element rendered before the label text.
 * @param disabled - Disables click actions and applies visual disabled styling.
 * @param className - Additional CSS class names for styling customization.
 * @returns The operation button.s
 */
export default function OperationButton({ onClick, label, icon, disabled, className }: OperationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn w-full h-fit flex items-center justify-center rounded-md shadow-md transition-all ${className ?? ''}`.trim()}
    >
      {icon}
      <span className="leading-none translate-y-px mb-0.5 font-bold text-base p-3">
        {label}
      </span>
    </button>
  );
}
