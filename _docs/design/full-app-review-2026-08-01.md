# Snapshot Lengkap UI — PITS Frontend (Pasca-Redesign)

Dokumen ini adalah potret LENGKAP kondisi UI aplikasi saat ini (bukan lagi daftar masalah/rencana seperti brief sebelumnya) — untuk dikirim ke AI lain (ChatGPT) sebagai bahan evaluasi menyeluruh. Mencakup: fungsi tiap halaman, tata letak, warna, tipografi, ukuran komponen, copywriting (teks asli), dan komponen yang dipakai.

**Tanggal:** 2026-08-01
**Cara pakai:** copy seluruh isi file ini ke ChatGPT, minta evaluasi/kritik menyeluruh.

---

## 0. Konteks Produk

**PITS (Public Information Trust System)** — sistem pembuktian keaslian dokumen institusi (target riil: BRIN) via hash SHA-256 + anchoring blockchain. Dua audiens: **Publisher** (staf institusi, login, mendaftarkan dokumen) dan **Verifier** (publik, tanpa login, mengecek keaslian dokumen).

Lima permukaan UI yang perlu dievaluasi: **Navbar** (global), **Verify** (`/`), **Register/Upload** (`/publisher`), **Dashboard** (`/dashboard`), **Result** (`/result/success`, `/result/failure`).

---

## 1. Design System — Token Mentah

### Warna (light theme — default, mode gelap otomatis ikut `prefers-color-scheme`)

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `base-100` (background/card) | `#F9F9F9` | Background halaman & semua card |
| `base-200` | `oklch(97% 0 0)` (abu sangat muda) | Hover row, header tabel |
| `base-300` (border) | `#C3BEBE` | SATU-SATUNYA pemisah visual antar card/section (tidak ada shadow) |
| `base-content` (teks utama) | `#3F4854` (nyaris hitam) | Teks primer — baru diganti dari `#8B8484` yang terlalu pudar |
| `ink-secondary` (token custom baru) | `#667085` | Teks sekunder (label, deskripsi) |
| `ink-muted` (token custom baru) | `#98A2B3` | Teks tersier (subtitle navbar, uppercase micro-label) |
| `primary` (teal) | `#00B5AA` | CTA/aksi, aksen halaman Verify, link aktif |
| `secondary` (navy) | `#00336C` | Heading, angka besar, aksen halaman Register |
| `accent` (biru) | `#0093DD` | Jarang dipakai eksplisit |
| `success` | `oklch(77% 0.152 181.912)` (hijau-teal) | Badge "On-chain", ikon centang |
| `error` | `oklch(70% 0.191 22.216)` | Badge/alert gagal |
| `warning` | `oklch(85% 0.199 91.936)` | Kotak "Sebelum mengirim" di halaman Register |

Dark theme: `base-100:#0a0f1d`, `base-300:#1e2942`, `base-content:#cbd5e1`, `secondary` jadi putih (`#f8fafc`), `primary` tetap teal.

### Tipografi
- **Plus Jakarta Sans** — heading (`h1`, `.card-title`, nama brand navbar).
- **Inter** — body text.
- Tidak ada type-scale terdokumentasi; ukuran ad-hoc per komponen (`text-sm` s/d `text-4xl`).

### Radius & Border
`rounded-xl` (0.5rem via `--radius-box`) dominan di semua card. Border `1.5px`. **Tidak ada shadow di manapun** — seluruh hierarki visual dibangun dari border + background flat.

### Ikon
Satu library: **`@mui/icons-material`** (varian Outlined dominan), dipakai konsisten di seluruh app termasuk navbar.

---

## 2. Navbar (Global, semua halaman)

**Fungsi**: identitas brand + navigasi antar 3 halaman utama + status login.

**Layout** (`components/layout/Header.tsx`):
```
[Logo BRIN 32x32] [Badan Riset dan Inovasi Nasional      ]     [ikon+Registrasi] [ikon+Verifikasi] [ikon+Dashboard] [ikon+Keluar/Masuk]
                   [Platform Verifikasi Dokumen Blockchain]
```
- Tinggi: `64px` (`h-16`), `sticky top-0`, background `base-100`, border bawah `base-300`, **tanpa shadow**.
- Brand: logo + nama institusi (font Jakarta, bold, warna `secondary`) + subtitle kecil "Platform Verifikasi Dokumen Blockchain" (warna `ink-muted`, **disembunyikan di layar <640px**).
- Link aktif ditandai **underline teal 2px di bawah item** (bukan background pill).
- **Responsif**: di layar <640px (`sm`), label teks nav disembunyikan — hanya ikon + `title` tooltip yang tampil, supaya tidak overflow.
- **Beda menu berdasar status login**:
  - Belum login (publik): hanya "Verifikasi" (link ke `/`). **Dashboard sengaja disembunyikan** untuk publik karena rutenya selalu redirect ke login (bukan UX yang baik untuk ditampilkan tapi tidak bisa diakses).
  - Sudah login (publisher): "Registrasi" (`/publisher`) → "Verifikasi" (`/`) → "Dashboard" (`/dashboard`) → "Keluar".
- Ikon: `UploadFileOutlined` (Registrasi), `FactCheckOutlined` (Verifikasi), `SpaceDashboardOutlined` (Dashboard), `LoginOutlined`/`LogoutOutlined`.

---

## 3. Halaman Verify — `/` (Landing Page Publik)

**Fungsi**: entry point publik, tanpa login, untuk mengecek keaslian dokumen. Dirancang sebagai landing page yang meyakinkan & cepat dipahami (bukan sekadar form upload).

**Urutan section (top to bottom)**:

### 3.1 Hero (`VerifyHero.tsx`)
- Background: `bg-primary/5` (tint teal sangat tipis), full width, padding `py-14`.
- Ikon shield-check (`GppGoodOutlined`, 44px) dalam lingkaran `bg-primary/10 text-primary` (80x80px).
- **Copy**:
  - H1: "**Verifikasi Keaslian Dokumen**" (4xl, bold, `text-secondary`/navy)
  - Subtitle: "Unggah dokumen PDF untuk langsung memeriksa apakah dokumen tersebut sudah terdaftar dan belum diubah sejak pertama kali didaftarkan." (lg, `ink-secondary`, max-width terpusat)
  - Micro-copy: "PDF saja • Maksimal 20 MB • Tanpa akun" (sm, `ink-muted`)

### 3.2 Upload Card (`FileUpload` mode="verify", accent="primary")
- `OperationCard`: border `base-300`, `bg-base-100`, **tanpa shadow**, `hover:border-primary/40`, padding `px-6/10 py-6`.
- Title: "Verifikasi Dokumen" | Description: "Unggah dokumen untuk memeriksa keaslian dan integritasnya"
- Dropzone teal (`border-primary`, dashed), teks: "**Seret & Lepas** untuk Unggah File / atau / Klik untuk Pilih File" + "PDF saja • Maksimal 20 MB"
- Setelah file dipilih → `DocumentPreview` menampilkan nama+ukuran+badge "Siap diverifikasi" (hijau).
- Tombol submit: "Verifikasi Dokumen" (`btn-primary`, disabled sampai file dipilih, tooltip "Unggah dokumen terlebih dahulu untuk melanjutkan").
- Saat submit → seluruh card diganti `LoadingCard` ("Memuat..." / "Mohon tunggu, dokumen sedang diproses...").

### 3.3 Tips Card (`TipsCard.tsx`)
- Card border tipis di bawah upload card, grid 2 kolom, 4 item dengan ikon centang teal:
  "Format PDF didukung" / "Ukuran maksimal 20 MB" / "Hasil verifikasi tampil dalam hitungan detik" / "Tidak perlu akun untuk memverifikasi"

### 3.4 How It Works (`HowItWorks.tsx`)
- H2 tengah: "Cara Kerja Verifikasi"
- Grid 2x2, tiap kartu: ikon dalam lingkaran kecil + "Langkah N" + judul + deskripsi:
  1. Unggah dokumen — "Pilih file PDF yang ingin diperiksa."
  2. Hitung sidik jari digital — "Sistem menghitung hash SHA-256 dari isi dokumen."
  3. Cocokkan ke blockchain — "Hash dicocokkan dengan catatan yang tersimpan di blockchain."
  4. Lihat hasil — "Sistem menampilkan status terverifikasi atau tidak ditemukan."

### 3.5 FAQ (`FAQSection.tsx`)
- H2 tengah: "Pertanyaan Umum"
- 4 item `<details>` accordion (native HTML, expand/collapse tanpa JS tambahan):
  1. "Apa yang terjadi setelah dokumen diunggah?" → penjelasan hash dihitung sesaat, tidak disimpan permanen.
  2. "Apakah dokumen saya disimpan di sistem?" → tidak, hanya hash & metadata.
  3. "Bisakah saya memverifikasi dokumen yang sama berkali-kali?" → bisa, tidak terbatas.
  4. "Kenapa verifikasi saya gagal / dokumen tidak ditemukan?" → penjelasan kemungkinan penyebab.

---

## 4. Halaman Register/Upload — `/publisher` (Institutional Workflow, butuh login role publisher)

**Fungsi**: alur kerja formal untuk publisher mendaftarkan dokumen resmi. Sengaja dibuat **navy**, bukan copy dari halaman Verify, untuk memberi kesan "tindakan institusional yang permanen".

### 4.1 Hero (`RegisterHero.tsx`)
- Background: `bg-secondary/5` (tint navy tipis), align kiri (bukan center seperti Verify), padding `py-12`.
- Ikon cloud-upload (`CloudUploadOutlined`, 32px) dalam lingkaran navy (64x64px).
- Badge kecil: "**Khusus Publisher**" (badge-soft, border+bg navy tipis).
- **Copy**:
  - H1: "Daftarkan Dokumen Resmi" (3xl-4xl, bold, navy)
  - Subtitle: "Terbitkan dokumen resmi institusi ke blockchain sebagai bukti keaslian yang permanen dan dapat diverifikasi publik." (`ink-secondary`)

### 4.2 Upload Card (`FileUpload` mode="register", accent="secondary")
- Sama struktur dengan Verify tapi Dropzone bertema **navy** (`border-secondary/60`, drag-active `bg-secondary/10`).
- Title: "Daftarkan Dokumen Baru" | Description: "Unggah dan daftarkan dokumen baru ke sistem"
- Setelah file dipilih, sebelum tombol submit muncul **kotak kuning "Sebelum mengirim"** (`BeforeSubmitChecklist.tsx`, border+bg `warning`):
  - "Dokumen tidak dapat diedit setelah didaftarkan"
  - "Catatan blockchain bersifat permanen dan tidak bisa dihapus"
  - "Pastikan ini adalah versi final/terbaru dari dokumen"
- Tombol submit: "Kirim Dokumen" — **tetap warna teal/primary** (aturan: CTA selalu primary, aksen halaman cuma untuk elemen pasif seperti border/hero).

### 4.3 Metadata Card (`MetadataCard.tsx`) — HANYA muncul setelah render (tidak ada di Verify)
- Card di bawah upload card, judul kecil "RINGKASAN FILE", 4 baris:
  - Nama — nama file atau "—"
  - Ukuran — human-readable (mis. "37.00 Bytes") atau "—"
  - SHA-256 — **dihitung live di browser via Web Crypto API** begitu file dipilih (bukan menunggu submit), format dipotong `xxxxxxxxxxxx…xxxxxxxx`, sempat menampilkan "Menghitung..." sesaat.
  - Status — "Menunggu file" (abu) → "Siap dikirim" (teal) setelah file dipilih.

### 4.4 Requirement Card (`RequirementCard.tsx`)
- Card di bawah Metadata, ikon `Rule` + judul "Persyaratan Dokumen", grid 2 kolom, 4 item bullet navy:
  "Format PDF" / "Ukuran maksimal 20 MB" / "Teks dapat dibaca (bukan hasil scan buram)" / "Tidak diproteksi kata sandi"

---

## 5. Dashboard — `/dashboard` (Workspace, butuh login)

**Fungsi**: daftar SEMUA dokumen terdaftar di sistem (lintas issuer — backend tidak memfilter per-publisher), untuk monitoring/audit oleh staf.

**Catatan render**: Server Component (fetch data di server, bukan client `useEffect`) — ada `loading.tsx` dengan skeleton pulsing selama fetch.

### 5.1 Page Header (`app/dashboard/page.tsx`)
- H1: "Dokumen Terdaftar" (3xl, bold, navy) | Deskripsi: "Daftar dokumen yang terdaftar beserta bukti transaksi blockchain."
- Tombol kanan atas: "Daftarkan Dokumen" (`btn-primary`, link ke `/publisher`).

### 5.2 Stats — Hero Metric + 3 Supporting (`StatsCards.tsx`)
Layout: 1 card besar (flex-1) + 3 card kecil di kanan (di layar besar; stack vertikal penuh di mobile, 3 kolom di tablet).

- **Hero card** (padding `p-6`): label kecil "Total Dokumen Terdaftar" (ikon dokumen dalam lingkaran kecil teal) → angka besar (`text-4xl font-bold text-secondary`/navy) → badge tren "+N bulan ini" (teal, ikon panah naik, HANYA muncul jika >0) → garis pemisah → breakdown jenis file (mis. ".pdf 100%" atau ".pdf 71% .docx 18% Lainnya 11%" — otomatis ambil top-2 ekstensi + gabung sisanya jadi "Lainnya").
- **3 supporting card** (padding `p-5`): "Bulan Ini", "Penerbit" (jumlah issuer unik), "Jenis File" (jumlah ekstensi unik) — masing-masing ikon kecil + angka (`text-xl font-bold text-secondary`).

### 5.3 Toolbar (`DashboardToolbar.tsx`)
```
[🔍 Cari nama file, hash, atau record ID...  (flex-1, dominan)]  [Semua jenis▾] [Terbaru▾] [▤▤ density-toggle] [⟳ refresh]
```
- Search: input dominan lebar, placeholder di atas.
- Filter jenis file: dropdown, opsi otomatis dari ekstensi yang ada di data.
- Sort: Terbaru / Terlama / Nama A-Z.
- **Density toggle** (fitur baru): dua tombol icon (`ViewAgendaOutlined`=Comfortable, `ViewHeadline`=Compact) dalam grup `join`, mengubah tinggi baris tabel & sembunyikan subtitle jenis-file di mode compact.
- Refresh: ikon bulat, memicu `router.refresh()` (re-fetch server component), spinner saat loading.

### 5.4 Tabel Dokumen (`RecordsTable.tsx`)
Desktop (≥768px) — tabel dengan header `bg-base-200` bold uppercase kecil:

| Dokumen | Terdaftar | Penerbit | Status | (chevron) |
|---|---|---|---|---|
| [ikon jenis file] **Nama file** (bold)<br>_jenis MIME_ (kecil, abu, hanya mode Comfortable) | tanggal format "August 1, 2026, 07.38" | [dot warna]+ID terpotong (mis. "e99a…b439") atau "Tidak diketahui" (italic abu, kalau issuer_id kosong) | badge hijau soft "✓ On-chain" | ›

- **Sengaja TIDAK ada kolom hash** di tabel utama — hash cuma di modal detail (klik baris).
- Klik baris (bukan hanya tombol) → buka modal.
- Mobile (<768px): kartu bertumpuk dengan struktur serupa.
- Empty state: ikon dokumen besar abu + "Tidak ada dokumen ditemukan" + deskripsi + tombol "Daftarkan Dokumen".

### 5.5 Pagination (`Pagination.tsx`)
```
Menampilkan 1–10 dari 42 dokumen  [10/halaman▾]        [‹] Halaman 1 / 5 [›]
```
Client-side (backend belum ada pagination server-side — jadi ini beroperasi di atas seluruh data yang sudah di-fetch, bukan query ulang ke server per halaman). Opsi ukuran halaman: 10/25/50/100.

### 5.6 Modal Detail (`RecordDetailModal.tsx`)
Native `<dialog class="modal">` daisyUI, dua section:
- Header: ikon jenis file + nama file + badge "✓ Terverifikasi on-chain"
- Section "DOKUMEN": Jenis file, Terdaftar, Penerbit (Issuer ID) — pakai `SummaryRow` (komponen sama dengan halaman hasil verifikasi).
- Section "BUKTI BLOCKCHAIN": Record ID (teks), Content hash (SHA-256) + tombol copy, Transaction hash + tombol copy — hash full ditampilkan (tidak dipotong) dengan `break-all` + monospace.
- Tombol "Tutup".

---

## 6. Halaman Hasil — `/result/success`, `/result/failure`

**Fungsi**: menampilkan hasil dari 4 kombinasi (register×{sukses,gagal}, verify×{sukses,gagal}) via satu komponen `ResultView.tsx` yang membaca payload dari query string.

Layout dasar semua state: `OperationCard` (border, tanpa shadow, max-width `2xl`, center) → ikon status besar (80px lingkaran) → judul (2xl bold navy) → deskripsi singkat → card detail (border) → tombol kembali di bawah.

### 6.1 Register — Sukses: "Registrasi Berhasil"
- Ikon: centang hijau dalam lingkaran `bg-success/10`.
- Deskripsi: "Dokumen berhasil didaftarkan dan dicatat ke blockchain secara permanen."
- Card detail 2 section: **DOKUMEN** (Nama file, Terdaftar, Record ID+copy) dan **BUKTI BLOCKCHAIN** (Content hash+copy, Transaction hash+copy).
- Tombol: "Kembali ke Registrasi" (teal).

### 6.2 Verify — Sukses: "Dokumen Terverifikasi"
- Ikon: shield-check hijau (`GppGoodOutlined`).
- Deskripsi: "Dokumen ini cocok dengan hash dan bukti blockchain yang terdaftar. Ini memastikan integritas dokumen, bukan kebenaran isinya."
- Card detail: Record ID+copy, Terdaftar, Content hash+copy, Transaction hash+copy.
- Tombol: "Kembali ke Beranda".

### 6.3 Verify — Gagal: "Dokumen Tidak Ditemukan"
- Ikon: kaca pembesar dicoret, merah (`SearchOffOutlined` dalam `bg-error/10`).
- Deskripsi: "Dokumen ini tidak cocok dengan catatan yang terdaftar di sistem."
- Card "Kemungkinan penyebab" (bullet list): "File yang diunggah salah" / "Dokumen sudah diubah sejak didaftarkan (mis. hasil scan ulang, edit, atau kompresi)" / "Dokumen memang belum pernah didaftarkan".
- Tombol: "Kembali ke Beranda".

### 6.4 Register/Verify — Error lain (network/HTTP error dsb): "Registrasi Gagal" / "Terjadi Kesalahan"
- Ikon: silang merah.
- Kotak error (`border-error/20 bg-error/5`) berisi pesan spesifik dari `getUploadFailureMessage()` (mapping kode HTTP → pesan Indonesia, mis. 401→"Hanya publisher terdaftar yang bisa mendaftarkan dokumen...", 413→"Ukuran file yang diunggah terlalu besar...", dst).

**Yang TIDAK ada** (secara sadar tidak dibuat): tombol "Download Certificate" — backend belum punya mekanisme generate file sertifikat, jadi tidak dibuatkan tombol yang tidak fungsional.

---

## 7. Komponen Bersama (dipakai lintas halaman)

| Komponen | Dipakai di | Catatan |
|---|---|---|
| `OperationCard` | Verify, Register, Result | Border-only, `hover:border-primary/40`, padding `py-6` |
| `Dropzone` | Verify, Register | Prop `accent` (`primary`/`secondary`), validasi client-side PDF-only + max 20MB + pesan error inline |
| `DocumentPreview` | Verify, Register | Badge "Siap didaftarkan"/"Siap diverifikasi" |
| `LoadingCard` | Verify, Register (saat submit) | Border-only (bukan shadow lagi), teks "Memuat..." |
| `FilledIcon` | Dashboard stats, modal, `SummaryRow` | Ikon 18px dalam lingkaran `bg-primary/10`, di-clone otomatis untuk ukuran konsisten |
| `SummaryRow` | Modal dashboard, halaman hasil (lewat `DetailRow` custom di ResultView) | Baris ikon+label+value |
| `CopyButton` | Modal dashboard, halaman hasil | Icon copy → checkmark sesaat setelah klik |

---

## 8. Keterbatasan yang Diketahui (jangan dianggap bug tersembunyi — ini sadar belum dikerjakan)

1. **Tidak ada i18n** — semua teks hardcode Bahasa Indonesia langsung di komponen, belum ada sistem locale/language switcher (keputusan sadar, ditunda).
2. **Pagination dashboard murni client-side** — backend `/api/v1/records` selalu kirim semua record sekaligus; untuk skala ribuan dokumen ini titik yang perlu diperbaiki ke depan (server-side pagination).
3. **Issuer ID belum resolve ke nama manusiawi** — hanya UUID Keycloak mentah, ditampilkan dengan avatar-dot warna otomatis + truncated ID.
4. **Tidak ada Download Certificate** di halaman hasil registrasi (backend belum mendukung).
5. **`components/BgHeader.tsx`** (ilustrasi confetti lama) sudah tidak dipakai di `ResultView` lagi, tapi masih ada file & Storybook story-nya (tidak dihapus, cuma tidak direferensikan dari halaman manapun).

---

## 9. Pertanyaan untuk Evaluasi

1. Apakah diferensiasi teal (Verify) vs navy (Register) sudah cukup terasa, atau perlu diperkuat lagi?
2. Apakah urutan section di Verify (Hero → Upload → Tips → How It Works → FAQ) sudah logis, atau ada yang perlu dipindah/dihapus?
3. Apakah Metadata Card di Register (dengan hash SHA-256 live) menambah kepercayaan atau malah bikin halaman terasa terlalu teknis untuk user awam?
4. Untuk skala ribuan dokumen di Dashboard, apakah struktur "1 hero + 3 stat kecil" masih representatif, atau perlu chart/grafik tambahan?
5. Apakah copywriting (semua sudah dicek) terasa natural dalam Bahasa Indonesia, atau ada yang terasa terjemahan kaku?
6. Apakah ada celah aksesibilitas (kontras, ukuran target klik, dsb) yang perlu diperbaiki lebih lanjut dari yang sudah dilakukan (kontras teks sudah dinaikkan dari `#8B8484`→`#3F4854`)?
