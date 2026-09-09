'use client';

import { useState } from 'react';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useLocale } from '@lib/i18n/LocaleContext';

interface AccountModalProps {
  email?: string | null;
  loginMethodLabel: string;
}

/** Avatar button in the header — click opens a small modal showing which
 * account/method is currently signed in, so a user switching between a
 * Keycloak password login and Google can always confirm which one is active. */
export function AccountModal({ email, loginMethodLabel }: AccountModalProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const initial = email?.trim().charAt(0).toUpperCase() || '?';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.header.accountMenu}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-content transition-opacity hover:opacity-80"
      >
        {initial}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label={t.header.closeMenu}
            className="absolute inset-0 cursor-default bg-black/30 transition-opacity duration-200 starting:opacity-0"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-col items-center gap-3 rounded-2xl bg-base-100 p-6 text-center shadow-2xl transition-transform duration-200 ease-out starting:scale-95 starting:opacity-0">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.header.closeMenu}
              className="absolute right-3 top-3 rounded-md p-1 text-ink-muted hover:bg-base-200 hover:text-base-content"
            >
              <CloseIcon style={{ fontSize: '1.2rem' }} />
            </button>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-secondary-content">
              {initial}
            </div>

            <p className="break-all text-sm font-medium text-base-content">
              {email ?? t.header.accountEmailUnknown}
            </p>

            <span className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <CheckCircleOutlinedIcon style={{ fontSize: '1rem' }} />
              {t.header.loggedInAs(loginMethodLabel)}
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
