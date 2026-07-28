import { signOut } from '@/auth';

/**
 * API route handler for processing logout requests. It utilizes the signOut function from the authentication module to log the user out of their session, redirecting them to the specified authentication URL after successful logout. The handler ensures that the user is properly signed out and redirected, providing a seamless logout experience.
 * @returns A response that triggers the sign-out process and redirects the user to the authentication URL after logout.
 */
export const GET = async () => {
  return signOut({
    redirect: true,
    redirectTo: process.env.AUTH_URL,
  });
};