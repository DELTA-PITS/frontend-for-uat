# Design Language v2 — PITS Frontend

**Tanggal:** 2026-08-01
**Status:** ✅ DITERAPKAN (2026-08-01) — semua §9 dijawab "lanjut, pakai usulan baru" (1: shadow di semua card ya, 2: tipografi naik ke 32/22, 3: navbar shadow-on-scroll ya dengan JS, 4: `rounded-3xl` khusus `OperationCard` ya). Dokumen ini sekarang jadi sumber kebenaran §2 (Warna), §3 (Tipografi), §5 (Pola Layout) di `design-system.md` — lihat §11 di bawah untuk detail penerapan aktual.

**Kenapa dokumen ini ada**: setelah beberapa ronde audit (type scale, layout md, tren 2026, motion), kesimpulannya bahasa visual PITS masih terasa seperti dashboard admin 2019–2022 — bukan karena struktur/layoutnya salah, tapi karena **border abu tebal di mana-mana, satu shade abu dipakai untuk segalanya, tanpa depth, dan warna merah BRIN dipakai untuk terlalu banyak peran sekaligus**. Ini "audit terberat" karena token di sini dipakai LITERAL di semua tempat — perubahan di sini otomatis merambat ke semua halaman tanpa perlu diedit satu-satu.

---

## 1. Kondisi Saat Ini (baseline, `styles/globals.css`)

| Token | Light | Dipakai untuk |
|---|---|---|
| `--color-base-100` | `#F9F9F9` | Background HALAMAN **dan** background CARD — sama persis, makanya card tidak terasa "naik" dari halaman, cuma keliatan dari border-nya saja |
| `--color-base-200` | `oklch(97% 0 0)` (≈ nyaris sama terangnya dengan base-100) | Hover state, header tabel |
| `--color-base-300` | `#C3BEBE` | SATU-SATUNYA border di seluruh app — navbar, card, input, table, accordion, semuanya pakai warna & ketebalan (`1.5px`) yang sama persis |
| Shadow | Tidak ada di manapun, kecuali `OperationButton` (`shadow-md`) dan overlay (`shadow-2xl`, ditambah sesi lalu) | — |
| Radius | `rounded-2xl` (card besar), `rounded-lg` (button/input, via `--radius-field: 0.5rem`) | Sudah ada hierarki 2 tingkat, belum ada tingkat ke-3 (hero) |
| `--color-primary` | `#E62F2A` (merah BRIN) | CTA utama, badge, ikon default (`FilledIcon`), border dropzone, **hover text/border di hampir semua elemen interaktif** (nav tab, sign in/out, copy button, card hover, FAQ hover) — total 24 titik pemakaian tersebar di 12 file, lintas peran berbeda |

**Diagnosis** (dikonfirmasi lewat grep, bukan tebakan): kritik user akurat — border `base-300` dipakai identik di navbar/card/table/input/accordion (satu bahasa visual untuk semua elemen), dan `primary` (merah) dipakai untuk aktif-nav, hover-nav, ikon, badge, border dropzone, hover-card, hover-FAQ sekaligus — kalau semua elemen highlight pakai warna yang sama dengan CTA utama, CTA jadi tidak menonjol lagi.

## 2. Background & Surface (2 lapis, bukan 1)

| Token baru | Light | Dark | Dipakai untuk |
|---|---|---|---|
| `--color-base-200` (PAGE background) | `#F5F6F8` | tetap `#121b2e` (sudah beda dari base-100 di dark, tidak perlu diubah) | `<body>`, background halaman |
| `--color-base-100` (SURFACE/card) | `#FFFFFF` | tetap `#0a0f1d` | Card, drawer, dropdown — SELALU lebih terang dari page background |

**Perubahan kunci**: di LIGHT mode, `base-100` dan `base-200` ditukar perannya. Sekarang keduanya nyaris sama (perbedaan 2% lightness, nyaris tidak kelihatan) — setelah ini, page = abu sangat muda (`#F5F6F8`), card = putih murni (`#FFFFFF`). Beda ~3-4% lightness ini yang bikin card "mengambang" dari page tanpa perlu border tebal. Dark mode TIDAK perlu diubah — di sana base-100/base-200 sudah cukup beda (`#0a0f1d` vs `#121b2e`).

## 3. Border vs Shadow

**Prinsip baru**: border jadi jauh lebih halus, shadow kecil mengambil alih sebagian tugas "memisahkan elemen" yang sebelumnya 100% dibebankan ke border tebal.

| Token | Sebelumnya | Baru |
|---|---|---|
| `--border` (ketebalan) | `1.5px` di semua elemen | `1px` |
| `--color-base-300` (warna border) | `#C3BEBE` (abu jelas, kontras tinggi) | `#E8E9EC` (abu sangat halus — mendekati warna card, hampir tidak terlihat sendirian, baru terlihat kalau ada shadow menemani) |
| Shadow card | Tidak ada | `shadow-[0_1px_2px_rgba(15,23,42,0.04)]` — nyaris tak terlihat, TAPI beda nyata dari 0 |
| Shadow hover card (yang genuinely clickable) | `hover:shadow-md` (sudah ada di `RecordsTable` card mobile) | Dipertahankan, ditambah transisi yang sudah ada |
| Navbar | `border-b border-base-300` selalu tampil | Border dihapus saat di posisi paling atas; saat discroll (`scrollY > 0`), transisi ke `shadow-sm` + `bg-base-100/90 backdrop-blur-sm` — butuh sedikit JS (scroll listener), bukan cuma CSS |

**Catatan konflik dengan keputusan lama**: sesi sebelumnya kita menetapkan "card SELALU border-only, TIDAK ADA shadow — kecuali overlay (drawer)". Usulan ini **merevisi** aturan itu: shadow sangat tipis (`0 1px 2px`, bukan `shadow-md`/`shadow-xl`) sekarang boleh dipakai di SEMUA card, bukan cuma overlay. Overlay tetap dapat shadow lebih tebal (`shadow-2xl`) supaya masih terasa "melayang di atas", sementara card biasa dapat shadow sangat tipis yang nyaris cuma terasa sebagai "penebalan border". Ini keputusan yang membalikkan prinsip lama — perlu dikonfirmasi eksplisit sebelum diterapkan (lihat §9).

## 4. Skala Abu (5 tingkat, bukan 1)

| Tingkat | Token | Dipakai untuk |
|---|---|---|
| `gray-50` | `--color-base-200` (page bg, lihat §2) | Background halaman |
| `gray-100` | `--color-base-100` (surface, lihat §2) | Card, drawer |
| `gray-200` | `--color-base-300` baru (`#E8E9EC`, lihat §3) | Border halus |
| `gray-300` → dipisah jadi token baru `--color-divider-strong` (`#D5D7DC`) | — | Dipakai KHUSUS untuk pemisah yang memang butuh kontras lebih (header tabel vs body tabel, divider antar section drawer) — bukan dipakai di semua tempat seperti `base-300` sekarang |
| `gray-500` ≈ `--color-ink-secondary` (sudah ada, `#667085`) | — | Teks sekunder — TIDAK berubah, sudah benar |

## 5. Warna Brand — Batasi Peran Merah

**Prinsip**: merah BRIN (`--color-primary`) hanya muncul di titik yang **memang penting** — bukan dekorasi hover di mana-mana. Warna lain sudah cukup selaras dengan usulan (`secondary`=navy≈slate, `success`=hijau≈emerald, `info`=biru, `warning`=amber — tidak perlu diubah).

| Peran | Sekarang | Baru |
|---|---|---|
| CTA utama (tombol submit, tombol register) | `primary` | **Tetap** `primary` — ini justru titik yang PALING pantas pakai merah |
| Badge status penting (Akses Publik, Khusus Publisher) | `primary`/`secondary` | **Tetap** |
| Nav aktif (tab Registrasi/Verifikasi, Dashboard, Layanan Dokumen) | `bg-primary/10 text-primary` | Ganti ke netral: `bg-base-200 text-base-content font-semibold` + garis bawah tipis `border-b-2 border-base-content/70` (bukan merah) — nav aktif harus terlihat "dipilih", bukan "penting seperti CTA" |
| Hover nav/button sekunder (Sign in/out, Copy button, item drawer mobile) | `hover:text-primary` | Ganti ke `hover:bg-base-200` (tanpa ganti warna teks) — hover cukup terasa lewat background, tidak perlu ganti ke merah |
| Ikon default (`FilledIcon`, `TipsCard` checklist) | `text-primary` | Ganti ke `text-secondary` (navy) untuk ikon netral/informational; `primary` disisakan HANYA untuk ikon yang benar-benar terkait aksi utama (upload/verify) |
| Border dropzone (idle) | `border-primary` | Ganti ke `border-base-300` netral; `primary` HANYA muncul saat `isDragActive` (state aktif, ini pas) |
| Hover border card (`OperationCard`, `RecordsTable` card, FAQ) | `hover:border-primary/40` | Ganti ke `hover:border-base-content/20` (netral, lebih gelap dikit dari border biasa) — card hover cukup terasa "diangkat" (shadow, §3), tidak perlu ganti warna border jadi merah |

**Hasil**: setelah ini, merah BRIN dihitung ulang — dari 24 titik pemakaian lintas-peran, turun ke sekitar 6-8 titik yang benar-benar CTA/state penting (tombol submit, badge, state upload aktif). Sisanya pakai `base-content`/`base-200`/`secondary` netral.

## 6. Radius — 3 Tingkat (naik dari 2)

| Tingkat | Class | Dipakai untuk |
|---|---|---|
| Hero/section besar | `rounded-3xl` *(baru)* | Hero band Verify/Register (bukan section, section tetap persegi/flat karena full-bleed) — dipakai di elemen dekoratif dalam hero kalau ada (badge sudah pill/full, jadi radius baru ini realistanya dipakai di card besar seperti `OperationCard`) |
| Card besar | `rounded-2xl` (sudah diterapkan sesi lalu) | Stat tile, step card, FAQ box, tabel wrapper, drawer bottom-sheet |
| Card kecil/input | `rounded-lg` (default daisyUI, sudah benar) | Button, input, dropdown |
| Chip/badge | `rounded-full` (via `badge-soft` daisyUI, sudah benar) | Badge status |

**Catatan**: usul asli menaruh `rounded-3xl` di Hero DAN `rounded-2xl` di "card besar" sebagai 2 tingkat berbeda — tapi `OperationCard` SEKARANG statusnya "card besar utama" (bukan hero, hero cuma teks+badge tanpa card box). Supaya tidak menambah tingkat ke-4 yang tidak perlu, `rounded-3xl` diusulkan HANYA untuk `OperationCard` (satu-satunya "hero-level card" di app), card lain tetap `rounded-2xl`.

## 7. Tipografi — ⚠️ Konflik dengan Keputusan yang Sudah Difinalisasi

Usul baru: Title 32 / Section 22 / Card 18 / Body 15 / Caption 13.

**Ini beda dari type scale yang SUDAH difinalisasi 2 sesi lalu** (setelah 2 ronde revisi + verifikasi visual): Page Title 30px / Section 20px / Card Title 18px / Subsection 16px / Body 14px / Caption 12px — waktu itu SENGAJA dipadatkan turun dari skala lebih besar karena kamu bilang skala besar "kegedean untuk aplikasi enterprise/internal" (lihat `design-system.md` §3, riwayat revisi).

Usul baru ini sebagian menaikkan lagi (Title 30→32, Section 20→22), tapi Card Title tetap 18, Caption malah turun (12→13, hampir sama). Selisihnya kecil (2px di beberapa tingkat) — **saya rekomendasikan TIDAK mengubah lagi** kecuali ada alasan kuat, supaya tidak bolak-balik revisi type scale untuk selisih yang nyaris tidak terlihat. Type scale yang sudah ada saya anggap **final**, tidak termasuk dalam Design Language v2 ini — kalau kamu tetap mau menaikkan 2px di Title/Section, tolong konfirmasi eksplisit (lihat §9).

## 8. Motion & Spacing

Sudah cukup selaras dengan yang diimplementasikan sesi lalu (hover 150ms, overlay slide 200ms, accordion 200ms) — **tidak berubah**. Spacing scale (`px-4/gap-4/py-8` mobile → `px-6/gap-6/py-10` tablet → `px-8/gap-8/py-12` desktop) juga sudah ada sebagai target (§7 lama di `design-system.md`), retrofit penuh masih backlog #19 — di luar cakupan token visual murni di dokumen ini.

## 9. Pertanyaan yang WAJIB Dijawab Sebelum Implementasi

1. **Border+shadow di semua card** (§3) — ini membalikkan prinsip "border-only, tanpa shadow" yang baru saja ditetapkan sesi lalu. Setuju shadow sangat tipis (`0 1px 2px rgba(15,23,42,.04)`) boleh dipakai di SEMUA card (bukan cuma overlay)?
2. **Tipografi** (§7) — pertahankan skala yang sudah final (30/20/18/16/14/12), atau naikkan lagi 2px di Title & Section (32/22) sesuai usul baru ini?
3. **Navbar shadow-on-scroll** (§3) — butuh sedikit JS (scroll listener untuk toggle class), bukan CSS murni. Oke ditambahkan, atau cukup border tipis statis (tanpa listener scroll) demi kesederhanaan?
4. **Radius `rounded-3xl` khusus `OperationCard`** (§6) — setuju, atau `rounded-2xl` saja sudah cukup untuk semua card besar (tanpa tingkat ke-3)?

## 10. Cara Pakai Dokumen Ini

Setelah §9 dijawab, saya terapkan token di `styles/globals.css` (background/surface/border/warna) sekali di satu tempat — otomatis merambat ke semua komponen yang sudah pakai token (`bg-base-100`, `border-base-300`, dst). Yang butuh edit manual per komponen: penggantian `text-primary`/`hover:text-primary`/`border-primary` jadi warna netral (§5, karena itu class eksplisit tiap komponen, bukan token global) dan navbar shadow-on-scroll (§3, butuh state React).

## 11. Penerapan Aktual (2026-08-01)

| Item | Diterapkan sebagai |
|---|---|
| Background/Surface (§2) | `styles/globals.css`: `--color-base-100` (card) `#F9F9F9`→`#FFFFFF`; `--color-base-200` (page/hover) `oklch(97% 0 0)`→`#F5F6F8`; `:root --background` (body) juga ikut `#F5F6F8`. Dark mode TIDAK diubah. |
| Border (§3) | `--color-base-300` `#C3BEBE`→`#E8E9EC`; `--border` `1.5px`→`1px` (light saja, dark tetap 1.5px). Token baru `--color-divider-strong` (`#D5D7DC` light / `#2a3752` dark) ditambah untuk pemisah yang memang butuh kontras lebih (belum dipakai di komponen manapun — cadangan). |
| Shadow (§3) | Utility class baru `.shadow-card` (`0 1px 2px rgba(15,23,42,.04)` light, `0 1px 2px rgba(0,0,0,.2)` dark) ditambah ke SEMUA card besar (`OperationCard`, `TipsCard`, `RequirementCard`, `MetadataCard`, `StatsCards`, `HowItWorks` step, `FAQSection` box, `RecordsTable` (tabel+card mobile), `DashboardView` "Dokumen" card, `EmptyState`, `LoadingCard`, `TableSkeleton`). Overlay (drawer) tetap `shadow-2xl`, jauh lebih kuat. |
| Navbar shadow-on-scroll (§3) | `components/layout/Header.tsx`: `useState isScrolled` + `useEffect` scroll listener (`window.scrollY > 4`). Border bawah dihapus total, diganti `bg-base-100/90 backdrop-blur-sm`, `shadow-sm` cuma muncul saat `isScrolled`. Terverifikasi lewat `getComputedStyle(header).boxShadow` di browser. |
| Radius (§6) | `OperationCard` naik ke `rounded-3xl` (satu-satunya elemen di tingkat ini — "hero-level card"). Card besar lain tetap `rounded-2xl` (sudah dari sesi sebelumnya). |
| Batasi peran merah (§5) | Nav aktif (baris utama, sub-nav, drawer mobile): `bg-primary/10 text-primary` → `bg-base-200 font-semibold text-base-content`. Nav hover: `hover:text-primary` dihapus, cukup `hover:bg-base-200`. `FilledIcon` default: `bg-primary/10 text-primary` → `bg-secondary/10 text-secondary` (dampak ke `StatsCards` 3 kartu pertama & `HowItWorks` 4 step icon, yang tidak eksplisit override warna). `TipsCard` checklist icon → `text-secondary`. `Dropzone` idle border → `border-base-300` netral, `primary`/`secondary` HANYA muncul saat `isDragActive`. Hover border card (`OperationCard`, `RecordsTable`, `FAQSection`) → `hover:border-base-content/20`. `CopyButton` hover → `hover:text-base-content`. `MetadataCard` status "siap dikirim" → `text-success` (bukan `text-primary`, karena secara semantik ini indikator "siap"/baik, bukan CTA). `LanguageSwitcher` toggle aktif TIDAK diubah (kontrol kecil mandiri, bukan bagian dari pola nav-highlight yang berulang). |
| Tipografi (§7) | Page Title dinaikkan ke 32px: Dashboard/Result `text-3xl`→`text-[2rem]` (flat); Hero (`VerifyHero`/`RegisterHero`) 3 tingkat `text-2xl md:text-3xl lg:text-4xl` (24/30/36) → `text-2xl md:text-[1.75rem] lg:text-[2rem]` (24/28/32). Section (`HowItWorks`/`FAQSection` heading) `text-xl`(20)→`text-[1.375rem]`(22). Card Title/Subsection/Body/Caption TIDAK diubah (tetap 18/16/14/12). |

Type-check dan lint bersih setelah semua perubahan; navbar shadow-on-scroll diverifikasi bekerja di browser.
