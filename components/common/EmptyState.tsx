import type { ReactNode } from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  /** Icon element, typically a MUI icon at a large font-size */
  icon: ReactNode;
  title: string;
  description: string;
  /** Optional primary action shown below the description */
  action?: { label: string; href: string };
}

/**
 * Shared empty-state pattern: icon → title → description → primary action.
 * Every empty state in the app (no records, no search results, etc.)
 * should use this instead of a bespoke layout, so they all read the same.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-base-300 bg-base-100 px-6 py-20 text-center">
      {icon}
      <h3 className="text-base font-semibold text-base-content">{title}</h3>
      <p className="max-w-sm text-xs text-base-content/70">{description}</p>
      {action ? (
        <Link href={action.href} className="btn btn-primary btn-sm mt-2">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
