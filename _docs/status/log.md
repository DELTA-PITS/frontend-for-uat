# Status — PITS Frontend

File ini diupdate Claude Code **setiap sesi kerja selesai**. Entry terbaru selalu ditambah di **paling atas** (append, jangan timpa/hapus entry lama).

---

## [2026-08-02 01:00] — Claude Code

- **Progress**: Design Language v2 — audit "bahasa visual" (bukan layout) atas kritik user bahwa PITS masih terasa dashboard 2019–2022, disusun jadi dokumen (`design-language-v2.md`), lalu diterapkan penuh setelah user konfirmasi "lanjut kerjakan 1-4". Diverifikasi type-check, lint, dan visual di browser (termasuk scroll behavior navbar via `getComputedStyle`).
- **Selesai sesi ini**:
  - **Background/Surface ditukar perannya**: `base-100` (card) `#F9F9F9`→`#FFFFFF` (putih murni), `base-200` (page bg) `oklch(97% 0 0)`→`#F5F6F8`. Sebelumnya keduanya nyaris sama terang (beda ~2%) sehingga card cuma kelihatan dari border; sekarang card benar-benar "mengambang" dari page background.
  - **Border dihaluskan**: `base-300` `#C3BEBE`→`#E8E9EC`, ketebalan `1.5px`→`1px` (light mode saja, dark mode belum diaudit — backlog #20). Token baru `--color-divider-strong` ditambah sebagai cadangan (belum dipakai).
  - **Shadow ditambah ke SEMUA card** (utility class baru `.shadow-card`, `0 1px 2px rgba(15,23,42,.04)` — nyaris tak terlihat sendirian) — **membalikkan prinsip lama** "card border-only, tanpa shadow sama sekali" yang baru ditetapkan 2 sesi lalu. Overlay (drawer) tetap `shadow-2xl`, jauh lebih kuat, supaya beda tingkat elevasi.
  - **Navbar shadow-on-scroll**: border bawah statis dihapus, diganti `bg-base-100/90 backdrop-blur-sm` + `shadow-sm` yang cuma muncul setelah `scrollY > 4` (state React + scroll listener) — diverifikasi bekerja lewat `getComputedStyle(header).boxShadow` di browser.
  - **`OperationCard` naik ke `rounded-3xl`** (satu-satunya "hero-level card"), card besar lain tetap `rounded-2xl`.
  - **Peran warna merah (`primary`) dibatasi drastis**: audit lewat grep menemukan 24 titik pemakaian lintas-peran di 12 file (nav aktif, nav hover, ikon default, border dropzone, hover card/FAQ). Semua diganti netral kecuali CTA/badge/state penting: nav aktif & hover → `bg-base-200`/`text-base-content` (bukan merah), `FilledIcon` default → `bg-secondary/10 text-secondary` (navy, bukan merah — berdampak ke `StatsCards` & `HowItWorks` yang tidak eksplisit override warna), `Dropzone` idle border → netral (`primary` HANYA saat `isDragActive`), hover border card (`OperationCard`/`RecordsTable`/`FAQSection`) → `hover:border-base-content/20`, `CopyButton` hover → netral, `MetadataCard` status "siap dikirim" → `text-success` (bukan primary, karena semantiknya "siap/baik").
  - **Tipografi dinaikkan lagi**: Page Title 30→32px, Section Title 20→22px — keduanya arbitrary value (`text-[2rem]`, `text-[1.375rem]`) karena tidak match step Tailwind manapun. Card Title/Subsection/Body/Caption SENGAJA tidak diubah (dianggap sudah final dari revisi sebelumnya).
  - Dokumentasi disinkronkan: `design-language-v2.md` (status PROPOSAL → DITERAPKAN, §11 detail penerapan aktual), `design-system.md` (§2 Warna, §3 Tipografi, §5 Pola Layout, §6 changelog), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah konfirmasi eksplisit ("lanjut kerjkan 1-4") untuk semua 4 keputusan yang sebelumnya diajukan sebagai pertanyaan terbuka.
- **Next steps**: backlog #19 (audit ritme layout & whitespace) dan #20 (audit dark mode mandiri — border/shadow/surface dark belum ikut direvisi di sesi ini) masih terbuka, disepakati butuh sesi tersendiri. Token `--color-divider-strong` tersedia tapi belum dipakai di komponen manapun (#18).

---

## [2026-08-01 22:00] — Claude Code

- **Progress**: Diskusi layout tablet/`md` (dilanjutkan ke ChatGPT), audit alignment bug (`OperationCard` vs section lain), riset tren desain 2026 (disaring untuk konteks aplikasi pemerintah), dan implementasi motion system — semua sudah diverifikasi (type-check, lint, dan cek visual di browser untuk yang bisa diakses tanpa login). Siap di-commit.
- **Selesai sesi ini**:
  - **Layout system dibangun**: komponen baru `components/layout/PageContainer.tsx` (`narrow`/`content`/`wide`/`full`) jadi satu-satunya sumber lebar+padding halaman, menggantikan `max-w`/`mx-auto`/padding manual ad hoc per halaman. Diterapkan ke Verify, Register, Dashboard.
  - **Bug alignment ditemukan & diperbaiki 2x**: (1) `OperationCard` (`max-w-4xl`) vs card lain (`max-w-3xl`) di Verify/Register — beda lebar independen-center bikin tidak sejajar (screenshot user). (2) `FAQSection` yang sengaja dibuat lebih sempit demi keterbacaan malah terlihat "tidak lurus" saat scroll — diperbaiki dengan cap lebar di teks jawaban saja (`max-w-2xl` pada `<p>`), bukan di seluruh section. Root-cause kedua kasus: pengecualian lebar di level section berisiko terbaca sebagai bug, lebih aman batasi di level elemen kecil.
  - **Judul redundan dihapus**: `OperationCard` title/description ("Verifikasi Dokumen"/"Registrasi Dokumen Baru" + deskripsi) yang mengulang isi Hero di atasnya dihapus dari Verify & Register — prop jadi opsional, section header tidak render kalau kosong. Key i18n mati (`verifyForm.title/description`, `registerForm.title/description`) dibersihkan dari kedua bahasa.
  - **Background band per section** ditambahkan di halaman Verify (Hero gradient → Form+Tips polos → Cara Kerja+FAQ `bg-base-200`) supaya batas antar section terlihat jelas, tidak menyatu.
  - **Riset tren desain 2026** (`_docs/design/2026-design-trend-research.md`) — web search utk tren UI/UX 2026, dashboard SaaS enterprise, GOV.UK/USWDS, lalu disaring khusus untuk PITS sebagai aplikasi pemerintah (banyak tren seperti Y2K color, 3D/AR, glassmorphism dekoratif, bento grid EKSPLISIT direkomendasikan dihindari karena merusak kredibilitas). Kesimpulan bareng user: PITS bukan "jadul", tapi "terlalu utilitarian" — kurang di hierarki visual, ritme layout, motion, dan depth, bukan di palet/tipografi/struktur yang sudah solid.
  - **Motion system diimplementasikan** sesuai prioritas ROI tertinggi dari user: hover-lift (150ms) hanya di elemen clickable (card record mobile), slide-in 200ms untuk `RecordDetailDrawer` + drawer mobile navbar (pakai varian `starting:` Tailwind v4 / `@starting-style`, CSS murni), FAQ accordion diganti dari native `<details>` (instan) jadi `<button aria-expanded>` + trik `grid-template-rows` (animasi 200ms, tetap accessible) — sudah diverifikasi bekerja di browser.
  - **Depth terbatas untuk overlay**: `shadow-2xl` ditambahkan HANYA ke `RecordDetailDrawer` dan drawer mobile navbar (satu-satunya elemen dengan shadow di seluruh app) — prinsip border-only untuk card biasa dipertahankan sesuai keinginan user.
  - **Border radius hierarki**: card besar (`OperationCard`, stat tile, step card, FAQ box, tabel wrapper, dll) `rounded-xl` → `rounded-2xl`; elemen kecil tetap radius lebih kecil.
  - **Progressive disclosure Dashboard**: `StatusSummary` baru di `DashboardView.tsx` — ringkasan "Semua N dokumen tercatat on-chain" ditampilkan SEBELUM stat card detail, sesuai pola dashboard SaaS 2026 (jawaban singkat dulu, breakdown belakangan).
  - Dokumentasi disinkronkan menyeluruh: `design-system.md` (§7 Layout System dirombak, §8 Motion System baru, §9 backlog diperbarui), `architecture/system-overview.md` (navbar, FAQ, Dashboard, PageContainer, EmptyState), `ONBOARDING.md` (aturan card+shadow+motion+PageContainer), `referensi/coding-standards.md` (aturan sama), `_docs/README.md` (link riset baru), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: backlog baru dari riset tren (#19 audit ritme layout & whitespace, #20 audit dark mode mandiri, #21 diferensiasi Upload vs Verify) — semua sengaja ditunda, butuh sesi tersendiri. Backlog lama masih terbuka: #2b (validasi server), #3 (cleanup test), #16 (quick-action Verifikasi di Dashboard).

---

## [2026-08-01 18:00] — Claude Code

- **Progress**: Navbar direstrukturisasi ("Layanan Dokumen" jadi menu utama), type scale diaudit dan direvisi 2x (termasuk ditemukan bug CSS global kritis), lalu review desain menyeluruh (skor 9/10-an dari user) diikuti perbaikan layout & mobile responsiveness — semua sudah diverifikasi visual di browser (desktop & mobile 375px). Akan di-commit ke branch baru (bukan `main`), tidak di-push.
- **Selesai sesi ini**:
  - **Navbar direstrukturisasi**: dari 2 baris (Dashboard di baris identitas + baris menu selalu tampil) jadi 1 baris utama ("Layanan Dokumen" sejajar Dashboard/Bahasa/Keluar) + sub-nav Registrasi/Verifikasi yang hanya tampil di section dokumen.
  - **Type scale diaudit & direvisi 2 kali**: revisi pertama menghapus level 24px (`text-2xl`) yang terlanjur dipakai untuk 3 peran berbeda, menambah level `text-lg` (Subsection); revisi kedua memadatkan seluruh scale turun 1 step (H1 36px→30px, Section 30px→20px, dst) setelah user menilai skala pertama masih kegedean untuk aplikasi enterprise/internal.
  - **Bug kritis ditemukan & diperbaiki**: rule global `h2 { font-size: 2rem }` dan `h4 { font-size: 1.25rem }` di `globals.css`, ditulis di luar `@layer` sehingga mengalahkan SEMUA class `text-*` Tailwind di elemen `<h2>`/`<h4>` — baru ketahuan saat verifikasi visual mobile (computed style `text-lg` yang harusnya 18px ternyata 32px). Ini artinya beberapa perubahan type-scale di sesi sebelumnya (OperationCard, HowItWorks, FAQSection, DashboardView heading) sebenarnya tidak pernah terlihat efeknya sampai bug ini dihapus.
  - **Review desain menyeluruh** (relay dari ChatGPT, dinilai user 9-9.5/10 untuk design system/konsistensi, tapi 7/10 untuk mobile) diikuti implementasi sebagian besar rekomendasi:
    - Hero Verify/Register disederhanakan: avatar ikon lingkaran besar dihapus, padding dipadatkan (`py-12`→`py-8 sm:py-10`), H1 lebih kecil di mobile (`text-2xl sm:text-3xl`).
    - Navbar mobile: dari kompresi ikon-only jadi hamburger + drawer (Dashboard, grup Layanan Dokumen, bahasa, sign in/out).
    - `RecordDetailDrawer`: drawer kanan di ≥sm, bottom sheet (drag-handle, `rounded-t-2xl`, `max-h-[85vh]`) di <sm.
    - `Dropzone`: teks "Seret & Lepas/atau" disembunyikan di mobile (drag-and-drop tidak relevan di touch), hanya sisakan "Klik untuk Pilih File".
    - Tombol submit `FileUpload`: sticky di bawah viewport pada mobile.
    - `EmptyState` diekstrak jadi komponen reusable (`components/common/EmptyState.tsx`), dipakai di `RecordsTable`.
    - Focus state global (`*:focus-visible`, ring primary 2px) ditambah — sebelumnya tidak eksplisit.
    - Padding halaman jadi responsif (`px-4 sm:px-6 lg:px-8`) di Verify/Register/Dashboard.
    - Ternyata mobile card table di `RecordsTable`, grid responsif `StatsCards`, dan skeleton loading (`app/dashboard/loading.tsx`) **sudah** diimplementasikan di sesi sebelumnya tapi belum tercatat di `design-system.md` — dokumentasi disinkronkan.
  - Type-check (`tsc --noEmit`) dan lint (`oxlint`) bersih untuk semua file yang diubah.
  - `design-system.md` ditambah §7 (Breakpoint & Layout) dan §8 (Backlog Desain — item yang sengaja belum dikerjakan).
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah minta commit langsung ke branch baru.
- **Next steps**: lanjutkan backlog `tasks.md` #15–18 (animasi drawer/accordion, quick-action Verifikasi di Dashboard, komponen generik tambahan, border hierarchy) kalau relevan; lanjutkan juga backlog lama #2b (validasi server) dan #3 (cleanup test) yang masih prioritas tinggi.

---

## [2026-08-01 12:00] — Claude Code

- **Progress**: Redesain UI penuh (Verify/Register/Dashboard/Result/Navbar) + sistem i18n penuh + rebrand warna ke identitas BRIN asli — sudah selesai dan diverifikasi manual di browser (light & dark mode, ID & EN). Belum di-commit.
- **Selesai sesi ini**:
  - **Redesain UI menyeluruh** berdasar dua putaran review UX (relay dari ChatGPT): hero Verify/Register diseragamkan ukuran & style; copywriting "hash" → "sidik jari digital" di teks publik; metadata file 2-kolom + tombol copy; notice sebelum submit diubah dari gaya warning (kuning) ke info (biru); Dashboard direstrukturisasi total — dari 1 hero besar + 3 card kecil menjadi 4 stat tile setara, toolbar menyatu dengan tabel dalam satu card, modal detail diganti drawer kanan.
  - **Navbar direstrukturisasi**: Dashboard dipindah ke baris identitas (sebelah tombol Keluar), dipisah dari menu dokumen karena sebelumnya "seolah-olah beda platform". Menu Registrasi/Verifikasi diberi label grup **"Layanan Dokumen"**. Tab aktif diperkuat (border 3px + background tint) setelah feedback "jelek" pada versi underline tipis.
  - **Sistem i18n penuh (ID/EN), fungsional bukan placeholder**: dibangun dari nol — `lib/i18n/translations.ts` (kamus terpusat), `lib/i18n/LocaleContext.tsx` (`LocaleProvider` + `useLocale()`, persist ke `localStorage`), `LanguageSwitcher.tsx` di navbar. Seluruh teks UI (termasuk pesan error upload, format tanggal, pagination) dipindah dari hardcode ke kamus. Pola khusus untuk Server Component (Dashboard) yang tidak bisa akses `localStorage`: kirim kode error, terjemahkan di client component kecil (`DashboardErrorAlert.tsx`).
  - **Rebrand warna ke merah BRIN asli**: sempat rebrand ke biru institusional berdasar asumsi keliru, lalu dicek langsung ke brin.go.id (color-frequency analysis via browser) — ternyata warna identitas BRIN yang sebenarnya adalah merah `#E62F2A` + navy-teal `#17384C`. Palet final diganti total ke warna ini (`styles/globals.css`), `error` token dibuat sengaja lebih gelap (`#991B1B`) untuk dibedakan dari `primary`.
  - **Pagination diperbaiki** (feedback "jelek"): pola `.join` dengan fake button-span dihapus, diganti dua tombol persegi ghost mengapit label teks polos.
  - **Dead code dihapus**: `components/features/` dan `components/ui/` (15 file, sudah divergen, jadi sumber error `tsc`) — dihapus setelah dikonfirmasi via grep tidak ada referensi eksternal.
  - **Dokumentasi diperbarui menyeluruh**: `_docs/tasks/tasks.md`, `_docs/architecture/system-overview.md`, `_docs/referensi/coding-standards.md` (section i18n baru), `_docs/design/design-system.md` (warna, komponen, layout, changelog), `CLAUDE.md` (root) — semua disinkronkan dengan state kode saat ini.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan sesi ini (kode + dokumentasi).
  - Kontras `primary` (merah) vs `error` (merah tua) belum diaudit aksesibilitas formal — lihat `tasks/tasks.md` #14.
- **Next steps**:
  - Setelah dapat konfirmasi, commit seluruh perubahan (tanpa co-author Claude).
  - Update `ONBOARDING.md` supaya sinkron dengan state terbaru (beberapa "known issue" yang disebut di situ — duplikasi component tree, tidak ada validasi upload — sudah tidak berlaku lagi/berubah statusnya).
  - Lanjutkan backlog terbuka: validasi server-side (#2b), cleanup test (#3), CI (#4), dan item baru dari sesi ini (server-side pagination #12, type scale #13, contrast review #14).

---

## [2026-08-01 00:00] — Claude Code

- **Progress**: Handoff dokumentasi selesai — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Dibuat `ONBOARDING.md` (root) untuk developer yang akan melanjutkan project: setup cepat, hal-hal kritis (component tree terduplikasi, route verify orphan, gap validasi upload, setup test membingungkan), prioritas kerja.
  - `_docs/README.md` diupdate — tambah link ke `ONBOARDING.md` di navigasi cepat.
  - Aturan baru (global, semua project): commit git tidak lagi menyertakan trailer `Co-Authored-By: Claude` — supaya riwayat commit tidak menampilkan atribusi AI di GitHub.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan dokumentasi (`CLAUDE.md`, `_docs/`, `ONBOARDING.md`).
- **Next steps**:
  - Setelah dapat konfirmasi, commit dokumentasi ini (tanpa co-author Claude) sebelum mulai kerjakan backlog di `tasks/tasks.md`.

---

## [2026-07-31 00:00] — Claude Code

- **Progress**: Dokumentasi baseline `_docs/` selesai dibuat (retroaktif) — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Audit menyeluruh codebase (`_docs/audit/audit-2026-07-31.md`) — 12 temuan, termasuk 3 High (component tree duplikat, tidak ada validasi upload, setup test bermasalah).
  - Scaffolding `_docs/` lengkap: CLAUDE.md, BRD, SRS (Publisher Portal + Verification Portal + NFR), 1 ADR (NextAuth + Keycloak), architecture overview, coding standards, Definition of Ready/Done, AI review checklist.
  - Backlog awal (`tasks/tasks.md`) diisi dari temuan audit, diurutkan prioritas.
- **Blocker / butuh keputusan dari Ersa**:
  - Keputusan arsitektur: hapus `components/features/`+`components/ui/` (dead code) atau selesaikan migrasi — butuh keputusan sebelum siapa pun mengedit area component lebih jauh.
  - Keputusan produk: nasib route `/verify` placeholder.
- **Next steps**:
  - Mulai kerjakan backlog dari prioritas tertinggi (task #1–#3 di `tasks/tasks.md`).

---

<!-- Entry lama di bawah sini, urut dari terbaru ke terlama -->
