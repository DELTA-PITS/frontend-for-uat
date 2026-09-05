import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const dirname = __dirname;

const PUBLISHER_USERNAME = process.env.PLAYWRIGHT_PUBLISHER_USERNAME ?? 'test-publisher';
const PUBLISHER_PASSWORD = process.env.PLAYWRIGHT_PUBLISHER_PASSWORD ?? 'test';

async function loginAsPublisher(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk' }).first().click();

  // Keycloak's default login theme.
  await page.waitForURL('**/realms/**/protocol/openid-connect/auth**');
  await page.fill('#username', PUBLISHER_USERNAME);
  await page.fill('#password', PUBLISHER_PASSWORD);
  await page.click('#kc-login');

  await page.waitForURL('**/localhost:*/**', { timeout: 15_000 });
}

// Fresh fixture per run so the register step is never a duplicate of a
// previous test run (backend registry is keyed by content hash). Written to
// os.tmpdir(), NOT tests/e2e/fixtures/ — the dev server's webpack watcher
// covers the whole project tree, so writing inside it mid-test triggers a
// Fast Refresh reload that wipes client state (see playwright.config.ts).
function writeUniqueFixture(): string {
  const src = path.join(dirname, 'fixtures', 'sample-document.pdf');
  const base = fs.readFileSync(src);
  const unique = Buffer.concat([base, Buffer.from(`\n% run-${Date.now()}-${Math.random()}`)]);
  const out = path.join(os.tmpdir(), `pits-e2e-run-${Date.now()}.pdf`);
  fs.writeFileSync(out, unique);
  return out;
}

// TC-4/TC-5/TC-6/TC-7 — Journey Publisher end-to-end, then a verifier
// round-trip against the just-registered document (_docs/qa/uat-test-plan.md §2/§3).
test('TC-4..7: publisher logs in, registers a document, sees it on the dashboard, and it verifies as authentic', async ({ page }) => {
  const fixture = writeUniqueFixture();
  const filename = path.basename(fixture);

  await loginAsPublisher(page);

  await page.goto('/publisher');
  await expect(page).toHaveURL(/\/publisher$/);

  await page.setInputFiles('input[type="file"]', fixture);
  await page.getByRole('button', { name: 'Kirim Dokumen' }).click();

  await page.waitForURL('**/result/**', { timeout: 15_000 });
  expect(page.url()).toContain('/result/success');

  await page.goto('/dashboard');
  await expect(page.getByText(filename).first()).toBeVisible({ timeout: 10_000 });

  // Round-trip: the same document, verified publicly (no session needed),
  // must now resolve as authentic.
  await page.context().clearCookies();
  await page.goto('/');
  await page.setInputFiles('input[type="file"]', fixture);
  await page.getByRole('button', { name: 'Verifikasi Dokumen', exact: true }).click();
  await page.waitForURL('**/result/**', { timeout: 15_000 });
  expect(page.url()).toContain('/result/success');

  fs.unlinkSync(fixture);
});
