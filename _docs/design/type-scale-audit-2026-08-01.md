# Audit Ukuran Font (Type Scale) — PITS Frontend

**Tanggal:** 2026-08-01
**Tujuan dokumen ini:** referensi lengkap untuk menyeragamkan ukuran font di seluruh aplikasi. Dibuat supaya bisa dibawa ke ChatGPT (atau siapa pun) tanpa perlu akses ke codebase — semua ukuran yang sedang dipakai, di mana dipakainya, dan copywriting asli yang tampil di tiap elemen sudah dikutip di sini.

Backlog terkait: `_docs/tasks/tasks.md` #13 ("Terapkan type scale yang sudah didokumentasikan secara konsisten").

---

## 1. Konteks Aplikasi

PITS (Public Information Trust System) — aplikasi Next.js untuk registrasi & verifikasi dokumen resmi (BRIN), dengan dua alur utama:
- **Verifikasi Dokumen** (publik, tanpa login) — upload PDF, cek keasliannya lewat blockchain.
- **Registrasi Dokumen** (khusus publisher, perlu login) — upload PDF untuk didaftarkan.
- Plus **Dashboard** (daftar dokumen terdaftar, tabel) dan halaman **Result** (hasil registrasi/verifikasi).

Bahasa aplikasi mendukung ID/EN (sistem i18n penuh), tapi ukuran font tidak berbeda antar bahasa — jadi seluruh contoh copy di bawah cukup diwakili versi Indonesia.

## 2. Stack Teknis Relevan

- **TailwindCSS v4** — ukuran font pakai utility class `text-*`, bukan CSS custom per elemen.
- **daisyUI v5** — beberapa class semantik ikut bawa ukuran font sendiri (`card-title`, dll).
- **Font**: **Plus Jakarta Sans** untuk heading (`h1`, `.card-title`, nama brand di navbar), **Inter** untuk body text. Tidak ada font ketiga.
- Tidak ada breakpoint khusus untuk tipografi selain beberapa heading yang punya varian `sm:` (mis. `text-3xl sm:text-4xl`).

### Referensi ukuran default Tailwind (px, di root 16px)

| Class | Ukuran |
|---|---|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |
| `text-4xl` | 36px |
| `text-5xl` | 48px |

Catatan: `text-md` dan `text-xxl` **bukan class Tailwind yang valid** (tidak ada di scale default, dan tidak didefinisikan custom di `styles/globals.css`). Kedua ini ditemukan dipakai di kode (lihat §5) — kemungkinan besar bug, elemen itu efektif tidak punya ukuran font eksplisit.

## 3. Target Type Scale yang Sudah Disepakati (tapi Belum Sepenuhnya Diterapkan)

Ini adalah target yang sudah ditulis di `_docs/design/design-system.md` §3 pada sesi redesain sebelumnya — bukan hasil audit kode, melainkan rencana yang baru sebagian diterapkan:

| Tingkat | Target | Class Tailwind terdekat | Dipakai untuk | Status |
|---|---|---|---|---|
| Hero | 48px | `text-5xl` | Landing page besar | Belum dipakai sama sekali |
| Page Title | 36px | `text-4xl` | H1 tiap halaman | Sebagian — lihat §5 |
| Section | 28px | Tidak ada class persis (antara `text-2xl` 24px dan `text-3xl` 30px) | Heading section ("Cara Kerja Verifikasi", "Pertanyaan Umum") | Saat ini `text-2xl` (24px), meleset dari target |
| Card Title | 20px | `text-xl` | Judul di dalam card | Tidak konsisten — lihat §5 |
| Body | 16px | `text-base` | Paragraf umum | Konsisten |
| Caption | 14px | `text-sm` | Label, deskripsi sekunder | Konsisten, dipakai paling banyak |
| Micro | 12px | `text-xs` | Micro-label uppercase, subtitle kecil | Konsisten |

**Masalah utama**: target "Section = 28px" tidak match class Tailwind manapun secara persis, sehingga tiap kali diterapkan orang pilih `text-2xl` (lebih kecil dari target) — ini salah satu hal yang perlu diputuskan ulang (lihat §6).

## 4. Copywriting Asli per Halaman (Bahasa Indonesia)

### Halaman Verifikasi (`/`)
- **H1 (hero)**: "Verifikasi Dokumen Resmi" — `text-3xl sm:text-4xl`
- **Subtitle hero**: "Pastikan dokumen yang Anda terima sesuai dengan catatan resmi yang telah didaftarkan oleh institusi." — `text-base`
- **Meta hero**: "PDF saja • Maksimal 20 MB • Tanpa akun" — `text-sm`
- **Card title form**: "Verifikasi Dokumen" (via `OperationCard`, class rusak — lihat §5)
- **Section heading**: "Mengapa menggunakan sistem ini?" — `text-sm` (font-semibold, bukan heading besar, meski secara visual berfungsi sebagai judul card kecil)
- **Section heading**: "Cara Kerja Verifikasi" — `text-2xl`
  - 4 step title (mis. "Unggah dokumen", "Hitung sidik jari digital") — tanpa class ukuran eksplisit (`font-semibold` saja → inherit `text-base`)
  - step description (mis. "Pilih file PDF yang ingin diperiksa.") — `text-sm`
- **Section heading**: "Pertanyaan Umum" — `text-2xl`
  - Pertanyaan FAQ (mis. "Apa yang terjadi setelah dokumen diunggah?") — tanpa class ukuran eksplisit
  - Jawaban FAQ — `text-sm`

### Halaman Registrasi (`/publisher`)
- **H1 (hero)**: "Registrasi Dokumen" — `text-3xl sm:text-4xl`
- **Subtitle hero**: "Daftarkan dokumen institusi sebagai arsip digital yang dapat diverifikasi melalui blockchain." — `text-base`
- **Card title form**: "Daftarkan Dokumen Baru" (via `OperationCard`, sama, class rusak)
- **Notice info**: "Informasi" (heading) — `text-sm` (font-semibold)
  - body: "Dokumen yang telah didaftarkan tidak dapat diubah..." — `text-sm`
- **Card**: "Persyaratan Dokumen" — `text-sm` (font-semibold)

### Halaman Result (hasil registrasi/verifikasi)
- **H1**: "Registrasi Berhasil" / "Dokumen Terverifikasi" / "Dokumen Tidak Ditemukan" / "Registrasi Gagal" / "Terjadi Kesalahan" — semua `text-2xl` (**catatan: ini H1 halaman, tapi ukurannya sama dengan section heading di halaman lain, bukan `text-4xl` seperti H1 Dashboard/Verify/Register**)
  - body sukses/gagal — `text-sm`
  - label micro ("Dokumen", "Bukti Blockchain") — `text-xs` (uppercase, semibold)
  - value (nama file, hash, dll) — `text-sm`

### Dashboard (`/dashboard`)
- **H1**: "Dokumen Terdaftar" — `text-4xl`
- 4 stat tile: label (mis. "Total Dokumen") — `text-xs`; angka/value besar — `text-xl font-bold`
- **Heading card tabel**: "Dokumen" — `text-lg`
- Empty state title ("Belum ada dokumen" / "Tidak ada dokumen ditemukan") — `text-lg`
- Empty state body — `text-sm`
- Header kolom tabel (uppercase) — `text-xs`
- Nama file di baris tabel — `text-base` (default, tanpa class eksplisit di beberapa baris)
- Toolbar (search, filter, "Diperbarui") — campuran `text-base` (search input) dan `text-xs` (label kecil)
- Pagination ("Halaman X dari Y") — `text-sm`
- **Drawer detail**: judul nama file — `text-xl`; label field — `text-xs`/`text-sm`; value — `text-xs` (mono) / `text-sm`

### Navbar (semua halaman)
- Nama institusi ("Badan Riset dan Inovasi Nasional") — `text-base` (font-semibold)
- Subtitle ("Platform Verifikasi Dokumen") — `text-sm`
- Semua item menu (Layanan Dokumen, Dashboard, Registrasi Dokumen, Verifikasi Dokumen, Masuk/Keluar) — `text-sm`
- Toggle bahasa (ID/EN) — `text-xs`

## 5. Temuan / Inkonsistensi yang Perlu Diputuskan

1. **`text-2xl` (24px) dipakai untuk 3 peran berbeda sekaligus**: heading section di Verify/Register ("Cara Kerja Verifikasi", "Pertanyaan Umum"), H1 halaman Result, dan judul `LoadingCard`. Padahal H1 halaman lain (Verify/Register/Dashboard) pakai `text-3xl`/`text-4xl`. Result H1 jadi terlihat lebih kecil dari H1 halaman lain meski perannya sama (judul utama halaman).
2. **Target "Section = 28px" tidak match class Tailwind manapun** — perlu diputuskan: turun ke `text-2xl` (24px, jadi target lama direvisi) atau naik ke `text-3xl` (30px), atau tambah custom class/token baru untuk 28px persis.
3. **Class tidak valid ditemukan di kode** (efektif tidak mengubah ukuran font sama sekali):
   - `components/common/OperationCard.tsx:48` → `text-xxl` (judul card form Verify & Register, harusnya jadi Card Title level)
   - `components/common/DocumentPreview.tsx:63` → `text-md` (nama file di preview upload)
4. **Card Title (target 20px / `text-xl`) tidak konsisten**: `Dropzone` pakai `text-2xl`/`text-xl` untuk teks "Seret & Lepas"/"atau"/"Klik untuk Pilih File", drawer dashboard pakai `text-xl` untuk nama file, tapi `OperationCard` (harusnya juga Card Title) malah rusak (poin 3).
5. **Step title/FAQ question tidak punya class ukuran eksplisit** — hanya `font-semibold`, jadi inherit body 16px. Ini mungkin sudah pas, tapi belum ditetapkan secara sadar sebagai "Card Title kecil" vs "Body tebal".
6. **Nama file di baris tabel dashboard** sebagian tanpa class ukuran eksplisit (inherit `text-base` dari parent), sebagian eksplisit `text-base` — perlu dipastikan konsisten kalau mau diseragamkan lewat class eksplisit semua atau reliance ke inherit semua.

## 6. Pertanyaan yang Perlu Diputuskan (Sebelum Diterapkan ke Kode)

1. Target 28px untuk "Section" — direvisi ke `text-2xl` (24px, samakan dengan kenyataan sekarang) atau dinaikkan ke `text-3xl` (30px)?
2. H1 halaman Result — dinaikkan ke `text-3xl`/`text-4xl` supaya sejajar dengan H1 halaman lain, atau memang sengaja dibuat lebih kecil karena konteksnya beda (halaman hasil, bukan halaman utama)?
3. Step title (How It Works) dan FAQ question — ditetapkan eksplisit sebagai ukuran apa (tetap inherit body, atau naik jadi `text-lg`/Card Title supaya beda dari body description di bawahnya)?
4. Apakah perlu 1 ukuran custom baru (mis. token `text-section` = 28px) supaya target desain bisa dicapai persis, atau cukup dibulatkan ke class Tailwind terdekat yang sudah ada (lebih simpel, tidak butuh custom CSS)?
5. Nama file di tabel dashboard & drawer — disamakan semua eksplisit `text-base`, atau ada alasan sebagian perlu lebih besar (mis. drawer sebagai "detail view" pantas lebih besar dari baris tabel)?

## 7. Cara Pakai Dokumen Ini

Bawa §3–§6 ke ChatGPT (atau siapa pun yang bantu putuskan), minta rekomendasi type scale final yang konsisten menjawab pertanyaan di §6. Hasilnya nanti dituang ulang sebagai revisi tabel di `_docs/design/design-system.md` §3, lalu diterapkan ke file-file yang disebut di §4–§5 (task #13 di `tasks/tasks.md`).
