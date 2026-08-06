# Onboarding — PITS Frontend

Panduan handoff untuk developer yang melanjutkan/mengambil alih project ini. Baca ini dulu sebelum menyentuh kode.

**Terakhir diupdate:** 2026-08-02

---

## 1. Apa Project Ini

Aplikasi Next.js (App Router) untuk **Public Information Trust System (PITS)** — dua portal: Publisher Portal (registrasi dokumen, `/publisher` + `/dashboard`) dan Verification Portal (verifikasi publik, `/`). Auth via NextAuth v5 (beta) + Keycloak. Styling TailwindCSS + daisyUI, warna brand **merah BRIN** (`#E62F2A`, diambil langsung dari identitas visual brin.go.id). Seluruh UI mendukung **dua bahasa (ID/EN)** lewat sistem i18n custom. Butuh backend `../backend-for-uat/` berjalan agar sebagian besar fitur berfungsi.

Baca urutan berikut untuk konteks lengkap:
1. `README.md` + `CONTRIBUTE.md` — cara jalankan lokal. (Struktur folder di README mungkin masih menyebut `components/features/`/`components/ui/` — folder itu **sudah dihapus**, lihat poin 3.)
2. `CLAUDE.md` — source of truth, constitution, aturan kritis.
3. `_docs/brd/brd-core.md` — kenapa project ini ada, persona, journey.
4. `_docs/architecture/system-overview.md` — peta komponen aktif per area + sistem i18n.
5. `_docs/design/design-system.md` — warna, tipografi, komponen, riwayat keputusan desain (termasuk kenapa warnanya merah, bukan biru/teal).
6. `_docs/referensi/coding-standards.md` — termasuk aturan wajib i18n (§2) sebelum menambah teks UI apapun.

## 2. Setup Cepat

```bash
npm install
cp .env.local.example .env.local   # isi AUTH_KEYCLOAK_*, NEXT_PUBLIC_AUTH_KEYCLOAK_*, PITS_BACKEND_*_URL
npm run dev
```

Pastikan backend PITS sudah jalan (`../backend-for-uat/`) sebelum test fitur register/verify/dashboard.

## 3. Yang PALING Penting Diketahui Sebelum Coding

- **Jangan pernah hardcode teks UI.** Semua string yang tampil ke user (label, heading, pesan error) WAJIB lewat `lib/i18n/translations.ts` + hook `useLocale()`. Tambah key baru ke **kedua** objek `id` dan `en` sekaligus. Server Component tidak bisa akses locale (client-only, via `localStorage`) — kalau perlu teks terjemahan di Server Component, kirim **kode** dan terjemahkan di client component kecil (contoh: `components/dashboard/DashboardErrorAlert.tsx`). Detail lengkap: `_docs/referensi/coding-standards.md` §2.
- **Warna selalu lewat token daisyUI** (`bg-primary`, `text-secondary`, dst di `styles/globals.css`) — jangan hardcode hex di komponen. Brand color sekarang **merah** (`#E62F2A` light / `#FF6B61` dark), bukan biru/teal seperti versi-versi sebelumnya. `error` token sengaja dibuat lebih gelap (`#991B1B`) supaya beda dari `primary` — keduanya sama-sama merah, jadi hati-hati kalau menambah elemen UI baru yang butuh dibedakan tegas dari CTA utama.
- **`components/features/` dan `components/ui/` sudah dihapus** (2026-08-01) — itu dulu dead code yang divergen dari versi aktif. Semua komponen aktif ada di `components/{common,auth,layout,verify,register,dashboard}/` + file top-level (`FileUpload.tsx`, `ResultView.tsx`). Kalau nemu dokumen lama yang masih menyebut folder itu, abaikan.
- **`FileUpload` adalah controlled component**: state `file`/`isUploading` dikelola di level halaman lewat `useFileUpload()` (hook), bukan di dalam `FileUpload` sendiri — supaya halaman bisa menampilkan info file yang sama di komponen sibling (mis. `MetadataCard` di halaman Register). Jangan kembalikan ke pola uncontrolled.
- **Route verifikasi sesungguhnya ada di `app/page.tsx` (root `/`)**. `app/verify/page.tsx` masih placeholder statis, tidak terhubung navigasi, belum ikut sistem i18n — nasibnya (lanjutkan jadi entry point resmi atau hapus) masih keputusan terbuka, lihat `_docs/tasks/tasks.md` #11.
- **Validasi upload ada di dua lapis** (2026-08-02): client (`components/common/Dropzone.tsx`: PDF-only, max 20MB, pesan error inline via `t.dropzone.*`) DAN server (`app/api/_lib/parseUpload.ts`, mengembalikan `ParseUploadResult` diskriminatif — 413 kalau >20MB, 415 kalau bukan PDF berdasar ekstensi+MIME). Jangan hapus/lemahkan pengecekan server-nya dengan alasan "client sudah cek".
- **Setup test sudah rapi** (2026-08-02): `jest.config.ts` **sudah dihapus**, cuma Vitest. `vitest.config.ts` punya 2 project — `unit` (jsdom, untuk `lib/*.ts` + hooks, dijalankan via `npm test`) dan `storybook` (browser/Playwright, untuk story interaction test). Alias `@lib`/`@components`/dst di-mirror manual di `vitest.config.ts` (`resolve.alias`) karena Vitest tidak baca `tsconfig.json` paths otomatis — kalau nambah alias baru di `tsconfig.json`, tambahkan juga di sana.
- **API route yang butuh sesi Keycloak pakai `app/api/_lib/requireAuth.ts`** (`requireAccessToken()`) — jangan tulis ulang `const session = await auth(); if (!session?.accessToken) ...` di route baru, pakai helper ini supaya konsisten. `app/api/records/route.ts` saat ini tidak dipanggil dari mana pun (dashboard fetch backend langsung, server-side) — jangan bingung kalau nemu route ini "tidak terpakai", itu memang begitu; lihat `_docs/tasks/tasks.md`.
- **Hasil register/verify (hash, record ID) TIDAK lagi lewat query string URL** (2026-08-02) — `lib/resultPayload.ts` (`buildResultHref`/`readResultPayload`) menyimpannya di `sessionStorage`, href-nya `/result/<status>` polos. `ResultView.tsx` baca payload lewat `useEffect` (bukan `useMemo`) karena `sessionStorage` cuma ada di client — kalau butuh data serupa di komponen lain, ikuti pola yang sama, jangan taruh data sensitif balik ke URL.
- **Dua set env var Keycloak** (server `AUTH_KEYCLOAK_*` vs client `NEXT_PUBLIC_AUTH_KEYCLOAK_*`) harus selalu diubah bersamaan.
- **Dashboard detail dokumen pakai drawer kanan (`≥sm`) / bottom sheet (`<sm`)** (`RecordDetailDrawer.tsx`), bukan modal tengah — pola ini disengaja supaya tabel tetap terlihat di belakang. Ikuti pola ini untuk panel detail baru, jangan balik ke `<dialog>` modal.
- **Card selalu border-only, tanpa shadow** (`border border-base-300 bg-base-100 rounded-2xl`) — konsisten di seluruh app. **Kecuali overlay** (drawer, drawer mobile navbar) yang sengaja diberi `shadow-2xl` karena benar-benar melayang di atas konten — jangan tambah shadow ke card biasa, itu bukan bug yang perlu "diperbaiki" jadi konsisten.
- **Lebar halaman selalu lewat `PageContainer`** (`components/layout/PageContainer.tsx`, variant `narrow`/`content`/`wide`/`full`) — jangan tulis `max-w-*` + `mx-auto` + padding manual sendiri di halaman baru. Lihat `_docs/design/design-system.md` §7.
- **Motion sudah ada standarnya**: hover-lift (150ms) hanya di elemen yang benar-benar bisa diklik (jangan ditaruh di card statis), overlay (drawer) slide 200ms pakai varian Tailwind v4 `starting:` (`@starting-style`, CSS murni tanpa JS), accordion pakai trik `grid-template-rows` (bukan native `<details>`, supaya bisa dianimasikan). Lihat `_docs/design/design-system.md` §8.

## 4. Alur Kerja yang Diharapkan

Ikuti `CLAUDE.md` § "Wajib Sebelum Coding Fitur". Ringkas: cek SRS di `_docs/srs/` dulu → cek Definition of Ready → coding (ingat aturan i18n & token warna di atas) → jalankan AI review checklist → update `_docs/status/log.md` (append di paling atas, jangan hapus entry lama).

## 5. Prioritas Kerja Saat Ini

Lihat `_docs/tasks/tasks.md` untuk daftar lengkap dengan prioritas. Ringkas beberapa teratas (per 2026-08-02, #2b/#3/#6/#7/#9b sudah selesai):
1. Aktifkan kembali CI linting — #4.
2. Evaluasi upgrade `next-auth` ke versi stabil begitu tersedia — #5.
3. Buat `.env.example` — #8.
4. Putuskan nasib `app/verify/page.tsx` (placeholder orphan) — #11.
5. Server-side pagination untuk dashboard (saat ini masih client-side atas seluruh data yang di-fetch) — #12.

## 6. Kontak/Konteks Tambahan

Backend ada di `../backend-for-uat/` (lihat `ONBOARDING.md`-nya untuk konteks server-side). Realm Keycloak & client secret harus tetap sinkron antara frontend dan backend.
