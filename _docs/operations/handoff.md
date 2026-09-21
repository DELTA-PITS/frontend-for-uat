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

## Update 2026-09-14 — PASS 5 (Integration & Reproducibility) + QA evidence package dideploy ke production

**Konteks**: lanjutan independent QA untuk paper "From Hoax to Hash" (lihat entry 2026-09-13 di atas). User minta ditutup gap "PASS 5 — Integration & Reproducibility": Postgres/Keycloak/Anvil nyata (bukan mock), isolasi multi-publisher, full provenance journey, dan reproduksi Locust — semua di environment lokal disposable, TIDAK menyentuh production.

**Yang dikerjakan** (repo `backend-for-uat`, lihat `_docs/qa/pass-5-integration-reproducibility.md` untuk laporan lengkap):
- Stack lokal disposable dibangun via `docker/docker-compose.yml` repo sendiri (Postgres 16, Keycloak 26.6.2, Anvil 1.8.1, backend FastAPI) — dibongkar lagi (`docker compose down -v`) setelah selesai.
- **Root cause bug "issuer_id kosong" akhirnya ditemukan**: BUKAN drift konfigurasi production semata — `realm-export.json` (dipakai di semua environment termasuk production) punya `clientScopes: []`, jadi tidak ada protocol mapper manapun yang mengeluarkan klaim `sub`. Dibuktikan dengan eksperimen terkontrol (tambah mapper `oidc-usermodel-property-mapper` → `sub` muncul; hapus lagi → hilang lagi, environment lokal dikembalikan ke baseline sebelum test formal jalan).
- **IDOR (Finding 1) dikonfirmasi dengan bukti runtime 2 akun asli** (Publisher A & B, dibuat khusus untuk pass ini) — sebelumnya cuma bisa dibuktikan via 1 akun (proxy) di sesi 2026-09-09.
- **Full provenance journey (PROV-01) sukses end-to-end**: upload → SHA-256 → Postgres → transaksi Anvil (mined) → baca ulang on-chain → verifikasi publik tanpa login (by upload & by hash) — semua cocok.
- **53 test integrasi baru** ditulis (`backend-for-uat/tests/integration_pass5/`): 45 PASS, 7 FAIL (semua temuan nyata terdokumentasi, bukan bug test), 1 SKIP.
- **Temuan baru**: filename >255 karakter → `500` unhandled (kolom `original_filename` cuma `VARCHAR(255)`, tidak ada validasi panjang sebelum insert).
- **Locust diperbaiki & dijalankan ulang** (3× 60 detik lokal): ditemukan bug test-code lama (`register.py` tidak pernah kirim Authorization header sama sekali; `verify.py` punya `is not str` yang selalu True, dan hardcode "issuer_id harus kosong" yang justru menormalisasi bug sebagai "benar"). Semua diperbaiki, hasil baru: 8.213 request gabungan, 10.2% gagal (semuanya karena Finding 2, nol error server tak terduga). **Angka baru ini sengaja TIDAK dibandingkan langsung** dengan angka historis 8.880/8.245/8.165 di paper — environment/konfigurasi `TEST_MODE` historis tidak bisa dipastikan sama.
- Semua ini sudah di-commit ke `backend-for-uat` (`main`, commit `1b98749`).

**Deploy paket evidence QA ke production** (5 halaman HTML dari ChatGPT, hasil olahan dari `pits-qa-master-export-2026-09-13.md` + laporan Pass 5 di atas):
- File disimpan di repo `frontend-for-uat`: `_docs/qa/results/pass5-evidence-package/` (index + 4 halaman: methodology, test catalog, results, findings/paper evidence).
- **Dideploy ke server production** (`209.58.160.63`, path baru, TIDAK menyentuh aplikasi PITS yang jalan): file di-upload ke `/var/www/pits-static/qa-evidence-pass5/`, ditambah 1 `location` block baru (murni additive) di `/etc/nginx/conf.d/pits-ui.conf` — backup dibuat dulu (`pits-ui.conf.bak-20260914-qa-evidence`), `nginx -t` lolos sebelum `nginx -s reload`.
- **Live di**: `https://pits-ui.pangkalandata.id/qa-evidence-pass5/` — diverifikasi semua 5 halaman 200 OK.
- Pola ini mengikuti preseden yang sudah ada di server (`/qa-report-v1.html` dari sesi 2026-09-09, di config nginx yang sama) — bukan pola baru yang diciptakan sesi ini.

**Untuk sesi berikutnya**: kalau paket evidence ini sudah tidak dibutuhkan publik lagi, hapus `location /qa-evidence-pass5/` dari `pits-ui.conf` (atau restore dari `pits-ui.conf.bak-20260914-qa-evidence`) dan hapus folder `/var/www/pits-static/qa-evidence-pass5/` di server — sengaja tidak ada auth di path ini (halaman statis, tapi isinya evidence teknis termasuk detail bug keamanan seperti IDOR, jadi sebaiknya tidak dibiarkan terbuka selamanya kalau URL-nya sudah tidak dipakai aktif oleh co-author paper).

## Update 2026-09-21 — Fix backend F1/F2/F3 di-deploy ke production

- Fix dari Pass 5 (IDOR `/records`, malformed bearer 500, filename >255 char 500) sudah di git (`backend-for-uat` `main`, commit `c0598d1`) dan **sekarang di-deploy ke production**. Sebelumnya hanya fix Keycloak `sub` (F5, 2026-09-14) yang live.
- **Cara deploy (penting)**: checkout production (`/home/hamka/pits/backend-for-uat`) masih di commit lama `c6a5638` dan divergen dari git (docker-compose.yml + `docker/themes/` dipatch manual), jadi JANGAN `git pull` mentah. Yang dilakukan: salin hanya 2 file yang berbeda (`src/trustmark/api/v1/documents.py`, `src/trustmark/infra/auth/keycloak.py`; owner `hamka:admin`, mode 644), lalu `cd docker && docker compose build trustmark-app && docker compose up -d --no-deps --force-recreate trustmark-app`. Compose file harus punya baris `name: trustmark` (lihat pelajaran 2026-09-07).
- **Backup/rollback**: `/home/hamka/pits/backup-pre-fix-20260921/` (src, docker-compose.yml, .env) + image lama di-tag `trustmark-trustmark-app:pre-fix-20260921`. Rollback: kembalikan `src/` dari backup lalu recreate `trustmark-app`, atau retag image `pre-fix-20260921` ke `latest`.
- **Verifikasi live** (uat-tester): malformed token 401, filename panjang 400, register normal `issuer_id` = sub asli, `/records` hanya milik sendiri, verify publik 200, health 200. 1 record tes (`deploy-check.pdf`) tertinggal di DB production.
- **Belum**: rerun API E2E live (`tests/api`) dan tes isolasi 2 publisher di production (baru ada 1 akun publisher produksi). Buat akun publisher kedua di Keycloak prod kalau mau membuktikan A tidak melihat B secara live.
- Catatan SSH server: perintah non-interaktif butuh `-tt`; `scp`/stdin-redirect sering hang; cara upload yang andal = base64 di-embed di argumen perintah (`echo '<b64>' | base64 -d > file`) lalu cek `md5sum`.
- Paket evidence V2 (`/qa-evidence-pass5-v2/`) sudah diupdate ke status ini; V1 (`/qa-evidence-pass5/`) tetap sebagai baseline sebelum-fix.

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
