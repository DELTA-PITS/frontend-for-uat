import { test, expect } from '@playwright/test';

// TC-1 / TC-2 — Journey Negatif (_docs/qa/uat-test-plan.md §2).
// proxy.ts's authorized() callback protects /publisher and /dashboard;
// auth.ts sets pages.signIn to '/' rather than a bare NextAuth sign-in page.
test.describe('Unauthenticated access guard', () => {
  test('TC-1: /publisher redirects to / when logged out', async ({ page }) => {
    await page.goto('/publisher');
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/(\?.*)?$/);
  });

  test('TC-2: /dashboard redirects to / when logged out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/^http:\/\/[^/]+\/(\?.*)?$/);
  });
});
