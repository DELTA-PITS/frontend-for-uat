'use client';

import React from 'react'
import { useLocale } from '@lib/i18n/LocaleContext';

interface LoadingCardProps {
  /** The primary loading message. Defaults to the current locale's loading title. */
  title?: string
  /** The secondary/subtext loading message. Defaults to the current locale's loading subtitle. */
  subtitle?: string
  /** Additional CSS class names for custom container styling */
  className?: string
}

/**
 * Displays a loading state dialog with an animated spinner, title, and subtitle.
 * @param title - The primary loading message. Defaults to the current locale's loading title.
 * @param subtitle - The secondary/subtext loading message. Defaults to the current locale's loading subtitle.
 * @param className - Additional CSS class names for custom container styling
 * @returns The loading card.
 */
const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  subtitle,
  className = '',
}) => {
  const { t } = useLocale();

  return (
    <div className={`bg-base-100 border border-base-300 rounded-2xl shadow-card p-6 sm:p-8 w-full max-w-3xl min-h-[17.5rem] flex flex-col justify-center mx-auto my-auto ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 flex items-center justify-center shrink-0">
          <div className="w-14 h-14 border-4 border-base-300 border-t-primary rounded-full animate-spin" />
        </div>

        <h3 className="text-lg font-semibold text-base-content">{title ?? t.loadingCard.title}</h3>
        <p className="text-xs text-base-content/70 text-center">{subtitle ?? t.loadingCard.subtitle}</p>
      </div>
    </div>
  )
}

export default LoadingCard
