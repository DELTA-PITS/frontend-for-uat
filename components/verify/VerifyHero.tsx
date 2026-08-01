'use client';

import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PageContainer from '@components/layout/PageContainer';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Public-facing hero for the Verify page. Same structure/sizing as
 * RegisterHero (icon size, padding, alignment, badge) — only the accent
 * color (primary vs secondary) and copy differ, so the two pages read as
 * one consistent product rather than two different designs stitched together.
 * Deliberately compact (small inline icon, not a large avatar circle) since
 * Verify/Register are workflow pages users pass through quickly, not a
 * landing page meant to be lingered on.
 */
export default function VerifyHero() {
  const { t } = useLocale();

  return (
    <section className="w-full bg-gradient-to-b from-base-100 to-primary/5 py-8 text-left md:py-10 lg:py-14">
      <PageContainer variant="content">
        <span className="badge badge-soft mb-2 gap-1 border-primary/30 bg-primary/10 font-medium text-primary">
          <GppGoodOutlinedIcon style={{ fontSize: '1rem' }} />
          {t.verifyHero.badge}
        </span>
        <h1 className="text-2xl font-bold text-secondary md:text-3xl lg:text-4xl">{t.verifyHero.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary">{t.verifyHero.subtitle}</p>
        <p className="mt-2 text-xs text-ink-muted">{t.verifyHero.meta}</p>
      </PageContainer>
    </section>
  );
}
