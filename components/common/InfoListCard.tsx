import type { ComponentType, CSSProperties } from 'react';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

interface InfoListCardProps {
  heading: string;
  /** Optional icon shown inline next to the heading (e.g. RequirementCard). Omit for a plain text heading (e.g. TipsCard). */
  headingIcon?: ComponentType<{ style?: CSSProperties; className?: string }>;
  items: string[];
  /** Number of columns on ≥sm. Defaults to 1. */
  columns?: 1 | 2;
  /** Bullet marker style — a check icon or a plain dot. Defaults to 'dot'. */
  bullet?: 'check' | 'dot';
  /** Extra classes on the outer card (e.g. page-level margin). */
  className?: string;
}

/**
 * Shared "card with a heading and a bullet list" pattern used by TipsCard
 * (Verify page, trust reasons) and RequirementCard (Register page, file
 * requirements) — same container/spacing; only the heading style, bullet
 * marker, and column count differ per use case.
 */
export default function InfoListCard({
  heading,
  headingIcon: HeadingIcon,
  items,
  columns = 1,
  bullet = 'dot',
  className,
}: InfoListCardProps) {
  return (
    <div className={`w-full rounded-2xl border border-base-300 bg-base-100 p-5 shadow-card ${className ?? ''}`.trim()}>
      {HeadingIcon ? (
        <div className="mb-3 flex items-center gap-2">
          <HeadingIcon className="text-secondary" style={{ fontSize: '1.2rem' }} />
          <p className="text-xs font-semibold text-base-content">{heading}</p>
        </div>
      ) : (
        <p className="mb-3 text-xs font-semibold text-base-content">{heading}</p>
      )}
      <ul className={`grid grid-cols-1 ${columns === 2 ? 'gap-2.5 sm:grid-cols-2' : 'gap-2'}`}>
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-ink-secondary">
            {bullet === 'check' ? (
              <CheckCircleOutlinedIcon className="mt-0.5 shrink-0 text-secondary" style={{ fontSize: '1.1rem' }} />
            ) : (
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/50" />
            )}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
