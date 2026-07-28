import { ReactNode } from 'react';

interface CardProps {
  title: string;
  description: string;
  children?: ReactNode;
  actions?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
}

/**
 * A reusable card component for displaying content with a title, description, and optional actions.
 * @param title - The title of the card, displayed prominently at the top.
 * @param description - A brief description or subtitle for the card, displayed below the title.
 * @param children - The main content of the card, which can include any React nodes such as text, images, or other components.
 * @param actions - Optional action elements (e.g., buttons) that are displayed at the bottom of the card, aligned to the right.
 * @param className - Additional CSS class names to customize the styling of the card container.
 * @returns A styled card component that can be used to display various types of content in a consistent format across the application.
 */
export default function OperationCard({ title, description, children, actions, headerContent, className }: CardProps) {
  return (
    <div className="relative flex flex-col p-5 text-center m-auto">
      {headerContent ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-0 w-full pointer-events-none">
          {headerContent}
        </div>
      ) : null}
      <section className="flex flex-col text-center">
        <h2 className="card-title text-xxl text-secondary justify-center p-1">{title}</h2>
        <h4 className="w-full text-secondary text-sm p-2">{description}</h4>
      </section>
      <section className={`card w-fit bg-white card-xl px-10 py-5 shadow-md shadow-black/10 ${className ?? ''}`.trim()}>
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