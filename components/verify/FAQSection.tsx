'use client';

import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Public FAQ section for the Verify landing page — anticipates the most
 * common questions non-technical visitors have about the process.
 */
export default function FAQSection() {
  const { t } = useLocale();

  return (
    <section className="mx-auto mt-14 w-full max-w-3xl pb-16">
      <h2 className="text-center text-xl font-bold text-secondary">{t.faq.heading}</h2>
      <div className="mt-6 flex flex-col gap-3">
        {t.faq.items.map((faq) => (
          <details
            key={faq.q}
            className="group rounded-xl border border-base-300 bg-base-100 px-5 py-4"
          >
            <summary className="cursor-pointer list-none text-base font-medium text-base-content marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.q}
                <span className="shrink-0 text-ink-muted transition-transform group-open:rotate-180">⌄</span>
              </span>
            </summary>
            <p className="mt-3 text-xs text-ink-secondary">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
