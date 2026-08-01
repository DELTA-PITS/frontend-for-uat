'use client';

import { useState } from 'react';
import { useLocale } from '@lib/i18n/LocaleContext';

/**
 * Public FAQ section for the Verify landing page — anticipates the most
 * common questions non-technical visitors have about the process. Section
 * box spans the same width as its siblings (no own `max-w`/`mx-auto`) so
 * the page stays visually aligned top to bottom — only the answer text
 * itself is capped (`max-w-2xl`) so prose doesn't stretch into
 * uncomfortably long lines.
 *
 * A controlled button + `grid-template-rows` accordion instead of native
 * `<details>` — the height animates (200ms) instead of snapping open/closed
 * instantly, while `aria-expanded` on a real `<button>` keeps it keyboard/
 * screen-reader operable like `<details>` was.
 */
export default function FAQSection() {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full">
      <h2 className="text-center text-[1.375rem] font-bold text-secondary">{t.faq.heading}</h2>
      <div className="mt-6 flex flex-col gap-3">
        {t.faq.items.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.q}
              className="rounded-2xl border border-base-300 bg-base-100 px-5 py-4 shadow-card transition-colors hover:border-base-content/20"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer items-center justify-between gap-3 text-left text-base font-medium text-base-content"
              >
                {faq.q}
                <span
                  className={`shrink-0 text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                >
                  ⌄
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="mt-3 max-w-2xl text-xs text-ink-secondary">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
