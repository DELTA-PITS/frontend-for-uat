'use client';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PageHero from '@components/common/PageHero';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Hero for the Register (Upload) page — deliberately navy/institutional in
 * tone rather than the primary-colored tone of Verify, to signal this is an
 * authoritative, permanent institutional action rather than a casual lookup.
 * Thin wrapper over the shared `PageHero` supplying Register-specific copy.
 */
export default function RegisterHero() {
  const { t } = useLocale();

  return (
    <PageHero
      accent="secondary"
      icon={CloudUploadOutlinedIcon}
      badge={t.registerHero.badge}
      title={t.registerHero.title}
      subtitle={t.registerHero.subtitle}
    />
  );
}
