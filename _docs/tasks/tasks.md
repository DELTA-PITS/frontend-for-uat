# Tasks — Backlog (PITS Frontend)

Semua request masuk sini. Diedit manual oleh manusia saat brief baru masuk; status diupdate seiring pengerjaan.

**Terakhir diupdate:** 2026-08-01

## Belum Dikerjakan

| # | Task | Tipe | Prioritas | Sumber |
|---|------|------|-----------|--------|
| 2b | Tambah validasi upload di **server** (`app/api/_lib/parseUpload.ts` masih cuma cek `file instanceof File`, belum cek MIME/ekstensi/ukuran — validasi baru ada di client `Dropzone`) | Security | High | Audit #2 (sisa) |
| 3 | Bersihkan setup test: hapus/reparasi `jest.config.ts` (nol test, environment salah), tulis unit test untuk `lib/*.ts`, `hooks/useUpload.ts`, dan translation dictionary via Vitest | Test coverage | High | Audit #3 |
| 4 | Aktifkan kembali CI linting sebelum lanjut dari UAT ke tahap berikutnya | Infra | Medium | Audit #4 |
| 5 | Evaluasi upgrade `next-auth` ke versi stabil begitu tersedia | Dependency | Medium | Audit #5 |
| 6 | Tambahkan proteksi middleware (defense-in-depth) untuk route API (`/api/register`, `/api/records`) | Security hardening | Medium | Audit §2.1 |
| 7 | Hindari menaruh data hasil (hash, record ID) di query string (`lib/resultPayload.ts`) — pertimbangkan alternatif (session storage/server state) | Security/privacy | Medium | Audit #7 |
| 8 | Buat `.env.example` yang mendokumentasikan seluruh env var yang dibutuhkan | DX | Low | Audit #11 |
| 9b | Hapus dependency `lucide-react` yang tidak terpakai (0 import di seluruh kode) | Code quality | Low | Audit #10 (sisa) |
| 11 | Putuskan nasib route `app/verify/page.tsx` (placeholder orphan, masih hardcode Inggris, belum ikut sistem i18n) — lanjutkan jadi entry point resmi atau hapus | Keputusan produk | Low | Audit #9 |
| 12 | Server-side pagination untuk `GET /api/v1/records` di backend — dashboard saat ini masih paginate di client atas seluruh data yang di-fetch sekaligus (aman untuk skala UAT, tapi tidak untuk ribuan dokumen) | Performance / perlu kerja bareng backend | Low-Medium | Design review 2026-08-01 |
| 14 | Pertimbangkan apakah kontras primary (merah `#E62F2A`) vs error (`#991B1B`) sudah cukup jelas dibedakan di semua konteks, terutama badge/alert yang berdekatan | Accessibility review | Low | Rebrand warna 2026-08-01 |
| 16 | Tambah tombol quick-action "Verifikasi Dokumen" di `DashboardHeader` (saat ini hanya ada "Daftarkan Dokumen") | Design polish | Low | Design review 2026-08-01 |
| 17 | Ekstrak komponen generik `PageHeader`/`SectionHeader`/`FilterBar`/`ConfirmDialog`/`StatCard` — tunda sampai ada use-case kedua yang nyata (hindari abstraksi prematur) | Refactor | Low | Design review 2026-08-01 |
| 18 | Border hierarchy 4 tingkat (card utama vs sekunder) — token `--color-divider-strong` sudah tersedia (`design-language-v2.md` §2) tapi belum dipakai di komponen manapun | Design polish | Low | Design review 2026-08-01 |
| 19 | Audit ritme layout & whitespace menyeluruh (jeda visual antar section, "napas" halaman) — disepakati layak tapi butuh sesi tersendiri | Design polish | Medium | Riset tren 2026 |
| 20 | Audit dark mode sebagai desain mandiri (bukan invert warna — border lebih redup, shadow nyaris hilang, surface lebih banyak) | Design polish | Medium | Riset tren 2026 |
| 21 | Diferensiasi mental model Upload vs Verify — Upload lebih fokus form+guidance, Verify lebih fokus hasil+scan cepat (saat ini dua halaman nyaris identik strukturnya) | Design/UX | Low-Medium | Riset tren 2026 |

## Sedang Dikerjakan

_(kosong)_

## Selesai

| # | Task | Selesai |
|---|------|---------|
| 1 | Hapus dead code `components/features/*` dan `components/ui/*` (15 file, divergen dari versi aktif) | 2026-08-01 |
| 2a | Validasi upload client-side (PDF-only, max 20MB, pesan error inline) di `Dropzone.tsx` | 2026-08-01 |
| 9a | Hapus `console.log` debug, ganti `any[]` dengan `FileRejection[]` di `Dropzone.tsx` | 2026-08-01 |
| 10 | Pindahkan dashboard dari client `useEffect` fetch ke Server Component (`app/dashboard/page.tsx`) | 2026-08-01 |
| — | Redesain penuh Verify/Register/Dashboard/Result/Navbar (identitas visual, warna brand BRIN, tipografi, dashboard restructure) | 2026-08-01 |
| — | Sistem i18n penuh (ID/EN) untuk seluruh aplikasi | 2026-08-01 |
| — | Restrukturisasi navbar: "Layanan Dokumen" jadi item menu utama sejajar Dashboard/Bahasa/Keluar, sub-nav Registrasi/Verifikasi hanya tampil di section dokumen | 2026-08-01 |
| 13 | Audit + terapkan type scale final (2 revisi): (1) level 24px dihapus, level baru `text-lg` (Subsection) ditambah, 2 bug class tidak valid (`text-xxl`, `text-md`) diperbaiki; (2) setelah cek visual, seluruh scale dipadatkan turun 1 step (H1 30px, Section 20px, Card Title 18px, Subsection 16px, Body 14px, Caption 12px) karena skala awal kegedean untuk aplikasi enterprise/internal | 2026-08-01 |
| — | Bug fix kritis: hapus rule global `h2`/`h4` di `globals.css` yang (di luar `@layer`) mengalahkan SEMUA class `text-*` Tailwind di elemen `<h2>`/`<h4>` — ditemukan saat verifikasi visual mobile | 2026-08-01 |
| — | Review desain menyeluruh + perbaikan layout & mobile responsiveness: hero disederhanakan (hapus avatar ikon, padding dipadatkan), navbar mobile jadi hamburger+drawer, `RecordDetailDrawer` jadi bottom sheet di mobile, `Dropzone` disederhanakan di mobile, tombol submit sticky di mobile, `EmptyState` diekstrak jadi komponen reusable, focus state global (`*:focus-visible`) ditambah, padding halaman jadi responsif (`px-4 sm:px-6 lg:px-8`) | 2026-08-01 |
| — | Bug fix: `OperationCard` `max-w-4xl` vs semua komponen lain `max-w-3xl` di halaman Verify/Register — beda lebar independen-center bikin card terlihat tidak sejajar (screenshot user) | 2026-08-01 |
| — | Layout system dibangun: komponen `PageContainer` (`narrow`/`content`/`wide`/`full`) jadi satu-satunya sumber lebar halaman — dipakai di Verify, Register, Dashboard. `OperationCard` naik ke `max-w-5xl`, Register `MetadataCard`+`RequirementCard` jadi grid `md:grid-cols-2`, Hero dapat type scale & padding 3 tingkat, sub-nav navbar di-center, stat card Dashboard `2/3/4` kolom (transisi di `md`/`xl`) + fix span kartu ke-4, breakpoint tabel Dashboard naik ke `lg`, `RecordDetailDrawer` lebar bertingkat `md/lg/xl` — lihat `layout-md-breakpoint-audit-2026-08-01.md` | 2026-08-01 |
| — | Bug fix: `FAQSection` sengaja lebih sempit (`max-w-3xl`) dari section lain (5xl) demi keterbacaan — malah terlihat "tidak lurus" saat scroll; diperbaiki dengan cap lebar di `<p>` jawaban saja, bukan di section | 2026-08-01 |
| — | Hapus title/description `OperationCard` yang redundan dengan Hero di Verify & Register (`title`/`description` jadi opsional); tambah background band per section (Hero gradient → Form plain → Cara Kerja+FAQ `bg-base-200`) untuk pemisah visual antar section | 2026-08-01 |
| 15 | Riset tren desain 2026 (`2026-design-trend-research.md`) + implementasi motion system: hover-lift di elemen clickable (bukan semua card), slide-in drawer & drawer mobile navbar (200ms, `starting:` Tailwind v4), FAQ accordion diganti button+grid-rows animasi (200ms, dari native `<details>` instan), `shadow-2xl` hanya di overlay (drawer), border radius `xl`→`2xl` di card besar, progressive disclosure Dashboard (`StatusSummary` sebelum stat card) | 2026-08-01 |
| — | Design Language v2 (`design-language-v2.md`) diterapkan penuh: `base-100`/`base-200` tukar peran (card putih murni, page bg abu `#F5F6F8`), border jauh lebih halus (`1px`, `#E8E9EC`), `.shadow-card` di SEMUA card besar, navbar shadow-on-scroll (JS scroll listener), `OperationCard` `rounded-3xl`, peran warna primary dibatasi dari 24 titik pemakaian jadi hanya CTA/badge/state penting (nav & hover jadi netral, ikon default `FilledIcon` jadi secondary/navy, border dropzone idle netral), Page Title & Section Title dinaikkan 30→32px / 20→22px (arbitrary value, Card Title/Subsection/Body/Caption tidak berubah) | 2026-08-01 |
