# PITS Frontend — Forensic Technical Audit (raw evidence)

Repo: `/Users/laksaersa/GitHub/_personal/_PITS/frontend-for-uat`
Audit date: 2026-09-13
Branch at audit time: `feature/uat-readiness` (tracking `origin/feature/uat-readiness`)

---

## A. Frontend Architecture Facts

### A1. Framework + exact versions
Source: `package.json:16-56`

| Package | Version |
|---|---|
| next | `16.2.12` (`package.json:24`) |
| next-auth | `5.0.0-beta.32` (`package.json:25`) |
| react / react-dom | `19.2.4` (`package.json:27-28`) |
| typescript | `^5` (`package.json:53`) |
| tailwindcss | `^4` (`package.json:52`) |
| daisyui | `^5.5.19` (`package.json:23`) |
| oxlint | `^1.61.0` (`package.json:26`) — the project's actual lint tool; `_docs/quality/test-strategy.md:5` says "ESLint sebelum commit" which is **stale/inaccurate** — repo has no ESLint config, `npm run lint` invokes `oxlint` (`package.json:9`) |
| @playwright/test | `^1.62.1` (`package.json:33`) |
| playwright | `^1.60.0` (`package.json:50`) |
| vitest | `^4.1.8` (`package.json:55`) |
| @vitest/browser-playwright | `^4.1.8` (`package.json:47`) |
| storybook | `^10.4.2` (`package.json:51`) |
| react-dropzone | `^15.0.0` (`package.json:29`) |
| vite | `^8.0.16` (`package.json:54`) |

Scripts (`package.json:5-15`): `dev`: `next dev --webpack`, `build`: `next build --webpack`, `start`: `next start`, `lint`: `oxlint`, `lint:fix`: `oxlint --fix`, `test`: `vitest run --project unit`, `test:e2e`: `playwright test`, `storybook`: `storybook dev -p 6006`, `build-storybook`: `storybook build`.

### A2. Routing structure

Page routes (from `find app -type f`):

| Route (file) | Protected? | Deciding logic (file:line) |
|---|---|---|
| `/` (`app/page.tsx`) | Public | No auth guard in file; `auth.ts:69-71` `authorized()` only gates paths starting `/publisher` or `/dashboard` |
| `/verify` (`app/verify/page.tsx`) | Public | Same as above. **Dead/stub page** — see Finding D4 below; not the real verify UI |
| `/publisher` (`app/publisher/page.tsx`) | Protected | Edge: `proxy.ts:1-4` (`export { auth as proxy }` + matcher) invokes `auth.ts:69-71` `authorized()` callback: `nextUrl.pathname.startsWith('/publisher')` → requires `auth`. Defense-in-depth server check in the page itself: `app/publisher/page.tsx:14,19-21` — `if (!session \|\| session.error) redirect('/')` |
| `/dashboard` (`app/dashboard/page.tsx`) | Protected | Edge: same `auth.ts:69-71`, `nextUrl.pathname.startsWith('/dashboard')`. Page-level defense-in-depth: `app/dashboard/page.tsx:52-55` `if (!session) redirect('/')` |
| `/result/success` (`app/result/success/page.tsx`) | Public | Not matched by protected-prefix check |
| `/result/failure` (`app/result/failure/page.tsx`) | Public | Not matched by protected-prefix check |

Comments in both `app/publisher/page.tsx:5,7` and `app/dashboard/page.tsx:10` reference `middleware.ts` and cite `_docs/security/session-auth-audit-2026-08-02.md` — but the actual file in this repo is `proxy.ts`, not `middleware.ts` (confirmed via `find . -maxdepth 2 -iname "middleware.ts"` → no result). **Stale comment** naming the wrong file (see Finding D4).

Internal API routes (`find app/api -name route.ts`):
- `app/api/register/route.ts`
- `app/api/verify/route.ts`
- `app/api/records/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/[...nextauth]/route.ts`

### A3. Auth — NextAuth/Keycloak config

File: `auth.ts` (121 lines).

- Provider: `Keycloak` from `next-auth/providers/keycloak` (`auth.ts:2,60`), env-driven (no client secret in code — `auth.ts:13-15` reads `AUTH_KEYCLOAK_ISSUER`, `AUTH_KEYCLOAK_ID`, `AUTH_KEYCLOAK_SECRET` from `process.env`).
- `pages.signIn: '/'` (`auth.ts:65-67`) — unauthorized requests to protected routes are redirected to `/` (the public Verify landing page with a "Masuk" button), not NextAuth's default sign-in page. Comment at `auth.ts:61-64` documents this intentionally.
- `authorized()` callback (`auth.ts:69-71`): `const protectedRoute = nextUrl.pathname.startsWith('/publisher') || nextUrl.pathname.startsWith('/dashboard'); return protectedRoute ? Boolean(auth) : true;` — **only** these two path prefixes are gated; everything else (including all `/api/*` routes) passes the middleware/proxy layer unconditionally.
- `jwt()` callback (`auth.ts:73-111`):
  - Captures `account.access_token` / `account.refresh_token` / `account.expires_at` into the token on first sign-in (`auth.ts:74-78`).
  - Decodes the Keycloak `id_token` payload manually (`auth.ts:85-96`, base64url JSON decode) to extract the `identity_provider` claim (e.g. `"google"`) — done because next-auth's Keycloak provider only maps a fixed claim subset; wrapped in try/catch that silently no-ops on malformed token (`auth.ts:93-95`).
  - Refresh logic: if `token.expiresAt` is unset, returns token as-is (`auth.ts:100-102`); if now < `expiresAt - 30s` (`TOKEN_REFRESH_BUFFER_SECONDS`, `auth.ts:5`), returns as-is (`auth.ts:104-107`); otherwise calls `refreshAccessToken(token)` (`auth.ts:109`).
  - `refreshAccessToken()` (`auth.ts:7-56`): POSTs `grant_type=refresh_token` to `${issuer}/protocol/openid-connect/token` (`auth.ts:28-34`); on any failure sets `token.error` to one of `'MissingRefreshToken'`, `'MissingAuthConfig'`, or `'RefreshAccessTokenError'` (`auth.ts:10,18,37,54`) rather than throwing.
- `session()` callback (`auth.ts:112-118`): copies `token.accessToken`, `token.error`, `token.identityProvider` onto the session object exposed to the app.
- **Access token → backend calls**: `session.accessToken` is read server-side in each protected API route / page and sent as `Authorization: Bearer <token>` header to the backend:
  - `app/api/register/route.ts:20-22,33-37` (`requireAccessToken()` → `accessToken` → `Authorization: \`Bearer ${accessToken}\``)
  - `app/api/records/route.ts:11-15` (same pattern)
  - `app/dashboard/page.tsx:37-38` (`fetch(BACKEND_RECORDS_URL, { headers: { Authorization: \`Bearer ${session.accessToken}\` } })`) — this is a **second, independent** direct-fetch path to the records backend from the dashboard Server Component, separate from `app/api/records/route.ts`; both exist in the codebase (see Finding D6).
- `app/api/verify/route.ts` performs **no** auth check at all (correct per constitution: `/verify` must stay public — `CLAUDE.md` "Route `/verify` selalu publik tanpa login").

### A4. Internal API routes — detail

| Route | Method | Proxies to | Auth check | Validation |
|---|---|---|---|---|
| `app/api/register/route.ts` | POST | `process.env.PITS_BACKEND_REGISTER_URL` (`route.ts:5,33`) | **Yes** — `requireAccessToken()` from `_lib/requireAuth.ts`, called at `route.ts:20-21`; 401 JSON `{message:'Missing Keycloak access token'}` if absent (`requireAuth.ts:16-21`) | **Yes** — `parseUpload(request)` at `route.ts:25`, from `_lib/parseUpload.ts` (see A4a) |
| `app/api/verify/route.ts` | POST | `process.env.PITS_BACKEND_VERIFY_URL` (`route.ts:4,23`) | **No** — no import/call of `requireAuth`; intentional per CLAUDE.md constitution (public verify) | **Yes** — same `parseUpload(request)` at `route.ts:17` |
| `app/api/records/route.ts` | GET | `process.env.PITS_BACKEND_RECORDS_URL` (`route.ts:4,14`) | **Yes** — `requireAccessToken()` at `route.ts:11-12` | N/A (no upload; passthrough GET with `cache: 'no-store'`, `route.ts:16`) |
| `app/api/auth/logout/route.ts` | GET | N/A — calls next-auth `signOut()` (`route.ts:1,8-14`) | Implicit via next-auth session | N/A |
| `app/api/auth/[...nextauth]/route.ts` | GET/POST | next-auth internal handlers (`route.ts:1-2`) | next-auth internal | N/A |

#### A4a. `parseUpload.ts` validation detail (`app/api/_lib/parseUpload.ts`, 33 lines)
```
MAX_UPLOAD_BYTES = 20 * 1024 * 1024        // line 1
```
- `formData.get('file')` must be instance of `File`, `formData.get('filename')` must be `string`, else 400 "Invalid upload payload" (`parseUpload.ts:15-20`).
- `file.size > MAX_UPLOAD_BYTES` → 413 "File size exceeds the 20 MB limit" (`parseUpload.ts:22-24`).
- PDF check (`parseUpload.ts:26-29`): `hasPdfExtension = filename.toLowerCase().endsWith('.pdf')`; `hasPdfType = file.type === '' || file.type === 'application/pdf'`; if either check fails → 415 "Only PDF files are supported". **Note**: this checks the browser-reported MIME type string and filename extension only — it does **not** inspect file bytes/magic-number (`%PDF-` header). A file renamed to `.pdf` with an empty or `application/pdf`-spoofed `Content-Type` and non-PDF bytes passes this check (confirmed as a real gap by prior E2E run, see Section B2 TC-11b and Section D1).

### A5. i18n mechanism
- File: `lib/i18n/translations.ts` — **504 lines**, exports `translations` object with `id` and `en` locale trees.
- Toggle: `lib/i18n/LocaleContext.tsx` (49 lines) — React context (`useLocale()` hook) exposing `{ locale, t }`; toggled via `components/layout/LanguageSwitcher.tsx`.
- Persistence/verification: `lib/i18n/translations.test.ts` asserts `id` and `en` have identical leaf key-paths (key parity) and that every leaf string is non-empty except an explicit allow-list (`dropzone.titleRest`) — `translations.test.ts:16-40`.
- Key count: not enumerated per instructions; file is 504 lines total for both locale trees combined (order of magnitude: several dozen leaf keys per locale, exact count not extracted — see Section F).

### A6. Test tooling versions / config
- Playwright: `@playwright/test ^1.62.1`, `playwright ^1.60.0` (`package.json:33,50`).
- Vitest: `^4.1.8` (`package.json:55`), config `vitest.config.ts` (59 lines): two projects — `storybook` (browser-mode, headless chromium via `@vitest/browser-playwright`) and `unit` (jsdom environment, `include: ['**/*.test.{ts,tsx}']`, excludes `node_modules/**`, `.next/**`, `stories/**`) (`vitest.config.ts:38-56`). Path aliases mirrored from `tsconfig.json` (`vitest.config.ts:19-27`).
- Playwright config `playwright.config.ts` (36 lines): `testDir: './tests/e2e'` (line 17); artifacts written to `os.tmpdir()/pits-frontend-e2e` rather than repo-local dirs, with an explicit comment explaining why (webpack dev-server file-watcher would Fast-Refresh mid-test, line 5-10); `baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3080'` (line 26); `fullyParallel: false`, `retries: 0` (lines 19-20); single project `chromium` / Desktop Chrome (lines 30-35).

### A7. Build/deploy
`Dockerfile` (multi-stage, 4 stages):
1. `deps` — `node:22-alpine`, `npm ci` (installs all deps incl. dev, needed for `next build`).
2. `builder` — copies `deps` node_modules + full source, runs `npm run build` at image-build time (comment: "was previously done on every container start" — i.e. this multi-stage layout is a fix for a prior anti-pattern).
3. `prod-deps` — separate `npm ci --omit=dev` for a lean runtime `node_modules`.
4. `runner` — `NODE_ENV=production`, copies `prod-deps` node_modules + `builder`'s `.next` + `public` + `package.json`, `EXPOSE 3000`, `CMD ["npm","run","start","--","--hostname","0.0.0.0","--port","3000"]`.

`.dockerignore`: excludes `node_modules`, `.next`, `.git`, `.storybook`, `stories`, `tests`, `coverage`, `_docs`, `*.md`, `.DS_Store`.

`next.config.ts` (14 lines): only notable setting is `turbopack.root: rootDir` (explicit Turbopack root); no other custom config (no `images`, `redirects`, `headers`, `experimental` flags set). Note: `npm run dev`/`build` scripts explicitly pass `--webpack` (`package.json:7-8`), i.e. **not** using Turbopack for dev/build despite the `turbopack` key being present in `next.config.ts`.

`.env.local` (not committed, present locally) declares these variable **names** only: `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_AUTH_URL`, `AUTH_KEYCLOAK_ID`, `AUTH_KEYCLOAK_SECRET`, `AUTH_KEYCLOAK_ISSUER`, `NEXT_PUBLIC_AUTH_KEYCLOAK_ID`, `NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER`, `PITS_BACKEND_REGISTER_URL`, `PITS_BACKEND_VERIFY_URL`, `PITS_BACKEND_RECORDS_URL`, `PITS_ISSUER_ID`. No `.env.example` file exists in the repo (`ls .env*` → only `.env.local`).

---

## B. Frontend Test Inventory

### B1. Unit tests (Vitest) — ALL PASS this audit run (30/30, see Section C)

| Test file | Test name (describe > it) | Purpose (from assertions) | Status this run | Notes |
|---|---|---|---|---|
| `hooks/useUpload.test.ts` | `useFileUpload > on successful register, stores the payload and navigates to /result/success` | Register success → `sessionStorage` payload set + router push `/result/success` | PASS | Mocks `@components/api`, `next/navigation` |
| `hooks/useUpload.test.ts` | `useFileUpload > when the backend reports already_existed, treats a register as a failure result` | `already_existed:true` in 200 response is treated as app-level failure, routes to `/result/failure` | PASS | |
| `hooks/useUpload.test.ts` | `useFileUpload > does nothing when submitted with no file selected` | Guards `handleSubmit()` against empty file state (no API call, no navigation) | PASS | |
| `lib/fileExtension.test.ts` | `getFileExtension > returns unknown for null` | Null-safety | PASS | |
| `lib/fileExtension.test.ts` | `getFileExtension > returns unknown when there is no extension` | No-extension case | PASS | |
| `lib/fileExtension.test.ts` | `getFileExtension > returns the lowercased extension` | Case normalization (`Document.PDF` → `pdf`) | PASS | |
| `lib/fileExtension.test.ts` | `getFileExtension > uses the last extension for multi-dot filenames` | `archive.tar.gz` → `gz` | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > prioritizes the already-registered case for register, over the generic 409 message` | 409 + `already_existed:true` for `register` maps to `alreadyRegistered` string, not generic conflict | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > maps known HTTP status codes to their dedicated message` | 413 → `tooLarge` message | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > maps 409 for verify to the generic conflict message (not already-registered)` | Source-dependent 409 handling (`verify` ≠ `register` semantics) | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > falls back to the raw error string when there is no matching status code` | Network-error fallback path | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > falls back to the generic failure message when nothing else applies` | Default fallback | PASS | |
| `lib/uploadErrorMessage.test.ts` | `getUploadFailureMessage > treats an unrecognized status code as no match and falls through to response.message` | Unknown status code (999) fallback to `response.message` | PASS | |
| `lib/dateFormat.test.ts` | `formatDisplayDateTime > returns null for a null value` | Null-safety | PASS | |
| `lib/dateFormat.test.ts` | `formatDisplayDateTime > returns the original string when it cannot be parsed as a date` | Unparseable-date fallback | PASS | |
| `lib/dateFormat.test.ts` | `formatDisplayDateTime > formats in en-US order: Month Day, Year, HH.MM` | Locale-specific date format (`en`) | PASS | |
| `lib/dateFormat.test.ts` | `formatDisplayDateTime > formats in id-ID order: Day Month Year, HH.MM` | Locale-specific date format (`id`) | PASS | |
| `lib/dateFormat.test.ts` | `formatDisplayDateTime > pads single-digit hours and minutes` | Zero-padding | PASS | |
| `lib/resultPayload.test.ts` | `buildResultHref > returns a bare /result/<status> href with no payload data in it` | Confirms no PII/result data leaks into the href string | PASS | Directly verifies CLAUDE.md constitution rule |
| `lib/resultPayload.test.ts` | `buildResultHref > stores the payload in sessionStorage so it can be read back` | Round-trip storage | PASS | |
| `lib/resultPayload.test.ts` | `readResultPayload > returns null when nothing was stored` | Empty-state handling | PASS | |
| `lib/resultPayload.test.ts` | `readResultPayload > returns null for malformed JSON` | Corrupt-storage handling | PASS | |
| `lib/resultPayload.test.ts` | `readResultPayload > returns null when source is not register/verify` | Schema validation on read | PASS | |
| `lib/resultPayload.test.ts` | `readResultPayload > returns null when status is not success/failure` | Schema validation on read | PASS | |
| `lib/fileSizeCalc.test.ts` | `getFileSize > returns "0 Bytes" for null` | Null-safety | PASS | |
| `lib/fileSizeCalc.test.ts` | `getFileSize > formats sizes under 1 KB in Bytes` | Byte formatting | PASS | |
| `lib/fileSizeCalc.test.ts` | `getFileSize > formats sizes in KB` | KB formatting | PASS | |
| `lib/fileSizeCalc.test.ts` | `getFileSize > formats sizes in MB` | MB formatting | PASS | |
| `lib/i18n/translations.test.ts` | `translations dictionary > has the exact same set of keys in id and en` | i18n key-parity guard | PASS | |
| `lib/i18n/translations.test.ts` | `translations dictionary > has non-empty string values for every leaf (no placeholder gaps)` | No empty i18n strings (except allow-listed) | PASS | |

Total: **7 test files, 30 `it(...)` blocks, 30 passed, 0 failed** this run (see Section C for verbatim output).

### B2. E2E tests (Playwright)

Not executable in this audit environment (see Section C for exact error). Table below is built from **static reading** of the spec files (exact `test(...)` strings and `expect(...)` assertions) cross-referenced against `_docs/qa/results/frontend-test-results-2026-09-09.md` for last-known outcomes.

| Test ID | File | Test name (exact) | Journey/persona | What it actually asserts | Last known result (2026-09-09 doc) | Notes |
|---|---|---|---|---|---|---|
| TC-1 | `tests/e2e/auth-guard.spec.ts:7` | `TC-1: /publisher redirects to / when logged out` | Negative | `await expect(page).toHaveURL(/^http:\/\/[^/]+\/(\?.*)?$/)` after `page.goto('/publisher')` | ✅ per `uat-test-plan.md` §3 (not in the 2026-09-09 run, which only covered TC-10..19) | Attempted this audit; failed on missing Chromium binary, not app logic (Section C) |
| TC-2 | `tests/e2e/auth-guard.spec.ts:12` | `TC-2: /dashboard redirects to / when logged out` | Negative | Same URL-regex assertion for `/dashboard` | ✅ per plan §3 | Same execution blocker |
| TC-3 | `tests/e2e/verifier-journey.spec.ts:8` | `TC-3: verifying an unregistered document lands on /result/failure` | Verifier | Heading visible; uploads sample PDF; clicks "Verifikasi Dokumen"; `page.url()` contains `/result/failure` | ✅ per plan §3 | |
| TC-4..7 | `tests/e2e/publisher-journey.spec.ts:40` | `TC-4..7: publisher logs in, registers a document, sees it on the dashboard, and it verifies as authentic` | Publisher + Verifier round-trip | Login via Keycloak; `/publisher` upload+submit → URL contains `/result/success`; `/dashboard` shows filename; clears cookies, verifies same file publicly → URL contains `/result/success` again | ✅ per plan §3 | Single test covers 4 TC IDs |
| TC-10 | `tests/e2e/edge-cases.spec.ts:47` | `publisher Dropzone rejects a file over the 20 MB limit client-side` | Publisher | Text "Ukuran file melebihi 20 MB." visible; asserts the `/api/register` network request was `rejected` (never fired) via `Promise.allSettled` | **PASSED** (results doc "Hasil aman") | Client-side only, not a 413 round-trip (comment `edge-cases.spec.ts:44-45`) |
| TC-11a | `tests/e2e/edge-cases.spec.ts:77` | `Dropzone rejects a .txt file by extension` | Publisher | Text "Hanya file PDF yang didukung." visible | **PASSED** | |
| TC-11b | `tests/e2e/edge-cases.spec.ts:88` | `a file with .pdf extension but non-PDF content passes the client filter — server must be the real gate` | Publisher | If client doesn't reject, submits and asserts `response.status()` === `415` | **FAILED** — expected 415, got 200 (results doc "🔴 Temuan nyata": server accepted non-PDF bytes disguised as `.pdf`) | Confirmed independently against current source: `parseUpload.ts:27` only checks `file.type === '' \|\| file.type === 'application/pdf'` and filename suffix — no byte-level check, consistent with this failure. See Finding D1 |
| — | `tests/e2e/edge-cases.spec.ts:131-140` | `test.skip(true, ...)` — TC-12: access token expiry | Publisher | N/A — explicitly skipped, documented as needing manual testing (Keycloak access-token TTL too long for CI) | Skipped (manual only), not part of the 14 executed | |
| TC-13 | `tests/e2e/edge-cases.spec.ts:145` | `logout ends both the NextAuth session and the Keycloak SSO cookie` | Publisher | After clicking "Keluar" (logout) and handling Keycloak's manual logout-confirmation screen, asserts revisiting `/dashboard` redirects to `/` and "Masuk" button is visible | **FAILED** — timed out at the **login** step (not logout/session-end assertion itself); results doc labels this "inconclusive", possibly Keycloak rate-limiting from repeated logins in one run (8th login in ~4.4 min session) | Comment at `edge-cases.spec.ts:156-161` documents a real app finding independent of the failure: `SignOut.tsx`'s `generateKeycloakLogoutUrl()` never passes `id_token_hint`, so Keycloak shows a manual confirmation screen instead of silent logout |
| TC-14 (part 1) | `tests/e2e/edge-cases.spec.ts:181` | `ID <-> EN toggle changes visible text on /, /result/success, /result/failure` | UI | Heading "Verifikasi Dokumen Resmi" visible; click "EN"; heading "Verify an Official Document" visible + button "Verify Document"; click "ID"; heading reverts | **FAILED in earlier run, then reclassified**: prior test asserted "Verify Official Documents" (wrong text) vs actual `translations.ts:263` "Verify an Official Document" — results doc says this was a **test bug**, already fixed in the version now in the repo (current source at line 181-191 already expects "Verify an Official Document", matching translations.ts) | Not an app bug per 2026-09-09 doc's root-cause note |
| TC-14 (part 2) | `tests/e2e/edge-cases.spec.ts:197` | `toggle persists into an authenticated page (/dashboard)` | UI | "Dokumen Terdaftar" visible; click EN; "Registered Documents" visible | **PASSED** | |
| TC-15a | `tests/e2e/edge-cases.spec.ts:213` | `/result/success with no sessionStorage payload does not crash` | Negative | Direct nav with empty storage; "Beranda"/"Home" button visible; zero `pageerror` events | **PASSED** | |
| TC-15b | `tests/e2e/edge-cases.spec.ts:226` | `/result/failure with no sessionStorage payload does not crash` | Negative | Same, for `/result/failure` | **PASSED** | |
| TC-16 | `tests/e2e/edge-cases.spec.ts:240` | `F5 after a successful verify keeps showing the same result (sessionStorage survives refresh)` | Publisher | Registers a doc, confirms "Registrasi Berhasil", reloads, confirms same text still present | **FAILED** in one run (login timeout, same suspected rate-limit cause as TC-13); **PASSED** in the final documented run — results doc notes this specific inconsistency explicitly ("TC-16 ... di run final ini PASSED") | Flaky/inconclusive per prior doc, not confirmed as consistent app bug |
| TC-17a | `tests/e2e/edge-cases.spec.ts:280` | `a valid session cannot push an oversized file past server-side validation` | Publisher (adversarial, direct API) | POSTs 21MB multipart directly to `/api/register` with valid session cookie (bypassing Dropzone UI); asserts response status `413` | **PASSED** | Confirmed against current source: `parseUpload.ts:22-24` returns 413 for `file.size > MAX_UPLOAD_BYTES` |
| TC-17b | `tests/e2e/edge-cases.spec.ts:300` | `a valid session cannot push a non-PDF file past server-side validation` | Publisher (adversarial) | POSTs a `.jpg` mimetype file directly to `/api/register`; asserts `415` | **PASSED** | Confirmed: `parseUpload.ts:28-29` |
| TC-17c | `tests/e2e/edge-cases.spec.ts:319` | `no session cookie is rejected outright (requireAuth.ts)` | Negative (adversarial) | POSTs to `/api/register` with no cookies; asserts `401` | **PASSED** | Confirmed: `requireAuth.ts:16-21` |
| TC-18 | `tests/e2e/edge-cases.spec.ts:333` | `rapid double-click on "Verifikasi Dokumen" does not fire two in-flight requests` | Verifier | Dispatches two native `click()` events synchronously inside one `page.evaluate()`; counts `/api/verify` requests over a 3s window; asserts `<= 1` | **FAILED** — timeout, "detached from DOM, retrying"; results doc assesses this as likely a **test-design** issue (button correctly unmounts on submit, which is itself the expected/safe behavior) rather than a confirmed app bug | Not re-verified against live app this audit (E2E not executable) |
| TC-19 | `tests/e2e/edge-cases.spec.ts:390` | `verifier page renders without horizontal overflow in dark mode on a narrow viewport` | UI | 375×800 viewport, dark color-scheme emulated; heading visible; `document.documentElement.scrollWidth > window.innerWidth + 1` must be `false`; screenshot saved | **PASSED** | |

**Cross-check against prior claim "10 passed, 4 failed":** Mapping the 14 executed (non-skip) test blocks in `edge-cases.spec.ts` against the 2026-09-09 results doc's own categorization:
- Failed (4): TC-11b, TC-13, TC-16 (failed in an earlier of the 3 runs, though the doc's own "final run" table separately states TC-16 passed on the final run — the headline "10 passed, 4 failed" figure and the per-test prose are **not fully self-consistent** in the source doc itself; this is flagged as-is, not resolved, per instructions not to invent numbers), TC-18.
- Passed (10, per doc's "Hasil aman" list + TC-14 part 2): TC-10, TC-11a, TC-14(part 2), TC-15a, TC-15b, TC-17a, TC-17b, TC-17c, TC-19 = 9 explicitly listed as passed in "Hasil aman" grouping, **plus** TC-14 part 2 stated as PASSED in the "✅ Tidak ada masalah" section = matches 10 only if TC-16's final-run PASS is the 10th. INFORMATION NEEDED: the source doc's headline count and its per-test breakdown do not resolve to an unambiguous single list of exactly which 10 are "passed" vs the note that TC-16 both failed (an earlier run) and passed (the final run) — this is a genuine ambiguity in the prior QA artifact itself, not introduced by this audit.

---

## C. Execution Log (verbatim, this audit run — 2026-09-13)

### `npm test`
```
> pits@0.1.0 test
> vitest run --project unit

(node:16791) [DEP0205] DeprecationWarning: `module.register()` is deprecated. Use `module.registerHooks()` instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
│
▲  No story files found for the specified pattern: stories/**/*.mdx

 RUN  v4.1.10 /Users/laksaersa/GitHub/_personal/_PITS/frontend-for-uat


 Test Files  7 passed (7)
      Tests  30 passed (30)
   Start at  23:34:21
   Duration  3.21s (transform 321ms, setup 0ms, import 644ms, tests 2.09s, environment 5.77s)
```
Note: Vitest binary resolved is v4.1.10 (installed), vs. `^4.1.8` pinned range in `package.json:55` — consistent (semver-compatible).

### `npx tsc --noEmit`
Output: **empty** (no errors/warnings printed). Exit code: `0`.

### `npm run lint` (oxlint)
```
> pits@0.1.0 lint
> oxlint
```
Output: no findings printed. Exit code: `0`.

### E2E attempt
Dev server pre-check:
```
$ lsof -i :3080
node 14998 ... TCP *:stm_pproc (LISTEN)     [a service is listening on 3080]
$ curl -sS -m 3 http://localhost:3080 -o /dev/null -w "HTTP:%{http_code}\n"
HTTP:200
```
→ A frontend dev server WAS reachable on port 3080 at audit time.

Ran: `npx playwright test tests/e2e/auth-guard.spec.ts --reporter=list`
```
Running 2 tests using 1 worker

  ✘  1 [chromium] › tests/e2e/auth-guard.spec.ts:7:7 › Unauthenticated access guard › TC-1: /publisher redirects to / when logged out (1ms)
  ✘  2 [chromium] › tests/e2e/auth-guard.spec.ts:12:7 › Unauthenticated access guard › TC-2: /dashboard redirects to / when logged out (1ms)

  1) [chromium] › tests/e2e/auth-guard.spec.ts:7:7 › Unauthenticated access guard › TC-1: /publisher redirects to / when logged out

    Error: browserType.launch: Executable doesn't exist at /Users/laksaersa/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell
    ╔════════════════════════════════════════════════════════════╗
    ║ Looks like Playwright was just installed or updated.       ║
    ║ Please run the following command to download new browsers: ║
    ║     npx playwright install                                 ║
    ╚════════════════════════════════════════════════════════════╝

  2) [chromium] › tests/e2e/auth-guard.spec.ts:12:7 › Unauthenticated access guard › TC-2: /dashboard redirects to / when logged out
    (identical error)

  2 failed
```
**Real failure mode: missing Chromium `headless_shell` binary in this audit environment (`npx playwright install` was never run here) — a local environment/tooling gap, not an app or network connectivity failure, and not evidence about backend/Keycloak availability.** Per task instructions, did not run `npx playwright install` or retry further — reporting honestly per the stop condition.

**E2E suite NOT executable in this audit environment** because the Playwright browser binary is not installed (`chromium_headless_shell-1234` missing under `~/Library/Caches/ms-playwright/`), independent of whether backend/Keycloak are running. Last known results are in `_docs/qa/results/frontend-test-results-2026-09-09.md` (target: `https://pits-ui.pangkalandata.id` production, stated final result "10 passed, 4 failed" — see Section B2 cross-check for the ambiguity in that figure's own internal consistency).

INFORMATION NEEDED: whether backend (`backend-for-uat`) and Keycloak were running locally at audit time was not separately verified beyond the port-3080 frontend check, since the E2E run never got past browser launch.

---

## D. Findings Observed From Source (this audit, re-verified against current code)

### D1. `/api/register` server-side re-validation — CONFIRMED, still present
`app/api/register/route.ts:20-26` calls `requireAccessToken()` (`app/api/_lib/requireAuth.ts:12-24`) then `parseUpload(request)` (`app/api/_lib/parseUpload.ts:13-33`) before any backend call. `parseUpload.ts` independently re-checks:
- File presence/type (`parseUpload.ts:18-20`)
- Size ≤ 20 MB (`parseUpload.ts:22-24`, `MAX_UPLOAD_BYTES = 20*1024*1024` at line 1)
- Extension `.pdf` AND (`file.type === ''` OR `file.type === 'application/pdf'`) (`parseUpload.ts:26-29`)

This re-validation is **independent of** the client Dropzone checks (a separate, unrelated code path in `components/common/Dropzone.tsx`, not read in full this audit — referenced only via test comments). Confirmed still true as of this audit's source read.

**However**, the MIME/extension check does **not** validate file bytes (no `%PDF-` magic-number check). A `.pdf`-named file with spoofed/empty `Content-Type` and arbitrary bytes passes `parseUpload.ts` server-side and is forwarded to the backend. This exact gap was caught by `tests/e2e/edge-cases.spec.ts` TC-11b in the prior run (expected 415, got 200) — see Section B2. The current source at `parseUpload.ts:26-29` is unchanged in a way that would fix this, so the gap is presumed to still exist (not re-verified live this audit — E2E could not run).

### D2. `resultPayload.ts` — CONFIRMED, still uses sessionStorage, not query string
`lib/resultPayload.ts:12-23` (`buildResultHref`): writes to `window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))` (line 15) and returns `` `/result/${payload.status}` `` (line 22) — a bare path with no query parameters. `STORAGE_KEY = 'pits:resultPayload'` (line 3). `readResultPayload()` (lines 25-39) reads back from `sessionStorage.getItem(STORAGE_KEY)` (line 29) with schema validation (lines 33-34) and returns `null` on any parse/shape failure. This matches `CLAUDE.md`'s constitution rule verbatim and is directly unit-tested (`lib/resultPayload.test.ts:16-21`, explicitly asserting the href does not contain payload fields like `record_id` or `deadbeef`).

### D3. `proxy.ts`/middleware protection scope — CONFIRMED: page routes only, not `/api/*`
`proxy.ts` (3 lines): `export { auth as proxy } from '@/auth'; export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|static/).*)'] };` — the matcher itself is broad (nearly all paths, including `/api/*`, pass through the proxy/middleware layer). But the actual gating logic inside `auth.ts:69-71`'s `authorized()` callback only returns `false` (blocking) for paths starting with `/publisher` or `/dashboard`; every other matched path — including all of `/api/register`, `/api/verify`, `/api/records`, `/api/auth/*` — returns `true` (allowed) from this callback. So API routes are **not** protected by the proxy/middleware layer; `/api/register` and `/api/records` protect themselves independently via `requireAccessToken()` (confirmed D1/A4), and `/api/verify` has no auth check by design (public endpoint).

### D4. i18n hardcoded strings found by inspection
Grep of `.tsx` files under `app/` and `components/` for literal text outside `lib/i18n/`:
- **`app/verify/page.tsx:4-5`**: hardcoded English strings `"Verification Page"` and `"Welcome to the Verification Page. Here you can verify an article."` — not routed through `useLocale()`/`t.*`, in violation of `CLAUDE.md`'s "Semua teks yang tampil ke user WAJIB lewat sistem i18n" rule. This appears to be a **dead/stub route** left over from scaffolding — the actual public verify UI lives at `app/page.tsx` (`/`), which does correctly use `useLocale()` (`app/page.tsx:12,16,30`) and real components (`VerifyHero`, `FileUpload`, etc.). `/verify` is reachable in the running app (no redirect away from it observed in source) but is not linked from the real navigation per the components read this audit — reachability from live nav was not further verified (E2E unavailable).
- Stale file-name reference: `app/publisher/page.tsx:5,7` and `app/dashboard/page.tsx:10` both say "`middleware.ts` already blocks..." in comments, but the actual file is `proxy.ts` (confirmed via `find . -maxdepth 2 -iname "middleware.ts"` returning nothing). Also references a doc `_docs/security/session-auth-audit-2026-08-02.md` not verified to exist in this audit (not in the required-reading list; not checked).

### D5. Other notable source observations
- No `TODO`/`FIXME`/`XXX` comments found anywhere under `app/`, `components/`, `lib/`, `hooks/` (grep returned zero matches).
- `app/dashboard/page.tsx:20-49` (`fetchRecords`) duplicates the records-fetching logic that also exists as `app/api/records/route.ts` — two independent code paths hit `PITS_BACKEND_RECORDS_URL` with a bearer token: one via the dashboard Server Component's own `fetch()` (page.tsx:37-40), the other via the internal `/api/records` route (route.ts:14-17). Both are read this audit; it is not clear from source alone whether `/api/records` is actually called by any client code (not traced further — `components/dashboard/*.tsx` not read in full this audit). INFORMATION NEEDED: whether `app/api/records/route.ts` is dead code or used by a client-side refetch/pagination path in `components/dashboard/`.
- `next.config.ts` sets `turbopack.root` but `package.json` dev/build scripts explicitly pass `--webpack`, so the Turbopack config key appears currently unused by the active scripts (not necessarily a bug — just an inconsistency worth flagging; Turbopack config could be used by an editor/other invocation not seen here).
- `_docs/quality/test-strategy.md:5` references "ESLint" as part of the static-analysis layer; actual configured/used linter is `oxlint` (`package.json:9-10`), no ESLint config or dependency found in `package.json`. Doc is stale relative to current tooling.
- `lib/i18n/translations.test.ts:23-24` comment notes one deliberately-empty string, `dropzone.titleRest`, allow-listed from the non-empty-string check — not itself a bug, but documents an intentional empty i18n value.

### D6. Duplicate records-fetch paths (restated from D5 for emphasis)
Two separate authenticated fetches to `PITS_BACKEND_RECORDS_URL` exist in the codebase: `app/dashboard/page.tsx:36-48` (Server Component direct fetch, used for the initial SSR render) and `app/api/records/route.ts:6-20` (internal API route, `GET`, wraps the same backend call with `requireAccessToken()`). Whether the latter is invoked by any client component was not traced this audit.

---

## E. Source File Inventory

| Path | Line count | Purpose (1 line) | Test coverage (Test IDs or NONE) | Associated findings |
|---|---|---|---|---|
| `auth.ts` | 121 | NextAuth + Keycloak config, JWT/session callbacks, token refresh | Indirectly via TC-1/2/4-7/13/17c (E2E, not unit-tested) | D3 |
| `proxy.ts` | 3 | Edge middleware — re-exports `auth` as `proxy`, matcher config | TC-1, TC-2 | D3 |
| `app/api/register/route.ts` | 78 | POST handler: auth + upload validation + proxy to backend register | TC-5 (E2E, success path), TC-11b, TC-17a/b/c | D1 |
| `app/api/verify/route.ts` | 62 | POST handler: upload validation (no auth) + proxy to backend verify | TC-3, TC-7, TC-18 | — |
| `app/api/records/route.ts` | 20 | GET handler: auth + proxy to backend records list | NONE found in E2E specs (dashboard tested via page render, not this route directly) | D5/D6 |
| `app/api/auth/logout/route.ts` | 14 | GET handler: next-auth `signOut()` with custom redirect | TC-13 | — |
| `app/api/auth/[...nextauth]/route.ts` | 2 | next-auth catch-all handler passthrough | Indirect (all login flows) | — |
| `app/api/_lib/requireAuth.ts` | 24 | Shared "does this request have a Keycloak access token" check | TC-17c | D1, D3 |
| `app/api/_lib/parseUpload.ts` | 33 | Shared server-side upload validation (size/type) | TC-11b (failing), TC-17a/b | D1 |
| `lib/resultPayload.ts` | 39 | sessionStorage-based result payload store/read (no query-string) | Unit: `resultPayload.test.ts` (6 cases); E2E: TC-15a/b, TC-16 | D2 |
| `lib/version.ts` | 1 | Exports `APP_VERSION = '1.0.0'` constant | NONE | — |
| `lib/i18n/translations.ts` | 504 | ID/EN translation dictionaries | Unit: `translations.test.ts` (2 cases); E2E: TC-14 | D4 |
| `lib/i18n/LocaleContext.tsx` | 49 | React context/hook (`useLocale`) for locale + toggle | Indirect via TC-14 | — |
| `lib/dateFormat.ts` | 29 | Locale-aware date/time formatting | Unit: `dateFormat.test.ts` (5 cases) | — |
| `lib/fileSizeCalc.ts` | 17 | Human-readable file size formatting | Unit: `fileSizeCalc.test.ts` (4 cases) | — |
| `lib/fileExtension.ts` | 10 | Extracts lowercased file extension | Unit: `fileExtension.test.ts` (4 cases) | — |
| `lib/uploadErrorMessage.ts` | 88 | Maps upload API responses/status codes to i18n error strings | Unit: `uploadErrorMessage.test.ts` (6 cases) | — |
| `lib/hashFile.ts` | 12 | (Not read in full this audit — file hashing helper) | NONE found | INFORMATION NEEDED: not read in full |
| `lib/avatarColor.ts` | 17 | (Not read in full — avatar color derivation) | NONE found | INFORMATION NEEDED: not read in full |
| `lib/colors.ts` | 19 | (Not read in full — color token helpers) | NONE found | INFORMATION NEEDED: not read in full |
| `lib/fileIcon.tsx` | 149 | (Not read in full — file-type icon component) | NONE found | INFORMATION NEEDED: not read in full |
| `hooks/useUpload.test.ts` | 76 | Unit tests for `useFileUpload` hook | Self (3 cases) | — |
| `playwright.config.ts` | 36 | Playwright E2E config | N/A (config) | — |
| `vitest.config.ts` | 59 | Vitest unit/storybook project config | N/A (config) | — |
| `app/page.tsx` | 58 | `/` — public Verify landing page (real verify UI) | TC-3, TC-7, TC-14(1), TC-18, TC-19 | — |
| `app/publisher/page.tsx` | 24 | `/publisher` — protected publisher portal page shell + defense-in-depth auth check | TC-4..7, TC-10, TC-11, TC-17a/b/c | D4 (stale comment) |
| `app/dashboard/page.tsx` | 77 | `/dashboard` — protected dashboard page, SSR records fetch + error states | TC-6, TC-13, TC-14(2) | D4 (stale comment), D5/D6 |
| `app/verify/page.tsx` | 7 | `/verify` — unused stub route, hardcoded English, no i18n | NONE | D4 |
| `app/layout.tsx` | 51 | Root layout | Indirect (all E2E) | — |
| `app/result/success/page.tsx` | 5 | `/result/success` route entry | TC-4..7, TC-15a, TC-16 | — |
| `app/result/failure/page.tsx` | 5 | `/result/failure` route entry | TC-3, TC-15b | — |
| `app/dashboard/loading.tsx` | 16 | Dashboard route loading state | NONE found directly | — |
| `tests/e2e/auth-guard.spec.ts` | 16 | E2E: TC-1, TC-2 | Self | Attempted this audit, blocked by missing browser binary |
| `tests/e2e/verifier-journey.spec.ts` | 17 | E2E: TC-3 | Self | Not executed this audit |
| `tests/e2e/publisher-journey.spec.ts` | 68 | E2E: TC-4..7 | Self | Not executed this audit |
| `tests/e2e/edge-cases.spec.ts` | 405 | E2E: TC-10..19 (15 test blocks incl. 1 skip) | Self | Not executed this audit |
| `components/*` (41 files, 3150 lines total per `wc -l`) | 3150 (aggregate) | UI components (dashboard, register, verify, auth, common, layout) | Not individually inventoried this audit — out of the explicit "read fully" list | INFORMATION NEEDED: component-level detail not in scope of the specified read list |

---

## F. Unknowns

- INFORMATION NEEDED: Exact leaf-key count of `lib/i18n/translations.ts` — not enumerated per task instructions (structure/size only requested); file is 504 lines for both `id`+`en` combined.
- INFORMATION NEEDED: Whether `_docs/security/session-auth-audit-2026-08-02.md` (referenced in comments at `app/publisher/page.tsx:7` and `app/dashboard/page.tsx:13`) exists and what it says — not in the required-reading list for this audit, not checked.
- INFORMATION NEEDED: Whether `app/api/records/route.ts` is actually invoked by any client-side code path (vs. the separate direct fetch in `app/dashboard/page.tsx`) — would require reading `components/dashboard/*.tsx` in full, out of scope of the specified read list.
- INFORMATION NEEDED: Whether backend (`backend-for-uat`) and/or Keycloak were reachable/running locally at audit time — E2E execution never got past Playwright's browser-launch step (missing `chromium_headless_shell` binary), so this was never actually tested. The only live-service confirmation obtained was `curl -m 3 http://localhost:3080` → HTTP 200, i.e. only the Next.js frontend dev server's reachability was confirmed, not the backend/Keycloak stack behind it.
- INFORMATION NEEDED: Whether `/verify` (`app/verify/page.tsx`) is linked from any navigation component or is fully unreachable/orphaned in the live app — not traced against `components/layout/Header.tsx` or other nav components in this audit.
- INFORMATION NEEDED: Current, live-server confirmation of the TC-11b PDF-magic-bytes gap (server accepting non-PDF bytes disguised as `.pdf`) — this audit only confirmed the gap exists **by reading `parseUpload.ts` source** (no byte-level check present), consistent with the prior E2E-observed failure, but did not re-run the E2E test live to reconfirm the runtime behavior in this audit's environment.
- INFORMATION NEEDED: Resolution of the exact "10 passed / 4 failed" breakdown ambiguity in the source doc `frontend-test-results-2026-09-09.md` itself (TC-16 is described as both failing in an earlier run and passing in "the final run," with the doc's own prose not cleanly resolving into a single unambiguous list of exactly 10 named passing tests) — flagged, not resolved, since resolving it would require re-running the actual suite against the actual production/staging target, which was not available this audit.
- INFORMATION NEEDED: Whether the current production build (`npm run build` output, Docker image) differs from the current source tree in any way — not built/tested this audit; only `tsc --noEmit`, `oxlint`, and `vitest` were run, not `next build`.
- INFORMATION NEEDED: Contents/line counts/purpose detail for `lib/hashFile.ts`, `lib/avatarColor.ts`, `lib/colors.ts`, `lib/fileIcon.tsx`, and all 41 files under `components/` — these were not in the explicit "read FULLY" list for this audit and were not opened; only counted via `wc -l`.
