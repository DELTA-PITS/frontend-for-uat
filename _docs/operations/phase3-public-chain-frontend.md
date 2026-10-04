# Phase 3 - frontend public blockchain verification (2026-10-04)

Branch `feat/sepolia-public-verification` (based on `feature/uat-readiness`). Frontend only; not deployed, not merged.

## What changed
- The hard-coded "Ethereum (Testnet Lokal)" label and "cannot be checked on Etherscan" disclaimer are gone. Wording is per record/anchor.
- `components/common/BlockchainProof.tsx` (used by the dashboard drawer and the register/verify result pages) shows network, status,
  shortened transaction hash (full value in `title` and copied by the copy button), block number and a "View on <explorer>" link.
- Network name and explorer URL come only from the backend `anchor` object (`network_name`, `explorer_tx_url`); the UI never builds an
  explorer URL. Links must be absolute `https:` URLs, open in a new tab with `rel="noopener noreferrer"`, and are never shown for legacy
  Anvil (chain 31337) or when the backend sends none. The explorer name (Etherscan, Basescan, ...) is derived from the URL's host.
- `lib/anchor.ts` maps backend status to a UI state; every field is optional so older backend responses (no `anchor`) keep working.

| Backend value | UI |
|---|---|
| `verification_status` confirmed / `anchor_status` confirmed | Terkonfirmasi / Confirmed |
| pending | Menunggu konfirmasi blockchain (never shown as verified) |
| anchor_failed / failed | Penjangkaran blockchain gagal |
| transaction_not_found | Transaksi blockchain tidak ditemukan + explanatory copy (no "corrupt", no crash) |
| chain_not_available / legacy_local | Legacy network not available for public verification; neutral "Legacy" badge, no explorer |
| hash_mismatch, wallet_mismatch, invalid_anchor_payload | Bukti blockchain tidak cocok dengan catatan |
| anything else | neutral "unrecognised status"; absent -> no status row |

A verify result with `valid:false` but a known `verification_status` (pending, failed, not found, unavailable, mismatch) now shows its own
explanation instead of the generic "Document not found" page; a hash that was never registered still shows the original page.

## Pointing a frontend at the Sepolia API (no new env var)
The browser only talks to this app's own `/api/*` routes; those forward to the backend using the existing server-side variables
`PITS_BACKEND_REGISTER_URL`, `PITS_BACKEND_VERIFY_URL`, `PITS_BACKEND_RECORDS_URL`. A rehearsal frontend simply sets them to the Sepolia API,
e.g. `https://pits-ui.pangkalandata.id/sepolia-api/api/v1/verify`, and runs as a separate process/container. A production build keeps
pointing at the production API until its env is changed deliberately.

## Verification done
- Unit/component tests (`npm test`): 87 pass, incl. 8 backend states x EN/ID, old-backend responses, unsafe explorer URL, i18n key parity.
- `tsc --noEmit`, `oxlint`, `next build`: clean.
- Local frontend (port 3080) against the live Sepolia API: canonical PDF -> "Dokumen Terverifikasi", Ethereum Sepolia, Terkonfirmasi,
  tx `0xeb912fd2...ed19`, block 11.839.743, "Lihat di Etherscan" -> https://sepolia.etherscan.io/tx/0xeb912fd2728dc79330b592684ca687374a882273a43c0a21ccb95719b052ed19
- Local frontend against a mock backend serving the fixtures in `lib/anchorFixtures.ts`, checked at 375 px: no horizontal overflow, explorer
  button 40 px high and full width, pending / transaction-not-found / legacy / chain-unavailable states readable.

## Not covered
- The dashboard drawer was covered by component tests only (login needs Keycloak redirect URIs for a rehearsal host).
- The register-result page was covered by component tests, not a live browser run.
- Playwright e2e suites were not run (they need the full local stack).

## Parallel deployment under `/sepolia` (2026-10-04)

One codebase, two builds, selected only by build-time environment (production build has none of these variables):

| Variable | Rehearsal value | Effect |
|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/sepolia` | Next.js `basePath`; `lib/basePath.ts#withBasePath` for raw fetch/img/location |
| `NEXT_PUBLIC_ENV_LABEL` | `Public Blockchain Rehearsal · Ethereum Sepolia` | thin banner (`EnvBanner`); absent in production |
| `AUTH_URL`, `NEXT_PUBLIC_AUTH_URL` | origin only (`https://pits-ui.pangkalandata.id`) | base path is added in code, not in the env value |
| `PITS_BACKEND_*_URL` | `https://pits-ui.pangkalandata.id/sepolia-api/api/v1/...` | server-side forwarding to the Sepolia backend |
| `AUTH_SECRET` | its own secret | rehearsal sessions are unreadable by production and vice versa |

Things a sub-path needs that Next.js does not do by itself (all no-ops at the root): `fetch('/api/...')` and `window.location` use
`withBasePath`; `next/image` needs the prefixed `src`; the Auth.js route re-adds the prefix Next strips so Auth.js's configured
`basePath` (`/sepolia/api/auth`, used to build the Keycloak `redirect_uri`) matches; `pages.signIn` and the logout redirect include the
prefix; Auth.js cookies get their own names and `Path=/sepolia` (`lib/authCookies.ts`) because both apps share one host and the default
cookie names/paths would let a login on one overwrite the other's session.

Canonical URL is `https://pits-ui.pangkalandata.id/sepolia` (Next.js redirects `/sepolia/` -> `/sepolia`).
Keycloak client `nextjs-web` needs, in addition to the production entries, redirect URI
`https://pits-ui.pangkalandata.id/sepolia/api/auth/callback/keycloak` and post-logout URI `https://pits-ui.pangkalandata.id/sepolia/api/auth/logout`.
