# Audit Layout di Breakpoint Tablet/MD — PITS Frontend

**Tanggal:** 2026-08-01
**Tujuan dokumen ini:** referensi lengkap untuk mendiskusikan (dengan ChatGPT atau siapa pun) apakah ukuran/lebar layout di rentang tablet (sekitar 768px–1023px, breakpoint Tailwind `md`) perlu disesuaikan. Ditulis supaya bisa dibaca tanpa akses ke codebase — semua breakpoint, class, dan behavior aktual sudah dikutip di sini.

Konteks sebelumnya: sesi ini baru menyelesaikan review desain besar (redesain UI, i18n, navbar, type scale, mobile responsiveness — lihat `_docs/design/design-system.md`). Saat verifikasi visual di lebar tablet (~768–834px, mis. iPad), ditemukan beberapa hal yang terasa belum pas. Dokumen ini fokus khusus ke rentang itu.

---

## 1. Konteks Aplikasi

PITS — aplikasi Next.js untuk registrasi & verifikasi dokumen resmi (BRIN). Halaman utama: **Verifikasi** (`/`, publik), **Registrasi** (`/publisher`, perlu login publisher), **Dashboard** (`/dashboard`, perlu login), **Result** (hasil registrasi/verifikasi). Stack: TailwindCSS v4 + daisyUI v5, tidak ada breakpoint custom — breakpoint yang dipakai murni default Tailwind:

| Breakpoint | Lebar |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |

## 2. Behavior Saat Ini per Elemen, per Rentang Lebar

### Navbar (`components/layout/Header.tsx`)
- `<640px`: logo + tombol hamburger saja. Tap membuka drawer full-screen (Dashboard, grup Layanan Dokumen, bahasa, sign in/out).
- `≥640px`: baris utama penuh (Layanan Dokumen, Dashboard, toggle bahasa, Masuk/Keluar sejajar) + sub-nav baris kedua (tab Registrasi/Verifikasi) — **tidak ada perbedaan lagi antara 640px dan 1024px+**, tampilannya identik dari tablet kecil sampai desktop lebar.
- Sub-nav row: `<nav className="hidden items-center gap-2 border-t border-base-300 bg-base-200/40 px-6 sm:flex">` — lebar nav ini **mengikuti isi** (flex, tidak ada `justify-between`/`w-full` pada tab-tabnya), jadi di layar lebar menyisakan area kosong di sisi kanan setelah tab terakhir.

### Kolom konten Verify/Register/Result (Hero + `OperationCard` + kartu-kartu pendukung)
- Semua pakai `max-w-3xl` (768px) + `mx-auto` — **flat, tidak berubah di breakpoint manapun**. Begitu viewport ≥768px + padding, kolom ini sudah mentok lebarnya dan tidak pernah melebar lagi walau layar 1440px sekalipun.
- Padding halaman pembungkus: `px-4 sm:px-6 lg:px-8` (mobile 16px, tablet 24px, desktop 32px) — naik bertahap, tapi kolom kontennya sendiri tetap 768px flat.
- **Akibat di lebar ~768–834px (tablet portrait, mis. iPad)**: `max-w-3xl` (768px) + padding `px-6` (24px kiri-kanan) nyaris = lebar viewport itu sendiri. Hasilnya terasa seperti tampilan mobile yang di-stretch, bukan layout yang sengaja dirancang untuk tablet — nyaris tidak ada "napas" di kiri-kanan.
- Hero (`VerifyHero`/`RegisterHero`): judul `text-2xl sm:text-3xl`, padding `py-8 sm:py-10` — juga flat sejak `sm` (640px), tidak ada penyesuaian lebih lanjut di `md`/`lg`.

### Dashboard (`components/dashboard/*`)
- Container halaman: `max-w-7xl` (1280px) + padding `px-4 py-8 sm:px-6 sm:py-10 lg:px-8` — ini SATU-SATUNYA area yang lebarnya benar-benar mengikuti breakpoint sampai ke `lg`, jadi Dashboard secara struktur sudah "melebar" natural sesuai layar.
- `StatsCards`: `grid-cols-2 lg:grid-cols-4` — 2 kolom dari mobile SAMPAI `lg` (1024px), baru 4 kolom di ≥1024px. Artinya di seluruh rentang tablet (768–1023px) stat card masih 2 kolom, padahal lebar tersedia (mis. iPad landscape 1024px persis di batas, iPad portrait 768–834px) sebenarnya cukup untuk 3 kolom.
- `RecordsTable`: mode kartu bertumpuk di `<md` (768px), tabel penuh di `≥md`. Breakpoint switch ini persis di lebar iPad portrait (768px/810px/820px tergantung model) — jadi begitu masuk mode tabel, kolom-kolomnya (Dokumen/Terdaftar/Penerbit/Status) langsung penuh di lebar yang masih tergolong sempit untuk sebuah tabel data.
- `RecordDetailDrawer`: bottom sheet di `<sm` (640px), drawer sisi kanan `max-w-md` (448px) tetap dari `sm` sampai layar terlebar — tidak melebar lagi di `lg`.

## 3. Ringkasan Masalah yang Terlihat

1. **Kolom konten Verify/Register/Result flat 768px** — tidak memanfaatkan ruang ekstra sama sekali begitu viewport ≥768px+padding; terasa mepet khususnya persis di rentang tablet portrait.
2. **Sub-nav navbar tidak simetris** — tab Registrasi/Verifikasi rata kiri, menyisakan strip kosong di kanan pada layar lebar (tablet ke atas), sementara baris utama di atasnya full-width (pakai `justify-between`).
3. **Stat card Dashboard "terlambat" melebar** — tetap 2 kolom di seluruh rentang tablet (768–1023px), baru 4 kolom persis di `lg` (1024px) — tidak ada kolom transisi 3 di antaranya.
4. **Breakpoint tabel Dashboard (`md`, 768px) berimpit dengan lebar tablet portrait** — table penuh langsung aktif di lebar yang secara historis dianggap "belum tentu cukup lega" untuk tabel data multi-kolom; belum ada uji apakah kolomnya jadi sesak persis di 768–800px.

## 4. Pertanyaan yang Perlu Diputuskan

1. Kolom konten Verify/Register/Result: tetap flat 768px selamanya (konsisten, tapi tidak memanfaatkan layar lebar), atau dibuat melebar bertahap (mis. `max-w-3xl md:max-w-4xl` atau sejenis) khusus di rentang tablet ke atas?
2. Sub-nav navbar: dibiarkan rata kiri dengan strip kosong (sederhana), atau diberi `justify-center`/`justify-between`/lebar mengikuti container penuh supaya tidak timpang dengan baris utama di atasnya?
3. Stat card Dashboard: tambah titik transisi 3 kolom di `md` (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`), atau cukup 2→4 seperti sekarang?
4. Breakpoint tabel Dashboard: majukan ke `lg` (1024px) supaya mode kartu bertahan lebih lama di tablet (lebih aman untuk lebar sempit), atau tetap di `md` (768px) seperti sekarang?

## 5. Cara Pakai Dokumen Ini

Bawa §2–§4 ke ChatGPT (atau siapa pun), minta rekomendasi konkret untuk tiap pertanyaan di §4 (breakpoint mana, class Tailwind apa). Hasilnya nanti diterapkan ke file-file yang disebut di §2 dan dicatat ulang sebagai revisi di `_docs/design/design-system.md` §7 (Breakpoint & Layout).
