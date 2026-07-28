import nextAuth from 'next-auth';
import Keycloak from 'next-auth/providers/keycloak';
import type { JWT } from 'next-auth/jwt';

const TOKEN_REFRESH_BUFFER_SECONDS = 30;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      return { ...token, error: 'MissingRefreshToken' };
    }

    const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
    const clientId = process.env.AUTH_KEYCLOAK_ID;
    const clientSecret = process.env.AUTH_KEYCLOAK_SECRET;

    if (!issuer || !clientId || !clientSecret) {
      return { ...token, error: 'MissingAuthConfig' };
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refreshToken,
    });

    const response = await fetch(`${issuer}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      return { ...token, error: 'RefreshAccessTokenError' };
    }

    const refreshed = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000 + refreshed.expires_in),
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const { handlers, auth, signIn, signOut } = nextAuth({
  debug: process.env.NODE_ENV === 'development',
  providers: [Keycloak],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const protectedRoute = nextUrl.pathname.startsWith('/publisher') || nextUrl.pathname.startsWith('/dashboard');
      return protectedRoute ? Boolean(auth) : true;
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }



      if (!token.expiresAt) {
        return token;
      }

      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (nowInSeconds < token.expiresAt - TOKEN_REFRESH_BUFFER_SECONDS) {
        return token;
      }

      return refreshAccessToken(token);

    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
});

