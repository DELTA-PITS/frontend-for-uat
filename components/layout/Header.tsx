'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import SignIn from '@components/auth/SignIn';
import SignOut from '@components/auth/SignOut';
import LanguageSwitcher from '@components/layout/LanguageSwitcher';
import { useLocale } from '@lib/i18n/LocaleContext';

export interface HeaderProps {
  session?: Session | null;
}

/**
 * Renders the main application header:
 * - Brand row: institution identity (logo/name/subtitle) + main menu
 *   (Layanan Dokumen, Dashboard, language switcher, sign in/out).
 * - Sub-nav row: only rendered while inside the "Layanan Dokumen" section
 *   (Register/Verify), showing those two document workflows. Hidden
 *   everywhere else (e.g. Dashboard) since it doesn't apply there.
 */
export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isLoggedIn = Boolean(session?.user);

  // Border only appears once the page has scrolled — a flat top edge reads
  // as less "boxed in" than an always-on border under the navbar.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const documentNavLinks = isLoggedIn
    ? [
      { label: t.header.navRegister, href: '/publisher', icon: UploadFileOutlinedIcon },
      { label: t.header.navVerify, href: '/', icon: FactCheckOutlinedIcon },
    ]
    : [{ label: t.header.navVerify, href: '/', icon: FactCheckOutlinedIcon }];

  const isDocumentSection = documentNavLinks.some((link) => link.href === pathname);

  // Close the mobile drawer on any route change so it never stays open after navigating.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const goTo = (href: string) => {
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-base-100 transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''
        }`}
    >
      {/* Brand row — institutional identity + main menu */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex min-w-0 cursor-pointer items-center gap-3 text-left hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="Logo BRIN"
            width={36}
            height={36}
            className="object-contain shrink-0"
          />

          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-heading text-base font-semibold text-secondary">
              {t.header.orgName}
            </span>
            <span className="hidden truncate text-sm text-ink-secondary sm:block">
              {t.header.orgSubtitle}
            </span>
          </span>
        </button>

        {/* Desktop/tablet controls — collapses into the hamburger drawer below sm */}
        <div className="hidden shrink-0 items-center gap-2 sm:flex sm:gap-3">
          <button
            type="button"
            onClick={() => router.push(documentNavLinks[0].href)}
            title={t.header.navGroupLabel}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${isDocumentSection
              ? 'bg-base-200 font-semibold text-base-content'
              : 'text-base-content hover:bg-base-200'
              }`}
          >
            <DescriptionOutlinedIcon style={{ fontSize: '1.1rem' }} />
            <span>{t.header.navGroupLabel}</span>
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              title={t.header.navDashboard}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${pathname === '/dashboard'
                ? 'bg-base-200 font-semibold text-base-content'
                : 'text-base-content hover:bg-base-200'
                }`}
            >
              <SpaceDashboardOutlinedIcon style={{ fontSize: '1.1rem' }} />
              <span>{t.header.navDashboard}</span>
            </button>
          ) : null}

          <LanguageSwitcher />

          {isLoggedIn ? (
            <SignOut className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-base-content hover:bg-base-200 transition-colors">
              <LogoutOutlinedIcon style={{ fontSize: '1.1rem' }} />
              <span>{t.header.signOut}</span>
            </SignOut>
          ) : (
            <SignIn className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-base-content hover:bg-base-200 transition-colors">
              <LoginOutlinedIcon style={{ fontSize: '1.1rem' }} />
              <span>{t.header.signIn}</span>
            </SignIn>
          )}
        </div>

        {/* Mobile hamburger trigger */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label={t.header.openMenu}
          className="flex shrink-0 items-center justify-center rounded-md p-2 text-base-content hover:bg-base-200 sm:hidden"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Sub-nav row (desktop/tablet only) — only within the "Layanan Dokumen" section */}
      {isDocumentSection ? (
        <nav className="hidden items-center justify-center gap-8 border-t border-base-300 bg-base-200/40 px-6 sm:flex">
          {documentNavLinks.map(({ label, href, icon: NavIcon }) => {
            const isActive = pathname === href;

            return (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                title={label}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm transition-colors ${isActive
                  ? 'border-base-content bg-base-200 font-semibold text-base-content'
                  : 'border-transparent text-base-content hover:bg-base-200'
                  }`}
              >
                <NavIcon style={{ fontSize: '1.2rem' }} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      {/* Mobile drawer — Dashboard, document links (grouped), language, sign in/out */}
      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label={t.header.closeMenu}
            className="absolute inset-0 bg-black/30 transition-opacity duration-200 starting:opacity-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col gap-1 overflow-y-auto border-l border-base-300 bg-base-100 p-4 shadow-2xl transition-transform duration-200 ease-out starting:translate-x-full">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-secondary">{t.header.orgName}</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={t.header.closeMenu}
                className="rounded-md p-1.5 text-ink-muted hover:bg-base-200 hover:text-base-content"
              >
                <CloseIcon />
              </button>
            </div>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={() => goTo('/dashboard')}
                className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm ${pathname === '/dashboard'
                  ? 'bg-base-200 font-semibold text-base-content'
                  : 'text-base-content hover:bg-base-200'
                  }`}
              >
                <SpaceDashboardOutlinedIcon style={{ fontSize: '1.2rem' }} />
                {t.header.navDashboard}
              </button>
            ) : null}

            <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {t.header.navGroupLabel}
            </p>
            {documentNavLinks.map(({ label, href, icon: NavIcon }) => {
              const isActive = pathname === href;
              return (
                <button
                  key={href}
                  type="button"
                  onClick={() => goTo(href)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm ${isActive
                    ? 'bg-base-200 font-semibold text-base-content'
                    : 'text-base-content hover:bg-base-200'
                    }`}
                >
                  <NavIcon style={{ fontSize: '1.2rem' }} />
                  {label}
                </button>
              );
            })}

            <div className="my-2 border-t border-base-300" />

            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-sm text-ink-secondary">{t.header.language}</span>
              <LanguageSwitcher />
            </div>

            {isLoggedIn ? (
              <SignOut className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-base-content hover:bg-base-200">
                <LogoutOutlinedIcon style={{ fontSize: '1.2rem' }} />
                {t.header.signOut}
              </SignOut>
            ) : (
              <SignIn className="flex items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-base-content hover:bg-base-200">
                <LoginOutlinedIcon style={{ fontSize: '1.2rem' }} />
                {t.header.signIn}
              </SignIn>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
