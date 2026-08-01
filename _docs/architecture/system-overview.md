# System Overview — PITS Frontend

**Terakhir diupdate:** 2026-08-01

## Gambaran Umum

Aplikasi Next.js App Router dengan tiga area: **Verify** (publik, `/`), **Register** (publisher, `/publisher`), **Dashboard** (publisher, `/dashboard`). Semua panggilan ke backend PITS diproksi lewat Next.js API routes server-side (`app/api/*`), bukan langsung dari client.

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
| `components/layout/Header.tsx` | 2 baris: identitas institusi + Dashboard + `LanguageSwitcher` + Masuk/Keluar (atas), menu "Layanan Dokumen" — Registrasi/Verifikasi (bawah) |
| `components/layout/LanguageSwitcher.tsx` | Toggle ID/EN, baca-tulis `LocaleContext` |

### Verify (`/`, publik)
| File | Catatan |
|---|---|
| `app/page.tsx` | Compose hero + form + tips + FAQ, panggil `useFileUpload('verify')` |
| `components/verify/VerifyHero.tsx` | Hero teal/primary, badge "Akses Publik" |
| `components/verify/TipsCard.tsx` | "Mengapa menggunakan sistem ini?" |
| `components/verify/HowItWorks.tsx` | 4 langkah cara kerja |
| `components/verify/FAQSection.tsx` | 3 pertanyaan (accordion native `<details>`) |

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
| `components/common/DocumentPreview.tsx`, `components/common/LoadingCard.tsx`, `components/common/OperationCard.tsx`, `components/common/OperationButton.tsx` | Border-only (tanpa shadow), semua sudah pakai `useLocale()` |
| `hooks/useUpload.ts` | Submit logic, redirect ke `/result/*` via `lib/resultPayload.ts` |

### Dashboard (`/dashboard`, butuh role publisher)
| File | Catatan |
|---|---|
| `app/dashboard/page.tsx` | Server Component — fetch `records` server-side, tidak ada `useEffect` fetch |
| `components/dashboard/DashboardHeader.tsx` | Client component kecil untuk judul+CTA yang perlu ikut locale |
| `components/dashboard/DashboardErrorAlert.tsx` | Maps error **code** (`no_backend`/`no_token`/`load_failed`/`conn_failed`) dari server ke pesan terjemahan di client |
| `components/dashboard/DashboardView.tsx` | Orkestrasi state (search/filter/sort/density/pagination/drawer) |
| `components/dashboard/StatsCards.tsx` | 4 kartu setara: Total, Publisher, Bulan Ini, Status Sistem |
| `components/dashboard/DashboardToolbar.tsx` | Search (baris sendiri) + filter/sort/density/refresh (baris kedua) |
| `components/dashboard/RecordsTable.tsx` | Tabel (desktop) + card (mobile), TANPA kolom hash |
| `components/dashboard/Pagination.tsx` | Client-side, atas seluruh data yang sudah di-fetch |
| `components/dashboard/RecordDetailDrawer.tsx` | **Drawer kanan** (bukan modal tengah) — tabel tetap terlihat di belakang |
| `components/dashboard/CopyButton.tsx` | Copy-to-clipboard kecil, dipakai drawer & result page |

### Result (`/result/success`, `/result/failure`)
| File | Catatan |
|---|---|
| `app/result/success/page.tsx`, `app/result/failure/page.tsx` | Thin wrapper, render `ResultView` |
| `components/ResultView.tsx` | 4 state: Registrasi Berhasil / Dokumen Terverifikasi / Dokumen Tidak Ditemukan / Error — kartu terpisah per outcome, bukan alert generik |
| `lib/resultPayload.ts` | Serialisasi hasil ke query string (⚠️ masih berisi data sensitif di URL, lihat `tasks/tasks.md` #7) |

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
