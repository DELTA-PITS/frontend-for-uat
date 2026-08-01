'use client';

import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Hero for the Register (Upload) page — deliberately navy/institutional in
 * tone rather than the primary-colored tone of Verify, to signal this is an
 * authoritative, permanent institutional action rather than a casual lookup.
 * Structurally identical to VerifyHero (icon size, padding, alignment,
 * badge) — only accent color and copy differ. Deliberately compact (small
 * inline icon, not a large avatar circle) since Verify/Register are
 * workflow pages users pass through quickly, not a landing page.
 */
export default function RegisterHero() {
  const { t } = useLocale();

  return (
    <section className="w-full bg-gradient-to-b from-base-100 to-base-200 px-4 py-8 text-left sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <span className="badge badge-soft mb-2 gap-1 border-secondary/30 bg-secondary/10 font-medium text-secondary">
          <CloudUploadOutlinedIcon style={{ fontSize: '1rem' }} />
          {t.registerHero.badge}
        </span>
        <h1 className="text-2xl font-bold text-secondary sm:text-3xl">{t.registerHero.title}</h1>
        <p className="mt-2 max-w-xl text-sm text-ink-secondary">{t.registerHero.subtitle}</p>
      </div>
    </section>
  );
}
