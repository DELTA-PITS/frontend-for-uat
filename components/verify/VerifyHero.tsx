'use client';

import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import PageHero from '@components/common/PageHero';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Public-facing hero for the Verify page — thin wrapper over the shared
 * `PageHero` supplying the Verify-specific copy/icon/accent.
 */
export default function VerifyHero() {
  const { t } = useLocale();

  return (
    <PageHero
      accent="primary"
      icon={GppGoodOutlinedIcon}
      badge={t.verifyHero.badge}
      title={t.verifyHero.title}
      subtitle={t.verifyHero.subtitle}
      meta={t.verifyHero.meta}
    />
  );
}
