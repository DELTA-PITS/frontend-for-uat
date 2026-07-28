import { ReactNode } from 'react';

interface CardProps {
  /** The prominent title displayed at the top of the card */
  title: string;
  /** A brief description or subtitle displayed below the title */
  description: string;
  /** The main content elements inside the card */
  children?: ReactNode;
  /** Action elements (e.g. buttons) displayed at the bottom of the card */
  actions?: ReactNode;
  /** Optional content displayed floating above the card header */
  headerContent?: ReactNode;
  /** Additional CSS class names for custom container styling */
  className?: string;
  /** Additional CSS class names for the outer wrapper container */
  containerClassName?: string;
}

/**
 * A reusable card container that hosts a title, description, body content, and action items.
 * @param title - The prominent title displayed at the top of the card.
 * @param description - A brief description or subtitle displayed below the title.
 * @param children - The main content elements inside the card.
 * @param actions - Action elements (e.g. buttons) displayed at the bottom of the card.
 * @param headerContent - Optional content displayed floating above the card header.
 * @param className - Additional CSS class names for custom container styling.
 * @param containerClassName - Additional CSS class names for the outer wrapper container.
 * @returns The operation card.
 */
export default function OperationCard({
  title,
  description,
  children,
  actions,
  headerContent,
  className,
  containerClassName,
}: CardProps) {
  return (
    <div className={`relative flex flex-col p-4 sm:p-5 text-center m-auto w-full max-w-4xl ${containerClassName ?? ''}`.trim()}>
      {headerContent ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full -mb-10 w-full pointer-events-none">
          {headerContent}
        </div>
      ) : null}
      <section className="flex flex-col text-center">
        <h2 className="card-title text-xxl text-secondary justify-center p-1">{title}</h2>
        <h4 className="w-full text-secondary text-sm p-2">{description}</h4>
      </section>
      <section className={`card w-full bg-card card-xl px-6 sm:px-10 py-5 shadow-md shadow-black/10 ${className ?? ''}`.trim()}>
        <div className="card-body w-full gap-4">
          {children}
          {actions ? (
            <div className="card-actions justify-end">{actions}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}