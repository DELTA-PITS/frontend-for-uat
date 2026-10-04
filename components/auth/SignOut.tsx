'use client';

import type { ReactNode } from 'react';
import { BASE_PATH } from '@lib/basePath';

export const generateKeycloakLogoutUrl = (
  redirectUrl: string,
  idToken?: string,
): string => {
  const CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ID ?? '';
  const AUTH_KEYCLOAK_ISSUER = process.env.NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER ?? '';

  const urlParams = new URLSearchParams();
  urlParams.append('client_id', CLIENT_ID);
  urlParams.append(
    'post_logout_redirect_uri',
    `${redirectUrl}${BASE_PATH}/api/auth/logout`,
  );

  if (idToken) {
    urlParams.append('id_token_hint', idToken);
  }

  return `${AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout?${urlParams.toString()}`;
};

export interface SignOutProps {
  name?: string;
  className?: string;
  children?: ReactNode;
}

export default function SignOut({
  className,
  children,
}: SignOutProps) {
  return (
    <a
      href={generateKeycloakLogoutUrl(
        process.env.NEXT_PUBLIC_AUTH_URL ?? '',
      )}
      className={className}
    >
      {children ?? 'Sign out'}
    </a>
  );
}