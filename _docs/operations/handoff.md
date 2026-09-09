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
