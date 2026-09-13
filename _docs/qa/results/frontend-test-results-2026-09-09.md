# Frontend E2E Test Results — 2026-09-09

**Target:** `https://pits-ui.pangkalandata.id` (production), akun `uat-tester`/`Uat2026!`
**Suite:** `tests/e2e/edge-cases.spec.ts` (TC-10..TC-19, 14 test dari `_docs/qa/uat-test-plan.md` §6)
**Hasil final (setelah 3x run, 2 perbaikan test diterapkan):** `10 passed, 4 failed` (2.6 menit)

Catatan proses: run pertama gagal total (Chromium headless-shell belum ter-install) — sudah diperbaiki. Run kedua nemuin salah ekspektasi teks EN di TC-14 dan double-click timing di TC-18 — sudah diperbaiki di test-nya. Run ketiga (final) di bawah ini. **TC-16 yang sebelumnya gagal karena login timeout, di run final ini PASSED** — menguatkan dugaan itu flakiness sesi (bukan bug app), bukan kegagalan konsisten.

## 🔴 Temuan nyata

### TC-11b — File `.pdf` berisi bukan-PDF **diterima** server (200, bukan ditolak)
**Test:** FAIL — expected `415`, dapat `200`.
**Konsisten dengan temuan backend REG-6** (`api-test-scenarios.md`/`api-test-results-2026-09-09.md`): baik lewat UI maupun langsung ke API, server sama sekali tidak validasi tipe konten file — cuma percaya ekstensi nama file. Ini dikonfirmasi dari dua arah (frontend proxy `/api/register` dan backend langsung), jadi bukan kebetulan satu lapis saja.
**Rekomendasi:** tambahkan validasi magic-bytes (cek header PDF `%PDF-`) minimal di backend `documents.py::_read_upload`, karena frontend saja tidak cukup (bisa dilewati langsung ke API — lihat TC-17 di bawah).

## 🟡 Perlu diverifikasi ulang (inconclusive, bukan bug terkonfirmasi)

### TC-13, TC-16 — Login Keycloak timeout 30 detik
**Test:** FAIL — keduanya gagal di step **login**, bukan di logout/refresh yang sebenarnya jadi fokus skenario.
**Konteks:** run test ini adalah login publisher ke-8 dan ke-11 dalam satu sesi ~4.4 menit (setiap TC yang butuh publisher login-ulang dari nol, tidak reuse sesi). Kemungkinan penyebab: rate-limiting/brute-force protection Keycloak yang mulai memperlambat setelah banyak login berturut-turut dalam waktu singkat, atau memang ada race/flakiness nyata di redirect setelah login.
**Belum bisa disimpulkan bug aplikasi** — perlu di-rerun TC-13/TC-16 secara terisolasi (bukan dalam satu batch 14 test yang semuanya login) untuk pastikan bukan efek rate-limit dari sesi testing ini sendiri.

### TC-18 — Double-click "Verifikasi Dokumen" timeout
**Test:** FAIL — timeout 30 detik saat klik kedua, elemen "detached from DOM, retrying".
**Konteks:** desain test ini sendiri agak agresif (`Promise.all` dua klik nyaris bersamaan dengan `force: true` di klik kedua) — errornya soal elemen ke-unmount saat klik kedua diproses, yang sebenarnya **konsisten dengan perilaku yang diharapkan** (tombol disable/unmount saat submit in-flight, jadi klik kedua memang seharusnya jadi no-op). Kemungkinan besar ini test yang perlu diperbaiki assertion/timing-nya, bukan bug aplikasi — tapi belum 100% dipastikan tanpa lihat trace.zip-nya langsung.

## ✅ Tidak ada masalah (test flag salah / expected text)

### TC-14 (bagian pertama) — heading EN tidak ketemu
**Root cause ditemukan:** test mengharapkan teks "Verify Official Documents", tapi string asli di `lib/i18n/translations.ts:263` adalah **"Verify an Official Document"** (singular, ada "an"). Ini **salah ekspektasi test**, bukan bug i18n aplikasi — i18n toggle-nya sendiri kemungkinan jalan normal. TC-14 bagian kedua ("toggle persists into /dashboard") **PASSED**, memperkuat bahwa mekanisme i18n-nya sehat.

## Hasil aman

- **TC-10** (oversize file ditolak Dropzone client-side) — PASSED
- **TC-11a** (`.txt` ditolak Dropzone) — PASSED
- **TC-15a/b** (akses langsung `/result/success` & `/result/failure` tanpa flow, sessionStorage kosong) — PASSED, tidak crash, sesuai constitution `sessionStorage` di CLAUDE.md
- **TC-17a/b/c** (bypass validasi lewat `/api/register` langsung — oversize, non-PDF, tanpa cookie) — PASSED, server-side route (`requireAuth.ts`) benar-benar re-validasi, tidak percaya begitu saja ke frontend
- **TC-19** (dark mode + mobile viewport verifier) — PASSED, tidak ada horizontal overflow

## Rekomendasi tindak lanjut

1. **Prioritas tinggi:** validasi magic-bytes PDF di backend (lihat REG-6 di `backend-for-uat/_docs/qa/results/api-test-results-2026-09-09.md`) — temuan ini dikonfirmasi dari 2 layer independen.
2. **Perlu rerun terisolasi:** TC-13 dan TC-16, satu test per run (bukan batch), untuk pastikan timeout login itu rate-limiting sesi testing atau bug nyata.
3. **Perbaiki test, bukan app:** TC-14 (ganti expected text jadi "Verify an Official Document"), TC-18 (perbaiki strategi double-click, mungkin cukup assert tombol ke-disable setelah klik pertama alih-alih paksa klik kedua).
