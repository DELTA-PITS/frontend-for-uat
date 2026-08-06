import { ReactNode } from 'react';

interface CardProps {
  /** The prominent title displayed at the top of the card. Omit when the page already has its own heading (e.g. a hero) — avoids restating the same heading twice. */
  title?: string;
  /** A brief description or subtitle displayed below the title. Omit along with `title`. */
  description?: string;
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
    <div className={`relative flex flex-col p-4 sm:p-5 text-center m-auto w-full max-w-5xl ${containerClassName ?? ''}`.trim()}>
      {headerContent ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full -mb-10 w-full pointer-events-none">
          {headerContent}
        </div>
      ) : null}
      {title || description ? (
        <section className="flex flex-col text-center">
          {title ? <h2 className="card-title text-lg text-secondary justify-center p-1">{title}</h2> : null}
          {description ? <h4 className="w-full text-secondary text-xs p-2">{description}</h4> : null}
        </section>
      ) : null}
      <section className={`card w-full rounded-3xl bg-base-100 card-xl border border-base-300 px-6 sm:px-10 py-6 shadow-card transition-colors hover:border-base-content/20 ${className ?? ''}`.trim()}>
        {/* `[&_p]:grow-0` cancels daisyUI's `.card-body p { flex-grow: 1 }` rule —
            without it, any <p> nested inside this card that's also a flex item
            of its own local flex-col container silently stretches to fill that
            container's height instead of sitting at its natural size (bit us
            once already inside Dropzone). Fixed here once so no future
            component nested in an OperationCard has to rediscover it.

            `p-0!` cancels daisyUI's own `.card-body` padding (40px on all
            sides from the `card-xl` modifier) — the parent `.card` section
            above already sets the real, responsive padding (`px-6 sm:px-10
            py-6`). Without this the two stack, which is invisible on desktop
            but on mobile eats most of the card as empty padding (measured:
            content area was under half the viewport width). */}
        <div className="card-body w-full gap-4 p-0! [&_p]:grow-0">
          {children}
          {actions ? (
            <div className="card-actions justify-end">{actions}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}