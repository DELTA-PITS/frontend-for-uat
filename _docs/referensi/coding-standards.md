# Coding Standards — PITS Frontend

## 1. Code Style

- **Framework**: Next.js App Router, React 19, TypeScript (`strict: true` — pertahankan, jangan matikan).
- **Linter**: Oxlint (bukan ESLint) — jalankan `npm run lint` sebelum commit. Belum ada `.oxlintrc.json` — kalau perlu kustomisasi rule, tambahkan file ini di root.
- **Styling**: TailwindCSS + daisyUI (`styles/globals.css`). Semua warna WAJIB lewat token daisyUI (`bg-primary`, `text-secondary`, `text-ink-secondary`, dst) — **jangan hardcode hex warna di komponen**. Ini bukan cuma gaya penulisan: rebrand warna dari teal ke merah BRIN (2026-08-01) hanya butuh edit satu file (`styles/globals.css`) justru karena aturan ini konsisten dipatuhi sebelumnya.
- **Ikon**: satu library — `@mui/icons-material` (varian Outlined dominan). Jangan tambah `@mdi/react` atau library ikon lain (sempat dipakai di navbar, sudah distandarisasi ke MUI 2026-08-01).
- **Struktur folder aktif**: `app/` (route), `components/{common,auth,layout,verify,register,dashboard}/` + file top-level (`FileUpload.tsx`, `ResultView.tsx`, `api.ts`, `BgHeader.tsx`) untuk komponen, `hooks/` untuk custom hook, `lib/` untuk utility (termasuk `lib/i18n/`), `types/` untuk definisi TypeScript bersama.
  `components/features/` dan `components/ui/` (dead code lama) **sudah dihapus** (2026-08-01) — kalau menemukan referensi ke folder ini di dokumen lama, itu sudah tidak berlaku.
- **Naming**: PascalCase untuk komponen React, camelCase untuk fungsi/variable, kebab-case untuk nama file route Next.js.
- **Server vs Client Component**: default ke server component; pakai `'use client'` hanya untuk yang benar-benar butuh interaktivitas/state/effect browser ATAU butuh `useLocale()` (context i18n hanya jalan di client). Kalau sebuah Server Component perlu menampilkan teks yang harus ikut locale, pisahkan bagian teks itu ke client component kecil (lihat pola `DashboardHeader.tsx`/`DashboardErrorAlert.tsx`) — jangan ubah seluruh halaman jadi client component hanya demi satu judul.
- **Image**: selalu pakai `next/image`, bukan `<img>` biasa.
- **Testing**: unit test business logic (`lib/*.ts`, `hooks/*.ts`) via Vitest — bukan Jest (`jest.config.ts` saat ini tidak efektif, masih di backlog `tasks/tasks.md` #3). Storybook + `@storybook/addon-vitest` dipakai untuk interaction test komponen.

## 2. Internasionalisasi (i18n) — WAJIB dibaca sebelum menambah teks UI

- **Jangan pernah hardcode string yang tampil ke user langsung di JSX.** Semua teks (label, heading, placeholder, pesan error, aria-label) WAJIB lewat `lib/i18n/translations.ts` + hook `useLocale()`.
- Alur nambah teks baru:
  1. Tambah key di **kedua** objek `id` dan `en` pada `lib/i18n/translations.ts` (di section yang relevan, atau bikin section baru kalau memang fitur baru).
  2. Di komponen (`'use client'` wajib), `const { t } = useLocale();` lalu pakai `t.section.key`.
  3. Untuk teks dengan variabel (mis. "Menampilkan 1–10 dari 42"), pakai pola function di dictionary (lihat `t.pagination.showing`), bukan string template manual yang cuma ada di satu bahasa.
- **Tanggal**: pakai `formatDisplayDateTime(value, locale)` dari `lib/dateFormat.ts`, jangan format tanggal manual — `locale` didapat dari `useLocale()`.
- **Server Component**: tidak bisa memanggil `useLocale()` (locale hanya ada di `localStorage`, client-only). Kalau error/pesan dari server perlu diterjemahkan, kirim **kode** (union type string, bukan pesan jadi), lalu terjemahkan di client component kecil yang consume kode itu — lihat `DashboardErrorAlert.tsx` sebagai contoh pola.
- Cara test cepat: buka halaman, klik toggle "EN" di navbar, pastikan tidak ada teks Indonesia yang "bocor" (berarti ada string yang lupa dipindah ke dictionary).

## 3. Project Rules

- **Env var Keycloak**: server-side (`AUTH_KEYCLOAK_ISSUER`, `AUTH_KEYCLOAK_ID`, `AUTH_KEYCLOAK_SECRET`) dan client-side (`NEXT_PUBLIC_AUTH_KEYCLOAK_ID`, `NEXT_PUBLIC_AUTH_KEYCLOAK_ISSUER`, `NEXT_PUBLIC_AUTH_URL`) harus selalu diubah bersamaan — jangan ubah salah satu tanpa cek yang lain.
- **Upload file**: `Dropzone` sudah punya validasi `accept`/`maxSize` (PDF only, 20MB) — pertahankan pola ini untuk dropzone baru. Validasi **server-side** (`app/api/_lib/parseUpload.ts`) masih belum selengkap client-side — jangan asumsikan server sudah aman, itu backlog terbuka (`tasks/tasks.md` #2b).
- **Data hasil (result payload)**: jangan menaruh data baru yang sensitif (hash, ID record, pesan error mentah) ke query string URL — pola `lib/resultPayload.ts` saat ini melakukan ini dan masih di backlog perbaikan (`tasks/tasks.md` #7). Fitur baru jangan menambah pola serupa di tempat lain.
- **Auth route protection**: route baru yang butuh login wajib didaftarkan di `authorized` callback (`auth.ts`) — jangan hanya mengandalkan cek manual di komponen.
- **Card**: border-only (`border border-base-300 bg-base-100 rounded-xl`), **tidak ada shadow di manapun** di UI ini — pertahankan konsistensi ini untuk komponen baru.
- **`FileUpload` adalah controlled component**: state `file`/`isUploading` dikelola di level halaman (lewat `useFileUpload()`), bukan di dalam `FileUpload` sendiri — supaya halaman bisa menampilkan info file di komponen sibling (mis. `MetadataCard`). Jangan kembalikan ke pola uncontrolled tanpa alasan kuat.
- **Console log**: tidak boleh ada `console.log` tertinggal di kode yang di-commit.
- **any type**: hindari `any` eksplisit — pakai tipe resmi dari library (contoh: `FileRejection[]` dari `react-dropzone`, bukan `any[]`).
