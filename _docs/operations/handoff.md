# Handoff — Sesi 2026-09-07

> Kredensial (SSH, Keycloak admin, DB, dll) **TIDAK ditaruh di file ini** karena repo ini publik/shared (`DELTA-PITS/frontend-for-uat`). Semua kredensial lengkap ada di `_credentials/19-project-trustmark-pits.md` (lokal, di luar repo, tidak di-commit).

## Ringkasan situasi
- **0 user nyata** — semua data yang ada sejauh ini hasil testing lokal/manual, bukan traffic production sungguhan. Jadi ruang gerak untuk beres-beres cukup longgar.
- Repo yang benar-benar **live di production**: `frontend-for-uat` (branch `main`) + `backend-for-uat` (branch `main`). Repo `V2-Frontend` **BUKAN** yang dipakai production — jangan bingung kalau lihat 3 folder di `_personal/_PITS/`.
- Deploy production: Docker Compose di server `209.58.160.63`, path `/home/hamka/pits/{frontend-for-uat,backend-for-uat}`. Container: `frontend-for-uat-frontend-1` (Next.js, port 3000), `trustmark-trustmark-app-1` (backend FastAPI, port 41012), `trustmark-keycloak-1`, `trustmark-postgres-1`, `trustmark-anvil-1` (blockchain lokal).
- Akses server: SSH sebagai `ersa`, `sudo` aktif (lihat file kredensial). File project dimiliki user `hamka` — perlu `sudo` untuk baca/tulis.

## Yang sudah dikerjakan & terverifikasi

### 1. 🔴 Bug 404 register/verify — FIXED
**Root cause:** `.env.local` production (`/home/hamka/pits/frontend-for-uat/.env.local`) salah path:
```
PITS_BACKEND_REGISTER_URL=.../api/v1/records/register   ❌ (backend cuma punya /api/v1/register)
PITS_BACKEND_VERIFY_URL=.../api/v1/records/verify        ❌ (backend cuma punya /api/v1/verify)
```
**Bukti:** log `trustmark-trustmark-app-1` menunjukkan `POST /api/v1/records/register` dan `.../verify` berulang kali balas `404`, sementara `/api/v1/register` dan `/api/v1/verify` (tanpa `records`) ada dan jalan.

**Fix:** hapus segmen `/records` dari kedua env var, restart container `frontend-for-uat-frontend-1`.

**Verifikasi setelah fix** (curl ke `https://pits-ui.pangkalandata.id/api/v1/{verify,register}`):
- `verify` → `415 "Only PDF files are supported"` (bukan 404 lagi — file test bukan PDF, ini validasi yang benar)
- `register` → `401 "Missing Keycloak access token"` (bukan 404 lagi — normal karena belum login)

Backup file sebelum diedit: `/home/hamka/pits/frontend-for-uat/.env.local.bak-20260907` (di server).

### 2. Arsitektur URL `/api/v1` didokumentasikan
Ada 2 makna `/api/v1` yang beda domain, sumber kebingungan awal:
- `pits.pangkalandata.id/api/v1/*` — API backend asli (FastAPI).
- `pits-ui.pangkalandata.id/api/v1/*` — **alias legacy** di nginx (`rewrite` ke route internal Next.js `/api/*`), untuk kompatibilitas konsumen lama. Konfigurasi ada di `/etc/nginx/conf.d/pits-ui.conf` di server.

## Update 2026-09-07 18:40 — Akses total gagal, 3 bug bertumpuk (FIXED)

Fix `.env.local` di atas ternyata **tidak pernah benar-benar aktif** karena container cuma di-`restart` (Docker `env_file` cuma dibaca saat container dibuat). Setelah di-recreate, muncul 2 bug lain di baliknya. Detail lengkap ada di `_docs/status/log.md` entry `[2026-09-07 18:40]`. Ringkasan:

1. **Env stale** — `docker compose up -d --force-recreate frontend` untuk reload `.env.local` yang benar.
2. **Backend tolak semua token asli (`Invalid issuer`)** — `KEYCLOAK_ISSUER` backend masih `http://localhost:8080/...`, seharusnya `https://keycloak.pangkalandata.id/...` (domain publik yang benar-benar dipakai token). Fixed di `docker/.env` backend.
3. **Nginx `upstream sent too big header`** — `pits-ui.conf` tidak ada `proxy_buffer_size`, cookie session NextAuth+Keycloak kepotong. Ditambah `proxy_buffer_size`/`proxy_buffers`/`large_client_header_buffers`.

**Penting untuk sesi berikutnya**: kalau ubah `.env`/`.env.local` di server lagi, **selalu** `docker compose up -d --force-recreate <service>`, jangan cuma `docker restart` — env tidak akan ke-reload.

Realm Keycloak `nextjs-kc` **tidak punya self-registration/self-reset-password** (`registrationAllowed: false`, `resetPasswordAllowed: false`) — akun baru harus dibuat manual oleh admin. Akun `uat-tester` dibuat untuk verifikasi (role `publisher`), kredensial di file kredensial lokal.

## Update 2026-09-07 (malam, lanjutan) — Google login + polish halaman login Keycloak

- **Google login diaktifkan** (Identity Provider `google` terpasang di realm `nextjs-kc`). Role `publisher` dijadikan **default role realm** (karena `registrationAllowed: false`, satu-satunya jalur user baru adalah Google, jadi auto-approve dianggap aman untuk fase UAT — **keputusan ini perlu direview ulang kalau nanti sign-up diaktifkan**, lihat `_docs/operations/handoff-signup-feature.md`).
- **Halaman login Keycloak di-redesain total** jadi custom theme `pits` (CSS-only, live di server, path `docker/themes/pits/`) — konsisten dengan design system app (merah BRIN, Plus Jakarta Sans+Inter, radius 0.6rem). Detail lengkap + 10 pitfall teknis PatternFly/Keycloak yang ditemukan: `_docs/design/keycloak-login-theme-audit.md` (WAJIB dibaca sebelum ubah CSS theme ini lagi — banyak override yang terlihat aneh tapi sengaja, ada alasan teknis di baliknya).
- **Sign Up ditanyakan user, sengaja belum diaktifkan** — realm tetap `registrationAllowed: false`. Dokumentasi opsi & pertimbangan keamanan: `_docs/operations/handoff-signup-feature.md`.

## Update 2026-09-07 malam — item #1-4 backlog selesai

Semua sudah dideploy & diverifikasi hidup di production:

- **Rebuild Dockerfile frontend**: multi-stage Dockerfile (`deps`→`builder`→`prod-deps`→`runner`), build sekali saat `docker compose build`, container start `~260ms` (dulu ~70 detik `npm ci && npm run build` tiap restart). `docker-compose.yml` diganti pakai `build:` context. File di-commit ke repo.
- **Nginx cleanup**: `keycloak.conf` dan `pits-backend.conf` ternyata punya bug **sama persis** dengan `pits-ui.conf` sebelumnya (tidak ada `proxy_buffer_size`) — sudah ditambahkan ke keduanya. File nginx mati (`pits-ui.conf.bak`, `.oke-v1`, `.with-v1`) dihapus dari server. Sub-item "response friendly untuk `GET /api/v1`" **di-skip** (kosmetik, dampak rendah).
- **Fix drift Docker port binding**: Postgres/Keycloak/Anvil/backend-app sekarang semua bind `127.0.0.1` (bukan `0.0.0.0`). **Insiden saat eksekusi**: compose file di server ternyata kehilangan baris `name: trustmark` (beda dari repo git) — `docker compose up -d --force-recreate` sempat bikin project/container/volume **baru** bernama `docker-*` (nyaris duplikat stack, gagal sendiri karena port bentrok, langsung dibersihkan sebelum sempat jalan, **tidak ada data hilang**). Root cause: file compose di server drift dari repo lebih dalam dari yang diduga — bukan cuma port binding.
  - **Efek samping ditemukan & difix**: setelah port 8080 Keycloak ditutup dari publik, backend jadi 503 `Authentication provider unavailable` — ternyata `KEYCLOAK_ISSUER_URL` (dipakai fetch JWKS) menunjuk ke `http://keycloak:8080/...` (internal), tapi Keycloak (dengan `KC_PROXY=edge`) me-generate `jwks_uri` pakai **hostname publik** `http://keycloak.pangkalandata.id:8080/...` — cuma "kebetulan jalan" sebelumnya karena port 8080 masih terbuka ke publik. Fix: `KEYCLOAK_ISSUER_URL` diarahkan ke domain publik HTTPS (sama dengan `KEYCLOAK_ISSUER`), supaya fetch JWKS lewat nginx/443 seperti biasa.
- **Bump Node version**: Dockerfile `node:20-alpine` → `node:22-alpine`, build bersih tanpa warning `EBADENGINE`.

**Fitur baru (di luar backlog awal, diminta user)**:
- Footer versi di semua halaman (`app/layout.tsx`, root layout): `PITS · v1.0.0`. Sumber versi: `lib/version.ts` — naikkan angka belakang untuk update kecil, angka depan untuk perubahan besar (konvensi sama seperti produk lain kerenevent.com).
- Disclaimer jaringan blockchain di `RecordDetailDrawer.tsx`: label "Ethereum" polos (menyesatkan) diganti "Ethereum (Testnet Lokal)" + catatan kecil bahwa ini jaringan uji lokal (Anvil, chain ID 31337), bukan Ethereum publik, tidak bisa dicek di Etherscan.

**Pelajaran untuk sesi berikutnya**: sebelum mengubah `docker-compose.yml` di server manapun, cek dulu apakah ada baris `name:` di file itu vs repo git — kalau beda/hilang, `--force-recreate` bisa membuat project Compose baru alih-alih meng-update yang lama.

## Update 2026-09-13 — Cara SSH otomatis/non-interaktif ke server (penting untuk sesi AI berikutnya)

Ditemukan saat mencoba SSH ke server production (`209.58.160.63`) dari command non-interaktif (`ssh user@host "command"`, bukan sesi shell interaktif manual):

- **Gejala**: autentikasi password **berhasil** (`Authenticated ... using password` di log `ssh -vv`), tapi sesi macet total setelah itu — command yang dikirim (`echo`, `hostname`, dll) tidak pernah mengembalikan output, sampai akhirnya timeout via `ServerAliveInterval`. TCP handshake dan port 22 normal, bukan masalah jaringan.
- **Fix**: tambahkan flag **`-tt`** (paksa alokasi pseudo-terminal) ke command SSH non-interaktif. Contoh: `ssh -tt ersa@209.58.160.63 "command"`. Root cause diduga ada langkah di server (PAM/shell startup/MOTD) yang menunggu TTY dan hang tanpa itu.
- **Dampak**: tanpa `-tt`, SSH otomatis (mis. dari script/AI agent) ke server ini akan selalu macet/timeout meski kredensial benar — jangan buru-buru simpulkan server down atau kredensial salah, coba `-tt` dulu.

Juga ditemukan: setup lokal `frontend-for-uat` untuk sesi baru butuh `npm install` dulu (`node_modules` tidak ter-commit, seperti biasa) sebelum `npm run dev` jalan.

## Update 2026-09-13 (lanjutan) — Independent QA context export untuk co-author paper akademik

User (Laksa Ersa, co-author/technical contributor — bukan penulis utama paper "From Hoax to Hash")
minta dikumpulkan **seluruh fakta teknis QA/testing** (bukan tulisan akademik) untuk dikirim ke
ChatGPT yang akan menyusun 4 dokumen HTML evidence untuk co-author (Amal, penulis utama):
`01-testing-methodology.html`, `02-test-catalog.html`, `03-testing-results.html`,
`04-findings-paper-evidence.html`.

**Proses**: 2 sub-agent audit paralel (backend + frontend) — baca SELURUH source code + test file
relevan secara penuh (bukan cuma grep nama fungsi), lalu benar-benar jalankan test yang bisa
dijalankan dan catat hasil apa adanya (termasuk kegagalan/ambiguitas dari dokumen QA sebelumnya,
tidak ditutup-tutupi).

**Output** (semua di `_docs/qa/results/`, kedua repo):
- `pits-qa-master-export-2026-09-13.md` (frontend repo) — dokumen utama, 20 section sesuai
  spesifikasi user (system identity, architecture, test environments, complete test inventory,
  coverage matrix, findings register, paper-claims-vs-evidence mapping, dll). **Ini yang dikirim ke
  ChatGPT.**
- `frontend-audit-raw.md` / `backend-audit-raw-2026-09-13.md` — bukti mentah pendukung tiap repo,
  setiap klaim disertai sitasi file:line.

**Temuan penting dari sesi ini yang WAJIB diketahui sesi berikutnya**:

1. **Backend: 94 unit test (`tests/trustmark/`) yang selama ini tidak pernah berhasil dijalankan
   (2 file baru, `test_documents.py` + `test_keycloak.py`) ternyata SEMUA PASS (94/94)** begitu 7
   env var dummy di-set sebelum `pytest` (`KEYCLOAK_ISSUER`, `KEYCLOAK_ISSUER_URL`,
   `KEYCLOAK_AUDIENCE`, `BLOCKCHAIN_RPC_URL`, `BLOCKCHAIN_PRIVATE_KEY`, `MAX_UPLOAD_BYTES`,
   `DATABASE_URL`). Root cause sebelumnya: `keycloak.py:176` evaluasi `settings.KEYCLOAK_ISSUER`
   di *import time* (Dynaconf lazy interpolation), bukan lazy — gagal collect tanpa env var itu.
   **Action item belum dikerjakan**: commit `tests/trustmark/conftest.py` (atau `.env.test`) berisi
   dummy value ini biar sesi/CI berikutnya tidak perlu re-discover masalah yang sama.
2. **PASS-nya 94 test itu TIDAK berarti bebas bug** — banyak test ditulis khusus untuk
   membuktikan bug MASIH ADA (IDOR `/records`, `issuer_id` kosong, TEST_MODE auth-bypass, dll) —
   PASS artinya bug-nya terkonfirmasi masih ada, bukan sudah fix. Semua bug dari sesi 2026-09-09
   (IDOR kritis di `GET /api/v1/records`, `issuer_id` selalu kosong, token malformed → 500,
   mismatch limit upload nginx) **dikonfirmasi ulang masih ada persis di kode saat ini, TIDAK ADA
   YANG DIPERBAIKI**.
3. **Ditemukan file test backend (`tests/trustmark/infra/test_blockchain_connector.py`) dengan
   perubahan LOKAL BELUM DI-COMMIT** yang docstring-nya menyebut langsung "paper §5.1" dan klaim
   "16 dari 17 → 17 dari 17" test — tapi angka itu tidak cocok dengan jumlah test yang benar-benar
   ada di git (8 committed / 14 di working tree, bukan 17). **Perlu direkonsiliasi user/Amal
   sebelum angka ini dikutip di paper** — kemungkinan ada sesi lain yang menulis fixture ini tapi
   lupa commit.
4. ~20 temuan BARU (di luar yang sudah diketahui sejak 2026-09-09) ditemukan lewat pembacaan source
   penuh — termasuk: hashing live endpoint (`/register`/`/verify`) ternyata pakai raw bytes, BUKAN
   fungsi canonicalize yang di-unit-test; file upload TIDAK PERNAH disimpan ke disk (cuma di-hash
   di memori — direktori `files-storage/` di Dockerfile vestigial); bug logika (`is not str`,
   harusnya `isinstance`) di `tests/locust/locustfiles/verify.py` yang mempertanyakan validitas
   angka performa manapun di paper yang memakai file itu; `TEST_MODE` auth-bypass mechanism aktif
   di production container entrypoint (`python -m trustmark.main`). Detail lengkap tiap temuan ada
   di master export §9.
5. Ketiga file (`pits-qa-master-export-2026-09-13.md` + 2 raw audit) **belum di-commit ke git**,
   menunggu review user.

## Backlog tersisa

| # | Item | Detail |
|---|---|---|
| 1 | Google login (opsional, dibahas tapi belum dieksekusi) | Realm Keycloak `nextjs-kc` belum ada Identity Provider apa pun. Rencana: user bikin OAuth Client di Google Cloud Console (redirect URI: `https://keycloak.pangkalandata.id/realms/nextjs-kc/broker/google/endpoint`), lalu Client ID/Secret dipasang di Keycloak — tidak perlu ubah kode |
| 2 | Response friendly untuk `GET /api/v1` di `pits-ui` (kosmetik) | Sekarang 404 kosong. Rendah prioritas, di-skip sesi ini |

## Blocked
- **Rename subdomain `pits.pangkalandata.id` → `pits-api.pangkalandata.id`**: user tidak punya akses ke DNS registrar (`ns1/ns2.dns-parking.com`). `pits-ui` tetap dibiarkan seperti sekarang sesuai keputusan user.

## Referensi
- Kredensial lengkap: `_credentials/19-project-trustmark-pits.md` (SSH, sudo, Keycloak admin, Postgres, Anvil private key)
- Backend routes: `backend-for-uat/src/trustmark/api/v1/documents.py`
- Nginx config production: `/etc/nginx/conf.d/{pits-ui.conf,pits-backend.conf}` di server `209.58.160.63`
