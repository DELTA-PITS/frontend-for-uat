'use client';

import Image from 'next/image';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import Icon from '@mdi/react';
import {
  mdiFileDocumentOutline,
  mdiViewDashboardOutline,
  mdiUploadOutline,
  mdiLogin,
  mdiLogout,
} from '@mdi/js';

import SignIn from '@components/auth/SignIn';
import SignOut from '@components/auth/SignOut';

export interface HeaderProps {
  session?: Session | null;
}

const publicNavLinks = [
  {
    label: 'Verify Document',
    href: '/',
    icon: mdiFileDocumentOutline,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: mdiViewDashboardOutline,
  },
];

const privateNavLinks = [
  {
    label: 'Upload Document',
    href: '/publisher',
    icon: mdiUploadOutline,
  },
  {
    label: 'Verify Document',
    href: '/',
    icon: mdiFileDocumentOutline,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: mdiViewDashboardOutline,
  },
];

/**
 * Renders the main application header featuring the BRIN logo, site title, 
 * navigation links, and dynamic authentication controls.
 * 
 * @param session - The user session to display header information.
 * 
 * @returns The header component.
 */
export function Header({ session }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoggedIn = Boolean(session?.user);
  const navLinks = isLoggedIn ? privateNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full bg-base-100 border-b border-base-300 shadow-sm">
      <div className="flex h-14 items-center justify-between px-6">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex cursor-pointer items-center gap-2 text-base font-heading font-semibold text-secondary hover:opacity-80 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="BRIN logo"
            width={28}
            height={28}
            className="object-contain"
          />

          <span>Badan Research Dan Inovasi Nasional</span>
        </button>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ label, href, icon }) => {
            const isActive = pathname === href;

            return (
              <button
                key={href}
                type="button"
                onClick={() => router.push(href)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-base-content hover:bg-base-200 hover:text-primary'
                  }`}
              >
                <Icon path={icon} size={0.7} />
                {label}
              </button>
            );
          })}

          {isLoggedIn ? (
            <SignOut className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors">
              <Icon path={mdiLogout} size={0.7} />
              Sign out
            </SignOut>
          ) : (
            <SignIn className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-base-content hover:bg-base-200 hover:text-primary transition-colors">
              <Icon path={mdiLogin} size={0.7} />
              Sign in
            </SignIn>
          )}
        </nav>
      </div>
    </header>
  );
}