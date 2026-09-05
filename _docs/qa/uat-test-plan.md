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
