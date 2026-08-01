# Design System — PITS Frontend

Referensi warna, tipografi, spacing, dan komponen yang benar-benar dipakai di codebase saat ini.

**Tanggal:** 2026-08-01 (setelah rebrand warna merah BRIN asli, restrukturisasi navbar, dan sistem i18n penuh)

---

## 1. Stack Styling

- **TailwindCSS v4** (`@import "tailwindcss"` di `styles/globals.css`)
- **daisyUI v5** sebagai component layer di atas Tailwind (`@plugin "daisyui"`)
- **Custom daisyUI theme** manual — 2 tema: `light` (default) dan `dark`, switch otomatis lewat `prefers-color-scheme`.
- **Satu library ikon**: `@mui/icons-material` (varian Outlined dominan) — dipakai konsisten di seluruh app termasuk navbar (sebelumnya navbar sempat pakai `@mdi/react`, sudah distandarisasi).

---

## 2. Warna

### Token daisyUI

**Direvisi 2026-08-01** (`design-language-v2.md`) — `base-100`/`base-200` ditukar peran di light mode supaya card benar-benar "mengambang" dari background (sebelumnya keduanya nyaris sama terang, cuma beda dari border). Peran `primary` (merah) juga dibatasi — sebelumnya dipakai di 24 titik lintas peran (nav aktif, hover, ikon default, border dropzone), sekarang cuma di CTA/badge/state penting; nav & hover pakai token netral (`base-200`/`base-content`).

| Token | Light | Dark | Dipakai untuk |
|---|---|---|---|
| `--color-primary` | `#E62F2A` (merah BRIN) | `#FF6B61` (merah lebih terang, kontras di background gelap) | **Hanya**: CTA utama, badge penting ("Akses Publik"/"Khusus Publisher"), border+bg dropzone SAAT drag aktif |
| `--color-primary-content` | `#ffffff` | `#2a0805` | Teks di atas background primary |
| `--color-secondary` | `#17384C` (navy-teal gelap) | `#f8fafc` (nyaris putih) | Judul halaman (`h1`), angka besar, aksen halaman Register, ikon default (`FilledIcon`) |
| `--color-accent` | `#3AA6FF` | `#3AA6FF` | Aksen biru terbatas — link/info, sengaja beda dari primary/secondary |
| `--color-base-100` | `#FFFFFF` (putih murni — **surface/card**) | `#0a0f1d` | Card, drawer, dropdown — SELALU lebih terang dari page background |
| `--color-base-200` | `#F5F6F8` (abu sangat muda — **page background**) | `#121b2e` | Background `<body>`, hover state, header tabel |
| `--color-base-300` | `#E8E9EC` (abu sangat halus, sebelumnya `#C3BEBE` jauh lebih gelap) | `#1e2942` | Border — sekarang nyaris tak terlihat sendirian, "ditemani" `.shadow-card` (lihat §5) |
| `--color-divider-strong` *(token custom, baru)* | `#D5D7DC` | `#2a3752` | Cadangan untuk pemisah yang butuh kontras lebih dari border biasa — belum ada pemakaian nyata |
| `--color-base-content` | `#3F4854` (nyaris hitam) | `#cbd5e1` (abu terang) | Teks utama |
| `--color-ink-secondary` *(token custom)* | `#667085` | `#94a3b8` | Teks sekunder (label, deskripsi) |
| `--color-ink-muted` *(token custom)* | `#98A2B3` | `#64748b` | Teks tersier (micro-label, subtitle) |
| `--color-success` | `#0F9D58` (hijau) | `#22C55E` | Badge "On-chain", indikator sukses, status "siap dikirim" (`MetadataCard`) |
| `--color-error` | `#991B1B` (merah tua) | `#F87171` | Alert/badge gagal — **sengaja dibuat lebih gelap/beda shade dari primary** (lihat catatan risiko di bawah) |
| `--color-warning` | `oklch(85% 0.199 91.936)` | sama | Jarang dipakai (dulu untuk notice, sekarang notice pakai `info`) |
| `--color-info` | `#3AA6FF` | `#3AA6FF` | Kotak notice netral (mis. "Sebelum mengirim" di Register) |

`--border` (ketebalan): `1px` (dari `1.5px`) di light mode — dark mode tetap `1.5px` (dark mode belum diaudit, lihat backlog #20).

### Riwayat keputusan warna

- **Semula palet primary/secondary adalah teal (`#00B5AA`) + navy (`#00336C`)**, sempat diganti ke biru institusional generik (`#0057A4`/`#003B73`) berdasar asumsi keliru dari brief AI sebelumnya. Setelah dicek langsung ke **brin.go.id**, ternyata identitas visual BRIN yang sesungguhnya adalah **merah** (`#E62F2A`, dipakai di logo & elemen highlight situs resmi) dengan navy-teal gelap (`#17384C`) sebagai pendamping — palet final sekarang mengikuti temuan ini. Semua referensi warna lewat token, jadi perubahan besar seperti ini cukup satu file (`styles/globals.css`).
- **⚠️ Risiko yang disadari dan diterima**: karena `error` juga warna merah (keluarga sama dengan `primary`), ada risiko kebingungan visual antara "ini CTA/aksen brand" vs "ini pesan gagal". Mitigasi yang sudah dilakukan: `error` dibuat jauh lebih gelap/muted (`#991B1B` vs `#E62F2A`) dan SELALU dipasangkan dengan ikon+label eksplisit ("Gagal", ikon silang) di UI, bukan berdiri sendiri sebagai warna. Ini keputusan sadar (bukan oversight) — user memilih ikut identitas BRIN asli apa adanya. Lihat `tasks/tasks.md` #14 untuk review lanjutan.
- **`base-content` semula `#8B8484`** (abu kecoklatan, kontras rendah) — diganti ke `#3F4854` (nyaris hitam) untuk keterbacaan. Ditambah 2 token baru `ink-secondary`/`ink-muted` untuk hierarki teks 3 tingkat yang jelas (utama/sekunder/tersier), menggantikan kebiasaan lama pakai opacity (`text-base-content/50` dst) yang gampang jadi terlalu pudar.
- **Badge status** semula `badge-outline` (teks berwarna tanpa isi) → sekarang `badge-soft` (background tipis berwarna) supaya lebih cepat dikenali sekilas.
- Palet warna ikon file (`lib/colors.ts`) tetap berdiri sendiri di luar token brand (13 warna tetap, disederhanakan jadi 8 kategori: PDF=merah, Dokumen=biru, Spreadsheet=hijau, Presentasi=oranye, Gambar=ungu, Media=cyan, Arsip=slate, Lainnya=abu) — sengaja tidak diikat ke token primary/secondary karena fungsinya beda (identifikasi jenis file, bukan branding).

### Radius & Border
```
--radius-selector: 0.5rem
--radius-field: 0.5rem
--radius-box: 0.5rem
--border: 1.5px
```
Tidak ada shadow di manapun dalam UI — seluruh hierarki visual dibangun dari border + background flat (`bg-base-100` di atas `bg-base-100`/`background` yang nilainya sama, jadi pemisahnya murni border).

---

## 3. Tipografi

- **Plus Jakarta Sans** — heading (`h1`, `.card-title`, nama brand navbar).
- **Inter** — body text.

### Type Scale (final, diterapkan penuh 2026-08-01, dipadatkan setelah review visual)

Revisi terjadi 2 tahap di sesi yang sama:
1. Level 28px (target lama, tidak match class Tailwind manapun) dihapus, `text-2xl` (24px, terlanjur dipakai untuk 3 peran berbeda: H1 Result, section heading, judul loading card) juga dihapus dari hierarki, level `text-lg` (Subsection) ditambahkan.
2. Setelah diterapkan dan dicek visual langsung di halaman Register (screenshot real), skala hasil tahap 1 terasa **kegedean untuk aplikasi internal/enterprise** (36px H1 pantas untuk landing page marketing, bukan aplikasi kerja pemerintah) — seluruh scale lalu **dipadatkan turun 1 step** sekaligus, urutan hierarkinya tetap sama.

Lihat rasional lengkap di `_docs/design/type-scale-audit-2026-08-01.md`.

| Tingkat | Ukuran | Kelas Tailwind | Dipakai untuk |
|---|---|---|---|
| Hero | 48px | `text-5xl` | (belum dipakai — cadangan untuk landing page besar) |
| Page Title | 32px | `text-[2rem]` (arbitrary — tidak match step Tailwind manapun) | H1 Dashboard/Result (flat); H1 Hero Verify/Register (tingkat `lg`, dari 3 tingkat responsif `text-2xl md:text-[1.75rem] lg:text-[2rem]` = 24/28/32) — dinaikkan dari 30px per `design-language-v2.md` §7 |
| Section Title | 22px | `text-[1.375rem]` (arbitrary) | Heading section besar ("Cara Kerja Verifikasi", "Pertanyaan Umum") — dinaikkan dari 20px |
| Card Title | 18px | `text-lg` | Judul card (`OperationCard`, `LoadingCard`), nama file di drawer/dropzone, stat value Dashboard — **tidak berubah** di revisi Design Language v2 |
| Subsection | 16px | `text-base` (bold) | Step title (How It Works), FAQ question, empty state title, heading card tabel Dashboard — tidak berubah |
| Body | 14px | `text-sm` | Teks paragraf umum, subtitle hero — tidak berubah |
| Caption | 12px | `text-xs` | Label, deskripsi sekunder, helper text, seluruh isi tabel/drawer Dashboard — tidak berubah |

**Revisi 2026-08-01 (Design Language v2)**: Page Title & Section Title dinaikkan lagi (30→32, 20→22) setelah riset tren 2026 menyimpulkan skala sebelumnya "terlalu datar" — beda dari Card Title (18px) terasa kurang tegas. Nilai 32px/22px tidak match step Tailwind manapun, jadi dipakai arbitrary value (`text-[2rem]`/`text-[1.375rem]`) alih-alih membulatkan ke `text-3xl`(30)/`text-2xl`(24) yang justru salah satunya sudah pernah dihapus dari hierarki. Card Title/Subsection/Body/Caption SENGAJA tidak ikut naik — sudah dianggap final dari revisi sebelumnya, cuma Title/Section yang direvisi. Elemen ikon (mis. `FilledIcon`, `SearchIcon`) yang kebetulan pakai class `text-lg`/`text-xl` untuk mengatur ukuran SVG **tidak ikut berubah** — itu bukan bagian dari type scale teks.

**Bug ikut diperbaiki** (bukan bagian dari type scale, tapi ditemukan lewat audit yang sama): `text-xxl` di `OperationCard.tsx` dan `text-md` di `DocumentPreview.tsx` bukan class Tailwind valid (elemen efektif tanpa ukuran font eksplisit) — keduanya diganti ke `text-xl`/`text-base`.

---

## 4. Komponen Reusable

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `OperationCard` | `components/common/OperationCard.tsx` | Card border-only (no shadow) dengan title + description + body — dipakai Verify, Register, Result |
| `OperationButton` | `components/common/OperationButton.tsx` | Tombol CTA besar full-width dengan ikon |
| `Dropzone` | `components/common/Dropzone.tsx` | Drag-and-drop file (react-dropzone), validasi PDF-only + max 20MB, prop `accent` (`primary`/`secondary`), pesan error dari `t.dropzone.*` |
| `DocumentPreview` | `components/common/DocumentPreview.tsx` | Preview file terpilih + badge status (label dari `t.documentPreview.*`) |
| `LoadingCard` | `components/common/LoadingCard.tsx` | Card loading border-only saat submit, `'use client'`, default title/subtitle dari `useLocale()` |
| `SummaryRow` | `components/common/SummaryRow.tsx` | Baris ikon + label + value |
| `FilledIcon` | `components/common/FilledIcon.tsx` | Ikon 18px dalam lingkaran `bg-primary/10` — di-clone otomatis untuk ukuran konsisten |
| `CopyButton` | `components/dashboard/CopyButton.tsx` | Tombol copy-to-clipboard kecil, dipakai di drawer dashboard & halaman hasil |
| `RecordDetailDrawer` | `components/dashboard/RecordDetailDrawer.tsx` | Panel detail dokumen — drawer kanan di ≥sm, bottom sheet di <sm (lihat §5); tabel tetap terlihat di belakang |
| `Header` (navbar) | `components/layout/Header.tsx` | Navbar 1 baris utama + sub-nav (≥sm), hamburger drawer (<sm) — lihat §5 |
| `LanguageSwitcher` | `components/layout/LanguageSwitcher.tsx` | Toggle ID/EN 2-tombol, baca-tulis `LocaleContext`, dipakai di navbar dan drawer mobile |
| `DashboardHeader` | `components/dashboard/DashboardHeader.tsx` | Client component kecil untuk judul+subtitle+CTA halaman Dashboard yang perlu ikut locale (halaman induknya Server Component) |
| `DashboardErrorAlert` | `components/dashboard/DashboardErrorAlert.tsx` | Terima kode error (`no_backend`/`no_token`/`load_failed`/`conn_failed`) dari server, terjemahkan & render alert di client |
| `EmptyState` | `components/common/EmptyState.tsx` | Pola empty-state tunggal: ikon → judul → deskripsi → tombol aksi opsional. Semua empty state baru wajib pakai ini |
| `TableSkeleton` | `components/dashboard/TableSkeleton.tsx` | Skeleton (bukan spinner) untuk `app/dashboard/loading.tsx` — dipakai Next.js saat Server Component Dashboard masih fetch data |
| `PageContainer` | `components/layout/PageContainer.tsx` | Satu-satunya sumber lebar halaman (`narrow`/`content`/`wide`/`full`) + padding responsif bawaan — lihat §7 |

**Pola hero terunifikasi**: `VerifyHero.tsx` dan `RegisterHero.tsx` berbagi struktur & ukuran identik — badge kecil dengan ikon inline (BUKAN lagi avatar lingkaran besar `h-16 w-16`, dihapus 2026-08-01 karena Verify/Register adalah halaman workflow yang dilewati cepat, bukan landing page untuk berlama-lama), judul `text-2xl sm:text-3xl` (Page Title, kecil di mobile), gradient tipis `from-base-100 to-primary/5` atau `to-base-200`, rata kiri, padding `py-8 sm:py-10` (dipadatkan dari `py-12`) — hanya beda warna aksen (primary untuk Verify, secondary untuk Register) dan copy. Jangan ubah salah satu tanpa menyamakan yang lain.

---

## 5. Pola Layout

- **Card border halus + shadow tipis** (`border border-base-300 bg-base-100 rounded-2xl shadow-card`) — **direvisi 2026-08-01** (Design Language v2): sebelumnya border-only tanpa shadow sama sekali, sekarang SEMUA card besar dapat `.shadow-card` (nyaris tak terlihat, `0 1px 2px rgba(15,23,42,.04)`) supaya card "mengambang" dari page background, bukan cuma terlihat dari border. Overlay (drawer) tetap `shadow-2xl`, jauh lebih kuat, supaya beda tingkat elevasi dari card biasa. Hover border card (yang genuinely clickable) pakai `hover:border-base-content/20` — netral, BUKAN `hover:border-primary/40` lagi (lihat §2, batasi peran merah).
- **`OperationCard` dapat `rounded-3xl`** (bukan `rounded-2xl` seperti card lain) — satu-satunya "hero-level card" di app.
- **Navbar 1 baris utama + sub-nav kondisional (desktop/tablet), hamburger drawer (mobile)**:
  - **≥sm**: baris utama — logo + nama + subtitle institusi, lalu di sisi kanan tombol **Layanan Dokumen** (highlight aktif saat di halaman Registrasi/Verifikasi, klik navigasi ke halaman dokumen pertama yang tersedia), **Dashboard** (kalau login), `LanguageSwitcher` (toggle ID/EN), dan Masuk/Keluar. Sub-nav (`bg-base-200/40`, `border-b-2` + `bg-base-200` + `font-semibold` untuk tab aktif — **netral, bukan merah lagi**) berisi tab Registrasi/Verifikasi — hanya dirender saat pathname ada di dalam section "Layanan Dokumen".
  - **<sm**: baris utama hanya menyisakan logo + tombol hamburger (`MenuIcon`). Tap membuka drawer full-screen dari kanan berisi: Dashboard, grup "Layanan Dokumen" (Registrasi/Verifikasi terindentasi), pemisah, toggle bahasa, Masuk/Keluar — satu daftar vertikal, bukan mengompres baris menu jadi ikon-ikon kecil.
  - **Shadow-on-scroll** (baru): navbar TIDAK punya border bawah statis lagi — `bg-base-100/90 backdrop-blur-sm`, `shadow-sm` cuma muncul setelah `window.scrollY > 4` (state React + scroll listener). Di posisi paling atas, navbar menyatu rata dengan halaman tanpa garis pemisah.
- **Dashboard**: 4 stat tile setara tinggi (`grid-cols-2 lg:grid-cols-4` — 2 kolom di mobile/tablet, 4 kolom di desktop) di atas, lalu SATU card besar berisi heading "Dokumen" + toolbar + tabel + pagination — toolbar tidak lagi jadi section terpisah, melainkan menyatu visual dengan tabel. Tabel jadi daftar kartu bertumpuk di mobile (`md:hidden`), tabel penuh di ≥md. CTA "Daftarkan Dokumen" full-width di mobile, auto-width di ≥sm.
- **Hero Verify & Register**: struktur dan ukuran diseragamkan penuh (lihat §4, "Pola hero terunifikasi") — hanya beda warna aksen dan copy.
- **Pagination**: dua tombol persegi ghost (`btn-square btn-ghost border border-base-300`) mengapit label teks polos "Halaman X / Y" — BUKAN `.join` dengan `<span className="btn ...">` di tengah (pola lama ini terlihat rusak karena styling `.btn` diterapkan ke elemen non-tombol).
- **Detail record**: `RecordDetailDrawer` — drawer kanan penuh tinggi di ≥sm (tabel di belakang tetap terlihat), **bottom sheet** (`rounded-t-2xl`, `max-h-[85vh]`, drag-handle bar) di <sm karena lebih mudah dijangkau ibu jari daripada panel sisi penuh-tinggi di layar kecil.
- **Dropzone**: teks "Seret & Lepas ... / atau" disembunyikan di <sm (drag-and-drop nyaris tidak dipakai di layar sentuh) — hanya menyisakan aksi utama "Klik untuk Pilih File" + meta. Tinggi kotak juga dipadatkan (`h-40` mobile → `h-64` ≥sm).
- **Tombol submit form** (`FileUpload`): sticky di bagian bawah viewport pada <sm (`sticky bottom-4` + backdrop blur) supaya tidak perlu scroll jauh saat form/checklist memanjang; kembali ke posisi statis normal di ≥sm.
- **Empty state**: pola tunggal — `components/common/EmptyState.tsx` (ikon → judul → deskripsi → tombol aksi utama, opsional). Dipakai oleh `RecordsTable`; komponen baru yang butuh empty state harus pakai ini, bukan bikin layout sendiri.
- **Focus state**: `*:focus-visible` global (`styles/globals.css`) — ring 2px warna primary + offset 2px, berlaku ke SEMUA elemen interaktif (bukan cuma yang kebetulan elemen native `<button>`/`<input>`), termasuk tombol custom seperti item navbar dan kartu record di tabel mobile.
- **Motion**: hover pakai `transition-colors` default Tailwind (150ms) — jangan override ke durasi lain tanpa alasan. Belum ada animasi masuk/keluar eksplisit untuk drawer atau accordion FAQ (native `<details>`) — dicatat sebagai item backlog, bukan diterapkan penuh di revisi ini.
- Badge status: `badge-soft` (background tipis) — bukan `badge-outline` lagi.
- **Padding halaman responsif**: `px-4 sm:px-6 lg:px-8` (bukan `px-6` flat) di semua page-level container (Verify, Register, Dashboard) — mobile lebih rapat, desktop lebih lega.

---

## 6. Riwayat Perubahan Besar (ringkas)

| Perubahan | Alasan |
|---|---|
| Teal → Biru institusional | Kesan startup/fintech → kesan lembaga riset/pemerintah |
| `base-content` digelapkan + token `ink-secondary`/`ink-muted` ditambah | Kontras teks terlalu pudar sebelumnya |
| Ikon MDI di navbar → MUI | Satu bahasa visual ikon di seluruh app |
| `OperationCard` shadow → border | Konsistensi dengan pola card dashboard |
| Modal detail dashboard → Drawer kanan | Tabel tetap terlihat, tidak kehilangan konteks saat lihat detail |
| Dashboard: hero besar + 3 card → 4 card setara + toolbar menyatu dengan tabel | Dashboard adalah workspace (fokus ke tabel), bukan halaman presentasi statistik |
| Badge `badge-outline` → `badge-soft` | Lebih cepat dikenali sekilas |
| "hash"/"Hash dicocokkan" → "sidik jari digital" (di teks publik) | Istilah teknis diganti bahasa yang lebih mudah dipahami masyarakat umum; label teknis presisi (Content hash/Transaction hash) tetap dipertahankan di area detail untuk publisher/power-user |
| Biru institusional (`#0057A4`/`#003B73`, asumsi keliru) → Merah BRIN asli (`#E62F2A`/`#17384C`, dicek langsung dari brin.go.id) | Warna sebelumnya berdasar asumsi brief AI, bukan identitas visual BRIN yang sebenarnya |
| Navbar 1 grup menu (Dashboard+Registrasi+Verifikasi bercampur) → 2 baris terpisah, Dashboard di baris identitas, "Layanan Dokumen" jadi label grup Registrasi/Verifikasi | Dashboard terasa seperti "platform lain" saat dicampur dengan menu dokumen publik |
| Tanpa toggle bahasa → Sistem i18n penuh (ID/EN) via `lib/i18n/translations.ts` + `LocaleContext` | User minta fungsional penuh, bukan sekadar placeholder UI |
| Pagination `.join` + fake button-span → dua tombol persegi ghost + label teks polos | Tampilan lama terlihat rusak/"jelek" karena styling tombol diterapkan ke elemen non-tombol |
| Tab menu navbar underline tipis 2px → `border-b-[3px]` + `bg-primary/10` + `font-semibold` | Feedback "jelek", terlalu tipis/flat |
| Navbar 2 baris (Dashboard di baris identitas + baris menu selalu tampil) → 1 baris utama ("Layanan Dokumen" jadi item nav sejajar Dashboard/Bahasa/Keluar) + sub-nav Registrasi/Verifikasi yang hanya tampil di section dokumen | User minta "Layanan Dokumen" jadi menu utama yang jelas, bukan sekadar label grup, dan sub-nav tidak relevan di luar alur dokumen (mis. Dashboard) |
| Type scale: `text-2xl` dipakai untuk H1 Result + section heading + judul loading card sekaligus, target 28px tanpa class Tailwind persis → level 24px dihapus, section naik ke `text-3xl` (30px), H1 semua halaman diseragamkan `text-4xl`, level baru `text-lg` (Subsection) ditambah untuk step title/FAQ question/empty state | Hierarki tipografi kabur karena satu ukuran dipakai untuk banyak level berbeda; keputusan diambil setelah audit lengkap (`type-scale-audit-2026-08-01.md`) — lihat §3 |
| Type scale (revisi ke-2, sesi sama): seluruh scale hasil poin di atas dipadatkan turun 1 step (H1 36px→30px, Section 30px→20px, Card Title 20px→18px, Subsection 18px→16px, Body 16px→14px, Caption 14px→12px) | Setelah dicek visual di halaman Register (screenshot nyata), skala 36-48px terasa berlebihan untuk aplikasi kerja internal/enterprise, bukan landing page marketing — urutan hierarki dipertahankan, hanya rentang absolutnya dipadatkan |
| **Bug ditemukan & diperbaiki**: rule global `h2 { font-size: 2rem }` dan `h4 { font-size: 1.25rem }` di `globals.css` (di luar `@layer`, jadi menang atas SEMUA utility class Tailwind di elemen `<h2>`/`<h4>`) dihapus — sebelumnya membuat `OperationCard` title, `HowItWorks`/`FAQSection` heading, dan `DashboardView` heading selalu tampil 32px/20px berapa pun class `text-*` yang diberi | Ditemukan saat verifikasi visual mobile: `text-lg` (18px) yang sudah diterapkan ke judul `OperationCard` ternyata computed 32px di browser — akar masalah bukan di pilihan class, tapi CSS unlayered yang mengalahkan seluruh sistem type scale sejak awal |
| Hero Verify/Register: avatar ikon lingkaran besar dihapus, jadi badge+ikon inline kecil; padding `py-12`→`py-8 sm:py-10`; H1 `text-2xl sm:text-3xl` (lebih kecil di mobile) | Hero dinilai terlalu "landing page" untuk halaman workflow yang harus cepat dipakai, bukan dilihat-lihat |
| Navbar mobile: kompresi ikon-only → hamburger + drawer (Dashboard, grup Layanan Dokumen, bahasa, sign in/out sebagai daftar vertikal) | 4+ ikon berdempetan di layar sempit terasa sesak; drawer lebih natural dan skalabel kalau menu bertambah |
| `RecordDetailDrawer`: drawer kanan penuh-tinggi di semua ukuran → tetap drawer kanan di ≥sm, jadi bottom sheet di <sm | Panel sisi penuh-tinggi sulit dijangkau ibu jari di ponsel; bottom sheet adalah pola standar mobile untuk detail view |
| `Dropzone`: teks "Seret & Lepas/atau" selalu tampil → disembunyikan di <sm, hanya sisakan "Klik untuk Pilih File" | Drag-and-drop nyaris tidak relevan di perangkat sentuh |
| Tombol submit `FileUpload`: statis → sticky di bagian bawah viewport pada <sm | Form yang memanjang (checklist, metadata) membuat tombol submit jauh di bawah; sticky menjaga CTA selalu terjangkau |
| Empty state `RecordsTable` inline → diekstrak jadi `components/common/EmptyState.tsx` reusable | Distandarkan supaya empty state baru di halaman lain tidak reinvent layout |
| Focus state eksplisit (`*:focus-visible`, ring primary 2px) ditambahkan — sebelumnya hanya mengandalkan default browser/daisyUI | Aksesibilitas keyboard belum eksplisit didokumentasikan/dijamin konsisten di elemen custom (bukan native button/input) |
| Padding halaman `px-6` flat → `px-4 sm:px-6 lg:px-8` di semua halaman utama | Selaras dengan rekomendasi breakpoint: mobile lebih rapat, desktop lebih lega |
| **Layout system dibangun**: tiap halaman punya `max-w` sendiri secara ad hoc (Verify/Register `max-w-3xl`, Dashboard `max-w-7xl`) → satu komponen `PageContainer` dengan 4 variant tetap (`narrow`/`content`/`wide`/`full`) | Aplikasi terasa seperti beberapa app disatukan karena tiap halaman punya filosofi lebar sendiri; lihat `layout-md-breakpoint-audit-2026-08-01.md` |
| Verify/Register: `OperationCard` `max-w-3xl`→`max-w-5xl`; Register: `MetadataCard`+`RequirementCard` jadi `grid md:grid-cols-2` (dulu ditumpuk `max-w-3xl` masing-masing) | Memanfaatkan ruang tablet/desktop yang sebelumnya terbuang karena kolom konten mentok sempit di semua ukuran layar |
| Hero Verify/Register: judul & padding flat sejak `sm` → 3 tingkat (`text-2xl`/`md:text-3xl`/`lg:text-4xl`, `py-8`/`md:py-10`/`lg:py-14`) | Tablet/desktop terasa lebih lapang; Hero sengaja dibedakan dari Page Title flat Dashboard/Result karena perannya presentasional, bukan judul workspace |
| Sub-nav navbar rata kiri (strip kosong di kanan) → `justify-center` | Timpang dibanding baris utama yang full-width di layar lebar |
| Dashboard stat card `grid-cols-2 lg:grid-cols-4` (loncat, tanpa transisi tablet) → `grid-cols-2 md:grid-cols-3 xl:grid-cols-4` + card ke-4 `md:col-span-3 xl:col-span-1` | Tablet (768–1023px) sebelumnya tidak memanfaatkan ruang ekstra; span-fix mencegah kartu ke-4 jadi yatim piatu di grid 3 kolom |
| Dashboard tabel: breakpoint kartu→tabel `md` (768px) → `lg` (1024px) | 768px pas berimpit lebar iPad portrait, kolom tabel jadi sesak begitu baru saja beralih |
| `RecordDetailDrawer` lebar flat `max-w-md` → bertingkat `sm:max-w-md lg:max-w-lg xl:max-w-xl` | Detail record terasa lega di layar lebar, bukan tetap 448px sampai selebar apapun monitor |
| `FAQSection` `max-w-3xl` sendiri → ikut lebar `content` (5xl) seperti section lain, keterbacaan dijaga cukup lewat `max-w-2xl` di `<p>` jawaban | Section terlihat "tidak lurus" dibanding section lain saat di-scroll — dikonfirmasi lewat DOM measurement |
| `OperationCard` title/description dihapus dari Verify & Register (`title`/`description` sekarang opsional, section header tidak render kalau kosong) | Redundan — Hero di atasnya sudah bilang hal yang sama dengan kalimat berbeda ("Registrasi Dokumen" + subtitle, lalu diulang lagi "Daftarkan Dokumen Baru" + deskripsi serupa) |
| Verify: section band ditambah — Hero (gradient), Form+Tips (`bg-base-100`, putih, menonjol dari page bg abu di sekitarnya), Cara Kerja+FAQ (`bg-base-200`, senada dengan page bg default, card putih mengambang di atasnya lewat `.shadow-card`) | Sebelumnya semua section menyatu di background yang sama, sulit membedakan batas antar section. **Catatan**: setelah revisi Design Language v2 (base-100/200 tukar peran, lihat §2), mekanismenya berbalik — `bg-base-100` sekarang yang "menonjol" (putih), bukan `bg-base-200` — tapi class di kode tidak berubah, cuma makna tokennya |
| **Design Language v2 diterapkan** (`design-language-v2.md`): `base-100`↔`base-200` tukar peran (card sekarang putih murni, page bg abu `#F5F6F8`, sebelumnya nyaris sama), border jadi jauh lebih halus (`#C3BEBE`→`#E8E9EC`, `1.5px`→`1px`), `.shadow-card` ditambah ke SEMUA card besar (sebelumnya border-only tanpa shadow sama sekali), navbar shadow-on-scroll (border statis dihapus, `shadow-sm` muncul cuma saat scroll), `OperationCard` dapat `rounded-3xl`, peran warna primary (merah) dibatasi dari 24 titik pemakaian lintas-peran jadi hanya CTA/badge/state penting (nav aktif & hover, ikon default, border dropzone idle, hover border card semua diganti netral), Page Title & Section Title dinaikkan (30→32px, 20→22px, pakai arbitrary value karena tidak match step Tailwind) | Kesimpulan riset tren 2026 + kritik user: PITS "terlalu utilitarian" karena satu shade abu dipakai untuk segalanya (border navbar/card/table/input identik) dan merah BRIN dipakai di terlalu banyak peran sekaligus sehingga CTA tidak lagi menonjol dari elemen lain |

---

## 7. Layout System (`PageContainer`)

**Direvisi total 2026-08-01** setelah audit menemukan tiap halaman punya "keluarga lebar" sendiri secara ad hoc (Verify/Register `max-w-3xl`, Dashboard `max-w-7xl`, navbar full-width tapi sub-nav ikut isi) — bikin aplikasi terasa seperti beberapa app yang disatukan. Lihat rasional lengkap di `_docs/design/layout-md-breakpoint-audit-2026-08-01.md`.

Sekarang HANYA ada 4 lebar halaman yang sah, dikontrol lewat satu komponen bersama: **`components/layout/PageContainer.tsx`** (`variant` + `as`, padding responsif `px-4 sm:px-6 lg:px-8` sudah built-in — jangan tulis ulang padding manual di halaman).

| Variant | Class | Dipakai untuk |
|---|---|---|
| `narrow` | `max-w-3xl` | Cadangan untuk form berdiri sendiri yang sengaja sempit (belum ada pemakaian nyata) |
| `content` | `max-w-5xl` | Verify, Register — hero + `OperationCard` + kartu pendukung, semua dalam SATU `PageContainer` supaya sejajar |
| `wide` | `max-w-7xl` | Dashboard (`as="main"`) |
| `full` | `w-full` (tanpa max-w) | Cadangan untuk landing/full-bleed |

**Result** (`ResultView`) bukan pemakai `PageContainer` langsung — dia tetap pakai `OperationCard` dengan `containerClassName="!max-w-2xl"` (perlu `!` supaya menang atas default `max-w-5xl` milik `OperationCard` di semua breakpoint, bukan cuma di `lg` seperti sebelumnya) karena halamannya cuma satu card tunggal, tidak ada saudara sejajar yang perlu disamakan lebarnya.

**Revisi 2026-08-01 (sesi sama)**: `FAQSection` semula dibuat sengaja lebih sempit (`max-w-3xl` sendiri, bukan ikut `content` 5xl) demi keterbacaan jawaban — tapi ini malah bikin section-nya kelihatan "tidak sejajar/tidak lurus" dibanding section lain saat di-scroll (feedback user, dikonfirmasi lewat DOM: box FAQ mulai di `left: 128px` sementara section lain di `left: 0`). **Diperbaiki**: `FAQSection` sekarang ikut lebar penuh `content` (5xl) seperti section lain — keterbacaan jawaban dijaga dengan cara lain, cukup `max-w-2xl` pada `<p>` jawabannya saja, bukan pada seluruh section. Pelajaran: pengecualian lebar per-section (biarpun beralasan) berisiko terasa sebagai bug alignment kalau pengguna tidak tahu itu disengaja — lebih aman batasi lebar di level teks/elemen kecil, bukan di level section.

### Breakpoint (Tailwind default, tidak ada custom): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px

| Elemen | Perilaku per breakpoint |
|---|---|
| Navbar | Hamburger+drawer `<sm`; baris utama + sub-nav `≥sm` — sub-nav sekarang **`justify-center`** (bukan rata kiri) supaya tab Registrasi/Verifikasi tidak menyisakan strip kosong timpang di layar lebar. |
| Hero (Verify/Register) | Judul 3 tingkat: `text-2xl` mobile → `md:text-3xl` tablet → `lg:text-4xl` desktop. Padding: `py-8` → `md:py-10` → `lg:py-14`. **Sengaja beda dari Page Title Dashboard/Result** (flat `text-3xl`) — Hero adalah band presentasional (gradient, badge), bukan judul workspace polos, jadi wajar kalau perannya beda dan boleh membesar di layar lebar. |
| Kartu pendukung Register (`MetadataCard` + `RequirementCard`) | `grid grid-cols-1 md:grid-cols-2 gap-6` — 1 kolom di mobile, sejajar 2 kolom mulai `md`. Grid internal masing-masing card (dulu `sm:grid-cols-2`) dihapus supaya tidak terjadi grid-dalam-grid yang bikin sesak begitu card sudah dipersempit jadi setengah lebar. |
| Kartu pendukung Verify (`TipsCard`) | Cuma satu card (tidak ada pasangan) — tetap 1 kolom, tapi ikut lebar penuh `content` (5xl), grid internal checklist-nya (`sm:grid-cols-2`) dipertahankan karena di sini dia punya ruang penuh untuk 2 kolom. |
| Dashboard — stat card | `grid-cols-2` mobile → `md:grid-cols-3` tablet → `xl:grid-cols-4` desktop (BUKAN `lg`, sengaja — 1024px masih terasa sempit untuk 4 card + padding + sidebar). Card ke-4 ("Status Sistem") diberi `md:col-span-3 xl:col-span-1` supaya di rentang `md`–`lg` (3 kolom, 4 item) dia jadi banner lebar di baris kedua, bukan kartu yatim piatu setengah kosong. |
| Dashboard — tabel vs kartu | Breakpoint switch dinaikkan dari `md` ke **`lg`** — mode kartu bertahan sampai tablet penuh (termasuk landscape), tabel penuh baru muncul di `≥lg` supaya kolom-kolomnya tidak sesak persis di lebar iPad. |
| `RecordDetailDrawer` | Lebar bertingkat: `sm:max-w-md` → `lg:max-w-lg` → `xl:max-w-xl` (sebelumnya flat `max-w-md` di semua ukuran ≥`sm`). |

## 8. Motion System

**Ditambahkan 2026-08-01** setelah riset tren desain 2026 (`2026-design-trend-research.md`) menyimpulkan motion adalah perubahan dengan ROI tertinggi (dampak besar, risiko kecil) untuk membuat PITS terasa modern tanpa mengubah identitas visual (tetap border-only, tanpa shadow di card biasa).

| Elemen | Motion | Cara |
|---|---|---|
| Hover (elemen benar-benar clickable saja, bukan semua card) | 150ms, translate tipis + border/shadow | `transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md` — dipakai di kartu record mobile (`RecordsTable`), TIDAK di card statis (`TipsCard`, `RequirementCard`, dll — card itu bukan tombol, hover-lift di situ menyesatkan) |
| `RecordDetailDrawer` & drawer mobile navbar | Slide masuk 200ms, backdrop fade 200ms | `transition-transform duration-200 ease-out starting:translate-x-full` (atau `translate-y-full` untuk bottom sheet mobile) — pakai varian `starting:` Tailwind v4 (`@starting-style`), murni CSS tanpa JS animasi |
| FAQ accordion | Expand/collapse 200ms | Native `<details>` diganti `<button aria-expanded>` + `<div>` dengan trik `grid-template-rows: 0fr → 1fr` — accordion asli tidak bisa animasi height tanpa JS, trik ini CSS murni dan tetap accessible (button asli, bukan div) |

**Depth terbatas untuk overlay saja** (bukan semua card, sesuai prinsip border-only yang dipertahankan): `RecordDetailDrawer` dan drawer mobile navbar diberi `shadow-2xl` — satu-satunya elemen di app yang punya shadow, karena keduanya benar-benar melayang di atas konten lain (z-50, fixed overlay). Card biasa tetap border-only, tanpa shadow.

**Border radius hierarki**: card besar (`OperationCard`, stat tile, step card, FAQ box, tabel wrapper, dll) dinaikkan dari `rounded-xl` ke `rounded-2xl` — elemen kecil (button, badge, ikon tile) tetap radius lebih kecil (`rounded-lg`/default daisyUI). Sebelumnya semua ukuran radius seragam, sekarang ada tingkatan sesuai ukuran elemen.

**Progressive disclosure di Dashboard**: satu baris ringkasan status (`StatusSummary` di `DashboardView.tsx`) ditambahkan SEBELUM stat card — "Semua N dokumen berhasil tercatat on-chain — tidak ada isu terdeteksi." Jawaban "apakah semuanya baik-baik saja?" diberi duluan, baru breakdown detail (stat card → tabel). Disembunyikan otomatis kalau belum ada dokumen (empty state di bawahnya sudah cukup).

## 9. Backlog Desain (belum dikerjakan di revisi ini)

Item dari review desain 2026-08-01 yang sengaja **belum** diimplementasikan — dicatat di `_docs/tasks/tasks.md` supaya tidak hilang:

- Tombol quick-action "Verifikasi Dokumen" di samping "Daftarkan Dokumen" pada `DashboardHeader` (saat ini hanya ada Registrasi) — akses ke Verifikasi dari Dashboard masih lewat navbar.
- Komponen generik tambahan yang diusulkan (`PageHeader`, `SectionHeader`, `FilterBar`, `ConfirmDialog`, `StatCard` generik) — belum diekstrak karena baru ada satu use-case nyata per pola; ekstraksi baru bernilai kalau ada use-case kedua (hindari abstraksi prematur).
- Border hierarchy 4 tingkat (`border-base-300` card utama / `border-base-200` card sekunder / `hover:border-primary/40` / `focus:border-primary`) — saat ini sebagian besar card seragam pakai `border-base-300`, belum ada varian "sekunder" karena belum ada kebutuhan visual bertingkat yang konkret.
- Spacing system `gap`/`py` per breakpoint (`px-4/gap-4/py-8` mobile → `px-6/gap-6/py-10` tablet → `px-8/gap-8/py-12` desktop) baru diterapkan konsisten di grid/padding BARU yang dibuat sesi ini (Register 2-col grid, Hero) — retrofit penuh ke gap-gap lama yang belum ikut pola ini belum dilakukan (risiko regresi terlalu besar untuk dikerjakan sekaligus tanpa verifikasi per halaman).
- **Audit ritme layout & whitespace menyeluruh** dan **audit dark mode sebagai desain mandiri** (bukan sekadar invert warna: border lebih redup, shadow nyaris hilang, surface lebih banyak) — keduanya disepakati layak dikerjakan tapi butuh sesi tersendiri, bukan dikerjakan tergesa bareng motion system.
- Role-based personalization lebih dalam untuk Dashboard — butuh data pemakaian nyata dulu, spekulatif tanpa itu.
