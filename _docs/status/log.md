# Status — PITS Frontend

File ini diupdate Claude Code **setiap sesi kerja selesai**. Entry terbaru selalu ditambah di **paling atas** (append, jangan timpa/hapus entry lama).

---

## [2026-09-07 20:00] — Claude Code

- **Progress**: Google login diaktifkan (diminta user) + fitur UI baru (avatar akun + modal info login). Ditemukan & difix 1 bug baru (user Google baru tidak dapat role `publisher`) dan 1 keputusan keamanan (auto-approve semua domain, dikonfirmasi user untuk fase UAT).
- **Selesai sesi ini**:
  - **Google Identity Provider terpasang** di realm `nextjs-kc` via admin API — OAuth Client baru "PITS Keycloak" dibuat terpisah dari client `n8n Kreen AI` yang sudah ada (project Google Cloud sama: `kreen-ai`, tapi Client ID/Secret beda, sengaja dipisah per keperluan). Tombol "Sign in with Google" langsung muncul di halaman login Keycloak, redirect ke Google terverifikasi jalan sampai halaman consent asli.
  - **Bug ditemukan & difix**: user baru yang login via Google (`laksa.dev.kreen@gmail.com`, auto-provisioned oleh Keycloak lewat "First Broker Login") cuma dapat role `default-roles-nextjs-kc`, TIDAK dapat role `publisher` → dashboard gagal muat ("403 Forbidden" dari backend, sama gejala dengan bug 401 sebelumnya tapi beda root cause). Role di-assign manual untuk user ini.
  - **Keputusan desain diambil (dikonfirmasi user)**: karena native self-registration sudah dimatikan (`registrationAllowed: false`), satu-satunya jalur user baru adalah lewat Google — jadi role `publisher` dijadikan **default role realm** (`default-roles-nextjs-kc` composite ditambah `publisher`), supaya semua login Google berikutnya otomatis dapat akses tanpa perlu di-assign manual. User diberi tahu risikonya (siapa pun dengan akun Google bisa jadi publisher) dan tetap memilih opsi ini untuk fase UAT.
  - **Fitur baru**: avatar akun di header (`components/layout/AccountModal.tsx`) — klik membuka modal kecil menampilkan email yang dipakai login + badge metode login (Google/Password). Metode login dideteksi dari klaim `identity_provider` di ID token Keycloak (butuh protocol mapper baru `oidc-usersessionmodel-note-mapper` di client `nextjs-web`, dipasang via admin API) — didekode manual di `auth.ts` `jwt()` callback karena next-auth's built-in Keycloak provider cuma mapping subset klaim standar. Menggantikan desain awal (badge inline di navbar) atas revisi user.
  - `npx tsc --noEmit`, `oxlint`, `npm test` (30/30) tetap hijau.
  - **Git cleanup**: ditemukan (atas pertanyaan user) trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` di 3 commit baru sesi saya + 1 commit lama (`test: add Playwright E2E suite...`, sudah lama ter-push & ter-merge ke `main`) — project ini sudah punya aturan eksplisit sejak lama (lihat log `[2026-08-02 09:00]`) untuk TIDAK menyertakan atribusi AI di commit manapun. Dibersihkan pakai `git filter-branch --msg-filter` (bukan `rebase -i`, tidak didukung), lalu `git push --force-with-lease` ke `feature/uat-readiness`. Commit yang sama di `main` (via merge PR #2) **belum dibersihkan** — perlu keputusan eksplisit user dulu karena berdampak ke branch bersama/production.
- **Blocker/keputusan dibutuhkan**: konfirmasi user soal bersihkan `main` juga atau dibiarkan. User belum konfirmasi hasil test login Google end-to-end dengan kode terbaru (avatar+modal) — perlu logout+login ulang karena token lama tidak punya klaim `identity_provider`.
- **Next steps**: tunggu user test ulang login Google dengan UI baru; tindak lanjuti keputusan `main` branch.

## [2026-09-07 19:10] — Claude Code

- **Progress**: Lanjutan sesi akses (di atas) — user minta kerjakan backlog item #1-4 (nginx cleanup, fix drift port binding, rebuild Dockerfile, bump Node), plus 2 fitur baru (footer versi, disclaimer blockchain). Semua selesai & dideploy production.
- **Selesai sesi ini**:
  - **Rebuild Dockerfile frontend**: `Dockerfile` multi-stage (`deps`→`builder`→`prod-deps`→`runner`) ditambahkan ke repo + `.dockerignore`, `docker-compose.yml` di server diganti pakai `build:` context. Container start ~260ms (dulu ~70 detik npm install+build tiap restart). Commit `716e17b`.
  - **Bump Node**: Dockerfile `node:20-alpine` → `node:22-alpine`, build bersih tanpa `EBADENGINE`. Commit `20bc1a8`.
  - **Fix drift Docker port binding**: Postgres/Keycloak/Anvil/backend-app di server (`backend-for-uat/docker/docker-compose.yml`) diganti bind `127.0.0.1` (dari `0.0.0.0`). **Insiden minor saat eksekusi** (langsung tertangani, tidak ada data hilang): compose file di server kehilangan baris `name: trustmark` dibanding repo git, jadi `--force-recreate` pertama sempat membuat project/container Docker baru bernama `docker-*` (gagal sendiri karena port bentrok sebelum sempat jalan) — dibersihkan, baris `name: trustmark` ditambahkan balik, retry sukses.
  - **Bug baru ditemukan & difix saat verifikasi fix di atas**: menutup port 8080 Keycloak dari publik bikin backend 503 `Authentication provider unavailable`, karena `KEYCLOAK_ISSUER_URL` (internal `http://keycloak:8080/...`) memicu Keycloak balas `jwks_uri` pakai hostname publik (`KC_PROXY=edge`) yang sebelumnya cuma "kebetulan jalan" karena port itu masih terbuka. Fix: `KEYCLOAK_ISSUER_URL` diarahkan ke domain publik HTTPS, sama seperti `KEYCLOAK_ISSUER`. Backup: `docker/.env.bak-20260906-issuerurl-fix`.
  - **Nginx cleanup**: `keycloak.conf` + `pits-backend.conf` ternyata punya bug `proxy_buffer_size` yang sama dengan `pits-ui.conf` (temuan sesi sebelumnya) — sudah difix di keduanya. 3 file nginx mati (`pits-ui.conf.bak`, `.oke-v1`, `.with-v1`) dihapus. Sub-item "friendly 404 untuk `GET /api/v1`" di-skip (kosmetik, prioritas rendah).
  - **Footer versi** (fitur baru, diminta user): `PITS · v1.0.0` di semua halaman via `app/layout.tsx` (root layout) — konsisten dengan pola versioning produk kerenevent.com lain (angka belakang = update kecil, angka depan = perubahan besar). Sumber version: `lib/version.ts`. Commit `6a05d53`.
  - **Disclaimer blockchain** (fitur baru): label "Ethereum" di `RecordDetailDrawer.tsx` (drawer detail dokumen) diganti "Ethereum (Testnet Lokal)" + catatan bahwa ini jaringan uji lokal (Anvil, chain ID `31337`, `web3_clientVersion: anvil/v1.8.1`), bukan Ethereum publik — dikonfirmasi user sebelumnya tidak sadar ini bukan mainnet asli. Commit `6a05d53` (sama dengan footer).
  - `npx tsc --noEmit` dan `npm test` (30/30) tetap hijau setelah semua perubahan kode.
- **Blocker/keputusan dibutuhkan**: tidak ada.
- **Next steps**: backlog tersisa cuma Google login (opsional, belum diminta eksekusi) dan friendly-404 kosmetik `GET /api/v1` (skip). Project docs `_docs/quality/release-checklist.md`, `_docs/quality/test-strategy.md`, `_docs/security/security-baseline.md`, `CLAUDE.md` (modified), dan `_docs/operations/` masih **belum di-commit** — sengaja dibiarkan (di luar scope sesi ini, user pilih commit terpisah untuk Dockerfile saja).

## [2026-09-07 18:40] — Claude Code

- **Progress**: User melaporkan tidak bisa login/registrasi sama sekali di production ("error, ga bisa masuk"). Investigasi menemukan **3 bug produksi terpisah** yang bertumpuk, semua sudah di-fix & diverifikasi end-to-end (login → dashboard → upload dokumen → tercatat di blockchain).
- **Selesai sesi ini** (urutan ditemukan):
  1. **Env fix sesi sebelumnya tidak pernah benar-benar aktif** — `.env.local` di disk sudah benar dari sesi `[2026-09-07]` di atas, tapi container `frontend-for-uat-frontend-1` cuma di-`restart`, bukan di-*recreate*. Docker `env_file` cuma dibaca sekali saat container dibuat; restart biasa tidak reload env dari file. Dibuktikan: `docker exec ... printenv` menunjukkan container masih pakai `PITS_BACKEND_REGISTER_URL=https://pits.pangkalandata.id/api/v1/records/register` (path lama/salah), padahal file sudah benar. **Fix**: `docker compose up -d --force-recreate frontend`.
  2. **Backend menolak semua token asli dengan `401 Invalid issuer`** — token JWT dari login Keycloak asli (via domain publik `https://keycloak.pangkalandata.id/realms/nextjs-kc`) punya klaim `iss` sesuai domain publik, tapi backend (`trustmark-trustmark-app-1`) divalidasi terhadap `KEYCLOAK_ISSUER=http://localhost:8080/realms/nextjs-kc` (env lama, tidak pernah diupdate ke domain production). Dibuktikan dengan decode JWT + curl langsung ke backend (`{"detail":"Invalid token Invalid issuer"}`). **Fix**: `docker/.env` backend `KEYCLOAK_ISSUER` → `https://keycloak.pangkalandata.id/realms/nextjs-kc` (backup: `docker/.env.bak-20260906-issuer-fix`), recreate `trustmark-trustmark-app-1`. `KEYCLOAK_ISSUER_URL` (dipakai fetch JWKS, boleh internal `http://keycloak:8080/...`) tidak diubah, sengaja dibiarkan beda dari `KEYCLOAK_ISSUER`.
  3. **Nginx `upstream sent too big header`** — request GET/POST ke `pits-ui.pangkalandata.id` (termasuk callback login OAuth) gagal 502 karena `/etc/nginx/conf.d/pits-ui.conf` tidak punya `proxy_buffer_size`/`proxy_buffers` sama sekali (pakai default nginx yang kekecilan untuk cookie session NextAuth+Keycloak yang cukup besar). Terjadi berulang sejak jam 18:00 (terlihat di `/var/log/nginx/error.log`, client asli `36.77.253.72`). **Fix**: tambah `proxy_buffer_size 16k; proxy_buffers 4 32k; proxy_busy_buffers_size 64k;` + `large_client_header_buffers 4 32k;` (backup: `/etc/nginx/conf.d/pits-ui.conf.bak-20260906-bufferfix`), `nginx -t` lolos, `nginx -s reload`.
  - **Sebab lain ditemukan (bukan bug, konfigurasi by design)**: realm `nextjs-kc` punya `registrationAllowed: false` dan `resetPasswordAllowed: false` — tidak ada self-registration/self-reset password. Semua akun harus dibuatkan manual oleh admin lewat Keycloak console. Dibuatkan 1 akun test baru `uat-tester` (role realm `publisher` di-assign) untuk keperluan verifikasi sesi ini — kredensial ada di `_credentials/19-project-trustmark-pits.md`.
  - **Verifikasi end-to-end**: login browser asli sebagai `uat-tester` → redirect Keycloak → dashboard tampil "Dokumen Terdaftar" (2 dokumen, status Normal) → upload PDF dummy via `curl` ke `/api/v1/register` sukses (`stored: true`, dapat `record_id` + `transaction_hash` blockchain Anvil).
- **Blocker/keputusan dibutuhkan**: tidak ada. Semua fix di atas sudah diverifikasi hidup di production.
- **Next steps**: backlog lama di `handoff.md` masih berlaku (nginx dedupe `proxy_pass`, fix drift Docker port binding, rebuild Dockerfile frontend biar tidak build ulang tiap restart — **ini yang sedang dikerjakan lalu ditunda user untuk prioritaskan akses dulu**, siap dilanjutkan). Pertimbangkan juga: cek subdomain lain di server yang sama (`pits.pangkalandata.id`) apakah punya `proxy_buffer_size` yang sama kurangnya.

## [2026-09-07] — Claude Code

- **Progress**: Sesi produksi — dikasih akses SSH server production (`209.58.160.63`) + sudo, Keycloak admin, dan investigasi root cause bug register/verify yang selalu gagal. Handoff lengkap: `_docs/operations/handoff.md`.
- **Selesai sesi ini**:
  - **Koreksi penting**: dikonfirmasi repo yang benar-benar live di production adalah `frontend-for-uat` + `backend-for-uat` (branch `main`), **bukan** `V2-Frontend` — sempat salah asumsi di awal sesi.
  - **Bug 404 register/verify — FIXED & terverifikasi di production**: root cause `.env.local` production salah path (`.../api/v1/records/register` & `.../records/verify`, harusnya tanpa `/records`). Dikonfirmasi via log container backend (`trustmark-trustmark-app-1`) yang menunjukkan 404 berulang untuk path salah, dan endpoint yang benar berhasil. Fix diterapkan (backup: `.env.local.bak-20260907` di server), container `frontend-for-uat-frontend-1` di-restart, hasil re-test: `verify` → `415` (validasi PDF, benar), `register` → `401` (butuh login, benar) — bukan 404 lagi.
  - Arsitektur `/api/v1` didokumentasikan: ada 2 makna beda domain (`pits.pangkalandata.id/api/v1/*` = backend asli; `pits-ui.pangkalandata.id/api/v1/*` = alias legacy nginx ke route internal Next.js) — sumber kebingungan awal sesi, sekarang tercatat di `handoff.md`.
  - Ditemukan (belum difix, masuk backlog di `handoff.md`): nginx config `pits-ui.conf` ada duplikasi + file bekas eksperimen tidak dipakai; drift Docker port binding (Postgres/Keycloak/Anvil bind `0.0.0.0` padahal compose repo sudah `127.0.0.1`, mitigasi sementara oleh `firewalld`); container frontend `npm install`+build ulang tiap restart (~70 detik downtime).
  - Verifikasi keamanan SSH sebelum eksekusi apa pun: `fail2ban` tidak aktif, `pam_faillock` tidak dikonfigurasi, firewall eksplisit izinkan service `ssh` — dikonfirmasi tidak ada risiko lockout dari aktivitas sesi ini.
  - Kredensial (SSH, sudo, Keycloak admin, Postgres, Anvil key) dicatat lengkap di `_credentials/19-project-trustmark-pits.md` (lokal, di luar repo — **sengaja tidak** ditaruh di `_docs/` karena repo ini public/shared).
  - Dibahas (belum dieksekusi): tambah Google login via Keycloak Identity Provider (realm `nextjs-kc` dicek kosong, belum ada IdP apa pun) — tidak perlu ubah kode, tinggal pasang Client ID/Secret Google di Keycloak begitu user buat.
- **Blocker/keputusan dibutuhkan**: rename subdomain `pits` → `pits-api` di-skip permanen — user tidak punya akses DNS registrar (`dns-parking.com`).
- **Next steps**: lanjutkan backlog di `handoff.md` (nginx cleanup, fix drift port binding, rebuild Dockerfile frontend) — user sudah konfirmasi 0 user real jadi risiko rendah untuk lanjut beres-beres.

## [2026-08-22 14:40] — Claude Code

- **Progress**: UAT test suite golden path — persona/journey diformalkan + E2E test suite baru dibuat dan dijalankan, plus manual browser walkthrough penuh (register → dashboard → verify round-trip).
- **Selesai sesi ini**:
  - Backend stack (`../backend-for-uat`) dijalankan via `docker compose` (postgres, Keycloak, Anvil, trustmark-app), `docker/.env` dibuat dari `.env.example`. Frontend `.env.local` dibuat (Keycloak `nextjs-web` + backend URL lokal). Karena port 3000 dipakai layanan lain di mesin ini (WAHA), frontend dijalankan di port 3080 — client Keycloak `nextjs-web` diupdate via admin API untuk menambah redirect URI/webOrigin `localhost:3080` (selain `localhost:3000` yang sudah ada, tidak dihapus).
  - `_docs/qa/uat-test-plan.md` dibuat: persona (Publisher, Verifier — memformalkan ulang `_docs/brd/brd-core.md` §3-4), user journey, dan test case matrix (TC-1..TC-9) yang memetakan ke `_docs/srs/fr-publisher-portal.md` §Testing Plan (sebelumnya manual-only, sekarang sebagian tertutup E2E).
  - Playwright E2E suite baru: `playwright.config.ts` + `tests/e2e/{auth-guard,verifier-journey,publisher-journey}.spec.ts` (+ fixture `sample-document.pdf`), script `npm run test:e2e`. Dev dependency `@playwright/test` ditambah (paket `playwright` inti sudah ada, dipakai Vitest browser mode). **4/4 test pass**, dijalankan 2x berturut untuk cek stabilitas (tidak flaky).
  - **Bug ditemukan & difix di test, bukan di app**: locator `getByRole('button', { name: 'Verifikasi Dokumen' })` tanpa `exact: true` collide dengan accessible name logo header ("...Verifikasi Dokumen" ada di teks logo BRIN) — strict mode violation Playwright. Bukan bug aplikasi.
  - **Temuan infra penting**: `npm run dev` (webpack watch) meng-cover seluruh project tree, jadi kalau Playwright menulis artifact (`test-results/`, `playwright-report/`, fixture sementara) ke dalam folder project, itu memicu Fast Refresh full-reload di tengah test yang mereset state client (file terpilih hilang) — kelihatan seperti "klik tidak bekerja"/redirect loop palsu. Fix: `playwright.config.ts` `outputDir`/report + fixture sementara di `publisher-journey.spec.ts` ditulis ke `os.tmpdir()`, bukan ke dalam repo.
  - **Temuan lain (bukan bug, catatan environment)**: akun `test-publisher` dari realm export butuh one-time "Update Account Information" (Keycloak required action, isi First/Last name) di login pertama — sudah diselesaikan manual via browser, tidak terulang lagi untuk akun ini. Test E2E otomatis mengasumsikan required action ini sudah tidak aktif (tidak menghandle-nya) — kalau realm/volume Keycloak di-reset, langkah ini perlu diulang manual dulu sebelum re-run suite.
  - Manual walkthrough via browser tool (bukan cuma automated): registrasi dokumen asli end-to-end sukses (record ID + content hash + transaction hash blockchain tampil di `/result/success`), dashboard menampilkan dokumen ter-registrasi (`Total Dokumen: 1`, status "On-chain"). Satu observasi kecil (bukan blocker): dashboard menampilkan "Publisher tidak diketahui" untuk kolom publisher — backend `/api/v1/records` kemungkinan tidak mengirim identitas issuer yang bisa dipetakan frontend; belum diinvestigasi lebih lanjut, di luar scope sesi ini.
  - `npm test` (Vitest unit, 30/30) tetap hijau setelah semua perubahan — tidak ada regresi.
- **Blocker/keputusan dibutuhkan**: tidak ada blocker. Realm Keycloak sekarang punya 2 redirect URI terdaftar (3000 & 3080) — kalau frontend akhirnya selalu dijalankan di port lain, sebaiknya port 3000 dibebaskan lagi di mesin dev supaya tidak perlu port alternatif.
- **Next steps**: skenario yang belum diotomasi (lihat `_docs/qa/uat-test-plan.md` §3): validasi upload >20MB/non-PDF (413/415), refresh token expiry, toggle i18n EN, logout flow penuh. `.env.local` lokal tidak dikomit (sesuai `.gitignore`) — kalau UAT dipindah ke mesin/CI lain, env var perlu diisi ulang manual mengikuti `ONBOARDING.md`.

## [2026-08-02 09:00] — Claude Code

- **Progress**: Sinkronisasi dokumentasi menyeluruh atas permintaan user ("update semua md tanpa terkecuali") — memastikan semua `.md` di repo konsisten dengan state kode terkini (setup test Vitest, validasi upload server, `sessionStorage` result payload, `requireAuth.ts`, `lucide-react` dihapus). Juga verifikasi git/GitHub attribution atas pertanyaan user.
- **Selesai sesi ini**:
  - Grep seluruh `*.md` di repo untuk kata kunci stale (`jest`, `resultPayload`/`query string`, `lucide`, `parseUpload`/validasi) — ditemukan 8 file dengan referensi usang.
  - **Diupdate**: `CLAUDE.md` (root — testing section, constitution query-string, aturan kritis jest→vitest+requireAuth), `README.md` (root — tree struktur folder disinkronkan penuh dengan struktur aktual saat ini, bukan cuma testing section; tree lama masih menyebut `components/features/`/`ui/` yang sudah dihapus sejak 2026-08-01), `ONBOARDING.md` (5 poin "paling penting" diupdate + prioritas kerja), `_docs/referensi/coding-standards.md` (§1 testing, §3 upload/result payload/auth route protection), `_docs/architecture/system-overview.md` (resultPayload, catatan `proxy.ts` tidak proteksi `/api/*` + `requireAuth.ts`), `_docs/srs/fr-publisher-portal.md` (data flow, validation rules table, security checklist — 2 dari 3 checkbox yang tadinya kosong sekarang tercentang), `_docs/srs/nfr.md` (keamanan, performance, constraint teknis), `_docs/brd/brd-core.md` (tabel risiko ditambah kolom Status + 1 risiko baru untuk validasi server, keputusan test runner difinalkan), `_docs/audit/audit-2026-07-31.md` (ditambah catatan status resolusi di atas — **tidak** mengubah temuan asli, itu snapshot historis), `_docs/README.md` (tanggal).
  - **Sengaja TIDAK diubah**: `_docs/status/log.md` & `_docs/tasks/tasks.md` (sudah disinkronkan di entry sebelumnya), `_docs/quality/*.md` & `_docs/ai/review-checklist.md` (aturan generik, tidak stale), dokumen `_docs/design/*.md` lain (di luar scope perubahan sesi ini, sudah disinkronkan sesi-sesi desain sebelumnya), `CONTRIBUTE.md` (tidak menyebut jest/lucide/resultPayload sama sekali).
  - Diverifikasi ulang setelah semua edit dokumentasi: `tsc --noEmit`, `oxlint`, `npm test` (30/30) tetap bersih — dokumentasi tidak menyentuh kode tapi dipastikan tidak ada regresi tidak sengaja.
  - **Cek atribusi Git/GitHub** (dipicu pertanyaan user): `git log --all --grep` untuk "claude"/"anthropic" — nihil, tidak ada trailer `Co-Authored-By: Claude` di commit manapun (aturan global sudah diikuti sejak awal). Repo (`origin` → `github.com/DELTA-PITS/frontend-for-uat.git`) dicek dengan `git fetch` + `git status -sb`: branch kerja (`redesign/ui-i18n-layout-mobile`) **belum pernah di-push**, tidak ada tracking branch di remote. Jadi belum ada risiko atribusi AI muncul di GitHub sama sekali — karena memang belum ada yang di-push.
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: semua perubahan (kode dari sesi 08:00 + dokumentasi sesi ini) masih **belum di-commit**. Kalau mau di-push ke GitHub, commit dulu (tanpa co-author trailer, sesuai aturan global) baru `git push -u origin redesign/ui-i18n-layout-mobile`.

---

## [2026-08-02 08:00] — Claude Code

- **Progress**: 5 item backlog security/quality dikerjakan sekaligus atas permintaan user: #2b (validasi upload server), #3 (setup test), #6 (proteksi API), #7 (hash/record ID di query string), #9b (dependency tidak terpakai). Diverifikasi type-check, lint, 30 unit test baru (semua lulus), dan cek visual di browser untuk perubahan yang observable.
- **Selesai sesi ini**:
  - **#2b — Validasi upload server-side**: `app/api/_lib/parseUpload.ts` diubah dari `File | null` ke `ParseUploadResult` diskriminatif (`{ ok: true, file, filename } | { ok: false, status, message }`), menolak file >20MB (413) dan non-PDF berdasar ekstensi+MIME (415), mencerminkan aturan yang sudah ada di client `Dropzone`. `register`/`verify` route diupdate untuk consume shape baru dan meneruskan `status`/`message` apa adanya — client sudah otomatis menampilkan pesan yang tepat karena `uploadErrorMessage.ts` sudah punya mapping 413/415.
  - **#3 — Setup test**: `jest.config.ts` (0 test file, environment salah) dihapus beserta dependency `jest`/`jest-environment-jsdom`/`@types/jest`/`ts-node` (`ts-node` cuma dipakai untuk load config Jest itu). `vitest.config.ts` ditambah project `unit` (environment `jsdom`) plus `resolve.alias` yang mencerminkan `tsconfig.json` paths (`@lib`, `@components`, dst — Vitest tidak baca tsconfig otomatis). `package.json#test` → `vitest run --project unit`. 30 unit test baru: `lib/resultPayload.test.ts`, `lib/dateFormat.test.ts`, `lib/fileExtension.test.ts`, `lib/fileSizeCalc.test.ts`, `lib/uploadErrorMessage.test.ts`, `lib/i18n/translations.test.ts` (parity key ID vs EN + no-empty-string check), `hooks/useUpload.test.ts` (alur register sukses, `already_existed` → failure, submit tanpa file). Ketemu 1 gotcha saat setup: `jsdom` package ternyata hanya ada di node_modules sebagai transitive dependency dari `jest-environment-jsdom` yang baru dihapus — jadi harus ditambah eksplisit sebagai devDependency, bukan asumsi "sudah ada".
  - **#6 — Proteksi API**: dianalisis dulu — `authorized()` callback di `auth.ts` cuma proteksi `/publisher` & `/dashboard` (redirect ke halaman sign-in), TIDAK proteksi `/api/*`. Tapi `register`/`records` route sudah punya pengecekan `auth()` manual di handler. Menambah proteksi lewat `proxy.ts`/middleware dianggap **berisiko** — kalau `authorized()` reject, NextAuth redirect ke halaman HTML, padahal client fetch API mengharapkan JSON, berpotensi merusak alur upload yang sudah jalan. Solusi yang dipilih: ekstrak pengecekan yang terduplikasi jadi `app/api/_lib/requireAuth.ts` (satu sumber kebenaran, defense-in-depth via konsistensi bukan lewat middleware). **Temuan sampingan**: `app/api/records/route.ts` ternyata tidak dipakai sama sekali — `app/dashboard/page.tsx` fetch `PITS_BACKEND_RECORDS_URL` langsung server-side, bukan lewat route internal ini. Tetap diupdate untuk konsistensi tapi dead-code-nya dibiarkan (di luar scope task ini, layak jadi item backlog baru kalau mau dibersihkan).
  - **#7 — Hash/record ID di query string**: `lib/resultPayload.ts` dirombak dari `buildResultHref`/`parseResultPayload` (JSON di query string `?payload=...`) jadi `buildResultHref`/`readResultPayload` berbasis `sessionStorage` (key `pits:resultPayload`) — href sekarang `/result/<status>` polos, tanpa data sensitif di URL/browser history/server access log. `ResultView.tsx` diubah dari `useSearchParams()`+`useMemo` (SSR-safe karena query string ada di server) jadi `useState`+`useEffect` (perlu `useEffect` karena `sessionStorage` cuma ada di client — kalau baca lewat `useMemo` langsung, hasil SSR (`null`) vs client-pertama (`window` sudah ada) akan beda dan bikin hydration mismatch). Diverifikasi di browser: halaman `/result/success` render tanpa error React, tidak crash.
  - **#9b — Dependency tidak terpakai**: `lucide-react` (0 import di seluruh kode) dihapus dari `package.json`.
  - Dokumentasi disinkronkan: `tasks/tasks.md` (5 item dipindah ke "Selesai" dengan detail implementasi).
- **Temuan sampingan (bukan bug baru, sudah ada sebelumnya)**: `ResultView.tsx` — kondisi banner "Data ini bukan untuk halaman hasil ini" (`payload?.status !== status`) ternyata true juga kalau `payload` itu `null` (belum ada data sama sekali, misal user refresh halaman `/result/success` langsung tanpa lewat flow upload) — bukan cuma saat benar-benar mismatch status. Perilaku ini identik dengan kode lama (query-string based), jadi bukan regresi dari perubahan #7, tapi layak jadi item backlog kecil kalau mau dirapikan (tambah pengecekan `payload &&` di depan kondisi).
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: `4 high severity vulnerabilities` muncul di `npm audit` setelah `npm uninstall` (pre-existing, bukan dari paket yang baru ditambah/dihapus sesi ini) — belum diinvestigasi, disarankan `npm audit` terpisah kalau mau ditindaklanjuti. Backlog lama masih terbuka: #4 (CI linting), #5 (upgrade next-auth), #8 (.env.example), #11 (nasib route /verify placeholder), plus temuan baru sesi ini (dead code `app/api/records/route.ts`, banner mismatch saat payload null).

---

## [2026-08-02 07:00] — Claude Code

- **Progress**: Update status saja, tidak ada perubahan kode. Blocker Keycloak (task #22) sudah diselesaikan Ersa di luar sesi coding.
- **Selesai sesi ini**:
  - Task #22 (post-logout redirect URI Keycloak belum terdaftar, logout error "Invalid redirect uri") dikonfirmasi Ersa sudah diperbaiki & disimpan di admin console Keycloak. Dipindah dari "Belum Dikerjakan" ke "Selesai" di `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada lagi blocker terbuka untuk item ini.
- **Next steps**: disarankan uji ulang alur logout end-to-end (klik Keluar → cek tidak ada lagi error "Invalid redirect uri" dari Keycloak) untuk konfirmasi fix berfungsi. Backlog lain masih terbuka seperti tercatat di entry sebelumnya (#2b, #3, dll).

---

## [2026-08-02 06:00] — Claude Code

- **Progress**: Lanjutan sesi session-auth — 3 pekerjaan terpisah: (1) polish UI kecil (sub-nav sembunyi saat logout, desain ulang box upload Dropzone), (2) audit & revisi copywriting UX (2 ronde, dipicu masukan ChatGPT eksternal user), (3) audit arsitektur komponen + refactor konsolidasi + fix 1 bug tersembunyi. Semua diverifikasi type-check bersih dan visual di browser.
- **Selesai sesi ini**:
  - **UI kecil**: sub-nav "Layanan Dokumen" sekarang cuma render kalau ada >1 link (dulu tampil dengan 1 tab kosong pas belum login) — `Header.tsx`. FAQ accordion: area klik dilebarkan ke seluruh kotak (padding dipindah dari div ke `<button>`), icon panah diganti `ExpandMoreIcon` (MUI) — `FAQSection.tsx`.
  - **Redesign Dropzone**: dari gaya dashed-border 2018 ke border solid + icon badge lingkaran + teks 1 baris ringkas — `Dropzone.tsx`. Proses ini menemukan **bug tersembunyi daisyUI**: `.card-body p { flex-grow: 1 }` bikin `<p>` di dalam `OperationCard` melar aneh kalau jadi flex-item di container sendiri — awalnya ditambal lokal di `Dropzone.tsx`, lalu di sesi ini dipindah jadi fix permanen di `OperationCard.tsx` (`[&_p]:grow-0` di div `card-body`) supaya kelas bug ini tidak muncul lagi di komponen manapun ke depan.
  - **Copywriting UX — 2 ronde revisi penuh** ke `lib/i18n/translations.ts` (ID & EN), dipicu 2 audit terpisah dari ChatGPT (user minta dump semua teks ke markdown untuk dibawa ke sana). Ronde 1: rombak subtitle/heading/CTA di hampir semua section (Header, Verify/Register Hero, Tips, How It Works, FAQ, Dashboard, Result, error messages) — istilah "sidik jari digital" diganti "hash" secara konsisten. Ronde 2 (audit ulang dari nol, skor naik dari 9.3 ke 9.8/10): **unifikasi terminologi "Publisher"** (hapus semua "Penerbit"), dropzone kasih konteks tipe file eksplisit, beberapa kalimat dibuat kurang birokratis. Ditemukan & diperbaiki 1 inkonsistensi lolos ronde 1: `registerHero.title` masih "Registrasi Dokumen" padahal nav sudah "Daftarkan Dokumen" (dilaporkan user lewat screenshot).
  - Dokumentasi referensi teks (`_docs/referensi/teks-ui-id-en.md`, baru dibuat ronde 1) diperbarui 2x supaya selalu sinkron dengan `translations.ts` — juga jadi tempat mencatat 4 aturan konsistensi terminologi permanen (hash / blockchain / Publisher / Record ID).
  - **Audit arsitektur komponen** (diminta user: "apakah design system sudah diterapkan konsisten, ada kode berulang yang bisa disatukan?") menemukan: Header sudah benar-benar reusable (1x mount di root layout); Footer TIDAK ada isinya (`<footer />` kosong di `app/layout.tsx`, bukan bug, cuma belum diisi); `VerifyHero.tsx`/`RegisterHero.tsx` adalah 2 file JSX ~95% identik yang disinkronkan manual (ada komentar eksplisit "jangan ubah salah satu tanpa menyamakan yang lain" — tanda jelas seharusnya 1 komponen); `TipsCard.tsx`/`RequirementCard.tsx` juga duplikat pola "card + heading + bullet list".
  - **Refactor konsolidasi** (setelah user konfirmasi "kerjakan semuanya 1-3 termasuk bugnya"): `PageHero.tsx` (baru, `components/common/`) — `VerifyHero`/`RegisterHero` sekarang thin wrapper yang lempar copy+ikon+accent ke situ. `InfoListCard.tsx` (baru, `components/common/`) — `TipsCard`/`RequirementCard` sekarang thin wrapper dengan prop `headingIcon?`/`columns`/`bullet`. `design-system.md` §4 diupdate: 2 komponen baru dicatat, gotcha daisyUI didokumentasikan eksplisit biar tidak terulang.
- **Blocker / butuh keputusan dari Ersa**: tidak ada yang baru sesi ini. Item lama masih terbuka: Keycloak post-logout redirect URI (task #22, butuh klik manual di admin console — lihat entry 03:00 di bawah).
- **Next steps**: kalau mau, isi `<footer />` yang masih kosong di `app/layout.tsx` (bukan urgent, cuma temuan audit). Belum di-commit — tunggu konfirmasi user sebelum commit.

---

## [2026-08-02 03:00] — Claude Code

- **Progress**: Audit sesi login/logout (dipicu laporan user: `/publisher` masih terlihat setelah logout, back button menampilkan Dashboard lama, logout Keycloak error "Invalid redirect uri") disusun jadi dokumen, lalu diimplementasikan penuh setelah user konfirmasi "ok implementasi". Ditemukan 1 koreksi penting terhadap audit sendiri saat implementasi. Diverifikasi type-check, lint, dan langsung di browser.
- **Selesai sesi ini**:
  - **Koreksi penting ditemukan saat implementasi**: mencoba menambah `middleware.ts` bikin dev server GAGAL start — ternyata project ini sudah pakai **Next.js 16**, yang mengganti konvensi `middleware.ts` jadi `proxy.ts`. File `proxy.ts` **sudah ada** sejak awal, sudah meng-export `auth as proxy` dengan matcher yang mencakup hampir semua route — artinya `authorized()` callback di `auth.ts` **sudah aktif sepanjang waktu**, bukan dead code seperti dugaan awal audit. `middleware.ts` yang sempat dibuat langsung dihapus lagi. Root cause asli yang dilaporkan user 100% adalah fenomena back/forward cache (bfcache) browser, bukan celah proteksi route.
  - **Auth guard eksplisit (defense-in-depth)** ditambah di `app/publisher/page.tsx` dan `app/dashboard/page.tsx` — keduanya sekarang `redirect('/')` kalau tidak ada sesi, plus `export const dynamic = 'force-dynamic'` supaya halaman tidak pernah di-cache. `app/publisher/page.tsx` diubah dari client component murni jadi async Server Component; JSX aslinya dipindah ke `components/register/PublisherPortalClient.tsx`.
  - **`BfcacheRefresh`** (komponen baru, `components/layout/BfcacheRefresh.tsx`) — listener global `pageshow`, kalau `event.persisted` true (halaman dipulihkan dari bfcache, misal lewat tombol back) langsung `router.refresh()` supaya data/sesi selalu ke-cek ulang. Di-mount sekali di `app/layout.tsx`.
  - **Redirect target login diarahkan ke Verify**: `auth.ts` ditambah `pages: { signIn: '/' }` — user tanpa sesi yang coba akses route privat sekarang mendarat di halaman Verify (`/?callbackUrl=...`), bukan halaman default NextAuth yang polos.
  - **Banner konfirmasi logout**: `app/api/auth/logout/route.ts` redirect ke `/?loggedOut=1`, ditangkap `components/verify/LogoutBanner.tsx` (baru) yang menampilkan "Kamu berhasil keluar." lalu membersihkan query param — sebelumnya logout sukses tidak memberi feedback apapun ke user.
  - **Logout Keycloak "Invalid redirect uri" TIDAK bisa diperbaiki dari sesi ini** — butuh akses ke Keycloak admin console (realm → client → Valid Post Logout Redirect URIs) untuk mendaftarkan `http://localhost:3000/api/auth/logout`. Dicatat sebagai backlog #22 (prioritas High, blocker fungsional).
  - Dev server sempat macet dengan error stale module (`EmptyState defined multiple times`) dari cache `.next` lama peninggalan sesi sebelumnya — di-clear (`rm -rf .next`) dan restart bersih, tidak terkait kode aktual (`tsc`/`oxlint` sudah bersih sebelum itu).
  - Dokumentasi disinkronkan: `session-auth-audit-2026-08-02.md` (status → DIIMPLEMENTASIKAN, koreksi ditulis eksplisit di bagian atas + §12 log implementasi, acceptance criteria dicentang), `tasks/tasks.md` (#22 baru untuk item Keycloak yang masih terbuka).
- **Blocker / butuh keputusan dari Ersa**: akses Keycloak admin console untuk memperbaiki §5.3 (post-logout redirect URI) — di luar kendali sesi coding, perlu dikoordinasikan dengan siapa pun yang pegang akses admin realm ini.
- **Next steps**: setelah Keycloak diperbaiki, uji ulang alur logout end-to-end. Backlog lama masih terbuka: #2b (validasi server), #3 (cleanup test), #6 (proteksi middleware/proxy untuk route API — belum disentuh sesi ini, beda dari proteksi halaman yang baru dikerjakan).

---

## [2026-08-02 01:00] — Claude Code

- **Progress**: Design Language v2 — audit "bahasa visual" (bukan layout) atas kritik user bahwa PITS masih terasa dashboard 2019–2022, disusun jadi dokumen (`design-language-v2.md`), lalu diterapkan penuh setelah user konfirmasi "lanjut kerjakan 1-4". Diverifikasi type-check, lint, dan visual di browser (termasuk scroll behavior navbar via `getComputedStyle`).
- **Selesai sesi ini**:
  - **Background/Surface ditukar perannya**: `base-100` (card) `#F9F9F9`→`#FFFFFF` (putih murni), `base-200` (page bg) `oklch(97% 0 0)`→`#F5F6F8`. Sebelumnya keduanya nyaris sama terang (beda ~2%) sehingga card cuma kelihatan dari border; sekarang card benar-benar "mengambang" dari page background.
  - **Border dihaluskan**: `base-300` `#C3BEBE`→`#E8E9EC`, ketebalan `1.5px`→`1px` (light mode saja, dark mode belum diaudit — backlog #20). Token baru `--color-divider-strong` ditambah sebagai cadangan (belum dipakai).
  - **Shadow ditambah ke SEMUA card** (utility class baru `.shadow-card`, `0 1px 2px rgba(15,23,42,.04)` — nyaris tak terlihat sendirian) — **membalikkan prinsip lama** "card border-only, tanpa shadow sama sekali" yang baru ditetapkan 2 sesi lalu. Overlay (drawer) tetap `shadow-2xl`, jauh lebih kuat, supaya beda tingkat elevasi.
  - **Navbar shadow-on-scroll**: border bawah statis dihapus, diganti `bg-base-100/90 backdrop-blur-sm` + `shadow-sm` yang cuma muncul setelah `scrollY > 4` (state React + scroll listener) — diverifikasi bekerja lewat `getComputedStyle(header).boxShadow` di browser.
  - **`OperationCard` naik ke `rounded-3xl`** (satu-satunya "hero-level card"), card besar lain tetap `rounded-2xl`.
  - **Peran warna merah (`primary`) dibatasi drastis**: audit lewat grep menemukan 24 titik pemakaian lintas-peran di 12 file (nav aktif, nav hover, ikon default, border dropzone, hover card/FAQ). Semua diganti netral kecuali CTA/badge/state penting: nav aktif & hover → `bg-base-200`/`text-base-content` (bukan merah), `FilledIcon` default → `bg-secondary/10 text-secondary` (navy, bukan merah — berdampak ke `StatsCards` & `HowItWorks` yang tidak eksplisit override warna), `Dropzone` idle border → netral (`primary` HANYA saat `isDragActive`), hover border card (`OperationCard`/`RecordsTable`/`FAQSection`) → `hover:border-base-content/20`, `CopyButton` hover → netral, `MetadataCard` status "siap dikirim" → `text-success` (bukan primary, karena semantiknya "siap/baik").
  - **Tipografi dinaikkan lagi**: Page Title 30→32px, Section Title 20→22px — keduanya arbitrary value (`text-[2rem]`, `text-[1.375rem]`) karena tidak match step Tailwind manapun. Card Title/Subsection/Body/Caption SENGAJA tidak diubah (dianggap sudah final dari revisi sebelumnya).
  - Dokumentasi disinkronkan: `design-language-v2.md` (status PROPOSAL → DITERAPKAN, §11 detail penerapan aktual), `design-system.md` (§2 Warna, §3 Tipografi, §5 Pola Layout, §6 changelog), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah konfirmasi eksplisit ("lanjut kerjkan 1-4") untuk semua 4 keputusan yang sebelumnya diajukan sebagai pertanyaan terbuka.
- **Next steps**: backlog #19 (audit ritme layout & whitespace) dan #20 (audit dark mode mandiri — border/shadow/surface dark belum ikut direvisi di sesi ini) masih terbuka, disepakati butuh sesi tersendiri. Token `--color-divider-strong` tersedia tapi belum dipakai di komponen manapun (#18).

---

## [2026-08-01 22:00] — Claude Code

- **Progress**: Diskusi layout tablet/`md` (dilanjutkan ke ChatGPT), audit alignment bug (`OperationCard` vs section lain), riset tren desain 2026 (disaring untuk konteks aplikasi pemerintah), dan implementasi motion system — semua sudah diverifikasi (type-check, lint, dan cek visual di browser untuk yang bisa diakses tanpa login). Siap di-commit.
- **Selesai sesi ini**:
  - **Layout system dibangun**: komponen baru `components/layout/PageContainer.tsx` (`narrow`/`content`/`wide`/`full`) jadi satu-satunya sumber lebar+padding halaman, menggantikan `max-w`/`mx-auto`/padding manual ad hoc per halaman. Diterapkan ke Verify, Register, Dashboard.
  - **Bug alignment ditemukan & diperbaiki 2x**: (1) `OperationCard` (`max-w-4xl`) vs card lain (`max-w-3xl`) di Verify/Register — beda lebar independen-center bikin tidak sejajar (screenshot user). (2) `FAQSection` yang sengaja dibuat lebih sempit demi keterbacaan malah terlihat "tidak lurus" saat scroll — diperbaiki dengan cap lebar di teks jawaban saja (`max-w-2xl` pada `<p>`), bukan di seluruh section. Root-cause kedua kasus: pengecualian lebar di level section berisiko terbaca sebagai bug, lebih aman batasi di level elemen kecil.
  - **Judul redundan dihapus**: `OperationCard` title/description ("Verifikasi Dokumen"/"Registrasi Dokumen Baru" + deskripsi) yang mengulang isi Hero di atasnya dihapus dari Verify & Register — prop jadi opsional, section header tidak render kalau kosong. Key i18n mati (`verifyForm.title/description`, `registerForm.title/description`) dibersihkan dari kedua bahasa.
  - **Background band per section** ditambahkan di halaman Verify (Hero gradient → Form+Tips polos → Cara Kerja+FAQ `bg-base-200`) supaya batas antar section terlihat jelas, tidak menyatu.
  - **Riset tren desain 2026** (`_docs/design/2026-design-trend-research.md`) — web search utk tren UI/UX 2026, dashboard SaaS enterprise, GOV.UK/USWDS, lalu disaring khusus untuk PITS sebagai aplikasi pemerintah (banyak tren seperti Y2K color, 3D/AR, glassmorphism dekoratif, bento grid EKSPLISIT direkomendasikan dihindari karena merusak kredibilitas). Kesimpulan bareng user: PITS bukan "jadul", tapi "terlalu utilitarian" — kurang di hierarki visual, ritme layout, motion, dan depth, bukan di palet/tipografi/struktur yang sudah solid.
  - **Motion system diimplementasikan** sesuai prioritas ROI tertinggi dari user: hover-lift (150ms) hanya di elemen clickable (card record mobile), slide-in 200ms untuk `RecordDetailDrawer` + drawer mobile navbar (pakai varian `starting:` Tailwind v4 / `@starting-style`, CSS murni), FAQ accordion diganti dari native `<details>` (instan) jadi `<button aria-expanded>` + trik `grid-template-rows` (animasi 200ms, tetap accessible) — sudah diverifikasi bekerja di browser.
  - **Depth terbatas untuk overlay**: `shadow-2xl` ditambahkan HANYA ke `RecordDetailDrawer` dan drawer mobile navbar (satu-satunya elemen dengan shadow di seluruh app) — prinsip border-only untuk card biasa dipertahankan sesuai keinginan user.
  - **Border radius hierarki**: card besar (`OperationCard`, stat tile, step card, FAQ box, tabel wrapper, dll) `rounded-xl` → `rounded-2xl`; elemen kecil tetap radius lebih kecil.
  - **Progressive disclosure Dashboard**: `StatusSummary` baru di `DashboardView.tsx` — ringkasan "Semua N dokumen tercatat on-chain" ditampilkan SEBELUM stat card detail, sesuai pola dashboard SaaS 2026 (jawaban singkat dulu, breakdown belakangan).
  - Dokumentasi disinkronkan menyeluruh: `design-system.md` (§7 Layout System dirombak, §8 Motion System baru, §9 backlog diperbarui), `architecture/system-overview.md` (navbar, FAQ, Dashboard, PageContainer, EmptyState), `ONBOARDING.md` (aturan card+shadow+motion+PageContainer), `referensi/coding-standards.md` (aturan sama), `_docs/README.md` (link riset baru), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: backlog baru dari riset tren (#19 audit ritme layout & whitespace, #20 audit dark mode mandiri, #21 diferensiasi Upload vs Verify) — semua sengaja ditunda, butuh sesi tersendiri. Backlog lama masih terbuka: #2b (validasi server), #3 (cleanup test), #16 (quick-action Verifikasi di Dashboard).

---

## [2026-08-01 18:00] — Claude Code

- **Progress**: Navbar direstrukturisasi ("Layanan Dokumen" jadi menu utama), type scale diaudit dan direvisi 2x (termasuk ditemukan bug CSS global kritis), lalu review desain menyeluruh (skor 9/10-an dari user) diikuti perbaikan layout & mobile responsiveness — semua sudah diverifikasi visual di browser (desktop & mobile 375px). Akan di-commit ke branch baru (bukan `main`), tidak di-push.
- **Selesai sesi ini**:
  - **Navbar direstrukturisasi**: dari 2 baris (Dashboard di baris identitas + baris menu selalu tampil) jadi 1 baris utama ("Layanan Dokumen" sejajar Dashboard/Bahasa/Keluar) + sub-nav Registrasi/Verifikasi yang hanya tampil di section dokumen.
  - **Type scale diaudit & direvisi 2 kali**: revisi pertama menghapus level 24px (`text-2xl`) yang terlanjur dipakai untuk 3 peran berbeda, menambah level `text-lg` (Subsection); revisi kedua memadatkan seluruh scale turun 1 step (H1 36px→30px, Section 30px→20px, dst) setelah user menilai skala pertama masih kegedean untuk aplikasi enterprise/internal.
  - **Bug kritis ditemukan & diperbaiki**: rule global `h2 { font-size: 2rem }` dan `h4 { font-size: 1.25rem }` di `globals.css`, ditulis di luar `@layer` sehingga mengalahkan SEMUA class `text-*` Tailwind di elemen `<h2>`/`<h4>` — baru ketahuan saat verifikasi visual mobile (computed style `text-lg` yang harusnya 18px ternyata 32px). Ini artinya beberapa perubahan type-scale di sesi sebelumnya (OperationCard, HowItWorks, FAQSection, DashboardView heading) sebenarnya tidak pernah terlihat efeknya sampai bug ini dihapus.
  - **Review desain menyeluruh** (relay dari ChatGPT, dinilai user 9-9.5/10 untuk design system/konsistensi, tapi 7/10 untuk mobile) diikuti implementasi sebagian besar rekomendasi:
    - Hero Verify/Register disederhanakan: avatar ikon lingkaran besar dihapus, padding dipadatkan (`py-12`→`py-8 sm:py-10`), H1 lebih kecil di mobile (`text-2xl sm:text-3xl`).
    - Navbar mobile: dari kompresi ikon-only jadi hamburger + drawer (Dashboard, grup Layanan Dokumen, bahasa, sign in/out).
    - `RecordDetailDrawer`: drawer kanan di ≥sm, bottom sheet (drag-handle, `rounded-t-2xl`, `max-h-[85vh]`) di <sm.
    - `Dropzone`: teks "Seret & Lepas/atau" disembunyikan di mobile (drag-and-drop tidak relevan di touch), hanya sisakan "Klik untuk Pilih File".
    - Tombol submit `FileUpload`: sticky di bawah viewport pada mobile.
    - `EmptyState` diekstrak jadi komponen reusable (`components/common/EmptyState.tsx`), dipakai di `RecordsTable`.
    - Focus state global (`*:focus-visible`, ring primary 2px) ditambah — sebelumnya tidak eksplisit.
    - Padding halaman jadi responsif (`px-4 sm:px-6 lg:px-8`) di Verify/Register/Dashboard.
    - Ternyata mobile card table di `RecordsTable`, grid responsif `StatsCards`, dan skeleton loading (`app/dashboard/loading.tsx`) **sudah** diimplementasikan di sesi sebelumnya tapi belum tercatat di `design-system.md` — dokumentasi disinkronkan.
  - Type-check (`tsc --noEmit`) dan lint (`oxlint`) bersih untuk semua file yang diubah.
  - `design-system.md` ditambah §7 (Breakpoint & Layout) dan §8 (Backlog Desain — item yang sengaja belum dikerjakan).
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah minta commit langsung ke branch baru.
- **Next steps**: lanjutkan backlog `tasks.md` #15–18 (animasi drawer/accordion, quick-action Verifikasi di Dashboard, komponen generik tambahan, border hierarchy) kalau relevan; lanjutkan juga backlog lama #2b (validasi server) dan #3 (cleanup test) yang masih prioritas tinggi.

---

## [2026-08-01 12:00] — Claude Code

- **Progress**: Redesain UI penuh (Verify/Register/Dashboard/Result/Navbar) + sistem i18n penuh + rebrand warna ke identitas BRIN asli — sudah selesai dan diverifikasi manual di browser (light & dark mode, ID & EN). Belum di-commit.
- **Selesai sesi ini**:
  - **Redesain UI menyeluruh** berdasar dua putaran review UX (relay dari ChatGPT): hero Verify/Register diseragamkan ukuran & style; copywriting "hash" → "sidik jari digital" di teks publik; metadata file 2-kolom + tombol copy; notice sebelum submit diubah dari gaya warning (kuning) ke info (biru); Dashboard direstrukturisasi total — dari 1 hero besar + 3 card kecil menjadi 4 stat tile setara, toolbar menyatu dengan tabel dalam satu card, modal detail diganti drawer kanan.
  - **Navbar direstrukturisasi**: Dashboard dipindah ke baris identitas (sebelah tombol Keluar), dipisah dari menu dokumen karena sebelumnya "seolah-olah beda platform". Menu Registrasi/Verifikasi diberi label grup **"Layanan Dokumen"**. Tab aktif diperkuat (border 3px + background tint) setelah feedback "jelek" pada versi underline tipis.
  - **Sistem i18n penuh (ID/EN), fungsional bukan placeholder**: dibangun dari nol — `lib/i18n/translations.ts` (kamus terpusat), `lib/i18n/LocaleContext.tsx` (`LocaleProvider` + `useLocale()`, persist ke `localStorage`), `LanguageSwitcher.tsx` di navbar. Seluruh teks UI (termasuk pesan error upload, format tanggal, pagination) dipindah dari hardcode ke kamus. Pola khusus untuk Server Component (Dashboard) yang tidak bisa akses `localStorage`: kirim kode error, terjemahkan di client component kecil (`DashboardErrorAlert.tsx`).
  - **Rebrand warna ke merah BRIN asli**: sempat rebrand ke biru institusional berdasar asumsi keliru, lalu dicek langsung ke brin.go.id (color-frequency analysis via browser) — ternyata warna identitas BRIN yang sebenarnya adalah merah `#E62F2A` + navy-teal `#17384C`. Palet final diganti total ke warna ini (`styles/globals.css`), `error` token dibuat sengaja lebih gelap (`#991B1B`) untuk dibedakan dari `primary`.
  - **Pagination diperbaiki** (feedback "jelek"): pola `.join` dengan fake button-span dihapus, diganti dua tombol persegi ghost mengapit label teks polos.
  - **Dead code dihapus**: `components/features/` dan `components/ui/` (15 file, sudah divergen, jadi sumber error `tsc`) — dihapus setelah dikonfirmasi via grep tidak ada referensi eksternal.
  - **Dokumentasi diperbarui menyeluruh**: `_docs/tasks/tasks.md`, `_docs/architecture/system-overview.md`, `_docs/referensi/coding-standards.md` (section i18n baru), `_docs/design/design-system.md` (warna, komponen, layout, changelog), `CLAUDE.md` (root) — semua disinkronkan dengan state kode saat ini.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan sesi ini (kode + dokumentasi).
  - Kontras `primary` (merah) vs `error` (merah tua) belum diaudit aksesibilitas formal — lihat `tasks/tasks.md` #14.
- **Next steps**:
  - Setelah dapat konfirmasi, commit seluruh perubahan (tanpa co-author Claude).
  - Update `ONBOARDING.md` supaya sinkron dengan state terbaru (beberapa "known issue" yang disebut di situ — duplikasi component tree, tidak ada validasi upload — sudah tidak berlaku lagi/berubah statusnya).
  - Lanjutkan backlog terbuka: validasi server-side (#2b), cleanup test (#3), CI (#4), dan item baru dari sesi ini (server-side pagination #12, type scale #13, contrast review #14).

---

## [2026-08-01 00:00] — Claude Code

- **Progress**: Handoff dokumentasi selesai — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Dibuat `ONBOARDING.md` (root) untuk developer yang akan melanjutkan project: setup cepat, hal-hal kritis (component tree terduplikasi, route verify orphan, gap validasi upload, setup test membingungkan), prioritas kerja.
  - `_docs/README.md` diupdate — tambah link ke `ONBOARDING.md` di navigasi cepat.
  - Aturan baru (global, semua project): commit git tidak lagi menyertakan trailer `Co-Authored-By: Claude` — supaya riwayat commit tidak menampilkan atribusi AI di GitHub.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan dokumentasi (`CLAUDE.md`, `_docs/`, `ONBOARDING.md`).
- **Next steps**:
  - Setelah dapat konfirmasi, commit dokumentasi ini (tanpa co-author Claude) sebelum mulai kerjakan backlog di `tasks/tasks.md`.

---

## [2026-07-31 00:00] — Claude Code

- **Progress**: Dokumentasi baseline `_docs/` selesai dibuat (retroaktif) — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Audit menyeluruh codebase (`_docs/audit/audit-2026-07-31.md`) — 12 temuan, termasuk 3 High (component tree duplikat, tidak ada validasi upload, setup test bermasalah).
  - Scaffolding `_docs/` lengkap: CLAUDE.md, BRD, SRS (Publisher Portal + Verification Portal + NFR), 1 ADR (NextAuth + Keycloak), architecture overview, coding standards, Definition of Ready/Done, AI review checklist.
  - Backlog awal (`tasks/tasks.md`) diisi dari temuan audit, diurutkan prioritas.
- **Blocker / butuh keputusan dari Ersa**:
  - Keputusan arsitektur: hapus `components/features/`+`components/ui/` (dead code) atau selesaikan migrasi — butuh keputusan sebelum siapa pun mengedit area component lebih jauh.
  - Keputusan produk: nasib route `/verify` placeholder.
- **Next steps**:
  - Mulai kerjakan backlog dari prioritas tertinggi (task #1–#3 di `tasks/tasks.md`).

---

<!-- Entry lama di bawah sini, urut dari terbaru ke terlama -->
