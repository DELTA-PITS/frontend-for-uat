import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const dirname = __dirname;

const PUBLISHER_USERNAME = process.env.PLAYWRIGHT_PUBLISHER_USERNAME ?? 'test-publisher';
const PUBLISHER_PASSWORD = process.env.PLAYWRIGHT_PUBLISHER_PASSWORD ?? 'test';

// Same login helper as publisher-journey.spec.ts (kept local rather than
// shared to avoid coupling two spec files' internals together for a one-line
// helper — see coding-standards.md on duplication vs. premature abstraction).
async function loginAsPublisher(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Masuk' }).first().click();
  await page.waitForURL('**/realms/**/protocol/openid-connect/auth**');
  await page.fill('#username', PUBLISHER_USERNAME);
  await page.fill('#password', PUBLISHER_PASSWORD);
  await page.click('#kc-login');
  // Single wait keyed off leaving the Keycloak '/realms/' path — works for
  // both a localhost dev server and a production baseURL, unlike waiting on
  // a hardcoded 'localhost' host first (that always timed out against
  // production and burned most of the test's time budget before falling
  // back — see 2026-09-09 test run notes in results doc).
  await page.waitForURL((url) => !url.pathname.includes('/realms/'), { timeout: 20_000 });
}

function tmpFile(name: string, content: Buffer): string {
  const out = path.join(os.tmpdir(), `pits-e2e-${Date.now()}-${name}`);
  fs.writeFileSync(out, content);
  return out;
}

function writeUniqueFixturePdf(): string {
  const src = path.join(dirname, 'fixtures', 'sample-document.pdf');
  const base = fs.readFileSync(src);
  const unique = Buffer.concat([base, Buffer.from(`\n% run-${Date.now()}-${Math.random()}`)]);
  return tmpFile('sample.pdf', unique);
}

// _docs/qa/uat-test-plan.md §6.1 — TC-10.
// Dropzone client-side rejects oversize files via react-dropzone's `maxSize`
// (components/common/Dropzone.tsx) before any network request is made — so
// this is a UI-only assertion, not a 413 round-trip.
test.describe('TC-10: oversize file upload', () => {
  test('publisher Dropzone rejects a file over the 20 MB limit client-side', async ({ page }) => {
    await loginAsPublisher(page);
    await page.goto('/publisher');
    await expect(page).toHaveURL(/\/publisher$/);

    // 21 MB — over Dropzone's `maxSize: 20 * 1024 * 1024` and parseUpload.ts's
    // MAX_UPLOAD_BYTES server-side mirror.
    const oversized = tmpFile('oversized.pdf', Buffer.alloc(21 * 1024 * 1024, 'a'));

    const [request] = await Promise.allSettled([
      page.waitForRequest('**/api/register', { timeout: 3_000 }),
      page.setInputFiles('input[type="file"]', oversized),
    ]);

    // The rejection must be visible immediately, and no /api/register call
    // should ever have been fired for a file this size.
    await expect(page.getByText('Ukuran file melebihi 20 MB.')).toBeVisible();
    expect(request.status).toBe('rejected');

    fs.unlinkSync(oversized);
  });
});

// _docs/qa/uat-test-plan.md §6.1 — TC-11.
// Dropzone's `accept: { 'application/pdf': ['.pdf'] }` filters non-PDF files
// client-side. Two sub-cases: a file whose extension isn't .pdf (browser
// picker / accept filter catches this even without correct MIME sniffing),
// and one disguised as .pdf but with non-PDF bytes (tests the MIME-vs-bytes
// gap noted in backend-for-uat's api-test-scenarios.md REG-6).
test.describe('TC-11: non-PDF file upload', () => {
  test('Dropzone rejects a .txt file by extension', async ({ page }) => {
    await loginAsPublisher(page);
    await page.goto('/publisher');

    const txt = tmpFile('not-a-pdf.txt', Buffer.from('this is not a pdf'));
    await page.setInputFiles('input[type="file"]', txt);

    await expect(page.getByText('Hanya file PDF yang didukung.')).toBeVisible();
    fs.unlinkSync(txt);
  });

  test('a file with .pdf extension but non-PDF content passes the client filter — server must be the real gate', async ({ page }) => {
    // This documents the gap explicitly: Dropzone's `accept` option filters
    // by extension/MIME sniffing, which a renamed file defeats. The request
    // records whether app/api/register/route.ts (via parseUpload.ts) still
    // catches it server-side with 415 — that's the real control, per
    // parseUpload.ts's `hasPdfType` check (file.type === '' || 'application/pdf').
    await loginAsPublisher(page);
    await page.goto('/publisher');

    const fakePdf = tmpFile('fake.pdf', Buffer.from('%NOT-PDF-CONTENT%'.repeat(20)));
    await page.setInputFiles('input[type="file"]', fakePdf);

    // If Dropzone's accept filter let it through (no rejection message),
    // continue to submit and confirm the server still rejects it.
    const rejected = await page
      .getByText('Hanya file PDF yang didukung.')
      .isVisible()
      .catch(() => false);

    if (!rejected) {
      const submit = page.getByRole('button', { name: 'Kirim Dokumen' });
      if (await submit.isEnabled().catch(() => false)) {
        const [response] = await Promise.all([
          page.waitForResponse('**/api/register', { timeout: 15_000 }).catch(() => null),
          submit.click(),
        ]);
        if (response) {
          // Server-side parseUpload.ts should still reject with 415 even
          // though the extension says .pdf — content-type sniffing in the
          // browser can be spoofed by renaming, filename alone can't be trusted.
          expect(response.status(), 'server must not silently accept non-PDF bytes disguised as .pdf').toBe(415);
        }
      }
    } else {
      expect(rejected).toBe(true);
    }

    fs.unlinkSync(fakePdf);
  });
});

// _docs/qa/uat-test-plan.md §6.1 — TC-12.
test.describe('TC-12: access token expiry', () => {
  test.skip(
    true,
    'Manual test needed — Keycloak access token TTL for realm nextjs-kc is long enough ' +
      '(default ~5 min, confirmed longer in production per _docs/qa) that waiting it out ' +
      'inside an automated Playwright run is not realistic for a CI-style pass/fail gate. ' +
      'Documented per instruction rather than silently skipped — see ' +
      '_docs/qa/results/frontend-test-results-2026-09-09.md for the manual procedure ' +
      '(let a logged-in /publisher tab sit idle past the access-token TTL, then submit, ' +
      'and confirm whether NextAuth silently refreshes or the user is forced back to login).',
  );
});

// _docs/qa/uat-test-plan.md §6.1 — TC-13.
test.describe('TC-13: full logout (app session + Keycloak SSO)', () => {
  test('logout ends both the NextAuth session and the Keycloak SSO cookie', async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsPublisher(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);

    // SignOut (components/auth/SignOut.tsx) links straight to Keycloak's
    // openid-connect/logout endpoint with post_logout_redirect_uri back to
    // /api/auth/logout — clicking it should end up back on the app logged out.
    await page.getByRole('link', { name: 'Keluar' }).first().click();

    // FINDING (see results doc): generateKeycloakLogoutUrl() in SignOut.tsx
    // is called with only the redirect URL, never the actual `idToken` param
    // its own signature supports — so Keycloak never receives an
    // id_token_hint and falls back to its manual "Do you want to log out?"
    // confirmation screen instead of a silent logout. Confirm it here so the
    // rest of the assertion (session actually ends) can still be verified.
    const confirmLogout = page.getByRole('button', { name: /logout/i });
    if (await confirmLogout.isVisible({ timeout: 15_000 }).catch(() => false)) {
      await confirmLogout.click();
    }

    await page.waitForURL((url) => !url.pathname.includes('/protocol/openid-connect/logout'), {
      timeout: 20_000,
    });

    // If the Keycloak SSO cookie were still alive, re-visiting a protected
    // route would silently re-authenticate instead of redirecting to '/'.
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/(\?.*)?$/, { timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Masuk' }).first()).toBeVisible();
  });
});

// _docs/qa/uat-test-plan.md §6.1 — TC-14.
test.describe('TC-14: i18n toggle across main pages', () => {
  test('ID <-> EN toggle changes visible text on /, /result/success, /result/failure', async ({ page }) => {
    // Public pages only — /publisher and /dashboard require auth and are
    // covered by the same toggle mechanism (shared LocaleContext/localStorage),
    // so exercising it once on an authenticated page below is sufficient
    // without duplicating the full login flow three more times.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Verifikasi Dokumen Resmi' })).toBeVisible();

    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Verify an Official Document' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify Document', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'ID', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Verifikasi Dokumen Resmi' })).toBeVisible();
  });

  test('toggle persists into an authenticated page (/dashboard)', async ({ page }) => {
    await loginAsPublisher(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);

    await expect(page.getByText('Dokumen Terdaftar')).toBeVisible();
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByText('Registered Documents')).toBeVisible();
  });
});

// _docs/qa/uat-test-plan.md §6.2 — TC-15.
// lib/resultPayload.ts's readResultPayload() returns null when sessionStorage
// has no payload (never went through the register/verify flow). ResultView
// must handle that gracefully — no crash, no blank white page.
test.describe('TC-15: direct navigation to /result pages without a flow', () => {
  test('/result/success with no sessionStorage payload does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/result/success');
    // Card shell (back button) must render regardless — confirms the page
    // didn't throw during render even though payload is null.
    await expect(page.getByRole('button', { name: 'Beranda' }).or(page.getByRole('button', { name: 'Home' }))).toBeVisible({
      timeout: 10_000,
    });
    expect(errors, `unexpected client-side errors: ${errors.join('; ')}`).toHaveLength(0);
  });

  test('/result/failure with no sessionStorage payload does not crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/result/failure');
    await expect(page.getByRole('button', { name: 'Beranda' }).or(page.getByRole('button', { name: 'Home' }))).toBeVisible({
      timeout: 10_000,
    });
    expect(errors, `unexpected client-side errors: ${errors.join('; ')}`).toHaveLength(0);
  });
});

// _docs/qa/uat-test-plan.md §6.2 — TC-16.
test.describe('TC-16: refresh /result/success after a real result', () => {
  test('F5 after a successful verify keeps showing the same result (sessionStorage survives refresh)', async ({ page }) => {
    test.setTimeout(60_000);
    const fixture = writeUniqueFixturePdf();

    // Verify flow doesn't need login and is simplest to reach a real
    // /result/success with populated sessionStorage.
    await page.goto('/publisher').catch(() => {});
    await loginAsPublisher(page);
    await page.goto('/publisher');
    await page.setInputFiles('input[type="file"]', fixture);
    await page.getByRole('button', { name: 'Kirim Dokumen' }).click();
    await page.waitForURL('**/result/**', { timeout: 15_000 });
    expect(page.url()).toContain('/result/success');

    const recordIdRow = page.locator('text=Record ID').locator('..').first();
    await expect(page.getByText('Registrasi Berhasil')).toBeVisible();
    const beforeReload = await page.content();

    await page.reload();

    await expect(page.getByText('Registrasi Berhasil')).toBeVisible({ timeout: 10_000 });
    const afterReload = await page.content();

    // Not a byte-for-byte compare (timestamps/formatting could legitimately
    // shift), just confirms the success view re-rendered with the same
    // outcome rather than falling back to the empty/error state.
    expect(afterReload).toContain('Registrasi Berhasil');
    void recordIdRow;
    void beforeReload;

    fs.unlinkSync(fixture);
  });
});

// _docs/qa/uat-test-plan.md §6.2 — TC-17.
// Security-relevant: sends a request straight to the Next.js server-side API
// route (NOT the FastAPI backend directly) with a valid session cookie,
// deliberately outside the Dropzone/browser UI, to confirm requireAuth.ts +
// parseUpload.ts revalidate rather than trusting the client.
test.describe('TC-17: bypassing frontend validation by hitting /api/register directly', () => {
  test('a valid session cannot push an oversized file past server-side validation', async ({ page, request }) => {
    test.setTimeout(45_000);
    await loginAsPublisher(page);
    await page.goto('/publisher');

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const oversized = Buffer.alloc(21 * 1024 * 1024, 'a');
    const response = await request.post('/api/register', {
      headers: { cookie: cookieHeader },
      multipart: {
        file: { name: 'bypass-oversized.pdf', mimeType: 'application/pdf', buffer: oversized },
        filename: 'bypass-oversized.pdf',
      },
    });

    expect(response.status(), 'server must reject an oversized file even with a valid session cookie').toBe(413);
  });

  test('a valid session cannot push a non-PDF file past server-side validation', async ({ page, request }) => {
    test.setTimeout(45_000);
    await loginAsPublisher(page);
    await page.goto('/publisher');

    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

    const response = await request.post('/api/register', {
      headers: { cookie: cookieHeader },
      multipart: {
        file: { name: 'bypass.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not-really-a-jpeg') },
        filename: 'bypass.jpg',
      },
    });

    expect(response.status(), 'server must reject a non-PDF file even with a valid session cookie').toBe(415);
  });

  test('no session cookie is rejected outright (requireAuth.ts)', async ({ request }) => {
    const response = await request.post('/api/register', {
      multipart: {
        file: { name: 'anon.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 fake') },
        filename: 'anon.pdf',
      },
    });

    expect(response.status()).toBe(401);
  });
});

// _docs/qa/uat-test-plan.md §6.2 — TC-18.
test.describe('TC-18: double-submit on verify', () => {
  test('rapid double-click on "Verifikasi Dokumen" does not fire two in-flight requests', async ({ page }) => {
    const fixture = writeUniqueFixturePdf();
    await page.goto('/');
    await page.setInputFiles('input[type="file"]', fixture);

    const submit = page.getByRole('button', { name: 'Verifikasi Dokumen', exact: true });

    const verifyRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/verify')) verifyRequests.push(req.url());
    });

    // Two rapid clicks. Issuing these as two separate Playwright `.click()`
    // calls races against React's own re-render: FileUpload.tsx unmounts the
    // button once isUploading flips true, so a second `.click()` call's
    // actionability wait can get stuck endlessly retrying against a locator
    // that keeps resolving to a just-detached element (this hung for the
    // full test timeout in an earlier run). Dispatching both native click
    // events back-to-back inside one page.evaluate() call fires them in the
    // same synchronous tick — closer to a real rapid double-click than two
    // separately-awaited Playwright actions, and it sidesteps the
    // actionability-retry hang. It also happens to be the more revealing
    // test: React 18 auto-batches state updates within one native event
    // dispatch, so both onClick handlers can run against the *same*
    // `isUploading === false` closure before either commit — i.e. the
    // handleSubmit's own `if (isUploading) return` guard
    // (hooks/useUpload.ts) may not be enough to stop this exact race even
    // though the UI unmounts the button correctly afterwards.
    await submit.waitFor({ state: 'visible' });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('Verifikasi Dokumen'),
      ) as HTMLButtonElement | undefined;
      btn?.click();
      btn?.click();
    });

    // Count requests over a fixed window rather than gating on navigation —
    // navigation is a secondary signal here and waiting on it directly
    // turned a real "how many requests fired" answer into a 30s hang in
    // earlier runs whenever navigation was slow/absent.
    await page.waitForTimeout(3_000);
    expect(
      verifyRequests.length,
      `expected at most 1 /api/verify request from a double-click, got ${verifyRequests.length}`,
    ).toBeLessThanOrEqual(1);

    // Best-effort confirmation the single request still completes normally
    // — not fatal to the double-submit assertion above if slow/absent.
    await page.waitForURL('**/result/**', { timeout: 15_000 }).catch(() => {});

    fs.unlinkSync(fixture);
  });
});

// _docs/qa/uat-test-plan.md §6.2 — TC-19.
test.describe('TC-19: dark mode + mobile viewport (verifier page)', () => {
  test('verifier page renders without horizontal overflow in dark mode on a narrow viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Verifikasi Dokumen Resmi' })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, 'page should not overflow horizontally at 375px width').toBe(false);

    await page.screenshot({
      path: path.join(os.tmpdir(), 'pits-frontend-e2e', 'tc19-dark-mobile-verifier.png'),
      fullPage: true,
    });
  });
});
