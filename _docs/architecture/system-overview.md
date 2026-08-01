# System Overview — PITS Frontend

**Terakhir diupdate:** 2026-08-01

## Gambaran Umum

Aplikasi Next.js App Router dengan tiga area: **Verify** (publik, `/`), **Register** (publisher, `/publisher`), **Dashboard** (publisher, `/dashboard`). Semua panggilan ke backend PITS diproksi lewat Next.js API routes server-side (`app/api/*`), bukan langsung dari client.

**⚠️ Project ini pakai Next.js 16 — proteksi route lewat `proxy.ts`, BUKAN `middleware.ts`.** Next.js 16 men-deprecate konvensi `middleware.ts` dan menggantinya dengan `proxy.ts` (`export { auth as proxy } from '@/auth'`). File itu **sudah ada** di root dan sudah menjalankan `authorized()` callback di `auth.ts` untuk semua route. **Jangan pernah membuat `middleware.ts` baru** — Next.js akan menolak start server kalau keduanya terdeteksi bersamaan ("Both middleware file and proxy file are detected"). Lihat `_docs/security/session-auth-audit-2026-08-02.md` §12 untuk kronologi lengkap kesalahan ini.

Proteksi `/publisher` dan `/dashboard` sekarang 2 lapis: `proxy.ts` (edge, utama) + `redirect()` eksplisit di masing-masing `page.tsx` (defense-in-depth). Keduanya juga pakai `export const dynamic = 'force-dynamic'` supaya tidak pernah di-cache (mencegah halaman lama muncul lagi lewat tombol back/forward setelah logout).

**`proxy.ts`/`authorized()` TIDAK memproteksi `/api/*`** (matcher-nya lolos untuk path apapun selain `/publisher`/`/dashboard`) — kalau proteksi API dipasang lewat mekanisme itu, penolakan akan me-redirect ke halaman HTML, padahal client fetch API mengharapkan JSON, dan itu bisa merusak alur upload. Sebagai gantinya, route API yang butuh sesi Keycloak (`app/api/register`, `app/api/records`) memanggil `requireAccessToken()` dari `app/api/_lib/requireAuth.ts` — satu sumber kebenaran untuk cek `auth()`+`accessToken`, dipanggil manual di awal handler masing-masing. `app/api/verify` sengaja tidak memakainya karena publik (lihat Constitution di `CLAUDE.md`).

```
┌────────────┐   login    ┌──────────────┐
│  Publisher │ ─────────► │  Keycloak    │
└─────┬──────┘            └──────────────┘
      │ session (NextAuth)
      ▼
┌─────────────────────────────────────────────┐
│  Next.js App (frontend-for-uat)               │
│  app/publisher, app/dashboard, app/ (verify)  │
│  ── proxy ──►  app/api/{register,verify,records}/route.ts
└─────────────────────┬─────────────────────────┘
                       │ HTTP (server-side fetch)
                       ▼
              ┌──────────────────┐
              │  Backend PITS     │
              │ (backend-for-uat) │
              └──────────────────┘
```

## Komponen Aktif per Area

### Navbar (global)
| File | Catatan |
|---|---|
| `components/layout/Header.tsx` | **≥sm**: 1 baris utama (Layanan Dokumen, Dashboard, `LanguageSwitcher`, Masuk/Keluar) + sub-nav Registrasi/Verifikasi (hanya tampil di section dokumen). **<sm**: logo + hamburger, membuka drawer full-screen (slide 200ms) berisi daftar menu vertikal |
| `components/layout/LanguageSwitcher.tsx` | Toggle ID/EN, baca-tulis `LocaleContext`, dipakai di navbar dan drawer mobile |
| `components/layout/PageContainer.tsx` | Satu-satunya sumber lebar+padding halaman — variant `narrow`/`content`/`wide`/`full` (lihat `_docs/design/design-system.md` §7) |

### Verify (`/`, publik)
| File | Catatan |
|---|---|
| `app/page.tsx` | Compose hero + form + tips + FAQ, panggil `useFileUpload('verify')` |
| `components/verify/VerifyHero.tsx` | Hero teal/primary, badge "Akses Publik" |
| `components/verify/TipsCard.tsx` | "Mengapa menggunakan sistem ini?" |
| `components/verify/HowItWorks.tsx` | 4 langkah cara kerja |
| `components/verify/FAQSection.tsx` | 3 pertanyaan, accordion terkontrol (`<button aria-expanded>` + trik `grid-template-rows`, animasi 200ms — bukan native `<details>`) |

### Register (`/publisher`, butuh role publisher)
| File | Catatan |
|---|---|
| `app/publisher/page.tsx` | Compose hero + form + metadata + requirement, panggil `useFileUpload('register')` |
| `components/register/RegisterHero.tsx` | Hero navy/secondary, badge "Khusus Publisher" |
| `components/register/MetadataCard.tsx` | Ringkasan file live (nama/ukuran/SHA-256 dihitung client-side/status) |
| `components/register/RequirementCard.tsx` | Syarat dokumen |
| `components/register/BeforeSubmitChecklist.tsx` | Notice info (bukan warning) sebelum submit |

### Shared upload mechanics (dipakai Verify & Register)
| File | Catatan |
|---|---|
| `components/FileUpload.tsx` | **Controlled component** — state `file`/`isUploading` diangkat ke halaman (`useFileUpload`), bukan dikelola sendiri. Prop `accent` (`primary`/`secondary`) mewarnai `Dropzone`. |
| `components/common/Dropzone.tsx` | Validasi client-side PDF-only + max 20MB, pesan error inline |
| `components/common/DocumentPreview.tsx`, `components/common/LoadingCard.tsx`, `components/common/OperationCard.tsx`, `components/common/OperationButton.tsx` | Border-only (tanpa shadow), semua sudah pakai `useLocale()`. `OperationCard`: `title`/`description` opsional (dikosongkan di Verify/Register karena Hero sudah menjelaskan, dead tanpa render kalau kosong) |
| `components/common/EmptyState.tsx` | Pola empty-state tunggal (ikon → judul → deskripsi → tombol aksi), dipakai `RecordsTable` |
| `hooks/useUpload.ts` | Submit logic, redirect ke `/result/*` via `lib/resultPayload.ts` |

### Dashboard (`/dashboard`, butuh role publisher)
| File | Catatan |
|---|---|
| `app/dashboard/page.tsx` | Server Component — fetch `records` server-side, tidak ada `useEffect` fetch. Pakai `PageContainer as="main" variant="wide"` |
| `app/dashboard/loading.tsx` | Skeleton (`TableSkeleton`), bukan spinner, saat Server Component masih fetch |
| `components/dashboard/DashboardHeader.tsx` | Client component kecil untuk judul+CTA (full-width di mobile) yang perlu ikut locale |
| `components/dashboard/DashboardErrorAlert.tsx` | Maps error **code** (`no_backend`/`no_token`/`load_failed`/`conn_failed`) dari server ke pesan terjemahan di client |
| `components/dashboard/DashboardView.tsx` | Orkestrasi state (search/filter/sort/density/pagination/drawer). Render `StatusSummary` (progressive disclosure — "Semua N dokumen tercatat on-chain") sebelum `StatsCards` |
| `components/dashboard/StatsCards.tsx` | 4 kartu: Total, Publisher, Bulan Ini, Status Sistem — grid `2/3/4` kolom (mobile/`md`/`xl`), kartu Status span 3 kolom di rentang tablet supaya tidak jadi yatim piatu |
| `components/dashboard/DashboardToolbar.tsx` | Search (baris sendiri) + filter/sort/density/refresh (baris kedua) |
| `components/dashboard/RecordsTable.tsx` | Tabel (`≥lg`) + card (`<lg`, termasuk tablet portrait), TANPA kolom hash. Hover-lift di card mobile (elemen clickable) |
| `components/dashboard/Pagination.tsx` | Client-side, atas seluruh data yang sudah di-fetch |
| `components/dashboard/RecordDetailDrawer.tsx` | Drawer kanan (`≥sm`, lebar bertingkat `md/lg/xl`) / bottom sheet (`<sm`) — tabel tetap terlihat di belakang. Slide-in 200ms + `shadow-2xl` (satu-satunya elemen dengan shadow di app, karena overlay) |
| `components/dashboard/CopyButton.tsx` | Copy-to-clipboard kecil, dipakai drawer & result page |
| `components/dashboard/TableSkeleton.tsx` | Skeleton loading untuk `app/dashboard/loading.tsx` |

### Result (`/result/success`, `/result/failure`)
| File | Catatan |
|---|---|
| `app/result/success/page.tsx`, `app/result/failure/page.tsx` | Thin wrapper, render `ResultView` |
| `components/ResultView.tsx` | 4 state: Registrasi Berhasil / Dokumen Terverifikasi / Dokumen Tidak Ditemukan / Error — kartu terpisah per outcome, bukan alert generik |
| `lib/resultPayload.ts` | `buildResultHref` menyimpan hasil (hash, record ID) di `sessionStorage` (bukan query string sejak 2026-08-02), href-nya `/result/<status>` polos. `readResultPayload` dibaca `ResultView` lewat `useEffect` (client-only, `sessionStorage` tidak ada saat SSR) |

## Sistem i18n (ID/EN)

| File | Fungsi |
|---|---|
| `lib/i18n/translations.ts` | Kamus lengkap `id`/`en`, satu source of truth untuk SEMUA teks UI |
| `lib/i18n/LocaleContext.tsx` | `LocaleProvider` (wrap di `app/layout.tsx`) + hook `useLocale()` → `{ locale, setLocale, t }`. Persist ke `localStorage` (`pits-locale`), default `'id'` saat SSR untuk hindari hydration mismatch |
| `lib/uploadErrorMessage.ts` | Terima `t: Dictionary`, map kode HTTP → pesan terjemahan |
| `lib/dateFormat.ts` | `formatDisplayDateTime(value, locale)` — format tanggal ikut locale aktif |

**Pola untuk Server Component yang butuh teks terjemahan**: karena locale hanya diketahui di client (`localStorage`, bukan cookie), bagian statis pada Server Component (mis. judul halaman Dashboard) dipisah ke client component kecil (`DashboardHeader.tsx`) yang consume `useLocale()`, sementara data-fetching tetap di server. Error dari server dikirim sebagai **kode**, bukan string siap-tampil, supaya bisa diterjemahkan di client (`DashboardErrorAlert.tsx`).

## Deployment

Frontend butuh backend PITS berjalan (lihat `backend-for-uat/_docs/architecture/system-overview.md`). Environment variable yang dibutuhkan tersebar di `auth.ts`, `app/api/register/route.ts`, `components/auth/SignOut.tsx` — belum ada `.env.example` terpusat (lihat `tasks/tasks.md` #8).
