# UAT Test Plan — PITS Frontend (Publisher & Verification Portal)

**Status:** Draft untuk eksekusi UAT
**Tanggal:** 2026-08-22
**Sumber persona/journey:** `_docs/brd/brd-core.md` §3–4 (diformalkan ulang di sini untuk kebutuhan test case)
**Terkait:** `_docs/srs/fr-publisher-portal.md` §Testing Plan, `_docs/srs/fr-verification-portal.md` §Testing Plan (checklist manual — sebelumnya belum ada E2E test, ditutup oleh `tests/e2e/` di dokumen ini)

---

## 1. User Persona

### Persona A — Publisher ("Budi", staf penerbit dokumen resmi)
- **Role:** Penerbit dokumen, akun Keycloak dengan realm role `publisher`.
- **Familiaritas teknis:** Menengah — paham konsep upload file, tidak paham/tidak perlu paham hash atau blockchain.
- **Goals:** Mendaftarkan dokumen resmi secepat mungkin, punya bukti/riwayat registrasi yang bisa diaudit kapan saja.
- **Pain points:** Tidak mau proses upload ambigu (sukses atau gagal harus jelas), tidak mau kehilangan histori dokumen yang sudah didaftarkan.
- **Frekuensi pakai:** Setiap kali ada dokumen baru yang perlu diterbitkan (bisa harian).
- **Device/context:** Desktop, browser modern, jaringan kantor.

### Persona B — Verifier ("Sari", masyarakat umum)
- **Role:** Pengunjung publik, tanpa akun.
- **Familiaritas teknis:** Awam — tidak tahu istilah hash/blockchain, tidak mau tahu.
- **Goals:** Cepat tahu apakah dokumen yang ia pegang asli/terdaftar.
- **Pain points:** Tidak mau proses berbelit, tidak mau baca istilah teknis, butuh hasil jelas (✅/❌) dalam hitungan detik.
- **Frekuensi pakai:** Sesekali, insidental (saat menerima dokumen yang perlu dicek).
- **Device/context:** Bisa desktop maupun mobile, koneksi bervariasi.

---

## 2. User Journey

### Journey Publisher — Registrasi Dokumen
```
ENTRY   : Buka "/", klik "Masuk" di navbar
STEP 1  : Redirect ke halaman login Keycloak (realm nextjs-kc) → isi kredensial publisher
STEP 2  : Redirect kembali ke aplikasi, sesi aktif (NextAuth session + accessToken)
STEP 3  : Navigasi ke "/publisher"
STEP 4  : Upload dokumen PDF via Dropzone (drag/drop atau file picker)
STEP 5  : Klik "Kirim Dokumen" → POST /api/register (server-side, Bearer token) → backend /api/v1/register
STEP 6  : Redirect ke /result/success (hash, record ID, tx hash blockchain ditampilkan) ATAU /result/failure kalau gagal
STEP 7  : Buka "/dashboard" → dokumen yang baru didaftarkan muncul di daftar riwayat
EXIT    : Publisher yakin dokumennya terdaftar dan bisa melihat buktinya kapan saja
```

### Journey Verifier — Verifikasi Dokumen Publik
```
ENTRY   : Buka "/" (root, tanpa login)
STEP 1  : Upload dokumen PDF via Dropzone
STEP 2  : Klik "Verifikasi Dokumen" → POST /api/verify (tanpa auth) → backend /api/v1/verify
STEP 3  : Redirect ke /result/success (dokumen cocok, tampil issuer/tanggal) ATAU /result/failure (tidak ditemukan/hash tidak cocok)
EXIT    : Verifier tahu status keaslian dokumen tanpa perlu akun
```

### Journey Negatif — Akses Tanpa Login
```
ENTRY   : Buka "/publisher" atau "/dashboard" langsung (belum login)
STEP 1  : proxy.ts (NextAuth authorized callback) menolak akses
EXIT    : Redirect ke "/" (bukan halaman login default NextAuth — lihat auth.ts pages.signIn)
```

---

## 3. Test Case Matrix

| # | Journey | Test Case | Tipe | Status |
|---|---------|-----------|------|--------|
| TC-1 | Negatif | Akses `/publisher` tanpa login → redirect ke `/` | E2E otomatis | ✅ `auth-guard.spec.ts` |
| TC-2 | Negatif | Akses `/dashboard` tanpa login → redirect ke `/` | E2E otomatis | ✅ `auth-guard.spec.ts` |
| TC-3 | Verifier | Verifikasi dokumen yang belum terdaftar → hasil "tidak ditemukan" (`/result/failure`) | E2E otomatis | ✅ `verifier-journey.spec.ts` |
| TC-4 | Publisher | Login via Keycloak → redirect balik ke aplikasi dengan sesi aktif | E2E otomatis | ✅ `publisher-journey.spec.ts` |
| TC-5 | Publisher | Upload & register dokumen valid → `/result/success` dengan hash/record ID/tx hash | E2E otomatis | ✅ `publisher-journey.spec.ts` |
| TC-6 | Publisher | Dokumen yang baru diregister muncul di `/dashboard` | E2E otomatis | ✅ `publisher-journey.spec.ts` |
| TC-7 | Verifier | Verifikasi dokumen yang **sudah** diregister publisher → `/result/success`, cocok | E2E otomatis | ✅ `publisher-journey.spec.ts` (round-trip) |
| TC-8 | UI | Bahasa default halaman verifikasi adalah Indonesia, tombol utama benar (`Verifikasi Dokumen`/`Kirim Dokumen`) | E2E otomatis | ✅ tercakup di TC-3/TC-5 |
| TC-9 | Manual | Visual/responsive check (mobile, dark mode) | Manual (Browser tool) | Dilakukan terpisah, lihat log sesi |

Skenario yang **tidak** dicakup otomatis di sesi ini (tetap manual/backlog): validasi upload file >20MB atau non-PDF (413/415), refresh token expiry, i18n toggle EN, logout flow penuh (Keycloak post-logout redirect). Alasan: fokus sesi ini adalah golden path UAT dua persona utama.

---

## 4. Automated Test Suite

Lokasi: `tests/e2e/` (Playwright, `@playwright/test`). Dipisah dari `vitest.config.ts` project `unit`/`storybook` yang sudah ada — E2E butuh browser real + server real (frontend + backend + Keycloak berjalan), beda kelas dari unit test.

Prasyarat sebelum `npm run test:e2e`:
1. Backend stack jalan: `cd ../backend-for-uat && docker compose --env-file docker/.env -f docker/docker-compose.yml up -d`
2. Frontend dev server jalan di port yang dikonfigurasi `playwright.config.ts` (`baseURL`), env `.env.local` terisi (lihat `.env.local` lokal, tidak dikomit).
3. Akun test Keycloak tersedia (`test-publisher` / `test`, dari realm export default) — dibaca dari `PLAYWRIGHT_PUBLISHER_USERNAME`/`PLAYWRIGHT_PUBLISHER_PASSWORD` (default ke kredensial itu kalau env tidak diset).

## 5. Hasil Eksekusi

Lihat `_docs/status/log.md` untuk hasil run terbaru (jumlah pass/fail, screenshot manual browser).

---

## 6. Skenario Tambahan (2026-09-09) — menutup gap §3 + adversarial

Ditambahkan untuk mendukung klaim testing di paper akademik ("From Hoax to Hash") yang menyebut skenario lebih luas (duplicate detection, auth failure) daripada yang sudah tercakup di §3. Skenario API-level (register/verify/duplicate/auth) ada di repo `backend-for-uat/_docs/qa/api-test-scenarios.md` — bagian ini cuma untuk yang spesifik ke UI/browser.

### 6.1 Gap yang sudah teridentifikasi di §3 (sekarang diformalkan)

| # | Journey | Test Case | Expected |
|---|---------|-----------|----------|
| TC-10 | Publisher | Upload file > batas ukuran (cek `MAX_UPLOAD_BYTES` server) via Dropzone | UI harus tampilkan error jelas ("ukuran file terlalu besar") **sebelum** atau **setelah** hit backend `413` — cek apakah Dropzone frontend punya validasi client-side duluan atau baru tahu setelah response gagal dari `/api/register` |
| TC-11 | Publisher | Upload file non-PDF (mis. `.jpg`, `.docx`) via Dropzone | Cek: apakah Dropzone frontend **menolak** file non-PDF di level UI (accept filter), atau lolos ke backend lalu diterima begitu saja (lihat catatan REG-6 di `api-test-scenarios.md` — backend saat ini **tidak validasi tipe file sama sekali**). Kalau frontend juga tidak filter → dokumentasikan sebagai gap bersama (frontend+backend), bukan cuma UI. |
| TC-12 | Publisher | Sesi NextAuth expired (access token Keycloak habis) saat publisher sedang di `/publisher` atau `/dashboard` | Cek refresh-token flow: apakah NextAuth auto-refresh, atau user di-redirect paksa ke login ulang saat submit? Uji dengan sesi yang sengaja dibiarkan idle melewati TTL access token (cek `KEYCLOAK` access token lifespan di realm `nextjs-kc`, biasanya 5 menit default). |
| TC-13 | Publisher | Logout penuh dari aplikasi (klik logout) → redirect ke halaman logout Keycloak → kembali | Pastikan sesi NextAuth **dan** sesi Keycloak (SSO cookie) benar-benar berakhir — cek dengan buka `/dashboard` lagi setelah logout, harus redirect ke `/` bukan auto-login lagi karena SSO cookie Keycloak masih hidup. |
| TC-14 | UI | Toggle bahasa Indonesia ↔ Inggris (i18n) di semua halaman utama (`/`, `/publisher`, `/dashboard`, `/result/success`, `/result/failure`) | Semua teks berubah sesuai `lib/i18n/translations.ts`, tidak ada string ID/EN yang ke-hardcode kelupaan (cross-check dengan aturan CLAUDE.md "semua teks WAJIB lewat i18n") |

### 6.2 Adversarial / edge case UI

| # | Journey | Test Case | Expected |
|---|---------|-----------|----------|
| TC-15 | Negatif | Akses langsung `/result/success` atau `/result/failure` **tanpa** melalui flow register/verify (langsung ketik URL) | `lib/resultPayload.ts` baca dari `sessionStorage` — kalau kosong (belum ada payload), halaman harus handle graceful (redirect ke `/` atau tampilkan state kosong yang jelas), **bukan** crash/blank page |
| TC-16 | Negatif | Refresh halaman `/result/success` (F5) setelah hasil tampil | Karena payload di `sessionStorage` (bukan query string, sesuai constitution CLAUDE.md), cek apakah refresh tetap menampilkan hasil yang sama (sessionStorage survive refresh) atau hilang — user harus tahu perilakunya, bukan nebak |
| TC-17 | Negatif | Publisher intercept request `POST /api/register` (server-side Next.js route) dan modifikasi payload / kirim langsung ke endpoint tanpa lewat UI (pakai devtools/curl dengan cookie sesi valid) | Cek apakah `app/api/register/route.ts` (via `requireAuth.ts`) benar-benar validasi ulang di server, tidak percaya begitu saja apa yang dikirim client — terutama untuk cek apakah bisa bypass validasi file dari sisi frontend |
| TC-18 | Verifier | Verifier upload file yang sama 2x berturut-turut dengan cepat (double-submit / double-click tombol "Verifikasi Dokumen") | Tidak boleh trigger 2 request paralel yang bikin race atau UI freeze — cek ada disable-state pada tombol saat submit in-flight |
| TC-19 | UI | Dark mode + mobile viewport bersamaan untuk halaman verifier (persona Sari, publik, sering pakai mobile) | Visual check: kontras warna brand merah BRIN (`#E62F2A`) tetap terbaca di dark mode, tidak ada elemen overflow di viewport < 400px |

**Catatan:** TC-15/16/17 relevan langsung dengan constitution CLAUDE.md soal `sessionStorage` untuk result payload — kalau ada yang gagal di sini, itu regresi terhadap keputusan arsitektur 2026-08-02, bukan cuma bug kosmetik.
