'use client';

import type { ComponentType } from 'react';
import PageContainer from '@components/layout/PageContainer';

interface PageHeroProps {
  /** Visual accent — 'primary' (teal, Verify) or 'secondary' (navy, Register). */
  accent: 'primary' | 'secondary';
  /** Icon shown inline in the small badge above the title. */
  icon: ComponentType<{ style?: React.CSSProperties }>;
  badge: string;
  title: string;
  subtitle: string;
  /** Optional small meta line below the subtitle (e.g. file constraints). */
  meta?: string;
}

const ACCENT_CLASSES = {
  primary: {
    gradient: 'from-base-100 to-primary/5',
    badge: 'border-primary/30 bg-primary/10 text-primary',
  },
  secondary: {
    gradient: 'from-base-100 to-base-200',
    badge: 'border-secondary/30 bg-secondary/10 text-secondary',
  },
} as const;

/**
 * Shared hero layout for the Verify and Register pages — badge, title,
 * subtitle, optional meta line, same sizing/spacing on both. Extracted
 * because the two page-specific heroes used to be separate files kept in
 * sync by hand (a doc comment literally said "don't change one without
 * the other"); now there's only one place to change.
 */
export default function PageHero({ accent, icon: Icon, badge, title, subtitle, meta }: PageHeroProps) {
  const colors = ACCENT_CLASSES[accent];

  return (
    <section className={`w-full bg-gradient-to-b ${colors.gradient} py-8 text-left md:py-10 lg:py-14`}>
      <PageContainer variant="content">
        <span className={`badge badge-soft mb-2 gap-1 font-medium ${colors.badge}`}>
          <Icon style={{ fontSize: '1rem' }} />
          {badge}
        </span>
        <h1 className="text-2xl font-bold text-secondary md:text-[1.75rem] lg:text-[2rem]">{title}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary">{subtitle}</p>
        {meta ? <p className="mt-2 text-xs text-ink-muted">{meta}</p> : null}
      </PageContainer>
    </section>
  );
}
