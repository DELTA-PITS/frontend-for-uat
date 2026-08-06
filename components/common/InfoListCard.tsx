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
      {/* Matches the "section label" treatment used everywhere else in the app
          (MetadataCard, ResultView SectionLabel, RecordDetailDrawer) — uppercase,
          tracked, muted — instead of a one-off bold dark heading that stood out
          next to MetadataCard on the same page (Register). */}
      <div className="mb-3 flex items-center gap-1.5">
        {HeadingIcon ? <HeadingIcon className="text-ink-muted" style={{ fontSize: '0.9rem' }} /> : null}
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{heading}</p>
      </div>
      <ul className={`grid grid-cols-1 ${columns === 2 ? 'gap-3 sm:grid-cols-2' : 'gap-2.5'}`}>
        {items.map((item) => (
          <li
            key={item}
            className={`flex gap-2 text-sm text-ink-secondary ${bullet === 'check' ? 'items-center' : 'items-start'}`}
          >
            {bullet === 'check' ? (
              // text-success (not text-secondary) matches the "verified/good" check
              // used everywhere else in the app (ResultView, DocumentPreview, CopyButton).
              <CheckCircleOutlinedIcon className="shrink-0 text-success" style={{ fontSize: '1rem' }} />
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
