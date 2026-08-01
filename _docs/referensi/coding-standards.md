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
- **Testing**: unit test business logic (`lib/*.ts`, `hooks/*.ts`) via Vitest, project `unit` (jsdom, `vitest.config.ts`) — jalankan dengan `npm test`. File test pakai suffix `*.test.ts`/`*.test.tsx`, ditaruh bersebelahan dengan file yang ditest (lihat `lib/resultPayload.test.ts`). Storybook + `@storybook/addon-vitest` (project `storybook`) dipakai untuk interaction test komponen. Alias import (`@lib`, `@components`, dst) di-mirror manual di `vitest.config.ts` (`resolve.alias`) karena Vitest tidak baca `tsconfig.json` paths — kalau nambah alias baru, update juga di situ.

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
- **Upload file**: `Dropzone` punya validasi `accept`/`maxSize` (PDF only, 20MB) di client, dicerminkan di server oleh `parseUpload()` (`app/api/_lib/parseUpload.ts`, mengembalikan `ParseUploadResult` diskriminatif — 413 untuk file >20MB, 415 untuk non-PDF). Route API baru yang menerima file upload wajib memakai `parseUpload()`, jangan terima `FormData` mentah tanpa validasi ukuran/tipe.
- **Data hasil (result payload)**: jangan menaruh data sensitif (hash, ID record, pesan error mentah) ke query string URL. Pola yang benar: `lib/resultPayload.ts` (`buildResultHref`/`readResultPayload`) menyimpan payload di `sessionStorage`, href-nya cuma `/result/<status>`. Komponen client yang perlu membacanya lakukan lewat `useEffect` + `useState` (bukan `useMemo` langsung saat render) — `sessionStorage` cuma ada di client, baca langsung saat render bikin hasil SSR vs client-pertama beda dan memicu hydration mismatch.
- **Auth route protection**: route baru yang butuh login (halaman) wajib didaftarkan di `authorized` callback (`auth.ts`). Route **API** yang butuh sesi Keycloak pakai `requireAccessToken()` dari `app/api/_lib/requireAuth.ts` (bukan `auth()` manual berulang) — proxy Next.js (`authorized()` callback) sengaja TIDAK dipasang untuk `/api/*` karena kalau ditolak dia redirect ke halaman HTML, padahal client fetch API mengharapkan JSON.
- **Card**: border-only (`border border-base-300 bg-base-100 rounded-2xl`), **tidak ada shadow** — pertahankan konsistensi ini untuk komponen baru. Pengecualian yang disengaja: overlay (`RecordDetailDrawer`, drawer mobile navbar) pakai `shadow-2xl` karena benar-benar melayang di atas konten (z-50, fixed) — jangan tambah shadow ke card biasa, dan jangan hapus shadow di overlay demi "konsistensi".
- **Lebar halaman**: selalu lewat `components/layout/PageContainer.tsx` (`narrow`/`content`/`wide`/`full`), jangan tulis `max-w-*`/`mx-auto`/padding manual sendiri per halaman — itu sumber bug alignment (lihat riwayat di `design-system.md` §6).
- **Motion**: hover-lift (`transition-all duration-150 hover:-translate-y-0.5`) hanya untuk elemen yang benar-benar bisa diklik, jangan ditaruh di card statis/non-interaktif. Overlay pakai slide 200ms lewat varian Tailwind v4 `starting:` (`@starting-style`), bukan library animasi. Accordion pakai trik `grid-template-rows` + `<button aria-expanded>`, bukan native `<details>` (tidak bisa dianimasikan height-nya).
- **`FileUpload` adalah controlled component**: state `file`/`isUploading` dikelola di level halaman (lewat `useFileUpload()`), bukan di dalam `FileUpload` sendiri — supaya halaman bisa menampilkan info file di komponen sibling (mis. `MetadataCard`). Jangan kembalikan ke pola uncontrolled tanpa alasan kuat.
- **Console log**: tidak boleh ada `console.log` tertinggal di kode yang di-commit.
- **any type**: hindari `any` eksplisit — pakai tipe resmi dari library (contoh: `FileRejection[]` dari `react-dropzone`, bukan `any[]`).
