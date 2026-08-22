import path from 'node:path';
import { test, expect } from '@playwright/test';

const SAMPLE_PDF = path.join(__dirname, 'fixtures', 'sample-document.pdf');

// TC-3 — Journey Verifier (_docs/qa/uat-test-plan.md §2): a document that was
// never registered must resolve to the "not found" failure result.
test('TC-3: verifying an unregistered document lands on /result/failure', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Verifikasi Dokumen Resmi' })).toBeVisible();

  await page.setInputFiles('input[type="file"]', SAMPLE_PDF);
  await page.getByRole('button', { name: 'Verifikasi Dokumen', exact: true }).click();

  await page.waitForURL('**/result/**', { timeout: 15_000 });
  expect(page.url()).toContain('/result/failure');
});
