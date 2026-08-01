# BRD — PITS Frontend Core (Publisher Portal & Verification Portal)

**Status:** Approved (retroaktif — mendokumentasikan sistem yang sudah dibangun untuk UAT)
**Author:** Tim DELTA-PITS (didokumentasikan ulang oleh Claude Code)
**Tanggal:** 2026-07-31
**Project:** frontend-for-uat

---

## 1. Latar Belakang

Backend PITS (`backend-for-uat`) menyediakan API untuk registrasi dan verifikasi dokumen berbasis hash + blockchain anchoring (lihat `backend-for-uat/_docs/brd/brd-core.md`). Frontend ini adalah antarmuka yang membuat kapabilitas tersebut dapat dipakai oleh dua jenis pengguna: penerbit dokumen (publisher) dan masyarakat umum yang ingin memverifikasi dokumen.

## 2. Masalah

- Publisher butuh antarmuka yang mudah untuk upload dan mendaftarkan dokumen, melihat riwayat dokumen yang sudah didaftarkan, tanpa perlu memahami detail teknis API/blockchain.
- Masyarakat umum (verifier) butuh cara paling sederhana untuk mengecek keaslian dokumen — tanpa akun, tanpa harus paham hash/blockchain — cukup upload dokumen atau masukkan kode verifikasi.

## 3. User Persona

| Persona | Role | Familiaritas Teknis | Goals | Pain Points | Frekuensi Pakai |
|---------|------|----------------------|-------|-------------|-------------------|
| Publisher | Penerbit dokumen, login via Keycloak | Menengah | Mendaftarkan dokumen dengan cepat, melihat riwayat registrasi di dashboard | Proses upload harus jelas statusnya (sukses/gagal), tidak mau bolak-balik cek manual | Setiap menerbitkan dokumen baru |
| Verifier (publik) | Pengunjung tanpa akun | Awam | Cek keaslian dokumen secepat mungkin | Tidak mau ribet, tidak mau baca istilah teknis (hash, blockchain) | Sesekali |

## 4. User Journey

### Journey Publisher
```
ENTRY POINT   : Buka /login → autentikasi via Keycloak (NextAuth)
LANGKAH 1     : Redirect ke /publisher setelah login berhasil
LANGKAH 2     : Upload dokumen via Dropzone
LANGKAH 3     : Submit → backend register → tampilkan hasil (sukses/gagal) di /result
LANGKAH 4     : Cek riwayat registrasi di /dashboard (list record + bukti tx blockchain)
EXIT          : Publisher tahu dokumennya sudah terdaftar, punya referensi record
```

### Journey Verifier
```
ENTRY POINT   : Buka halaman utama (root "/") — tanpa login
LANGKAH 1     : Upload dokumen yang ingin dicek
LANGKAH 2     : Submit → backend verify → redirect ke /result/success atau /result/failure
EXIT          : Verifier melihat status terverifikasi/tidak beserta detail (issuer, tanggal)
```

**Catatan implementasi vs desain**: `app/verify/page.tsx` saat ini adalah halaman placeholder statis yang tidak terhubung navigasi — fungsi verifikasi sesungguhnya berjalan di root `/` (`app/page.tsx`). Lihat `_docs/audit/audit-2026-07-31.md` #9 dan `tasks/tasks.md` untuk keputusan yang perlu diambil (hapus placeholder atau selesaikan route-nya).

## 5. Tujuan & Success Metric

| Tujuan | Metric | Target |
|--------|--------|--------|
| Publisher bisa mendaftarkan dokumen tanpa training tambahan | Task success rate saat UAT | ≥ 90% publisher menyelesaikan alur registrasi tanpa bantuan |
| Verifier bisa mengecek dokumen tanpa akun | Waktu dari buka halaman sampai lihat hasil | < 30 detik |
| Tidak ada kebocoran data sensitif lewat frontend | Audit kode: query string, log, dsb | 0 temuan data sensitif ter-expose baru |

## 6. Scope

### In Scope
- Login publisher via Keycloak (NextAuth).
- Upload & registrasi dokumen (Publisher Portal).
- Dashboard riwayat registrasi.
- Verifikasi dokumen publik tanpa login.
- Tampilan hasil sukses/gagal yang jelas.

### Out of Scope
- Manajemen akun/role publisher dari sisi frontend (dikelola di Keycloak admin, bukan di aplikasi ini).
- Riwayat verifikasi untuk verifier publik (verifikasi bersifat sekali pakai, tidak ada histori tersimpan per pengunjung).
- Multi-bahasa (i18n) — belum ada requirement ini.

## 7. User Stories

```
SEBAGAI Publisher,
SAYA INGIN login lalu upload dokumen untuk didaftarkan,
SUPAYA dokumen saya punya bukti registrasi yang bisa dicek pihak lain.

Acceptance Criteria:
- [x] Login via Keycloak mengarahkan ke /publisher
- [x] Upload dokumen lewat Dropzone, submit ke backend /api/register
- [x] Hasil (sukses/gagal) ditampilkan di halaman /result
- [ ] File yang diupload divalidasi tipe & ukurannya SEBELUM dikirim ke backend (belum ada — lihat audit #2)

SEBAGAI Verifier (publik),
SAYA INGIN mengecek keaslian dokumen tanpa perlu akun,
SUPAYA saya cepat tahu apakah dokumen tersebut asli.

Acceptance Criteria:
- [x] Halaman utama bisa diakses tanpa login
- [x] Upload dokumen, submit ke backend /api/verify
- [x] Hasil ditampilkan jelas (terverifikasi / tidak)
```

## 8. Asumsi & Dependensi

| Asumsi | Risiko kalau asumsi salah |
|--------|------------------------------|
| Backend PITS selalu berjalan di URL yang dikonfigurasi (`PITS_BACKEND_*_URL`) | Semua fungsi utama (register/verify/records) gagal total kalau backend down/salah URL |
| Realm Keycloak & client secret sinkron antara frontend dan backend | Login gagal atau token ditolak backend kalau konfigurasi tidak sinkron |

| Dependensi | Status |
|------------|--------|
| Backend PITS (`backend-for-uat`) | Tersedia, harus dijalankan bersamaan (lihat README) |
| Keycloak realm `nextjs-kc` | Tersedia (docker-compose backend) |

## 9. Risiko

| Risiko | Kemungkinan | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Component tree duplikat (`features/`, `ui/` dead code) menyesatkan developer baru | Tinggi | Sedang | Putuskan: hapus dead code atau selesaikan migrasi (lihat `tasks/tasks.md`) |
| Tidak ada validasi upload di client — UX buruk & beban penuh ke backend | Tinggi | Sedang-Tinggi | Tambahkan `accept`/`maxSize` di Dropzone |
| Data hasil (hash, record ID) di query string URL | Sedang | Sedang | Pindahkan ke state yang tidak tampil di URL |

## 10. Keputusan

| Keputusan | Pilihan yang Dipertimbangkan | Pilihan yang Dipilih | Alasan |
|-----------|-------------------------------|-------------------------|--------|
| Auth di frontend | Custom session, NextAuth | NextAuth + Keycloak provider | Konsisten dengan backend yang sudah pakai Keycloak. Detail lihat ADR-001. |
| Test runner unit | Jest, Vitest | (belum final — dua-duanya ada, hanya Vitest yang wired ke Storybook) | Perlu keputusan eksplisit, lihat `tasks/tasks.md` |

## 11. Sign-off

| Peran | Nama | Status | Tanggal |
|-------|------|--------|---------|
| Product Owner | Tim DELTA-PITS | ☑ Approved (retroaktif, untuk rilis UAT) | 2026-07-31 |
