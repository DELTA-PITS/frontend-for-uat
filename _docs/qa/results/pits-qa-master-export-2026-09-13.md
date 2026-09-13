# PITS — Complete Independent QA Context Export

**Prepared by:** Claude Code (AI coding agent), acting under direction of Laksa Ersa
(developer/technical contributor, co-author) — NOT the paper's lead/corresponding author.
**Purpose:** Raw factual export for ChatGPT (acting as QA/test architect + technical writer) to
compose `01-testing-methodology.html`, `02-test-catalog.html`, `03-testing-results.html`,
`04-findings-paper-evidence.html`.
**Status of this document:** FINAL DRAFT for handoff to ChatGPT — both parallel deep source/test
audits (backend, frontend) completed and merged 2026-09-13. Any remaining `[PENDING...]`/
`INFORMATION NEEDED` markers are genuine unknowns, not incomplete work. Two full raw audit files
(`backend-audit-raw.md`, `frontend-audit-raw.md`) exist alongside this document as backing evidence
with complete file:line citations for every claim summarized here — consult them for anything this
document condenses.
**Rule followed throughout:** facts only, no narrative embellishment, no hidden failures, no
invented numbers. Every "INFORMATION NEEDED" marker is intentional, not an oversight.

---

## 1. SYSTEM IDENTITY

- **Name:** PITS — Public Information Trust System.
- **Stated purpose (from paper draft, "From Hoax to Hash"):** a verification architecture for
  public communication in Indonesia, intended to let citizens independently check whether an
  official-looking digital document (circular, regulation, certificate) is genuine/unaltered,
  without depending on after-the-fact institutional correction statements.
- **Core mechanism (from paper + code):** authenticated publisher registers a digital artifact →
  system computes a SHA-256 content hash → hash is anchored to a local Ethereum-compatible
  blockchain (Anvil) and stored in a PostgreSQL registry record → any public verifier (no login) can
  later submit the same artifact (or query by hash) and get a match/no-match result against the
  registry + blockchain evidence.
- **Primary users (from paper §4.1 + BRD):**
  - **Publisher** — authenticated user (Keycloak realm role `publisher`), registers official
    documents. Persona in `_docs/qa/uat-test-plan.md`: "Budi", staff who publishes official
    documents.
  - **Public verifier** — any member of the public, no account, no login required. Persona: "Sari",
    general public checking a document she received.
- **Two portals (from paper + code):**
  - **Publisher Portal** — protected routes `/publisher` (upload/register) and `/dashboard`
    (registration history). Auth required.
  - **Verification Portal** — public route(s), no auth, for the verify workflow.
- **Relationship to the paper:** PITS is presented in the paper as a proof-of-concept
  operationalization of **Domain 3 ("Blockchain Provenance and Security")** of a 7-domain public
  communication governance framework proposed by BRIN (Setiawan et al., 2025). The paper states it
  does **not** operationalize the full 7-domain framework, and within Domain 3 itself does **not**
  implement every sub-aspect (e.g., full version history, institutional publisher verification,
  production blockchain governance are explicitly named as NOT operationalized in paper §6.1).
- **Domain/framework aspect PITS specifically targets (paper §3.2, Table 1):** the four Domain 3
  functions — Content Hashing, Audit Trail, Source Verification, Public Proof — mapped respectively
  to: hash generation/comparison, linked registry+hash+blockchain metadata, publisher-role-gated
  registration, and unauthenticated public verification.
- **Explicit scope limits stated in the paper itself (not my interpretation, direct from text):**
  authentication proves "access to a publisher account", NOT "institutional government authority";
  a successful verification proves consistency with a prior registration, NOT that the document's
  content is factually correct; the study "does not demonstrate that PITS increases public trust or
  participation" — field testing, citizen perception studies, institutional adoption, and
  adversarial-condition assessments are named as still necessary.

No further academic interpretation added beyond what is directly stated in the paper draft or
directly observable in the BRD/SRS docs.

---

## 2. COMPLETE SYSTEM ARCHITECTURE

Confirmed by direct source read + real command execution in both sub-agent audits (backend
2026-09-13, frontend 2026-09-13).

### 2B. Backend — CONFIRMED (source-read + command execution, 2026-09-13 audit)

**Exact dependency versions** (`pyproject.toml`/`uv.lock`): FastAPI 0.135.3, uvicorn 0.44.0,
SQLAlchemy 2.0.49, python-jose[cryptography] 3.5.0, web3.py 7.16.0, eth-account 0.13.7, Dynaconf
3.2.13, psycopg2-binary 2.9.11, pytest 9.0.3, locust 2.43.4. Python `>=3.12.8` (Docker pins exactly
`python:3.12.8-bookworm`). Package `trustmark 0.1.0-dev`.

**Endpoints** (all in `src/trustmark/main.py`/`api/v1/documents.py`):

| Method | Path | Auth | Response fields |
|---|---|---|---|
| GET | `/health` | none | `{"status": str}` — **duplicate** of the one below (Finding #22) |
| GET | `/api/v1/health` | none | Pydantic `HealthResponse{"status": str}` |
| POST | `/api/v1/register` | bearer + `publisher` role | `{stored, already_existed, record_id, content_hash, transaction_hash, issuer_id, filename, content_type, created_at}` |
| GET | `/api/v1/records` | bearer + `publisher` role | `{"records": [...]}` — **no issuer filter, IDOR, Finding #4** |
| POST | `/api/v1/verify` | none (public by design) | 3-shape response depending on match state |
| GET | `/api/v1/verify/{file_hash}` | none (public) | same 3-shape pattern |

**Database:** single table `registry_records` (`src/trustmark/registry/models.py`): `id`
(String(36) PK, app-generated UUID4), `content_hash` (String(64), unique, indexed, not null),
`transaction_hash` (String(66), unique, not null), `issuer_id` (String(128), not null but CAN be
empty string — Finding #1), `original_filename`/`content_type` (nullable), `created_at`
(not null). No FKs, no relations, **no Alembic/migration tooling anywhere** (schema created via
`Base.metadata.create_all()` at startup — Finding #31). DBMS: Postgres 16 in production compose,
falls back to SQLite if `DATABASE_URL` unset.

**Auth (Keycloak):** realm/client names not hardcoded in code, read from env (`nextjs-kc`/`account`
per `.env.example`). JWT claims actually read: `sub` (→ `Principal.sub`, empty-string fallback,
Finding #1), `preferred_username`, `email`, `realm_access.roles`, `resource_access.<client_id>.
roles` (dead in practice — `KEYCLOAK_ROLES_CLIENT_ID` has no default anywhere, Finding #23).
`Principal` = frozen dataclass (`sub, username, email, roles, claims`). `KeycloakVerifier.verify()`
does real signature/exp/iss/aud validation (RS256/PS256) with a JWKS cache (in-process, TTL-based,
per-worker — not shared across uvicorn workers). Malformed (non-JWT) tokens hit an unhandled
exception path (Finding #2/#15).

**Hashing:** SHA-256 via `hashlib`. Two functions exist: `generate_hash()` (canonicalizes
CRLF/whitespace first) and `generate_hash_from_bytes()` (raw bytes, no canonicalization). **The
live `/register` and `/verify` HTTP endpoints only ever call `generate_hash_from_bytes()` on raw
uploaded bytes — the canonicalizing function is unit-tested but unreachable from any real API call**
(Finding #16) — relevant if the paper describes hashing as "canonicalized"/"normalized" anywhere.

**Blockchain:** web3.py → local Anvil only (every config file in the repo shows
`BLOCKCHAIN_RPC_URL=http://anvil:8545`, Foundry's local dev simulator; no public-chain RPC URL
anywhere). **No smart contract exists anywhere in the repo** — hash is written as calldata
(`VALUE:<hash>`) on a zero-value self-transfer transaction (`from==to==acct.address, value=0`),
signed locally, broadcast via `send_raw_transaction`. Chain ID read live from the node, not pinned
in config. `.env.example`'s private key is Anvil/Foundry's well-known public default test key (not
a real leaked secret, but also not safe if ever pointed at a real chain). Tx read-back compares the
decoded on-chain value against the Postgres-stored hash as a string equality cross-check — on-chain
data is a cross-check, not the sole source of truth. A new Web3/account connection is constructed
on every single request (Finding #25); the blocking receipt-wait call runs synchronously inside an
`async def` handler with no timeout override (Finding #26).

**Infra:** single-stage Dockerfile, `python:3.12.8-bookworm`, non-root user, `CMD ["python","-m",
"trustmark.main"]` (this exact invocation is what keeps the `TEST_MODE` auth-bypass mechanism live
in production, Finding #5). Docker Compose: `postgres:16-alpine`, `quay.io/keycloak/keycloak:26.6.2`,
`anvil` (unpinned `:latest` Foundry image, Finding #27), `trustmark-app`. All 4 services bound to
`127.0.0.1` only as of the latest commit (`7261708`). Dockerfile also provisions unused
`files-storage/{registered,verified}` directories — **uploaded file bytes are never persisted to
disk anywhere in the current code, only hashed in memory** (Finding #28) — relevant if any
documentation implies PITS archives the documents themselves.

**Dead/unused code found:** ~9 completely empty (0-byte) source files under `src/trustmark/`
(`exports.py`, `inventor.py`, `status.py`, `verification.py`, `cache.py`, `reports.py`, 4 files
under `services/`), plus a populated-but-unused `models/documents.py` (Pydantic models never
imported by any router) — see Finding #14, #33.

Full detail (every file:line citation, all 6 endpoint definitions, complete env-var inventory): see
`backend-audit-raw.md` §A.

### 2F. Frontend — CONFIRMED (source-read + command execution, 2026-09-13 audit)

### 2F. Frontend — CONFIRMED (source-read + command execution, 2026-09-13 audit)

**Exact dependency versions** (`package.json`):

| Package | Version |
|---|---|
| next | `16.2.12` |
| next-auth | `5.0.0-beta.32` |
| react / react-dom | `19.2.4` |
| typescript | `^5` |
| tailwindcss | `^4` |
| daisyui | `^5.5.19` |
| oxlint | `^1.61.0` (actual lint tool — `_docs/quality/test-strategy.md` calling it "ESLint" is stale/wrong, no ESLint config exists) |
| @playwright/test | `^1.62.1` (resolved `1.62.10` at run time) |
| vitest | `^4.1.8` (resolved `4.1.10` at run time) |
| react-dropzone | `^15.0.0` |

**Routing / route-protection** (ground truth, not the doc's paraphrase):
- Protected: `/publisher`, `/dashboard` — gated by `auth.ts:69-71` `authorized()` callback, matched
  via path-prefix `startsWith('/publisher')`/`startsWith('/dashboard')` inside `proxy.ts` (the
  actual middleware file — NOT `middleware.ts`, which does not exist; stale comments in
  `app/publisher/page.tsx` and `app/dashboard/page.tsx` incorrectly reference `middleware.ts`).
- Public: `/`, `/verify` (dead stub, see Finding), `/result/success`, `/result/failure`.
- **`proxy.ts`'s matcher is broad (near-everything, including `/api/*`) but `authorized()`'s gating
  logic only blocks `/publisher`/`/dashboard` — every `/api/*` route passes the middleware layer
  unconditionally** and protects itself independently (or not, for the intentionally-public
  `/verify` endpoint).
- Internal API routes: `app/api/register/route.ts` (POST, auth required via `requireAccessToken()`,
  validates upload via `parseUpload.ts`), `app/api/verify/route.ts` (POST, no auth by design,
  same upload validation), `app/api/records/route.ts` (GET, auth required, passthrough — possibly
  dead code, see Finding D5/D6, since `app/dashboard/page.tsx` fetches records via its own
  independent direct `fetch()` call, not through this route), `app/api/auth/logout/route.ts`,
  `app/api/auth/[...nextauth]/route.ts`.
- Upload validation (`app/api/_lib/parseUpload.ts`): size ≤ 20MB (`MAX_UPLOAD_BYTES = 20*1024*1024`,
  hardcoded, not env-driven), and PDF check = filename ends `.pdf` AND (`file.type===''` OR
  `file.type==='application/pdf'`) — **no magic-byte/`%PDF-` header check**, confirmed still present
  at current HEAD, matching the known gap (paper-relevant Finding, consistent with backend REG-6).
- Auth/session: NextAuth `Keycloak` provider, `pages.signIn:'/'` (intentional — unauth users land on
  the public verify page, not a NextAuth default login page), JWT callback manually decodes the
  Keycloak `id_token` to extract `identity_provider` claim (needed because NextAuth's built-in
  Keycloak provider doesn't map it), refresh-token flow with a 30s buffer before expiry, sets
  `token.error` (not a thrown exception) on any refresh failure.
- Build: 4-stage Dockerfile (`deps`→`builder`→`prod-deps`→`runner`), `node:22-alpine`, build happens
  at image-build time (fixed prior anti-pattern of building on every container start).
- Dev/build scripts explicitly force `--webpack` even though `next.config.ts` sets a `turbopack.root`
  key — Turbopack config present but unused by the active npm scripts (inconsistency, not
  necessarily a bug).
- `.env.local` variable NAMES only (no values): `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_AUTH_URL`,
  `AUTH_KEYCLOAK_ID`, `AUTH_KEYCLOAK_SECRET`, `AUTH_KEYCLOAK_ISSUER`,
  `NEXT_PUBLIC_AUTH_KEYCLOAK_ID`, `NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER`, `PITS_BACKEND_REGISTER_URL`,
  `PITS_BACKEND_VERIFY_URL`, `PITS_BACKEND_RECORDS_URL`, `PITS_ISSUER_ID`. No `.env.example` exists
  in the repo.

Full detail (every file:line citation): see `frontend-audit-raw.md` §A (preserved as backing
evidence, not reproduced in full here to keep this master document navigable).

---

## 3. TEST ENVIRONMENTS

### A. Live / UAT (production server, no separate staging exists)
- **Server:** `209.58.160.63` (shared VPS — also hosts unrelated domains: `pangkalandata.id`,
  `poc.pangkalandata.id`, `poc2.pangkalandata.id`, `amalin.nl`, `linara.id`,
  `sbdc.amalin.nl`/`sbdc-test.amalin.nl`).
- **Domains under test:** `pits-ui.pangkalandata.id` (frontend), `pits.pangkalandata.id` (backend
  API), `keycloak.pangkalandata.id` (IdP).
- **Deploy mechanism:** Docker Compose, path `/home/hamka/pits/{frontend-for-uat,backend-for-uat}`
  on the server, containers: `frontend-for-uat-frontend-1`, `trustmark-trustmark-app-1`,
  `trustmark-keycloak-1`, `trustmark-postgres-1`, `trustmark-anvil-1`.
- **Real vs mocked services:** ALL services real (real Postgres, real Keycloak instance, real Anvil
  chain instance) — this environment has no mocking; it is the actual deployed system.
- **Test accounts used:** `uat-tester` (Keycloak realm role `publisher`, created 2026-09-07
  specifically for QA), and pre-existing `test-publisher` (password unknown, from old realm export,
  unused in most sessions for that reason).
- **Real/production data present:** YES — per the 2026-09-09 API audit, the `/records` table already
  contained 33-42 records at that time including documents from 2026-09-06/07 that predate the
  `uat-tester` account, meaning multiple people/sessions have registered real-looking documents
  (filenames like "Resume (1).pdf", "cv E. Indarto 2020 - EN.pdf") into this "test" environment.
  **This is NOT a clean/isolated test environment** — it is live production, confirmed by the
  project owner to have "0 real end users" as of the sessions documented so far, but it does carry
  accumulated test-session data with no reset/cleanup process documented.
- **Network dependency:** full internet path client → nginx → containers; SSH access to the host
  requires the `-tt` PTY flag for non-interactive automated commands (undocumented quirk discovered
  2026-09-13, root cause not fully diagnosed — see §19).
- **Safety constraints observed by testers so far:** avoid `docker restart` for env changes (must
  use `--force-recreate`, restart alone does not reload `env_file`); check `docker-compose.yml` on
  the server has the `name: trustmark` line matching git before any `--force-recreate` (drift
  previously caused an accidental duplicate Compose project); do not touch non-PITS services/domains
  on the same host.
- **Dates used:** 2026-08-22 (initial Playwright E2E suite creation+run), 2026-09-06/07 (production
  incident response + fixes), 2026-09-09 (dedicated QA session: API E2E pytest suite + Playwright
  edge-case suite, both against this live environment).

### B. Local mocked unit-test environment (backend)
- **Location:** developer machine (`/Users/laksaersa/GitHub/_personal/_PITS/backend-for-uat`), this
  audit session's machine, 2026-09-13.
- **Real components:** none (Postgres, Keycloak, Anvil are all mocked/monkeypatched in these tests
  per test file inspection — confirmed exhaustively in the backend sub-agent audit, §7 below).
- **Mocked components:** DB session (SQLAlchemy, likely in-memory or Mock object — TBD from
  sub-agent audit), blockchain connector, Keycloak JWKS/token verification.
- **Framework:** pytest, run via `uv run pytest` (project uses `uv` for dependency/venv management,
  `pyproject.toml` + `uv.lock`).
- **Blocker discovered this session:** two of the newer test files (`test_documents.py`,
  `test_keycloak.py`) fail at collection time (before any test runs) because importing
  `trustmark.infra.auth.keycloak` requires the env var `KEYCLOAK_ISSUER` to be set (Dynaconf lazy
  string interpolation). No local `.env`/`settings.local.toml` exists in the repo (expected, not
  committed). Without it: `dynaconf.utils.parse_conf.DynaconfFormatError: Dynaconf can't
  interpolate variable because 'KEYCLOAK_ISSUER'`.
- **Does NOT touch production/live data:** confirmed, fully local/mocked.

### C. Local integration environment
`[PENDING SUB-AGENT AUDIT — confirm whether one exists at all; per docs read so far, the only
"integration-like" local setup was the 2026-08-22 session that ran the full Docker Compose stack
(Postgres+Keycloak+Anvil+backend) locally to support the first Playwright E2E suite — see Pass
history §6. No evidence of a currently-running local integration stack found yet.]`

### D. Performance/load environment
- **Config:** `tests/locust/locust.conf` — target `http://127.0.0.1:41012` (i.e., configured to hit
  the backend container port DIRECTLY, bypassing nginx — this is either run from inside the server,
  or via an SSH tunnel; not clear which was used for the numbers in the paper — flag as
  `INFORMATION NEEDED`), 10 users, spawn-rate 1/s, run-time 60s, autostart, autoquit 70s.
- **Locustfiles:** `health.py`, `register.py`, `verify.py` under `tests/locust/locustfiles/`.
- **Known issue found this session:** `verify.py`'s `verify_with_path_parameter` task contains
  `response_body["record_id"] is not str` (identity check against the `str` type object, not
  `isinstance`) — almost certainly a logic bug in the test itself, needs verification against actual
  endpoint response shape (backend sub-agent auditing this).
- **No raw Locust result artifact (CSV/HTML report) found in either repo** — the numbers in paper
  §5.3 Table 4 are not currently traceable to a stored raw output file in this codebase. See §11 and
  §18.

---

## 4. TESTING TOOLS

| Tool | Used for | Which tests |
|---|---|---|
| **pytest** | Backend unit tests (mocked) and backend API E2E tests (live HTTP) | `tests/trustmark/**`, `tests/api/**` |
| **`requests` (Python HTTP client)** | Making real HTTP calls to the live production API in the API E2E suite | `tests/api/test_register_verify_e2e.py` |
| **`uv`** | Python dependency/venv management for the main backend package (`pyproject.toml`/`uv.lock`) | all backend pytest runs |
| **separate venv `.venv-qa/`** | Isolated venv used specifically for the 2026-09-09 API E2E session (pytest 9.1.1 + requests), kept apart from the main app's dependency set | `tests/api/**` |
| **Playwright (`@playwright/test`)** | Browser-driven E2E tests against a real running frontend+backend+Keycloak stack | `tests/e2e/**` (frontend repo) |
| **Vitest** | Frontend unit tests (pure logic, jsdom environment) | `*.test.ts`/`*.test.tsx` (frontend repo) |
| **Locust** | HTTP load testing | `tests/locust/locustfiles/**` (backend repo) |
| **Manual browser testing** (via an AI-agent-driven browser tool, not a person clicking manually) | Visual/responsive checks, golden-path walkthroughs, verifying claims that automated tests couldn't cover (e.g. dark mode, mobile viewport) | referenced in `_docs/status/log.md` entries, not a separate committed test file |
| **`tsc --noEmit`** | TypeScript static type checking (frontend) | whole frontend codebase, not test-specific |
| **`oxlint`** | Linting (frontend) | whole frontend codebase |
| **`npm audit`** | Dependency vulnerability scan (frontend) — run at least once (2026-08-02 session), found "4 high severity vulnerabilities", not investigated further per that session's log | not a test suite, ad hoc |
| **SSH (`ssh -tt`)** | Server-side execution/inspection (Docker, nginx, logs) during incident-response and QA sessions | not itself a test tool, but the access mechanism for server-side verification steps |
| **AI coding agent (Claude Code, this session and prior sessions)** | Reading source code, designing test scenarios, writing test files, executing test commands, interpreting results, writing findings documents | see §5 for precise role boundaries |

Confirmed exact versions: pytest 9.0.3, Locust 2.43.4 (both from backend `uv.lock`); Playwright `@playwright/test` 1.62.1 (resolved 1.62.10 at run time)/`playwright` 1.60.0, Vitest 4.1.8 (resolved 4.1.10) (both from frontend `package.json`).

---

## 5. ROLE OF AI AGENT

This section is written precisely because it may be referenced in the paper. Do not let ChatGPT or
any downstream writer describe the AI agent as an "independent human reviewer" — it is not one.

- **What the AI agent (Claude Code) did, concretely, across sessions documented in this repo's
  `_docs/status/log.md` and `_docs/qa/**`:**
  - Read application source code directly (not black-box testing) to design test scenarios — e.g.
    `_docs/qa/api-test-scenarios.md` was explicitly written by reading `documents.py` and
    `keycloak.py` source to derive expected status codes/response shapes per scenario, per that
    document's own text.
  - Wrote test code (Playwright specs, pytest files, Locust files) by hand (as an LLM generating
    code), not by any automated test-generation tool.
  - Executed the tests itself via shell commands (`npm test`, `npm run test:e2e`,
    `uv run pytest`/`.venv-qa/bin/python -m pytest`, `locust`) inside its own tool-use loop — the
    execution is real (a real subprocess runs, real HTTP requests go out, real assertions
    pass/fail) — NOT simulated or hallucinated by the model.
  - Read the actual terminal output of each run and transcribed real pass/fail/error counts and
    error messages into the results documents (`_docs/qa/results/*.md`) — cross-checked against
    what this current audit session independently re-verified where possible (see §9/§10).
  - When a finding was made (e.g. the IDOR on `/records`), it was corroborated with TWO independent
    evidence types where possible: (1) static code reading (the missing `WHERE issuer_id=...`
    filter, a structural/code-level fact independent of any test run) and (2) empirical/runtime
    evidence (an actual API call showing pre-existing documents from before the test account
    existed) — this dual-evidence pattern is documented explicitly in
    `api-test-results-2026-09-09.md` Temuan #4.
  - Where a scenario could NOT be executed (e.g. needed a second Keycloak account and was blocked by
    that session's own tool-permission policy), the AI agent marked the test `xfail` with an
    explicit reason in code/docs rather than silently skipping it or claiming success.
- **What was human-directed/human-decided (Laksa Ersa, and in earlier incidents the end
  user/project owner):**
  - The decision to run tests directly against production (no staging environment exists) was a
    human/project-owner decision, justified by "0 real users" at the time.
  - Security-sensitive follow-up decisions (e.g. whether to fix the IDOR before or after paper
    submission, whether to enable Google login, whether to make `publisher` a default realm role)
    were explicitly deferred to and decided by the human user, not the AI agent — documented in
    `_docs/status/log.md` entries as "Blocker/keputusan dibutuhkan" (decision needed) items.
  - Credentials, server access grants, and scope of what the agent was allowed to touch were
    human-controlled at every session.
  - This current QA/context-export task itself is explicitly human-directed: the human specified
    the exact 20-section structure and the instruction to report facts only, no narrative.
- **Verification / re-checking:** in THIS audit session specifically, previously-reported facts were
  NOT taken at face value — the agent independently re-ran a subset of backend unit tests and found
  a NEW, previously-undocumented problem (two whole test files failing to even collect due to a
  missing env var — see §3B and §9) that no prior QA document had mentioned, because apparently no
  prior session had actually tried running those two specific files after they were added to the
  repo. This is direct evidence that results in this export are being independently re-verified
  against current repo state, not copy-pasted from old docs.
- **Explicit statement for the paper, if useful:** Test *results* in this export come from **actual
  program execution** (real subprocess runs, real HTTP calls, real assertions), not from the AI
  model generating plausible-looking numbers. Test *design* (which scenarios to test, what the
  expected behavior should be) was done by an AI agent reading source code and prior documentation,
  under human task-direction, cross-checked in at least one documented case (IDOR finding) against
  independent empirical evidence. The AI agent's outputs (docs, findings, code) were reviewed by the
  human project owner across sessions (evidenced by phrases like "belum di-commit, menunggu review
  user" — "not committed yet, awaiting user review" — appearing in the QA results docs themselves),
  though the audit trail available to this export does not include a record of line-by-line human
  verification of every individual test assertion.

---

## 6. COMPLETE TESTING PASSES (chronological)

### PASS 1 — Initial Golden-Path E2E Suite Creation (2026-08-22)
- **Objective:** Formalize UAT personas/journeys and close the "no E2E test" gap noted in the SRS
  docs (`fr-publisher-portal.md`/`fr-verification-portal.md` §Testing Plan, previously manual-only).
- **Environment:** Full local Docker Compose stack (Postgres, Keycloak, Anvil, backend) run locally
  by the agent; frontend dev server run locally on port 3080 (port 3000 was occupied by an unrelated
  service, "WAHA", on the dev machine); Keycloak client `nextjs-web` updated via admin API to add
  redirect URI for `localhost:3080`.
- **Methodology:** Wrote `_docs/qa/uat-test-plan.md` (personas, journeys, TC-1..TC-9 matrix mapped
  to SRS testing-plan sections), then wrote Playwright suite (`playwright.config.ts` +
  `tests/e2e/{auth-guard,verifier-journey,publisher-journey}.spec.ts` + a PDF fixture).
- **Tools:** Playwright (`@playwright/test`, added as new dev dependency), manual browser walkthrough
  via an AI-driven browser tool for visual confirmation.
- **Test count:** 4 automated E2E tests (mapping to TC-1,2,3,4/5/6/7 combined across the 3 spec
  files) + 1 manual full walkthrough.
- **Result:** 4/4 passed, re-run twice consecutively to check for flakiness — stable (not flaky).
  Vitest unit suite also run: 30/30 passed, no regression.
- **Limitations noted at the time:** upload >20MB/non-PDF (413/415), refresh-token expiry, i18n EN
  toggle, full logout flow — explicitly NOT automated yet (deferred).
- **Bugs found & fixed IN THE TEST CODE itself (not app bugs):** a Playwright locator collided with
  header logo text (missing `exact: true`) — fixed in test, not application.
- **Infra finding (test methodology issue, not app bug):** Playwright writing artifacts inside the
  watched project tree triggered Next.js Fast Refresh full-reloads mid-test, resetting client state
  and producing false-looking failures ("clicks not working"). Fixed by redirecting
  `outputDir`/report/fixture paths to `os.tmpdir()`.
- **Files created:** `playwright.config.ts`, `tests/e2e/auth-guard.spec.ts`,
  `tests/e2e/verifier-journey.spec.ts`, `tests/e2e/publisher-journey.spec.ts`,
  `tests/e2e/fixtures/sample-document.pdf`, `_docs/qa/uat-test-plan.md`.

### PASS 2 — Production Incident Response (2026-09-06/07) — not a planned QA pass, but produced test-relevant evidence
- **Objective:** Not testing per se — responding to "cannot login/register at all in production".
- **What happened (summary, full detail in `_docs/operations/handoff.md`):** 3 stacked production
  bugs found and fixed (wrong `.env.local` API paths; `KEYCLOAK_ISSUER` mismatch; nginx
  `proxy_buffer_size` too small), verified via direct log inspection (`docker logs`) and manual
  curl/browser testing, not via the automated suites above.
- **Relevance to QA/paper:** demonstrates the system had NOT been end-to-end functional in
  production for some period despite whatever testing had been claimed — worth the paper being
  precise about WHEN in the timeline the "100% functional pass" claim's underlying tests were
  actually run, relative to these incidents.

### PASS 3 — Dedicated API E2E + Locust context review (2026-09-09, backend repo)
- **Objective:** Explicitly stated in `api-test-scenarios.md`: close the gap between the paper's
  claim of "15 end-to-end scenarios (registration, duplicate detection, authentication failures,
  verification)" and the fact that the only 15 tests in the repo at the time were backend UNIT tests
  with mocks (`test_hash_engine.py` ×7, `test_blockchain_connector.py` ×8), not E2E API tests.
- **Environment:** Live production (`https://pits.pangkalandata.id`), account `uat-tester`, isolated
  venv `.venv-qa/` (pytest 9.1.1 + requests), explicitly NOT touching the main app's dependency set.
- **Methodology:** For every scenario, read the actual `documents.py`/`keycloak.py` source first to
  derive an expected status code + response shape, then wrote a pytest assertion against the live
  API, executed it, recorded the real result.
- **Test count:** 27 test cases total, covering registration (REG-1..6), duplicate detection
  (DUP-1..4), auth/authz failures (AUTH-1..8), verification (VER-1..8) — some scenarios could not be
  executed (xfail/skip, see below).
- **Result:** 19 passed, 3 failed (real application bugs — see §9 Findings #1/#2/#4), 2 skipped
  (needed direct server access, out of scope for HTTP-only session), 3 xfailed (needed a 2nd
  Keycloak account, blocked by that session's own tool-permission policy, explicitly documented as
  such rather than silently skipped), ~5m20s runtime (includes a deliberate 5-minute real-time wait
  to test actual token expiry for AUTH-3, not a mocked/fast-forwarded clock).
- **Files created (as of this export, still UNCOMMITTED per repo git status):**
  `tests/api/conftest.py`, `tests/api/test_register_verify_e2e.py`,
  `_docs/qa/api-test-scenarios.md`, `_docs/qa/results/api-test-results-2026-09-09.md`.
- **Commands used:** `.venv-qa/bin/python -m pytest tests/api/ -v -s`.

### PASS 4 — Edge-case Playwright suite (2026-09-09, frontend repo, same day as Pass 3)
- **Objective:** Close the gap sections §6 of `uat-test-plan.md` explicitly created "to support
  testing claims in the academic paper" for scenarios broader than the original TC-1..9 golden path
  (duplicate detection at UI level, auth failures at UI level, adversarial/edge cases).
- **Environment:** Live production (`https://pits-ui.pangkalandata.id`), account `uat-tester`.
- **Test count:** 14 tests (TC-10..TC-19, some split into sub-cases like TC-11a/b, TC-15a/b,
  TC-17a/b/c).
- **Result (final run, after 2 in-test fixes across 3 total run attempts):** 10 passed, 4 failed,
  ~2.6 minutes. First run attempt failed entirely (Chromium headless-shell not installed —
  environment issue, fixed). Second run found 2 wrong test expectations (fixed in test code, not
  app). Third (final) run is the one reported.
- **Real app bug confirmed by this pass:** TC-11b (non-PDF content accepted as if it were a valid
  PDF, `200` instead of expected rejection) — independently consistent with backend REG-6 finding
  from Pass 3, found via 2 independent layers (UI and direct API), i.e. not a coincidence of one
  test methodology.
- **Inconclusive (not confirmed bugs):** TC-13/TC-16 (Keycloak login timeouts, suspected test-session
  rate-limiting from repeated logins in one batch, not re-isolated to confirm); TC-18 (double-click
  test timeout, suspected aggressive test design rather than app bug, not confirmed via trace
  inspection).
- **Confirmed NOT bugs (test-expectation errors):** TC-14 (test expected wrong English string).
- **Files created:** `tests/e2e/edge-cases.spec.ts`,
  `_docs/qa/results/frontend-test-results-2026-09-09.md`, backend
  `_docs/qa/results/api-test-results-2026-09-09.md` cross-referenced.

### PASS 5 — This audit (2026-09-13) — source re-verification + gap discovery, IN PROGRESS
- **Objective:** Produce this complete, independently-re-verified QA context export for the paper's
  co-author.
- **Environment:** Local developer machine, some checks against local repo state only (no new
  production HTTP calls made in this pass, to avoid uncoordinated changes to the shared production
  environment without explicit sign-off).
- **What this pass did that is NEW versus Pass 3/4:**
  - Actually attempted to execute the two backend unit test files (`test_documents.py`,
    `test_keycloak.py`, ~55 test cases combined) that exist in the repo but had NEVER been confirmed
    to run successfully in any prior documented session — found they fail at collection due to a
    missing env var, a gap no prior QA doc mentions.
  - Independently ran the remaining 4 backend test files in isolation: 24 passed, 4 failed (all 4
    failures being `test_main_test_mode.py`, same root cause: missing env var import chain).
  - Spotted a likely logic bug in the Locust `verify.py` script (`is not str` instead of
    `isinstance`) that had not been flagged in any prior document.
  - Launched two parallel deep source-and-test sub-agent audits (backend, frontend) — results being
    merged into this document (§2, §7, §9, §17).
- **Result:** see merged sections below once sub-agent audits complete.

---

## 7. COMPLETE TEST INVENTORY

### 7B. Backend — CONFIRMED, 94/94 PASS (full re-execution 2026-09-13, verbatim log in
`backend-audit-raw.md` §C; full 94-row table in §B — condensed by file below, every test name and
its individual PASS status is preserved in the raw audit file, not summarized away)

| File | Tests | Layer | All mocked components | Status this run | Key findings this file reproduces |
|---|---|---|---|---|---|
| `test_hash_engine.py` | 7 | Unit | none (pure function) | **7/7 PASS** | — |
| `test_blockchain_connector.py` | 14 (uncommitted diff adds 3 vs. 8 in git history — Finding #18) | Unit | `Web3`, `Account` | **14/14 PASS** | Finding #17 (pending-message reuse) |
| `test_commons.py` | 4 | Unit | monkeypatched env | **4/4 PASS** | — |
| `test_main_test_mode.py` | 4 | Unit/Security (real `runpy` execution of `main.py`) | only `uvicorn.run` | **4/4 PASS** | Finding #5 (TEST_MODE bypass) — these tests ACTUALLY exercise the real bypass code path |
| `test_documents.py` | 27 | Unit | DB session, blockchain service | **27/27 PASS** | Finding #1 (issuer_id), #4 (IDOR, via `test_records_from_two_issuers_visible_to_one_principal`), #19 (MAX_UPLOAD_BYTES unset) |
| `test_keycloak.py` | 39 (incl. 7 parametrized cases) | Unit | `requests.get`, `jwt.decode`, JWKS cache | **39/39 PASS** | Finding #2 (malformed token), #15 (jwks_uri KeyError), #23 (client roles dead) |
| **Subtotal `tests/trustmark/`** | **94** | Unit (100% mocked, 0 real I/O) | — | **94/94 PASS, 0 FAIL** | — |
| `tests/api/test_register_verify_e2e.py` | 27 | API E2E (live prod) | none — real HTTP to production | **NOT RE-RUN this session** (last known 2026-09-09: 19 pass/3 fail/2 skip/3 xfail) | Findings #1,#2,#4 all originally discovered here |
| `tests/locust/locustfiles/*` | 3 files, not pytest | Performance | N/A | **NOT RUN this session** (no live target) | Finding #29/#30 (verify.py bugs) |

**Critical interpretive note, stated explicitly per task instructions not to let a pass count imply
"no bugs":** the 94/94 PASS result for `tests/trustmark/` does **NOT** mean the application is
bug-free. A meaningful fraction of these 94 tests (at minimum: `test_missing_sub_claim_reproduces_
finding_2`, `test_principal_sub_empty_writes_empty_issuer_id`, `test_records_from_two_issuers_
visible_to_one_principal`, `test_verify_malformed_token_is_unhandled`, `test_test_mode_true_
installs_a_hardcoded_auth_bypass`, `test_oidc_config_missing_jwks_uri_key_is_unhandled`,
`test_max_upload_bytes_default_is_unreachable_if_env_var_unset`) are **written to assert that a
known bug's current, broken behavior occurs** — they PASS precisely BECAUSE the bug is still there.
This is a deliberate and methodologically sound test-design choice (it prevents a bug from being
silently "fixed" or "un-fixed" without anyone noticing), but it means "94/94 pass" should never be
quoted in the paper as equivalent to "94/94 confirm correct behavior" without this caveat.

Full per-test-name table (all 94 rows, individually): `backend-audit-raw.md` §B.1-B.6.

### 7F. Frontend — CONFIRMED (full detail in `frontend-audit-raw.md` §B, reproduced in full here
per instructions not to summarize)

**Unit tests (Vitest) — 7 files, 30 `it()` blocks, ALL RE-EXECUTED THIS SESSION: 30 PASS, 0 FAIL:**

| Test file | Test name | Purpose | Status |
|---|---|---|---|
| `hooks/useUpload.test.ts` | on successful register, stores the payload and navigates to /result/success | Register success → sessionStorage payload + router push | PASS |
| `hooks/useUpload.test.ts` | when backend reports already_existed, treats register as a failure result | 200+already_existed=true routed to /result/failure | PASS |
| `hooks/useUpload.test.ts` | does nothing when submitted with no file selected | Guards empty submit | PASS |
| `lib/fileExtension.test.ts` | returns unknown for null | Null-safety | PASS |
| `lib/fileExtension.test.ts` | returns unknown when there is no extension | No-ext case | PASS |
| `lib/fileExtension.test.ts` | returns the lowercased extension | Case normalization | PASS |
| `lib/fileExtension.test.ts` | uses the last extension for multi-dot filenames | `archive.tar.gz`→`gz` | PASS |
| `lib/uploadErrorMessage.test.ts` | prioritizes already-registered case for register over generic 409 | Source-aware 409 mapping | PASS |
| `lib/uploadErrorMessage.test.ts` | maps known HTTP status codes to dedicated messages | 413→tooLarge | PASS |
| `lib/uploadErrorMessage.test.ts` | maps 409 for verify to generic conflict (not already-registered) | Source-dependent semantics | PASS |
| `lib/uploadErrorMessage.test.ts` | falls back to raw error string when no status match | Network-error fallback | PASS |
| `lib/uploadErrorMessage.test.ts` | falls back to generic failure message | Default fallback | PASS |
| `lib/uploadErrorMessage.test.ts` | treats unrecognized status code as no match, falls to response.message | Unknown-status fallback | PASS |
| `lib/dateFormat.test.ts` | returns null for a null value | Null-safety | PASS |
| `lib/dateFormat.test.ts` | returns original string when unparseable | Fallback | PASS |
| `lib/dateFormat.test.ts` | formats en-US order | Locale format | PASS |
| `lib/dateFormat.test.ts` | formats id-ID order | Locale format | PASS |
| `lib/dateFormat.test.ts` | pads single-digit hours/minutes | Zero-padding | PASS |
| `lib/resultPayload.test.ts` | returns bare /result/<status> href with no payload data in it | No-PII-in-URL constitution check | PASS |
| `lib/resultPayload.test.ts` | stores payload in sessionStorage so it can be read back | Round-trip | PASS |
| `lib/resultPayload.test.ts` | readResultPayload returns null when nothing stored | Empty-state | PASS |
| `lib/resultPayload.test.ts` | returns null for malformed JSON | Corrupt-storage handling | PASS |
| `lib/resultPayload.test.ts` | returns null when source is not register/verify | Schema validation | PASS |
| `lib/resultPayload.test.ts` | returns null when status is not success/failure | Schema validation | PASS |
| `lib/fileSizeCalc.test.ts` | returns "0 Bytes" for null | Null-safety | PASS |
| `lib/fileSizeCalc.test.ts` | formats sizes under 1 KB in Bytes | Formatting | PASS |
| `lib/fileSizeCalc.test.ts` | formats sizes in KB | Formatting | PASS |
| `lib/fileSizeCalc.test.ts` | formats sizes in MB | Formatting | PASS |
| `lib/i18n/translations.test.ts` | id/en have exact same key set | i18n key-parity guard | PASS |
| `lib/i18n/translations.test.ts` | every leaf has non-empty value (allow-list exempted) | No placeholder gaps | PASS |

**E2E tests (Playwright) — 18 test blocks total (2 auth-guard + 1 verifier + 1 publisher-multi-TC +
14 edge-case incl. 1 skip); NOT re-executable this session (Chromium `headless_shell` binary
missing locally — confirmed via real attempted run, see §6 Pass 5 execution log below), so results
below are the LAST KNOWN results (2026-08-22 for TC-1..9, 2026-09-09 for TC-10..19), cross-checked
against current source for whether the underlying code still matches what the test expects:**

| Test ID | File:line | Journey | What it asserts | Last known result | Source re-check this audit |
|---|---|---|---|---|---|
| TC-1 | `auth-guard.spec.ts:7` | Negative | `/publisher` redirects to `/` when logged out | PASS (2026-08-22) | Logic unchanged (`auth.ts:69-71`) |
| TC-2 | `auth-guard.spec.ts:12` | Negative | `/dashboard` redirects to `/` when logged out | PASS (2026-08-22) | Logic unchanged |
| TC-3 | `verifier-journey.spec.ts:8` | Verifier | Unregistered doc verify → `/result/failure` | PASS (2026-08-22) | — |
| TC-4..7 | `publisher-journey.spec.ts:40` | Publisher+Verifier round-trip | Login→register→dashboard-shows-it→public-verify-matches | PASS (2026-08-22) | — |
| TC-10 | `edge-cases.spec.ts:47` | Publisher | Dropzone rejects >20MB client-side, `/api/register` never fires | PASS (2026-09-09) | — |
| TC-11a | `edge-cases.spec.ts:77` | Publisher | Dropzone rejects `.txt` by extension | PASS (2026-09-09) | — |
| TC-11b | `edge-cases.spec.ts:88` | Publisher | `.pdf`-named non-PDF content — server must reject (415) | **FAIL** (got 200, not 415) — confirmed real bug | **Still present**: `parseUpload.ts:26-29` has no magic-byte check, source unchanged |
| — | `edge-cases.spec.ts:131-140` | Publisher | `test.skip()` — token-expiry, explicitly not automated | SKIPPED (by design) | — |
| TC-13 | `edge-cases.spec.ts:145` | Publisher | Logout ends NextAuth + Keycloak SSO session | **FAIL** — timed out at login step, not at the logout assertion itself; suspected Keycloak rate-limit from repeated logins in one batch, NOT confirmed as app bug | Independent real finding in test comments: `SignOut.tsx`'s Keycloak logout URL never passes `id_token_hint`, so Keycloak shows a manual confirmation screen instead of silent SSO logout — this is a separate, real, confirmed-by-source-reading UX/security-adjacent gap |
| TC-14(1) | `edge-cases.spec.ts:181` | UI | ID↔EN toggle on `/`, `/result/*` | Originally FAIL due to WRONG TEST EXPECTATION ("Verify Official Documents" vs actual "Verify an Official Document"); current repo's test source ALREADY has the corrected string | Confirmed not an app bug, test already fixed in current source |
| TC-14(2) | `edge-cases.spec.ts:197` | UI | Toggle persists into `/dashboard` | PASS (2026-09-09) | — |
| TC-15a | `edge-cases.spec.ts:213` | Negative | `/result/success` w/ empty sessionStorage doesn't crash | PASS (2026-09-09) | Confirmed: `resultPayload.ts` `readResultPayload()` returns `null` gracefully on empty/malformed storage |
| TC-15b | `edge-cases.spec.ts:226` | Negative | `/result/failure` same | PASS (2026-09-09) | — |
| TC-16 | `edge-cases.spec.ts:240` | Publisher | F5 after success keeps showing result (sessionStorage survives refresh) | **AMBIGUOUS in source doc itself** — described as failing in one run (login timeout, same suspected cause as TC-13) AND passing in "the final run" in the same document, without a single clean resolution — flagged as an unresolved ambiguity in the PRIOR artifact, not invented by this audit | — |
| TC-17a | `edge-cases.spec.ts:280` | Adversarial | Direct 21MB POST to `/api/register` bypassing UI → 413 | PASS (2026-09-09) | Confirmed: `parseUpload.ts:22-24` |
| TC-17b | `edge-cases.spec.ts:300` | Adversarial | Direct non-PDF POST → 415 | PASS (2026-09-09) | Confirmed: `parseUpload.ts:28-29` |
| TC-17c | `edge-cases.spec.ts:319` | Adversarial | No session cookie → 401 | PASS (2026-09-09) | Confirmed: `requireAuth.ts:16-21` |
| TC-18 | `edge-cases.spec.ts:333` | Verifier | Rapid double-click doesn't fire 2 in-flight `/api/verify` requests | **FAIL** — Playwright timeout "detached from DOM, retrying"; prior doc's own assessment: likely test-design issue (button correctly unmounts on submit, which IS the safe behavior), not confirmed app bug | Not re-verified live this audit |
| TC-19 | `edge-cases.spec.ts:390` | UI | Dark mode + 375px viewport, no horizontal overflow | PASS (2026-09-09) | — |

**Cross-check note (from frontend sub-agent, preserved verbatim as an important caveat):** the prior
results doc's headline "10 passed, 4 failed" does not cleanly resolve to one unambiguous list of
exactly which 10 tests passed, because TC-16 is described inconsistently within that same document
(failed in an earlier run / passed in "the final run"). This audit does NOT resolve that ambiguity
by picking one interpretation — it is reported as-is, per the instruction not to invent or round
numbers.

---

## 8. COVERAGE MATRIX

`[TO BE COMPLETED after merging test inventories — draft below from what's already known, to be
corrected/expanded]`

| Area | Coverage | Test IDs (partial, pending full inventory) |
|---|---|---|
| Authentication (login success) | Covered | Playwright `publisher-journey.spec.ts`, backend `test_keycloak.py` (pending confirm runs) |
| Authentication (failure modes: missing/malformed/expired token) | Partially covered | AUTH-1 (pass), AUTH-2 (pass=bug found, 500 not 401), AUTH-3 (pass, real 5-min wait) |
| Authorization (role check) | Partially covered | AUTH-4 not executable (no 2nd account, as of Pass 3); needs re-check now that server access is unblocked |
| Publisher identity / issuer attribution | **Not covered — actively broken** | Finding #1 (`issuer_id` always empty) |
| Publisher data isolation (cross-tenant access) | **Not covered — actively broken (IDOR)** | Finding #4, AUTH-7 |
| Registration (happy path) | Covered | REG-1 (fail — issuer_id bug), publisher-journey E2E |
| File validation (size) | Partially covered — mismatched layers | REG-3/4/4b, TC-10 |
| File validation (type/content, magic bytes) | **Not covered — confirmed gap** | REG-6, TC-11a/b |
| Hash generation | Covered | test_hash_engine.py (7 tests), VER-1/3 |
| Duplicate prevention | Partially covered | DUP-1 (pass), DUP-2 (not executed), DUP-3 (pass) |
| Concurrent registration (race) | Covered, no bug found | DUP-4 |
| Database persistence | Covered indirectly | REG-1, VER-1 |
| Blockchain write | Covered | REG-1, test_blockchain_connector.py |
| Blockchain read | Covered | VER-1, VER-3 |
| Transaction confirmation | `INFORMATION NEEDED` — pending sub-agent confirmation of exact mechanism |  |
| Verification by upload | Covered | VER-1/2/3, verifier-journey E2E |
| Verification by hash | Covered | VER-4/5/6 |
| Tamper detection | Covered | VER-3 |
| Public verification without login | Covered | AUTH-8, verifier-journey E2E |
| Frontend login | Covered | publisher-journey E2E |
| Logout | Partially covered | TC-13 (inconclusive result) |
| Session behavior (token refresh/expiry) | Not automated (frontend); partially (backend AUTH-3) | TC-12 (manual/backlog), AUTH-3 |
| Internationalization | Covered | TC-14, `translations.test.ts` |
| Responsive/mobile | Partially covered (manual + 1 automated) | TC-19 |
| Error handling (generic) | Partially covered | AUTH-2 finding shows a gap (500 leak) |
| Configuration failures | `[PENDING — depends on test_documents.py/test_keycloak.py actually running]` |  |
| Keycloak failures (JWKS unreachable etc.) | Covered — `test_keycloak.py`'s `TestFetchJwks` (14 tests incl. parametrized cases), all confirmed PASS this session | 13 tests in `test_keycloak.py::TestFetchJwks` |
| Database failures | Covered (mocked only, not against a real DB — see §14 gap) — `test_db_commit_failure_propagates_unhandled`, confirmed PASS this session | `test_documents.py::TestRegister::test_db_commit_failure_propagates_unhandled` |
| Blockchain failures | Partially — VER-8/REG blockchain-down scenarios written but VER-8 NOT executed live; `test_documents.py` has a mocked version pending confirmation | |
| Performance/load | Covered but evidence gap | see §11 |
| Security/adversarial | Partially covered, found 1 critical (IDOR) | VER-6 (injection-like payload), AUTH-7 |
| Accessibility | **Not covered** | none found |
| Recovery/resilience | **Not covered** (only anecdotal: technical-user-eval found Anvil restart wipes state) | none automated |

---

## 9. ALL FINDINGS (master register)

`[Base list from prior docs, to be cross-verified against current source by sub-agent audit — §D of
each raw audit file. Status column will be updated to "RE-CONFIRMED AT CURRENT HEAD" or "COULD NOT
RE-CONFIRM — CODE APPEARS CHANGED" once merged.]`

### Finding #1 — `issuer_id` empty on all records (missing JWT `sub` claim)
- Severity: High
- Date discovered: 2026-09-09
- How discovered: API E2E test REG-1 assertion failure + manual JWT payload decode + `GET /records`
  empirical check across 33-42 production records.
- Affected component: `src/trustmark/infra/auth/keycloak.py` (Principal construction, `sub` claim
  read with `claims.get("sub", "")`), Keycloak client `nextjs-web` scope config.
- Source evidence: `keycloak.py:196` (line number per 2026-09-09 doc, to be re-confirmed against
  current HEAD by sub-agent).
- Runtime evidence: decoded JWT for `uat-tester` shows no `sub` field; `/records` response shows
  `issuer_id: ""` for all records.
- Impact: total loss of chain-of-custody / source-verification capability — directly undermines the
  paper's "Source verification" claim for Domain 3.
- Status: **OPEN — RE-CONFIRMED at current HEAD, 2026-09-13** by backend sub-agent audit. Exact
  same line `keycloak.py:196` (`claims.get("sub", "")`), unchanged since the repo's very first
  commit (`a70d53b`, per `git log --follow` — this file has never been modified). Reproduced
  deterministically via unit tests `test_missing_sub_claim_reproduces_finding_2` and
  `test_principal_sub_empty_writes_empty_issuer_id` (both PASS, i.e. correctly detect the bug is
  still there). Whether the LIVE production Keycloak client-scope config still omits `sub` was NOT
  re-checked live this session (source-level confirmation only, see §19).
- Regression test: exists now (the two unit tests above), but they assert the BROKEN behavior as
  "expected" — i.e. they are bug-documenting tests, not tests that will fail once this is fixed;
  they would need inverting once a real fix lands.

### Finding #2 — Malformed bearer token → HTTP 500 instead of 401
- Severity: Medium
- Date discovered: 2026-09-09
- Source evidence: `keycloak.py:113-117` (per 2026-09-09 doc), `jwt.get_unverified_header(token)`
  called outside try/except.
- Runtime evidence: AUTH-2 test, actual 500 response from live API with garbage bearer token.
- Status: **OPEN — RE-CONFIRMED at current HEAD, 2026-09-13.** `jwt.get_unverified_header(token)`
  at `keycloak.py:114` still sits before the nearest `try:` (line 130), unchanged. Reproduced via
  unit test `test_verify_malformed_token_is_unhandled` (PASSES precisely because it asserts the
  raw, uncaught exception still propagates — the test's own docstring says it should be rewritten
  to expect a clean 401 once/if fixed).

### Finding #3 — nginx upload limit (~1MiB) mismatched with app config (`MAX_UPLOAD_BYTES`=20MB)
- Severity: Medium
- Date discovered: 2026-09-09
- Source evidence: infra config (nginx `client_max_body_size` not overridden for
  `pits.pangkalandata.id`), app config `docker/.env` `MAX_UPLOAD_BYTES` (value confirmed 20MB by the
  session, exact file/line pending sub-agent for app-side).
- Runtime evidence: binary search against production, exact boundary documented: 1,048,402 bytes →
  200; 1,048,403 bytes → 413 (HTML from nginx, not JSON from app).
- Status: OPEN as of 2026-09-09, infra-level fix (nginx config), not application code. `[not
  re-verifiable without live production check — not attempted this session, see §19]`

### Finding #4 — IDOR on `GET /api/v1/records` (CRITICAL)
- Severity: Critical
- Date discovered: 2026-09-09
- Source evidence: `documents.py:84` (exact line, current HEAD): `db.query(RegistryRecord).order_by
  (RegistryRecord.created_at.desc()).all()` — no `.filter_by(issuer_id=...)` or equivalent anywhere
  in `list_records()` (`documents.py:79-85`).
- Runtime evidence: two independent lines — (a) structural/code reading alone is sufficient proof
  regardless of test data, (b) empirical (2026-09-09): `uat-tester` (created 2026-09-07) could see
  documents registered 2026-09-06, i.e. before the account existed.
- Impact: any authenticated publisher can see every other publisher's full registration history
  (filenames, timestamps, hashes) — privacy/confidentiality breach across tenants.
- Status: **OPEN — RE-CONFIRMED at current HEAD, 2026-09-13, CRITICAL, NOT FIXED.** Same code shape,
  same file, same missing filter as both prior docs describe — zero change since the repo's initial
  commit. Additionally now reproduced **deterministically in a controlled unit test**:
  `test_records_from_two_issuers_visible_to_one_principal` (PASSES — i.e. correctly demonstrates
  that one principal's `/records` call returns records belonging to a different issuer). This is
  the single most important finding to resolve or explicitly caveat before paper submission.
- Note: this finding is compounded by Finding #1 — even a naive fix (filter by `issuer_id`) is
  currently a no-op because `issuer_id` is empty for every record.

### Finding #5 — `TEST_MODE` authentication bypass mechanism live in production container
- Severity: High (latent risk, not currently triggered)
- Date discovered: (test file `test_main_test_mode.py` header states "2026-09-09 source audit" —
  though this specific test file's existence/execution was not documented in any results doc found
  by this session prior to today; treat discovery date as `INFORMATION NEEDED` pending
  clarification, since the code comment says 2026-09-09 but no QA results doc from that date
  mentions it)
- Source evidence: `docker/Dockerfile` runs `CMD ["python", "-m", "trustmark.main"]`; `main.py`'s
  `if __name__ == "__main__":` guard IS live under `python -m` execution (not inert, per the test
  file's own explanatory docstring); if `TEST_MODE=True` were ever set, the app would substitute a
  hardcoded `Principal(sub="test-user", roles={"publisher"}, ...)` for the real auth dependency,
  bypassing Keycloak verification entirely for every request.
- Runtime evidence: `docker/.env.example:24` confirms `TEST_MODE=False` in the example config
  (live `.env`/`.env.save` on the deploy server not fully re-read this session to avoid transcribing
  potentially-live secret material — see §19).
- Status: **OPEN — RE-CONFIRMED at current HEAD, 2026-09-13.** `main.py:109-113` unchanged,
  `Dockerfile:50`'s `CMD ["python","-m","trustmark.main"]` unchanged — mechanism is live in the
  actual container entrypoint, not inert. Confirmed via 4 PASSING unit tests in
  `test_main_test_mode.py` that actually EXECUTE `main.py`'s real `__main__` block via
  `runpy.run_module` (only `uvicorn.run` is patched out) — this is not a simulated/inferred result,
  the bypass code path is really exercised and really installs the hardcoded principal when
  `TEST_MODE=true`. Not fixed (bypass code path still exists, still one env-var flip away).

### Finding #6 — Locust `race condition` (DUP-4) — NOT reproducible / no bug found
- Severity: N/A (negative finding — informational)
- Date discovered: 2026-09-09
- Result: 2 parallel identical-content register requests → 1 blockchain tx, 2nd response correctly
  `already_existed: true`, no 500/IntegrityError leaked.
- Caveat explicitly stated in the source doc: not proven safe under all conditions (e.g.
  multi-worker/higher load) — the code itself has no explicit lock between the `.first()` check and
  `.commit()`.
- Status: no code fix applied or needed as of 2026-09-09 (informational, not a confirmed bug).

### Finding #7 — Locust `verify.py` likely logic bug (`is not str`)
- Severity: `INFORMATION NEEDED` (test-code bug, not app bug, but affects trust in any Locust numbers using this file)
- Date discovered: 2026-09-13 (this session), NOT previously documented anywhere.
- Source evidence: `tests/locust/locustfiles/verify.py`, task `verify_with_path_parameter`, uses
  `response_body["record_id"] is not str` and similarly for `created_at` — Python identity
  comparison against the type object `str`, not `isinstance(...)`. This condition is structurally
  almost always `True` for a real string value, meaning this branch would mark the response a
  failure essentially always, OR (if `issuer_id` key is absent from the actual `/verify/{hash}`
  response shape) an earlier `elif response_body["issuer_id"] != ""` would raise `KeyError` first.
- Status: NOT YET independently confirmed against the real response shape of
  `GET /verify/{hash}` — **CONFIRMED by backend audit**: the bug is real (`verify.py:39,44`, `is not str` identity check, contrasted against the correct `type(x) is not str` form used in `register.py`), see §9 Finding #29 for full detail. Flagged
  as directly relevant to whether the Locust numbers cited in the paper (§5.3) are trustworthy,
  since it's unknown which exact locustfile version, if any, produced those numbers.

### Finding #8 — Frontend `/api/register` still lacks PDF magic-byte validation (mirrors backend REG-6)
- Severity: Medium (same underlying gap as Finding on backend side, confirmed independently at the
  frontend layer too)
- Date discovered: 2026-09-09 (TC-11b), RE-CONFIRMED via source read 2026-09-13 (this session)
- Source evidence: `app/api/_lib/parseUpload.ts:26-29` — checks filename suffix `.pdf` and
  `file.type` string only, no byte-level `%PDF-` header check.
- Runtime evidence: TC-11b (2026-09-09), expected 415, got 200.
- Status: OPEN, unchanged at current HEAD (source-confirmed 2026-09-13; NOT re-confirmed live this
  session since E2E could not execute).

### Finding #9 — Keycloak logout does not pass `id_token_hint` → shows manual confirmation screen instead of silent SSO logout
- Severity: Low/Medium (UX gap with a security-adjacent flavor — user may believe they are logged
  out when Keycloak SSO cookie handling is not cleanly terminated)
- Date discovered: 2026-09-13 (this session, frontend sub-agent, found via test-file comments
  referencing `SignOut.tsx`'s `generateKeycloakLogoutUrl()`), NOT previously documented as its own
  finding in any prior QA doc — was previously only visible as "TC-13 inconclusive" without this
  root-cause explanation.
- Source evidence: `components/.../SignOut.tsx` `generateKeycloakLogoutUrl()` (exact file
  path/line not fully captured by sub-agent — `[PENDING exact file:line]`) never includes
  `id_token_hint` in the Keycloak end-session URL.
- Status: OPEN, newly documented this session.

### Finding #10 — `/verify` route (`app/verify/page.tsx`) is a dead/orphaned stub with hardcoded English, bypassing i18n
- Severity: Low
- Date discovered: 2026-09-13 (this session)
- Source evidence: `app/verify/page.tsx:4-5` — literal strings `"Verification Page"` /
  `"Welcome to the Verification Page. Here you can verify an article."`, not routed through
  `useLocale()`, violating the project's own CLAUDE.md constitution rule ("semua teks WAJIB lewat
  i18n"). The REAL public verify UI lives at `/` (`app/page.tsx`), which correctly uses i18n.
- Status: OPEN, unclear if this route is linked from any navigation
  (`INFORMATION NEEDED: reachability from live nav not traced`) — likely leftover scaffolding, not
  a functional regression, but still a live discoverable URL serving non-compliant content.

### Finding #11 — Possible dead code: `app/api/records/route.ts` vs duplicate direct fetch in `app/dashboard/page.tsx`
- Severity: Low (code quality, not a functional bug)
- Date discovered: originally suspected 2026-08-02 ("dead code kalau mau dibersihkan" backlog note),
  RE-CONFIRMED as still present/unresolved 2026-09-13 (this session).
- Source evidence: `app/dashboard/page.tsx:36-48` fetches `PITS_BACKEND_RECORDS_URL` directly
  (Server Component), while `app/api/records/route.ts:6-20` independently wraps the same backend
  call behind `requireAccessToken()`. Whether the latter route is invoked by any client-side code was
  NOT traced (`components/dashboard/*.tsx` not read in full).
- Status: OPEN / UNRESOLVED, `INFORMATION NEEDED: confirm whether app/api/records/route.ts is truly
  dead code or has a live caller`.

### Finding #12 — Stale documentation/comments referencing nonexistent `middleware.ts` and "ESLint"
- Severity: Cosmetic/documentation-only
- Date discovered: 2026-09-13 (this session)
- Source evidence: comments in `app/publisher/page.tsx:5,7` and `app/dashboard/page.tsx:10`
  reference `middleware.ts` (actual file is `proxy.ts`); `_docs/quality/test-strategy.md:5`
  references "ESLint" as the static-analysis tool (actual tool is `oxlint`, no ESLint dependency in
  the repo).
- Status: OPEN, purely documentation drift, no functional impact.

### Findings #14-33 — NEW backend findings from source audit (2026-09-13), condensed
(Full text with complete reasoning for each is in `backend-audit-raw.md` §D.1-D.20 — reproduced
here as a condensed register per instructions to capture ALL findings; severity is this document's
own assessment, not stated in the raw audit.)

| # | Title | Severity | File:line | Status | Regression test |
|---|---|---|---|---|---|
| 14 | `src/trustmark/models/documents.py` (`Provenance`/`Document` Pydantic models) — dead code, never imported by any router | Low (hygiene) | `models/documents.py` (17 lines, whole file) | OPEN, new 2026-09-13 | none |
| 15 | `_fetch_jwks()`: `oidc["jwks_uri"]` plain dict index outside the enclosing try/except → unhandled `KeyError` if Keycloak's discovery doc omits `jwks_uri` | Medium | `keycloak.py:66` | OPEN — test file's own docstring calls this a "candidate 5th bug" implying an unsupplied prior audit may already know of it; reproduced by PASSING test `test_oidc_config_missing_jwks_uri_key_is_unhandled` | exists (documents current broken behavior, not yet a "should be fixed" assertion) |
| 16 | Live `/register`/`/verify` hash RAW bytes, not the canonicalized text (`generate_hash`) that is unit-tested and documented — canonicalization exists in code but is unreachable from any real HTTP endpoint | Medium (integrity-claim precision) | `documents.py:8,55,91` vs `hash_engine.py:4-13` | OPEN, new 2026-09-13 — **directly relevant if the paper describes hashing as "canonicalized"/"normalized" anywhere** | n/a |
| 17 | `read_transaction_value()` reuses the same "Transaction is still pending" 400 message for 2 semantically different conditions (unmined tx vs. mined-block-with-missing-timestamp) | Low | `blockchain_connector.py:65` vs `:70` | OPEN, new 2026-09-13 | exists (`test_read_transaction_value_block_missing_timestamp_returns_400`) |
| 18 | `tests/trustmark/infra/test_blockchain_connector.py` has an **uncommitted local diff** containing a corrected test fixture + 3 new tests, whose own docstring makes a **self-referential claim about "the accompanying paper's §5.1"** and a "16 out of 17 → 17 out of 17" figure that does NOT match this file's actual committed test count (8 tests in git history, not 17) | High (paper-evidence integrity issue) | `tests/trustmark/infra/test_blockchain_connector.py` (whole file, uncommitted diff) | **OPEN, UNRESOLVED — flagged as reported file content, not acted upon as an instruction.** `INFORMATION NEEDED: what exact 17-test set and paper section this refers to — no paper document exists in either repo to cross-check.` **This directly affects paper claim #7 in §12 below — recommend co-author investigate before citing any "16/17"/"17/17" figure.** | n/a |
| 19 | `MAX_UPLOAD_BYTES` default (20MB) is unreachable if the env var is fully UNSET (as opposed to set-empty) — raises unhandled `DynaconfFormatError` instead of falling back | Medium | `documents.py:24` + `conf/settings.toml:15` | OPEN, new named finding 2026-09-13 (test docstring calls it "candidate 6th bug") | exists (`test_max_upload_bytes_default_is_unreachable_if_env_var_unset`, PASS = bug confirmed) |
| 20 | `pyproject.toml` lists both `sqlalchemy>=2.0.48` AND a separate, unrelated/vestigial `sqlalchemy-orm>=1.2.10` package — not imported anywhere | Low (dependency hygiene) | `pyproject.toml:21` | OPEN, new 2026-09-13 | n/a |
| 21 | `get_current_principal` is declared as a dependency TWICE per request (router-level + inside `require_roles`) — FastAPI's dependency caching means it only executes once in practice, so NOT a functional bug, but redundant/confusing | Low (code quality) | `main.py:79` + `documents.py:51,81` + `keycloak.py:207` | OPEN, new 2026-09-13, not empirically traced at the network level (reasoned from FastAPI's documented caching behavior) | n/a |
| 22 | Duplicate `/health` endpoints (`GET /health` plain dict vs `GET /api/v1/health` Pydantic model) — functionally harmless, dead/duplicate surface | Low | `main.py:70-72` vs `metrics.py:12-20` | OPEN, new 2026-09-13 | n/a |
| 23 | `KEYCLOAK_ROLES_CLIENT_ID` has no default in any config file in the repo → client-role extraction branch is effectively always disabled in every shipped configuration (only realm roles are ever checked) | Medium (authorization completeness) | `keycloak.py:192` | OPEN, new 2026-09-13 | exists (`test_client_id_none_skips_client_roles_entirely`) |
| 24 | `src/trustmark/infra/hash_generator.py` — empty (0-byte) file, distinct from the real `hash_engine.py` — vestigial/confusing naming | Cosmetic | `infra/hash_generator.py` | OPEN, new 2026-09-13 | n/a |
| 25 | New `Web3`/account/RPC connection constructed on EVERY register/verify request, no pooling/reuse | Medium (performance, not evaluated under load this audit) | `documents.py:15-20` | OPEN, new 2026-09-13, **relevant to interpreting any future Locust numbers** | n/a |
| 26 | `wait_for_receipt()` — blocking synchronous web3.py call inside an `async def` handler, no timeout override, no thread/executor offload — could stall the whole event loop under a slow/unresponsive chain | Medium-High (availability risk) | `documents.py:63` calling `blockchain_connector.py:78-81` | OPEN, new 2026-09-13 | n/a |
| 27 | Unpinned `:latest` Docker image tags for `uv` installer and the `anvil`/Foundry image — reproducibility risk | Low (supply-chain hygiene) | `Dockerfile:25`, `docker-compose.yml:45` | OPEN, new 2026-09-13 | n/a |
| 28 | `Dockerfile` creates `files-storage/{registered,verified}` directories that NOTHING in current source ever writes to — uploaded bytes are hashed in-memory only, never persisted to disk; `files_storage_path` setting defined but never referenced in `src/` | Low (dead infra / confusing for anyone assuming files are archived) | `Dockerfile:47`, `conf/settings.toml:7` | OPEN, new 2026-09-13 — **relevant if the paper or any documentation implies uploaded documents themselves are retained/archived by PITS; per this audit, they are NOT — only the hash + metadata + blockchain reference are stored** | n/a |
| 29 | `tests/locust/locustfiles/verify.py:39,44` — `is not str` identity-check bug, CONFIRMED (matches Finding #7 above, now with exact confirmed line numbers) | Medium (undermines trust in any historical Locust numbers using this file) | `verify.py:39,44` | **CONFIRMED via direct source read**, contrasted against the CORRECT `type(x) is not str` form used in `register.py:31,36,41` | n/a — needs fixing before any future Locust run |
| 30 | `verify.py:34` hardcodes an expectation that `issuer_id` is ALWAYS empty string (`!= ""` check) — the load-test script has baked in Finding #1 (empty issuer_id bug) as "normal," so it would not catch a regression if that bug were fixed, and would instead start FAILING once fixed | Low (test-design gap, not an app bug) | `verify.py:34` | OPEN, new 2026-09-13 | n/a |
| 31 | No `Alembic`/migration tooling found anywhere — schema is created via `Base.metadata.create_all()` at app startup, no versioned migrations | Medium (operational risk for any future schema change, e.g. a fix for Finding #4 that adds an index/constraint) | `main.py:36` | OPEN, new 2026-09-13 | n/a |
| 32 | `RegistryRecord.id` — app-generated UUID4 `String(36)` PK, not DB-native UUID type, not autoincrement — every insert generates its own id client-side | Cosmetic/design note | `models.py:12` | OPEN, new 2026-09-13, not necessarily a bug | n/a |
| 33 | ~9 completely empty (0-byte) source files exist under `src/trustmark/` (`exports.py`, `inventor.py`, `status.py`, `verification.py`, `cache.py`, `reports.py`, plus 4 files under `services/`) — none imported/wired anywhere | Cosmetic (codebase cleanliness) | see `backend-audit-raw.md` §E for full path list | OPEN, new 2026-09-13, `INFORMATION NEEDED: whether these are planned-but-unbuilt features or leftovers from a larger private codebase this UAT export was trimmed from` | n/a |

**Verdict table (backend sub-agent's own explicit re-verification of every item this audit was
asked to check, reproduced verbatim as it is authoritative):**

| Item re-verified | Verdict |
|---|---|
| `GET /api/v1/records` filters by `issuer_id`? | **Still NO filter — IDOR confirmed present**, `documents.py:84` |
| `Principal.sub = claims.get("sub","")`? | **Still present unchanged**, `keycloak.py:196` |
| `jwt.get_unverified_header` outside try/except? | **Still present unchanged**, `keycloak.py:114` |
| `MAX_UPLOAD_BYTES` vs magic-byte validation? | **Still absent** — no content-type/magic-byte check anywhere in `documents.py` |
| `TEST_MODE` bypass wired into `python -m trustmark.main`? | **Still present and still wired**, `main.py:109-113`, `Dockerfile:50` |
| `verify.py` `is not str` bug? | **Confirmed present**, `verify.py:39,44` |

---

## 10. FINDINGS STATUS AFTER FIXES

**As of this export, NO code fixes have been applied for any of Findings #1-5 (issuer_id,
AUTH-2/500, nginx limit, IDOR, TEST_MODE) since their discovery on 2026-09-09.** This session (Pass
5) has not modified backend or frontend application source code — only test execution and reading.
Therefore this section currently has no "Original → Fix → Regression test → Retest → Current status"
chains to report; all findings remain in their original OPEN state pending explicit user decision on
whether to fix before or after paper submission (see the open question raised back to the user in
the previous context-export message of this conversation).

`[If sub-agent audit discovers any fix WAS applied since 2026-09-09 that no doc mentions, it will be
reported here as a surprise finding, not assumed.]`

---

## 11. PERFORMANCE TESTING

### A. Numbers stated in the paper
- **Abstract:** "three 60-second trials ... processed 8,880 requests without failure, with mean
  response latency of 53.5 milliseconds and mean p95 latency of 97.7 milliseconds."
- **§5.3 / Table 4** (per-run breakdown):

| Run | Requests | Failures | Mean (ms) | p50 (ms) | p95 (ms) | Throughput (req/s) |
|---|---|---|---|---|---|---|
| 1 | 2,695 | 0 | 35 | 36 | 56 | 46.26 |
| 2 | 2,695 | 0 | 36 | 33 | 67 | 46.31 |
| 3 | 2,775 | 0 | 38 | 37 | 69 | 46.32 |
| **Total/derived** | **8,165** (2695+2695+2775, NOT 8,245 as prose states — see note) | 0 | — | — | — | — |

  - **Note on internal arithmetic:** summing the 3 row values in Table 4 as printed (2,695 + 2,695 +
    2,775) = **8,165**, not the 8,245 stated in the paper's own prose just below the table
    ("PITS completed 8,245 verification requests across the three final runs"). This is a SECOND,
    previously unnoticed internal inconsistency (distinct from the Abstract-vs-Table mismatch
    already flagged) — `INFORMATION NEEDED: which number (8,165 sum-of-table, 8,245 prose, or 8,880
    abstract) is the actual raw figure; at least two of these three numbers must be wrong given
    they can't all be correct simultaneously.`
- **Config stated:** Locust, 10 simulated users, spawn rate 1/s, 60-second runs, focused on
  verification workflow.

### B. Actual raw test evidence currently available in the repo
- **NONE.** No CSV, HTML report, or log file from any Locust run was found in either repository by
  this session (confirmed by directory listing of `tests/locust/` — only config and locustfile
  source exist, no `*.csv`/`*.html`/`locust.log` output artifact, despite `locust.conf` specifying
  `logfile = tests/locust/locust.log`, which does not exist in the repo — either it was never
  committed, or the run happened in an environment/working directory not reflected in this repo
  checkout).
- The `verify.py` locustfile has an unresolved possible logic bug (Finding #7, §9) whose effect on
  historical run results (if this exact file version was used) is unknown.

### C. Independent rerun this session
- **NOT PERFORMED.** This session did not execute a Locust run (would require the full stack —
  Postgres+Keycloak+Anvil+backend — running somewhere reachable, and was out of scope for this
  context-export pass to avoid making uncoordinated live changes). `[If the user wants this
  re-run, it needs to be scheduled as a distinct, explicitly-approved action given it hits either
  production or requires spinning up a local stack.]`

**Explicit instruction followed: no single number is being chosen as "the" correct one. All three
paper-stated figures (8,880 / 8,245 / 8,165-from-table) and the "0 raw evidence in repo" fact are
presented side by side for the co-author/ChatGPT to reconcile with the actual source data (if it
exists somewhere outside this repo checkout) or to caveat in the paper.**

---

## 12. PAPER CLAIMS VS TEST EVIDENCE

| # | Claim (paraphrase) | Section | Evidence originally cited (in paper) | Independent test evidence | Verdict | Explanation |
|---|---|---|---|---|---|---|
| 1 | "15 end-to-end scenarios (registration, duplicate detection, authentication failures, verification)" | Abstract | (implied: the test suite) | The only pre-existing 15 tests were backend UNIT tests with mocks (hash engine + blockchain connector), not E2E. A genuinely E2E scenario set (27 cases) was only written 2026-09-09, separately. | **NOT SUPPORTED** as originally worded — conflates unit-test count with E2E scenario count | The number "15" is real but refers to a different test layer than what the sentence describes. |
| 2 | "100% Functional Pass Rate" | Abstract | (implied: the test suite) | 2026-09-09 API E2E run: 19/27 passed outright, 3 failed on real bugs, 2 skipped, 3 xfailed. Frontend edge-case run: 10/14 passed, 4 failed (1 confirmed real bug, 2 inconclusive, 1 test-expectation error). | **NOT SUPPORTED** | Multiple confirmed application-level failures exist (IDOR, AUTH-2 500, non-PDF acceptance) as of the most recent execution on record. |
| 3 | "Zero Failures" (in the context of the described testing generally) | Abstract/§5.1 | (implied) | Same as above — Findings #2 and #4 are functional/security failures found via the very E2E testing being described. | **NOT SUPPORTED** | — |
| 4 | Locust: "8,880 requests without failure, mean 53.5ms, p95 97.7ms" | Abstract | Locust run (unspecified which) | Table 4 in the SAME paper gives different totals/latencies for what is presented as the same 3 runs; no raw artifact in repo to adjudicate either number; a possible logic bug in the current `verify.py` locustfile casts further doubt on reproducibility. | **REQUIRES RECONCILIATION** | Internal inconsistency within the paper itself, plus no available raw evidence to independently confirm either figure. |
| 5 | Locust Table 4 per-run figures (2,695/2,695/2,775 req, 0 failures, 35-38ms mean, 56-69ms p95, ~46.3 req/s) | §5.3 Table 4 | (the Locust run itself) | No raw Locust output artifact found in repo; table's own row-sum (8,165) also doesn't match the paper's adjacent prose figure (8,245). | **REQUIRES RECONCILIATION** | Table is internally self-consistent per-row but the aggregate figure quoted in prose right after it doesn't match summing the rows. |
| 6 | Integrity: "3 of 4 users [could] tell the original registered artifact apart from a modified version" / 1 frontend stuck-loading case | §5.2 | Technical user evaluation | Consistent with, and appears to be describing, the same technical-user-evaluation data referenced in §5.4; not independently re-run this session (would require the 4 original external testers). | **NOT EVALUATED** (this session) | Original claim references a specific evaluation event this session did not have access to re-run; no contradicting evidence found either. |
| 7 | "Backend unit test... initial run passed 16 out of 17... final run passed 17 out of 17" (hash engine + connector fixture fix) | §5.1 | Backend unit test run | **Now resolved with important nuance by the backend audit.** `test_hash_engine.py` has 7 tests (committed, unchanged). `test_blockchain_connector.py` has **8 tests in git history** but **14 tests in the current UNCOMMITTED working tree** (a local diff adds a corrected fixture + 3 new tests). 7+8=15 (committed state) or 7+14=21 (working-tree state) — **neither equals 16 or 17.** Most strikingly: the uncommitted diff's own test-file docstring contains a **self-referential claim naming "the accompanying paper's §5.1"** and the exact "16 out of 17 / 17 out of 17" wording — i.e. some prior session wrote a test-file comment that explicitly ties itself to this exact paper claim, but that corrected state was **never committed to git**, so a fresh checkout of this repo would NOT reproduce the paper's claimed 17/17 result. | **REQUIRES RECONCILIATION — HIGH PRIORITY** | This is not just a stale-numbers issue: it suggests the paper's claimed test-fix narrative was written based on LOCAL, UNCOMMITTED work that could be lost/inconsistent if not committed. Recommend: (1) locate/confirm the actual 17-test set the paper describes (not found in either repo by this audit), (2) commit the current working-tree fixture fix if it's the intended final state, (3) verify the resulting committed count actually equals 17 before citing this number in the paper. |
| 8 | Requirement coverage: 24 requirements, 10 Satisfied / 7 Satisfied-with-caveat / 5 Partial-pending / 2 Supported-by-design / 0 Not-evaluated | §5.1 Table 3 | internal requirements audit | No requirements traceability matrix document (the "24 requirements" list itself) was found in either repo by this session — referenced in-text as `(Khairunnisa et al., 2026)`, i.e. an external/other document not present in this codebase. | **NOT EVALUATED** (this session — source document not accessible) | `INFORMATION NEEDED: the actual 24-requirement traceability matrix document location.` |
| 9 | Technical user evaluation: 4 stakeholders × 20 test cases = 80 outcomes (68 Pass/9 Fail/2 Blocked/1 Not Run) | §5.4 | technical user evaluation | Same as #8 — the underlying raw per-tester results/test-case list was not found in either repo by this session. | **NOT EVALUATED** (this session — source document not accessible) | `INFORMATION NEEDED: raw technical-user-evaluation records/spreadsheet location.` |
| 10 | "PITS operationalized artifact hashing, registry evidence, public verification, and publisher-side access control. It did not operationalize complete version history, institutional publisher verification..." | §6.1 | (self-assessment) | Consistent with code-level findings — publisher-side access control as implemented has a critical flaw (IDOR, Finding #4) that arguably means even the *implemented* scope of "access control" is not achieved correctly, not just "incomplete" as framed. | **PARTIALLY SUPPORTED** | The qualitative direction of the claim (what was vs wasn't attempted) is accurate; the paper's framing of what WAS achieved may be too generous given Finding #4. |

`[More rows to be added once sub-agent audits are merged, especially around specific §3.3/Table 1
requirement-to-component mappings.]`

---

## 13. REPRODUCIBILITY INFORMATION

### Unit — Backend (pytest, mocked)
- **Prerequisites:** Python (repo uses `uv`, resolves its own interpreter — observed 3.12.14 via
  `uv` in this session), `uv` installed.
- **Env vars needed (NAMES only, dummy values suffice for pure unit tests per this session's
  finding):** `KEYCLOAK_ISSUER`, and likely others per `conf/settings.toml`
  `[PENDING sub-agent full list]`.
- **Setup:** `cd backend-for-uat && uv sync`
- **Run:** `uv run pytest tests/trustmark -v` (currently fails to collect 2 of 6 files without env
  vars set — see §3B; with dummy env vars set, expected to run cleanly, pending sub-agent
  confirmation of final pass/fail count).
- **Test data:** none external — uses in-code fixtures/mocks.
- **Cleanup:** none needed (no real state touched).

### Unit — Frontend (Vitest)
- **Prerequisites:** Node.js + npm (exact version `[PENDING sub-agent]`), `node_modules` installed.
- **Setup:** `cd frontend-for-uat && npm install`
- **Run:** `npm test` (= `vitest run --project unit`)
- **Test data:** none external.
- **Cleanup:** none needed.

### API E2E — Backend (pytest + requests, live)
- **Prerequisites:** network access to `https://pits.pangkalandata.id`, a valid publisher account
  (`uat-tester`, credentials in local untracked `_credentials/` file, NOT reproducible by someone
  without that file — see §19), Python + `requests` + `pytest` (session used isolated `.venv-qa/`).
- **Setup:** `python3 -m venv .venv-qa && .venv-qa/bin/pip install pytest requests` (approximate,
  exact commands used in 2026-09-09 session `[PENDING confirmation of exact pip freeze/requirements
  if one was saved]`).
- **Run:** `.venv-qa/bin/python -m pytest tests/api/ -v -s`
- **Test data:** generates PDF-like byte content on the fly (per test file, to be confirmed by
  sub-agent read of `conftest.py`).
- **Touches production:** YES — creates real records in the live registry, real blockchain
  transactions on the live (shared) Anvil chain.
- **Cleanup:** `INFORMATION NEEDED: no documented cleanup/teardown process for records created by
  this suite — production DB accumulates test records indefinitely as currently designed.`
- **Limitations:** several scenarios (DUP-2, AUTH-4, VER-7, VER-8) require either a 2nd test account
  or direct server access, both now technically available (per §6 of the earlier context-export in
  this conversation) but not yet re-run under those unblocked conditions.

### Frontend E2E (Playwright, live)
- **Prerequisites:** backend stack reachable (production or local Docker Compose), Keycloak test
  account, `npx playwright install` for browser binaries (session-01 hit a missing
  headless-shell install issue).
- **Setup:** `cd frontend-for-uat && npm install && npx playwright install`
- **Run:** `npm run test:e2e` (env vars `PLAYWRIGHT_PUBLISHER_USERNAME`/`PLAYWRIGHT_PUBLISHER_PASSWORD`
  override the default `test-publisher`/`test` — per `uat-test-plan.md` §4; 2026-09-09 run used
  `uat-tester` instead, presumably via these env vars, `[PENDING sub-agent confirmation of exact
  invocation]`).
- **Touches production:** YES, when pointed at the live `baseURL`.
- **Cleanup:** same gap as API E2E — no documented cleanup of records created during E2E runs.

### Performance (Locust)
- **Prerequisites:** Locust installed, backend reachable at the URL in `locust.conf`
  (`http://127.0.0.1:41012` — implies either running FROM the server itself, or via a tunnel/port
  forward; `[INFORMATION NEEDED: which was actually used for the paper's numbers]`).
- **Run:** `locust` (config auto-loads from `tests/locust/locust.conf`, `autostart = true`).
- **Test data:** `tests/locust/testfile.txt` (fixed content, referenced by fixed hash string in
  `register.py`/`verify.py` — meaning re-running against a FRESH/empty registry the very first
  register call would succeed, all subsequent identical-content calls across all 3 users’
  concurrent requests would hit the duplicate-detection path, not fresh-insert path — worth the
  paper being precise about which code path the load test is actually exercising for "register").
- **Cleanup:** none documented; leaves data behind in the target registry.

---

## 14. WHAT IS STILL NOT TESTED

`[Draft list from known gaps in prior docs + this session; to be expanded/corrected by sub-agent
findings]`

| Module/flow | Reason not tested | Risk | Recommended test | Priority |
|---|---|---|---|---|
| `GET /api/v1/records` with a genuine 2nd publisher account (DUP-2, AUTH-7 A-vs-B) | Previously blocked by tool-permission policy of that session, not by real access limits | Cannot fully confirm scope of IDOR (whether it's truly ALL publishers or something narrower) without 2 real accounts | Create 2nd Keycloak publisher account, re-run DUP-2 + AUTH-7 A-vs-B explicitly | P0 (directly validates the most severe open finding) |
| VER-7 (on-chain vs DB desync) | Needed direct server/DB access, unavailable in the HTTP-only 2026-09-09 session | Unknown whether app correctly reports mismatch state (`valid=false` + `record_id` present) in a REAL desync, vs only in the unit-mocked version | Now that SSH access works (this conversation, 2026-09-13), deliberately edit one `content_hash` in Postgres (non-destructively, on a disposable test record) and re-verify | P1 |
| VER-8 (blockchain node down) | Needed to stop the Anvil container, risky/out of scope for HTTP-only session | Unknown whether app returns a controlled error (e.g. 503) or a raw 500 leak when the chain RPC is unreachable | Stop `trustmark-anvil-1` container briefly (coordinate timing to avoid impacting other users of the shared server), attempt a verify call, restart, confirm data unaffected | P1 (but destructive-ish — needs explicit user sign-off per constraints in §3A) |
| AUTH-4 (token valid, no publisher role) | Needed a non-publisher test account | Cannot confirm role-check actually rejects correctly (only inferred from code reading) | Create a Keycloak account with no `publisher` role, attempt register | P1 |
| ~~Two newer backend unit test files~~ | **RESOLVED THIS SESSION (2026-09-13)** — all 94 backend unit tests (incl. `test_documents.py` 27 + `test_keycloak.py` 39) now confirmed to run cleanly (94/94 PASS) once 7 dummy env vars are exported. See §7B/§16A. **Action item that remains:** commit a `conftest.py` or documented `.env.test` with these dummy values so future sessions/CI don't hit the same collection blocker from scratch. | Low now (was blocking, now just a DX/onboarding papercut) | Add `tests/trustmark/conftest.py` (or similar) that sets the 7 required dummy env vars before collection, commit it | P2 (down from P0 — already unblocked manually this session, just needs to be made permanent/committed) |
| Real DB integration test (against an actual Postgres/SQLite, not a mocked `Session`) | No test in `tests/trustmark/` ever exercises `RegistryRecord` against a real database — all DB interaction is mocked | Unknown whether `models.py`'s `unique=True` constraints actually behave as expected at the DB layer (relevant to the DUP-4 race-condition finding, which currently only has evidence from LIVE production) | Add an integration test layer using a real SQLite file or ephemeral Postgres | P1 |
| No migration tooling (Alembic or equivalent) | Schema created via `Base.metadata.create_all()` at startup, no versioned migrations anywhere | Any future schema change (e.g. fixing Finding #4's IDOR might need a new index) has no tested upgrade path | Introduce Alembic, or explicitly document that schema changes require manual DB intervention | P1 |
| Raw Locust artifact reproduction | No stored raw output, only paper's summarized numbers, and the paper's own numbers are internally inconsistent (§11) | Cannot cite verifiable performance evidence in the paper as currently written | Fix `verify.py`'s `is not str` bug (confirm real shape first), re-run Locust with `--csv`/`--html` output flags, commit the raw artifact to the repo | P0 (needed for paper credibility on Table 4) |
| Frontend TC-13/TC-16 (isolated re-run, not batched) | Flagged inconclusive on 2026-09-09, never re-isolated | Unknown if login timeout is a real bug or Keycloak rate-limiting artifact of test methodology | Re-run TC-13 and TC-16 as standalone single-test invocations, not part of the 14-test batch | P2 |
| Accessibility (screen reader, WCAG) | Never attempted in any session found | Unknown accessibility compliance, relevant for a public-sector-facing civic tool | Basic axe-core/Lighthouse accessibility pass at minimum | P2 |
| Real mobile devices | Only viewport-emulation tested (TC-19), not a real device | Emulated viewport may not reflect real touch/rendering behavior | Manual test pass on at least one real Android + iOS device | P3 |
| Rate limiting (app-level, not just Keycloak's incidental behavior) | No evidence any app-level rate limiting exists or was tested | Public `/verify` endpoint is unauthenticated — no confirmed protection against abuse/scraping of the registry via repeated hash guesses (note `/verify/{hash}` accepts arbitrary 64-hex strings) | Explicit rate-limit / abuse test against `/verify` and `/verify/{hash}` | P2 |
| Dependency/CVE scanning (backend) | Only frontend `npm audit` was run once (2026-09-07/08, found "4 high severity", not investigated) — no Python equivalent (`pip-audit`/`safety`) found run anywhere | Unknown vulnerable dependency exposure on the backend | Run `pip-audit`/`uv pip list` cross-check against a CVE DB | P2 |
| Disaster recovery / backup-restore | Never tested; Anvil is known to lose all state on restart per the technical-user-evaluation finding in the paper itself | No confirmed recovery path if the shared server has any incident | Document and test an actual backup/restore procedure for Postgres at minimum (Anvil being ephemeral-by-design may just need to be documented as a known limitation rather than "fixed") | P1 for documentation, P3 for actual DR testing given PoC status |
| Full "complete provenance journey" (register → multiple verifies over time → any admin/audit view) | No admin/audit UI exists to test against, per repo inspection so far | Cannot verify the "audit trail" Domain-3 claim beyond the DB row + blockchain tx existing | `INFORMATION NEEDED: does any audit-trail VIEW exist at all, or is the claim solely "the data exists in 2 places, linkable by hash"?` — sub-agent to confirm | P1 (directly a Domain-3 requirement in the paper's own Table 1) |

---

## 15. RECOMMENDED NEXT TEST PASS

1. **[P0] Run the ~55 already-written-but-never-executed backend unit tests** (`test_documents.py`,
   `test_keycloak.py`) to completion with proper env setup. Objective: confirm/refute whether
   Findings #1/#4/#5 are reproducible at the unit/mock level (cheap, fast, no production risk).
   Environment: local, fully mocked. Expected result: a definitive pass/fail list for ~55 previously
   unknown test outcomes.
2. **[P0] Fix and re-run the Locust suite with raw artifact output.** Objective: produce a single
   number set that can actually be cited in the paper, resolving the 3-way inconsistency in §11.
   Environment: needs a decision — against production (matches "real" conditions but adds test load
   to shared prod) or a local full-stack replica (safer, but numbers won't be "production" numbers —
   this tradeoff should be made explicitly, not silently).
3. **[P0] Create a 2nd Keycloak publisher test account and a 3rd no-role account**, then re-run
   DUP-2, AUTH-4, AUTH-7-A-vs-B. Objective: fully confirm the scope and exact mechanics of the IDOR
   (Finding #4) and role-based access control, with real 2-tenant evidence instead of 1-account
   inference. Environment: live production Keycloak admin console (or admin API) — this is a
   configuration change (new accounts), not a destructive action, low risk.
4. **[P1] With server access now available, attempt VER-7 and VER-8** in a controlled, reversible
   way (VER-7: use a disposable/newly-created test record, not a real one; VER-8: coordinate a brief
   Anvil stop/start, confirm no data loss for anything other than the ephemeral chain state that's
   already known to be non-persistent). Requires explicit user sign-off given shared-server risk.
5. **[P1] Locate and incorporate the actual 24-requirement traceability matrix and the raw
   technical-user-evaluation data** (`Khairunnisa et al., 2026` referenced in the paper but not
   found in either repo) — without this, §8/§12 of this export cannot fully close the loop on the
   paper's Table 3 and §5.4 claims.
6. **[P2] Isolated re-run of TC-13/TC-16** (single-test invocation, not batched) to resolve the
   rate-limiting-vs-real-bug ambiguity.
7. **[P2] Backend dependency CVE scan** (`pip-audit` or equivalent) — currently zero backend
   dependency security scanning has been documented anywhere, an asymmetry versus the one-time
   frontend `npm audit`.
8. **[P3] Basic accessibility pass** (axe-core/Lighthouse) given the public-facing civic nature of
   the Verification Portal.

Why this order matters for the paper specifically: items 1-3 are the cheapest/fastest and directly
either CONFIRM or REFUTE the paper's most consequential claims (100% pass rate, the security finding
severity, and the Locust performance numbers) — they should happen before any prose is finalized.
Items 4-5 close remaining "not evaluated" gaps. Items 6-8 are hygiene/completeness, lower urgency
for the paper itself.

---

## 16A. ⚠️ CORRECTION NOTICE (supersedes provisional numbers below and in §3B/§9)

**The backend sub-agent audit (2026-09-13) obtained a materially different result than this
document's earlier draft assumed.** Earlier sections of this document (written before the backend
audit completed) stated the 2 newer test files could not be collected and were "NEVER SUCCESSFULLY
RUN." That was true only in the audit's OWN first attempt with NO env vars set. When 7 dummy env
vars were exported (`KEYCLOAK_ISSUER`, `KEYCLOAK_ISSUER_URL`, `KEYCLOAK_AUDIENCE`,
`BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, `MAX_UPLOAD_BYTES`, `DATABASE_URL`), **all 94 tests
in `tests/trustmark/` collected and ran, and ALL 94 PASSED, 0 FAILED**, confirmed twice (`-v` full
run and `--collect-only`). This is a real, reproducible result from actual test execution, not an
estimate. See §7B/§9 below for full detail. Any number elsewhere in this document that still says
"~59 tests never run" or "19/78 executable" is now STALE and superseded by this section and §7B.

## 16. RAW NUMBERS SUMMARY

**Definitions used:** "Test" = one `test_*`/`it(...)`/`test(...)` function as written in source,
counted individually even if it shares a `describe`/`class` block with others. Parametrized cases
(if any exist — pending sub-agent confirmation) will be counted as the number of actual generated
cases, noted separately from the function count.

### Backend — Unit (mocked) — **UPDATED, see §16A correction notice**
Once 7 dummy env vars were exported (see §16A), the FULL suite collected and ran cleanly:
- `test_hash_engine.py`: 7 tests — **PASS 7/7**
- `test_blockchain_connector.py`: 14 tests (NOT 8 — file has an uncommitted working-tree diff
  adding 3 new tests since the 2026-09-09 doc's count of 8; also the fixture that doc says was
  "corrected" only exists in this UNCOMMITTED diff, not in git history — see Finding D.7/#14
  below) — **PASS 14/14**
- `test_commons.py`: 4 tests — **PASS 4/4**
- `test_main_test_mode.py`: 4 tests — **PASS 4/4** (env-var blocker resolved; these are the
  TEST_MODE auth-bypass security tests, all confirm the bypass mechanism is real and still wired,
  see Finding #5)
- `test_documents.py`: 27 tests (exact, not ~25) — **PASS 27/27**
- `test_keycloak.py`: 39 tests (exact, not ~30) — **PASS 39/39**
- **Backend unit total: 94 tests, 94 PASS, 0 FAIL, 0 ERROR** (confirmed via both `-v` and
  `--collect-only`, `uv run pytest tests/trustmark -v`, 0.88s runtime). **Every one of these 94
  tests independently re-confirms — by design, most of them were written specifically to reproduce
  a known bug/finding as a passing assertion — that Findings #1 (empty issuer_id), #2 (AUTH-2 500),
  #4 (IDOR), #5 (TEST_MODE bypass) are ALL still present in the current source code, unchanged.**
  Important nuance: "94 pass" here means the tests correctly detected and documented the
  still-broken behavior (e.g. `test_missing_sub_claim_reproduces_finding_2` PASSES because it
  asserts the bug still happens) — it does NOT mean "94 tests prove the app has no bugs." See §9
  for the distinction.

### Backend — API E2E (live, 2026-09-09 data, NOT re-run this session — explicitly out of scope
for the backend sub-agent per safety instructions not to hit production without confirmed
credentials/authorization in that isolated context)
- Total: 27. Pass: 19. Fail: 3. Skipped: 2. XFailed: 3. **Status: last known, not re-verified
  2026-09-13.**

### Backend — Performance (Locust)
- No raw artifact available, and NOT executed this session (no live server target was running).
  Paper cites 3 different aggregate figures that don't mutually agree (§11). A confirmed logic bug
  exists in `verify.py` (Finding #7/D.18) that would need fixing before any future run's numbers
  could be trusted. **0 independently-verifiable performance numbers available as of this
  document.**

### Frontend — Unit (Vitest)
- **RE-CONFIRMED this session (2026-09-13)**: 30/30 pass, verbatim `npm test` output captured in `frontend-audit-raw.md` §C. Also `npx tsc --noEmit` and `npm run lint` (oxlint) both clean, exit 0.

### Frontend — E2E (Playwright, live, 2026-08-22 + 2026-09-09 data, not re-run this session)
- Golden path (2026-08-22): 4/4 pass.
- Edge cases (2026-09-09): 14 total. 10 pass. 4 fail (1 confirmed real bug, 2 inconclusive, 1
  test-expectation error, not an app bug).
- **Frontend E2E combined:** 18 tests across both suites, 14 pass, 4 fail.

### Grand total (FINAL, both sub-agent audits merged, 2026-09-13)

| Layer | Total | Pass | Fail | Skip | XFail | Re-executed this session? |
|---|---|---|---|---|---|---|
| Backend unit (`tests/trustmark/`) | 94 | 94 | 0 | 0 | 0 | **YES — this session, verbatim log in backend-audit-raw.md §C** |
| Backend API E2E (`tests/api/`) | 27 | 19 | 3 | 2 | 3 | No — last known 2026-09-09 |
| Backend Performance (Locust) | 0 raw runs available | — | — | — | — | No |
| Frontend unit (Vitest) | 30 | 30 | 0 | 0 | 0 | **YES — this session, verbatim log in frontend-audit-raw.md §C** |
| Frontend E2E (Playwright) | 18 (incl. 1 explicit skip) | ~14 | ~4 | 1 | 0 | No (blocked: missing Chromium binary locally) — last known 2026-08-22/2026-09-09, with 1 unresolved internal ambiguity (TC-16) in the source doc itself |
| **GRAND TOTAL** | **169** | **157** (or 156-158 depending on TC-16 resolution) | **7** | **3** | **3** | 124/169 (73%) re-executed and independently reconfirmed this session; 45/169 (27%) carried forward from 2026-09-09/08-22 docs, not re-verified |

**Definition check:** every number above is a count of actual `test`/`it`/`def test_` functions as
they exist in source, confirmed via `--collect-only` (backend) or direct grep+read (frontend) —
not estimates. Parametrized cases (7 in `test_keycloak.py`'s `TestFetchJwks`) are counted as
individual cases, already folded into the 94.

**What changed from the provisional estimate earlier in this document:** the original draft
(written before the backend audit completed) guessed "~59 backend tests never run." The actual
result is dramatically different and better: **all 94 backend unit tests DO run successfully once
a one-time environment-variable setup gap is fixed** — this was a test-infrastructure/DX gap, not
a sign of untested/broken code. See §16A.

---

## 17. SOURCE FILE INVENTORY

### 17B. Backend (confirmed, full table with all ~28 files in `backend-audit-raw.md` §E — key rows
reproduced here)

| Path | Lines | Purpose | Test coverage | Findings |
|---|---|---|---|---|
| `src/trustmark/main.py` | 114 | App construction, router mounting, TEST_MODE bypass, entrypoint | 4 tests | #5, #21, #22 |
| `src/trustmark/api/v1/documents.py` | 129 | register/records/verify/verify-by-hash handlers | 27 tests | #1, #4, #16, #19, #21 |
| `src/trustmark/api/v1/metrics.py` | 20 | `/health` route | 0 dedicated tests | #22 |
| `src/trustmark/infra/auth/keycloak.py` | 213 | JWT verification, Principal, roles | 39 tests | #1, #2, #15, #23 |
| `src/trustmark/infra/blockchain_connector.py` | 85 | Tx create/read/wait | 14 tests | #17, #18, #25, #26 |
| `src/trustmark/infra/commons.py` | 55 | Settings singleton, `get_env_int` | 4 tests | — |
| `src/trustmark/infra/hash_engine.py` | 17 | SHA-256 hashing + unused canonicalization | 7 tests | #16 |
| `src/trustmark/registry/models.py` | 18 | `RegistryRecord` SQLAlchemy model | indirect only, never against real DB | #32 |
| `src/trustmark/models/documents.py` | 17 | Unused Pydantic models | 0 | #14 (dead code) |
| 9 files under `src/trustmark/{api/v1,infra,services}/` | 0 each | Empty/vestigial | 0 | #33 |
| `tests/api/conftest.py` + `test_register_verify_e2e.py` | 118 + 467 | Live E2E fixtures + 27 tests | self | see §7B |
| `tests/locust/locustfiles/{health,register,verify}.py` | 27+74+118 | Load test scripts | N/A (not pytest) | #29, #30 (verify.py only) |
| `conf/settings.toml`, `docker/Dockerfile`, `docker/docker-compose.yml`, `docker/.env.example`, `pyproject.toml` | 15/52/89/24/42 | Config/build | N/A | #19, #27, #28, #20 |

Full 28-row table: `backend-audit-raw.md` §E.

### 17F. Frontend — see below (unchanged from earlier merge)

### 17F. Frontend (confirmed, full table in `frontend-audit-raw.md` §E — key rows reproduced here)

| Path | Lines | Purpose | Test coverage | Findings |
|---|---|---|---|---|
| `auth.ts` | 121 | NextAuth+Keycloak config, JWT/session/refresh callbacks | Indirect via E2E only, no unit tests | — |
| `proxy.ts` | 3 | Edge middleware, re-exports `auth` | TC-1, TC-2 | Finding #12 (stale docs call it middleware.ts) |
| `app/api/register/route.ts` | 78 | POST register: auth+validation+proxy | TC-5, TC-11b, TC-17a/b/c | Finding #8 |
| `app/api/verify/route.ts` | 62 | POST verify: validation only, no auth (by design) | TC-3, TC-7, TC-18 | — |
| `app/api/records/route.ts` | 20 | GET records: auth+proxy | NONE in E2E | Finding #11 (possible dead code) |
| `app/api/_lib/requireAuth.ts` | 24 | Shared auth-check helper | TC-17c | — |
| `app/api/_lib/parseUpload.ts` | 33 | Shared upload validation (size/type, no magic-bytes) | TC-11b (failing), TC-17a/b | Finding #8 |
| `lib/resultPayload.ts` | 39 | sessionStorage-based result payload (no query string) | Unit ×6, E2E TC-15a/b/TC-16 | — |
| `lib/i18n/translations.ts` | 504 | ID/EN dictionaries | Unit ×2, E2E TC-14 | — |
| `app/verify/page.tsx` | 7 | Dead stub route, hardcoded English | NONE | Finding #10 |
| `app/dashboard/page.tsx` | 77 | Protected dashboard, SSR records fetch | TC-6, TC-13, TC-14(2) | Finding #11, #12 |
| `components/*` (41 files, ~3,150 lines aggregate) | 3150 | UI components | Not individually inventoried this audit | `INFORMATION NEEDED` — out of scope of the explicit read list |

Full 30+ row table with every file read (config files, all lib/ helpers, all page routes, all E2E
spec files with line counts) is in `frontend-audit-raw.md` §E.

---

## 18. TEST ARTIFACT INVENTORY

| Artifact | Path | Type | Notes |
|---|---|---|---|
| UAT test plan | `frontend-for-uat/_docs/qa/uat-test-plan.md` | Markdown doc | Personas, journeys, TC-1..19 |
| Frontend E2E results (2026-09-09) | `frontend-for-uat/_docs/qa/results/frontend-test-results-2026-09-09.md` | Markdown doc | Findings + pass/fail narrative, no raw Playwright trace/report referenced as saved |
| Old QA report (HTML) | `frontend-for-uat/_docs/qa/qa-report-v1.html` | HTML | `[PENDING — content not yet read by this export, note its existence]` |
| Backend API test scenarios | `backend-for-uat/_docs/qa/api-test-scenarios.md` | Markdown doc | REG/DUP/AUTH/VER scenario definitions |
| Backend API test results (2026-09-09) | `backend-for-uat/_docs/qa/results/api-test-results-2026-09-09.md` | Markdown doc | Full findings + JWT payload excerpt appendix |
| Backend unit tests | `backend-for-uat/tests/trustmark/**` | pytest source | See §7/§16 |
| Backend API E2E tests | `backend-for-uat/tests/api/{conftest.py,test_register_verify_e2e.py}` | pytest source | Uncommitted as of this export |
| Locust config + scripts | `backend-for-uat/tests/locust/**` | Locust source | No raw run output present (`locust.log` referenced in config but file absent) |
| Frontend E2E tests | `frontend-for-uat/tests/e2e/**` | Playwright source | Includes 1 PDF fixture |
| Frontend unit tests | `frontend-for-uat/**/*.test.ts(x)` | Vitest source | `[PENDING exact file list from sub-agent]` |
| Test strategy doc | `frontend-for-uat/_docs/quality/test-strategy.md` | Markdown doc | 6-layer strategy definition |
| Status log (chronological session history) | `frontend-for-uat/_docs/status/log.md` | Markdown doc | Primary source for §6 Pass history |
| Operations handoff | `frontend-for-uat/_docs/operations/handoff.md` | Markdown doc | Infra/deploy facts, incident history |
| Local credentials (NOT to be exposed in output) | `_credentials/19-project-trustmark-pits.md` | Markdown doc, outside both repos, untracked | Referenced for account/server access only, values never reproduced in this export |

No screenshots, Playwright trace `.zip` files, HTML test reports, JSON/CSV result exports, or Locust
result files were found in either repository by this session — all documented results exist only as
prose/tables in the Markdown docs listed above, not as raw machine-readable artifacts.
`[PENDING sub-agent — double check for any `test-results/`, `playwright-report/`, or similar
gitignored-but-locally-present directories that might still exist on disk even if not committed.]`

---

## 19. FACTS THAT CHATGPT MUST NOT ASSUME

**UNKNOWN (backend, from source audit):**
- Whether a fuller git history exists upstream — this `backend-for-uat` repo copy shows only 6
  commits total, all from one "UAT release" window, no history before "Initial stakeholder UAT
  release."
- The actual deployed production chain ID / whether production's blockchain setup matches this
  repo's local-Anvil-only config exactly.
- Current production Keycloak client-scope config for `nextjs-web` — whether a `sub` mapper has
  been added since 2026-09-09 (not re-checked live this session).
- web3.py 7.16.0's default timeout for `wait_for_transaction_receipt` (Finding #26) — not
  investigated (outside this repo's own source).
- What exact "17-test set" and paper "§5.1" the uncommitted `test_blockchain_connector.py`
  docstring refers to (Finding #18) — no paper document exists inside either repo to cross-check.
- Whether `tests/api/test_register_verify_e2e.py`'s 2026-09-09 results (19/3/2/3) still hold today
  — NOT re-executed this session.
- Whether `docker/.env`/`docker/.env.save` (present on disk, not fully read this audit to avoid
  transcribing potentially-live secret material) differ meaningfully from `.env.example`.
- Whether the ~9 empty/vestigial source files represent planned-but-unbuilt features or leftovers
  from a larger private codebase this UAT export was trimmed from.

**UNKNOWN (general):**
- Production server hardware specification (CPU/RAM/disk) — never documented in any session found.
- Exact Locust invocation environment (run from the server itself vs. via SSH tunnel vs. some other
  path) used to produce the paper's Table 4 numbers.
- The actual 24-requirement traceability matrix document (`Khairunnisa et al., 2026` citation) — not
  present in either repository checked by this session.
- The raw per-tester technical-user-evaluation data (4 stakeholders × 20 cases) underlying paper
  §5.4 — not present in either repository.
- Root cause of why non-interactive SSH sessions to the production server hang without the `-tt`
  flag — a workaround was found (this conversation, 2026-09-13) but the underlying server-side
  mechanism (PAM module / shell rc script / MOTD) was not identified, only inferred.
- Whether `issuer_id`/IDOR/TEST_MODE/AUTH-2/nginx-limit findings (§9, #1-5) are still reproducible at
  the exact current HEAD of both repos — `[being addressed by sub-agent re-verification, not yet
  complete at time of this draft]`.

**NOT VERIFIED (this export):**
- Actual behavior of the public Ethereum network — not applicable, PITS explicitly uses only a local
  Anvil chain (per paper + config), no public-chain behavior was ever claimed to be tested.
- Whether the frontend/backend versions currently deployed in production exactly match the current
  git HEAD of either repo (uncommitted local changes exist in both repos per `git status` — see
  conversation history in this session).
- Whether any fix has been applied to Findings #1-5 between 2026-09-09 and now, other than what this
  session's sub-agent source re-read can directly observe in the CURRENT working tree (which may
  itself differ from what's actually deployed).

**OUT OF SCOPE (explicitly, per the paper's own text, not something this export is failing to
cover):**
- Human user study / field testing of public trust or participation impact — paper explicitly states
  this was not attempted.
- Citizen perception studies.
- Institutional adoption studies.
- Full adversarial-condition security assessment (only a narrow set of adversarial API/UI test cases
  were run, e.g. injection-like payloads in a path parameter — this is NOT a penetration test).

---

## 20. FINAL QA SELF-CHECK

- [x] **Recounted every test total against actual test files, not prior summaries.** Backend:
  94 unit tests confirmed via `--collect-only` (not an estimate). Frontend: 30 unit tests confirmed
  via `npm test` output; 18 E2E test blocks confirmed via direct grep/read of spec files. §16's
  grand total (169) is the sum of these directly-confirmed counts plus the 27 backend API E2E tests
  carried forward from the 2026-09-09 doc (not re-counted from source this session, but that count
  itself came from an actual pytest run at the time).
- [x] **Cross-checked §16 against §7's full inventory** — they match: 94 backend unit (§7B) + 27
  backend API E2E (§7B, carried-forward) + 30 frontend unit (§7F) + 18 frontend E2E (§7F) = 169.
- [x] **Flagged inconsistent numbers explicitly, did not resolve/pick one:**
  - §11: Locust's 3 mutually-inconsistent totals (8,880 abstract / 8,245 prose / 8,165 table-sum).
  - §12 row 7: the "16/17→17/17" backend fixture claim does not match ANY of (a) the 8 committed
    tests in `test_blockchain_connector.py`, (b) the 14 tests in its current uncommitted version,
    or (c) 7+8=15/7+14=21 combined with `test_hash_engine.py` — flagged as high-priority
    reconciliation needed, not resolved.
  - Frontend's own prior doc's TC-16 ambiguity (failed in one run, passed in "the final run,"
    without a clean single resolution) — reported as-is.
- [x] **No test described as "done" when only planned/written-but-never-run** — the one case where
  this was initially true (`test_documents.py`/`test_keycloak.py`) was resolved by ACTUALLY running
  them this session (94/94 pass, real result) rather than continuing to describe them as unrun;
  `tests/api/test_register_verify_e2e.py` (27 tests) and the Locust suite remain correctly labeled
  "NOT RE-EXECUTED THIS SESSION / last known result from [date]" throughout, never conflated with a
  fresh result.
- [x] **Source-code observations vs runtime observations labeled distinctly** — "Source evidence"
  vs "Runtime evidence" fields used throughout §9; §2B/§2F explicitly note what was confirmed by
  reading code vs by executing it.
- [x] **Mocked vs real-integration evidence distinguished** — §3's environment categories (A=live
  real, B=local mocked) applied consistently; §7B/§7F test tables have explicit "Mocked components"
  columns; §14 explicitly flags the total ABSENCE of any real-DB integration test as a gap.
- [x] **Current (open) vs historical (fixed) bugs distinguished** — §10 confirms NO fixes have been
  applied to any of Findings #1-33 as of this document; there is currently no "historical/fixed"
  category, correctly, because none exist yet.
- [x] **No credentials/secrets/PII exposed** — verified: no password/token/private-key VALUE appears
  anywhere in this document or either raw audit file (the backend audit deliberately did NOT
  transcribe live `.env`/`.env.save` contents, only `.env.example`'s well-known public Anvil test
  key, which is explicitly noted as non-secret). Account usernames (`uat-tester`, `test-publisher`)
  are referenced for reproducibility, their passwords are not.
- [x] **New findings this session are clearly distinguished from re-confirmed prior findings** —
  Findings #1-7 marked "RE-CONFIRMED at current HEAD, 2026-09-13" with exact matching file:line;
  Findings #8-13 (frontend) and #14-33 (backend) marked "NEW, not previously documented" throughout.

**Final tallies for this document:** 33 total findings in the master register (§9), 169 total test
functions inventoried (§16), 2 source repos fully read (not sampled) for every file listed in the
audit scope, 2 real test-execution passes performed THIS session (94 backend + 30 frontend, both
100% pass) in addition to the historical passes 1-4 carried forward with clear "last known" labeling.

---

*End of document. This export, plus the two backing raw audit files
(`backend-audit-raw.md`, `frontend-audit-raw.md`), together constitute the complete factual record
for ChatGPT to draft the 4 HTML deliverables from. Every "INFORMATION NEEDED" marker in this
document is an intentional, honest gap — not something to be filled with an assumption downstream.*
