'use client';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { FilledIcon } from '@components/common/FilledIcon';
import { useLocale } from '@lib/i18n/LocaleContext';

const STEP_ICONS = [
  <UploadFileOutlinedIcon key="upload" />,
  <FingerprintOutlinedIcon key="fingerprint" />,
  <LinkOutlinedIcon key="link" />,
  <FactCheckOutlinedIcon key="check" />,
];

/**
 * Explains the verification mechanism in plain language for non-technical
 * public visitors — builds trust by showing the process is systematic,
 * without requiring the reader to understand hashing/blockchain beforehand.
 */
export default function HowItWorks() {
  const { t } = useLocale();

  return (
    <section className="w-full">
      <h2 className="text-center text-[1.375rem] font-bold text-secondary">{t.howItWorks.heading}</h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {t.howItWorks.steps.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-card">
            <FilledIcon icon={STEP_ICONS[index]} className="text-xl" />
            <div>
              <p className="text-xs font-semibold text-ink-muted">
                {t.howItWorks.stepLabel} {index + 1}
              </p>
              <p className="text-base font-semibold text-base-content">{step.title}</p>
              <p className="mt-1 text-xs text-ink-secondary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
