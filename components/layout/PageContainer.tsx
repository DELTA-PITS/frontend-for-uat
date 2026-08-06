import type { ElementType, ReactNode } from 'react';

export type ContainerVariant = 'narrow' | 'content' | 'wide' | 'full';

const WIDTH_CLASSES: Record<ContainerVariant, string> = {
  narrow: 'max-w-3xl',
  content: 'max-w-5xl',
  wide: 'max-w-7xl',
  full: '',
};

interface PageContainerProps {
  /** Which width bucket this page belongs to — see design-system.md §7 for when to use which. */
  variant?: ContainerVariant;
  /** Render as a different element, e.g. 'main' for the top-level page wrapper. Defaults to 'div'. */
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Shared layout container — the single source of truth for page max-width
 * and horizontal padding, so every page belongs to one of a fixed set of
 * width "families" instead of each page picking its own `max-w` ad hoc
 * (the root cause of PITS pages feeling like separate apps stitched
 * together). Responsive padding (`px-4 sm:px-6 lg:px-8`) is built in —
 * callers should not repeat it.
 */
export default function PageContainer({ variant = 'content', as: Tag = 'div', className, children }: PageContainerProps) {
  return (
    <Tag className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${WIDTH_CLASSES[variant]} ${className ?? ''}`.trim()}>
      {children}
    </Tag>
  );
}
