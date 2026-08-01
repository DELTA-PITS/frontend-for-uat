# Brief Redesain — Dashboard Dokumen Terdaftar (PITS)

Dokumen ini disiapkan untuk didiskusikan dengan AI lain (misalnya ChatGPT) sebagai bahan pertimbangan desain ulang tampilan dashboard. Berisi konteks produk, struktur halaman saat ini, data yang tersedia, fungsi yang sudah ada, dan batasan teknis — supaya rekomendasi desain yang dihasilkan realistis dan bisa langsung diterapkan ke kode yang ada.

**Tanggal:** 2026-08-01

---

## 1. Konteks Produk

**PITS (Public Information Trust System)** adalah sistem untuk membuktikan keaslian dokumen digital milik institusi (rencana penggunaan nyata: instansi riset pemerintah semacam BRIN). Cara kerja: dokumen di-hash (SHA-256), hash tersebut dicatat ke blockchain sebagai bukti tidak bisa diubah, dan siapa pun bisa memverifikasi ulang keaslian dokumen dengan mencocokkan hash-nya.

Ada dua jenis pengguna:
- **Publisher** — pegawai/unit di instansi yang mendaftarkan dokumen resmi (login via Keycloak/SSO).
- **Verifier (publik)** — siapa saja yang ingin mengecek keaslian dokumen, tanpa login.

**Halaman yang sedang direstain: `/dashboard`** — halaman internal (butuh login) yang menampilkan daftar seluruh dokumen yang sudah terdaftar di sistem, dengan bukti transaksi blockchain-nya. Ini adalah halaman kerja harian bagi staf instansi untuk memantau/mengaudit dokumen yang sudah didaftarkan — BUKAN halaman publik untuk verifikasi (itu ada di halaman terpisah, `/`).

**Skala nyata yang perlu diantisipasi**: kalau dipakai instansi riil seperti BRIN, jumlah dokumen bisa mencapai ratusan–ribuan record (laporan penelitian, surat resmi, publikasi, dsb dari banyak unit/pusat riset). Dashboard yang sekarang didesain untuk skala kecil (uji coba/demo) dan belum benar-benar diuji dengan volume data besar dari sisi *visual* (walau secara fungsi sudah ada pagination).

**Temuan penting soal data**: endpoint backend yang memasok data dashboard ini (`GET /api/v1/records`) mengembalikan **SEMUA dokumen dari SEMUA issuer/penerbit**, bukan cuma milik user yang login. Jadi dashboard ini secara data memang cocok jadi "dashboard semua dokumen instansi", bukan "dashboard dokumen saya sendiri" — kolom/identitas penerbit jadi relevan untuk ditampilkan.

---

## 2. Masalah dengan Tampilan Saat Ini

Sebelum saya redesain kodenya (baru saja), versi lama dashboard cuma: judul halaman + satu tabel HTML polos berisi 4 kolom (nama file, tanggal, content hash, transaction hash) di mana **hash ditampilkan mentah, penuh, tanpa dipotong** — bikin tabel jadi lebar, berantakan, dan susah dipindai mata. Tidak ada pencarian, filter, sort, pagination, ringkasan jumlah dokumen, atau detail view. Untuk institusi dengan banyak dokumen, versi ini sama sekali tidak akan scalable secara visual.

Saya sudah memperbaiki secara **fungsional** (search, filter, sort, pagination, stats cards, modal detail, hash dipotong + copy button, responsive card di mobile) — tapi secara **visual/estetika**, saya (Claude) menilai hasilnya masih generik/"kaku ala admin panel template" dan belum benar-benar dirancang matang. Ini bagian yang saya minta bantuan desain lebih lanjut.

---

## 3. Struktur Halaman Saat Ini (Setelah Perbaikan Fungsional)

```
┌─────────────────────────────────────────────────────────────┐
│ Header halaman: "Registered Documents" + tombol "Register"  │
├─────────────────────────────────────────────────────────────┤
│ [Stat Card] [Stat Card] [Stat Card] [Stat Card]              │
│  Total Dok   Bulan Ini   Jenis File  Jml Penerbit             │
├─────────────────────────────────────────────────────────────┤
│ [Search box.....................] [Filter jenis▾][Sort▾][⟳] │
├─────────────────────────────────────────────────────────────┤
│  Tabel (desktop) / Card list (mobile):                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Icon  Nama File   Tanggal   Penerbit  Hash    Hash  ✓  │  │
│  │ Icon  Nama File   Tanggal   Penerbit  Hash    Hash  ✓  │  │
│  │ ... (klik baris → buka modal detail lengkap)            │  │
│  └───────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Pagination: "Menampilkan 1-10 dari 42" + [◀ Hal 1/5 ▶]      │
└─────────────────────────────────────────────────────────────┘
```

Detail per dokumen dibuka lewat **modal** (klik baris) yang menampilkan: Record ID, jenis file, tanggal registrasi, Issuer ID, content hash lengkap, transaction hash lengkap.

### File kode yang relevan (Next.js App Router + TypeScript)
```
app/dashboard/page.tsx                       ← Server Component, fetch data dari backend
components/dashboard/DashboardView.tsx       ← Client Component, state search/filter/sort/paginasi
components/dashboard/StatsCards.tsx          ← 4 kartu ringkasan
components/dashboard/DashboardToolbar.tsx    ← search box + filter + sort + tombol refresh
components/dashboard/RecordsTable.tsx        ← tabel desktop + card mobile
components/dashboard/Pagination.tsx          ← kontrol halaman
components/dashboard/RecordDetailModal.tsx   ← modal detail per dokumen
components/dashboard/CopyButton.tsx          ← tombol copy-to-clipboard kecil
```

---

## 4. Data yang Tersedia (Bentuk Nyata dari Backend)

Setiap dokumen terdaftar punya field berikut (tidak lebih dari ini — backend belum menyimpan ukuran file, kategori/tag dokumen, atau deskripsi):

```ts
type RecordItem = {
  record_id: string;        // UUID unik record
  filename: string | null;  // nama file asli saat upload, bisa null
  content_hash: string;     // SHA-256, 64 karakter hex
  transaction_hash: string; // hash transaksi blockchain, 66 karakter hex (0x + 64 hex)
  issuer_id: string;        // ID Keycloak (UUID) dari publisher yang mendaftarkan — BUKAN nama manusia
  content_type: string | null; // MIME type, misal "application/pdf"
  created_at: string;       // ISO 8601 timestamp saat didaftarkan
};
```

### Contoh data (sample, mendekati kondisi nyata di instansi riset)

```json
[
  {
    "record_id": "a1b2c3d4-1111-4a2b-9c3d-000000000001",
    "filename": "Laporan-Akhir-Riset-Genomik-Padi-2026.pdf",
    "content_hash": "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a1",
    "transaction_hash": "0x7a3e1c2f9b4d8e6a1c0f3b7d9e2a4c6f8b1d3e5a7c9f2b4d6e8a0c1f3b5d7e90",
    "issuer_id": "e99aef26-88f2-4e24-8934-3cd3ac27b439",
    "content_type": "application/pdf",
    "created_at": "2026-07-28T09:15:00Z"
  },
  {
    "record_id": "a1b2c3d4-1111-4a2b-9c3d-000000000002",
    "filename": "SK-Penetapan-Peneliti-Utama-2026.pdf",
    "content_hash": "3b5d7e908f1a2c4e6b0d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e",
    "transaction_hash": "0x1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3",
    "issuer_id": "e99aef26-88f2-4e24-8934-3cd3ac27b439",
    "content_type": "application/pdf",
    "created_at": "2026-07-25T14:02:30Z"
  },
  {
    "record_id": "a1b2c3d4-1111-4a2b-9c3d-000000000003",
    "filename": "Dokumentasi-Foto-Ekspedisi-Laut-Dalam.jpg",
    "content_hash": "5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f79",
    "transaction_hash": "0x9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1",
    "issuer_id": "7c4a8d09-ca37-4067-b76a-88f22f16456e",
    "content_type": "image/jpeg",
    "created_at": "2026-07-20T08:40:11Z"
  },
  {
    "record_id": "a1b2c3d4-1111-4a2b-9c3d-000000000004",
    "filename": "Data-Mentah-Sensor-Cuaca-Q2-2026.xlsx",
    "content_hash": "1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c",
    "transaction_hash": "0x3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5",
    "issuer_id": "7c4a8d09-ca37-4067-b76a-88f22f16456e",
    "content_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "created_at": "2026-06-30T11:22:45Z"
  },
  {
    "record_id": "a1b2c3d4-1111-4a2b-9c3d-000000000005",
    "filename": null,
    "content_hash": "7e9b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b",
    "transaction_hash": "0x5a7c9e1b3d5f7a9c1e3b5d7f9a1c3e5b7d9f1a3c5e7b9d1f3a5c7e9b1d3f5a7",
    "issuer_id": "e99aef26-88f2-4e24-8934-3cd3ac27b439",
    "content_type": null,
    "created_at": "2026-06-15T16:05:00Z"
  }
]
```

Catatan: `filename` dan `content_type` bisa `null` (edge case yang harus tetap enak dilihat di desain, bukan cuma diasumsikan selalu ada). `issuer_id` adalah UUID Keycloak mentah — sistem **belum punya** mekanisme resolve UUID ini ke nama instansi/unit/orang yang manusiawi. Ini keterbatasan data yang perlu diketahui AI yang membantu desain (jangan desain yang mengasumsikan ada "nama penerbit" yang cantik, kecuali disarankan sebagai peningkatan data yang perlu ditambahkan backend juga).

---

## 5. Fungsi/Kapabilitas yang Sudah Tersedia di Kode (Bisa Dipakai/Diatur Ulang)

- **Pencarian** teks bebas — cocok ke nama file, content hash, atau record ID.
- **Filter** berdasarkan ekstensi file (dropdown, otomatis terisi dari ekstensi yang ada di data).
- **Sort**: terbaru, terlama, nama A-Z.
- **Pagination** client-side dengan pilihan jumlah baris per halaman (10/25/50/100).
- **Refresh manual** (re-fetch data dari server tanpa reload penuh).
- **Copy-to-clipboard** untuk hash (content hash & transaction hash), dengan feedback ikon centang sesaat.
- **Modal detail** per dokumen (klik baris/kartu) — cocok untuk menampung info yang tidak muat di baris tabel.
- **Icon jenis file otomatis** berdasarkan ekstensi (`lib/fileIcon.tsx` — sudah ada mapping utk PDF, Word, Excel, gambar, dsb, pakai ikon dari `@mui/icons-material` dengan warna berbeda per kategori).
- **Format tanggal** manusiawi (`lib/dateFormat.ts` — contoh output: "April 16, 2024, 11.30").
- **Responsive**: tabel di layar lebar, kartu bertumpuk di mobile (breakpoint `md`).

**Yang BELUM ada di backend (jangan didesain seolah-olah ada, kecuali disarankan sebagai fitur baru yang butuh perubahan backend juga)**:
- Ukuran file.
- Nama/label instansi-penerbit yang human-readable (hanya UUID).
- Kategori/tag dokumen (misal "Laporan", "SK", "Publikasi").
- Status/lifecycle dokumen selain "terdaftar" (semua record yang muncul di sini sudah pasti berhasil terdaftar — tidak ada draft/pending/revoked).
- Riwayat perubahan/versi dokumen (tiap upload = record baru terpisah, tidak ada relasi "versi dari").
- Pagination sungguhan di sisi server (saat ini backend mengembalikan SEMUA record sekaligus; pagination yang ada murni di sisi browser/client — jadi untuk jumlah dokumen sangat besar/ribuan, ini titik yang mungkin juga perlu disarankan perbaikannya).

---

## 6. Batasan & Fondasi Teknis (Supaya Saran Desain Bisa Langsung Diimplementasikan)

- **Stack**: Next.js (App Router) + TypeScript + TailwindCSS + **daisyUI** (komponen berbasis class Tailwind seperti `btn`, `card`, `table`, `badge`, `modal`, `input`, `select`, `alert`, `join` untuk grup tombol).
- **Ikon**: `@mui/icons-material` (Material Symbols/Icons) dan `@mdi/react` + `@mdi/js` (Material Design Icons) — dua sumber ikon berbeda dipakai di tempat berbeda dalam app ini.
- **Font**: Plus Jakarta Sans (variable `--font-jakarta`) dan Inter (variable `--font-inter`), di-load via `next/font/google`.
- **Tema warna** (light & dark, lewat CSS variable daisyUI, otomatis switch berdasar preferensi sistem):

  | Token | Light | Dark |
  |---|---|---|
  | `--color-primary` (teal) | `#00B5AA` | `#00B5AA` |
  | `--color-secondary` | `#00336C` (biru navy) | `#f8fafc` (nyaris putih) |
  | `--color-accent` | `#0093DD` (biru cerah) | `#0093DD` |
  | `--color-base-100` (background utama) | `#F9F9F9` | `#0a0f1d` |
  | `--color-base-300` (border/divider) | `#C3BEBE` | `#1e2942` |
  | `radius` (field/box/selector) | `0.5rem` di semua elemen | sama |

  Jadi desain harus tetap enak dilihat di kedua mode (terang & gelap), bukan cuma salah satu.
- **Komponen reusable yang sudah ada dan idealnya dipertahankan konsisten** (dipakai di halaman lain seperti hasil verifikasi):
  - `SummaryRow` — baris ikon + label + value, dipakai di modal detail.
  - `FilledIcon` — ikon dengan background lingkaran berwarna lembut (dipakai di stat card).
  - `OperationCard` — card dengan title + description + body, pola umum di halaman lain (upload, hasil verifikasi).
- Target pengguna: staf institusi (**bukan** developer) — desain harus terasa "profesional/instansi pemerintah/riset", tepercaya, rapi — bukan playful/startup-y.

---

## 7. Yang Ingin Dicari Lewat Diskusi Desain

Tolong bantu berikan rekomendasi/redesain untuk hal-hal berikut (boleh dalam bentuk deskripsi tata letak, saran layout, hierarki visual, atau kombinasi warna/tipografi — tidak harus kode):

1. **Layout keseluruhan** — apakah struktur "stats cards di atas + toolbar + tabel + pagination" ini sudah tepat untuk kebutuhan institusi dengan ratusan/ribuan dokumen, atau ada pola lain yang lebih baik (misal grouping per bulan/instansi, tab, sidebar filter, dsb)?
2. **Visual hierarchy** — dari sekian banyak kolom (nama file, tanggal, penerbit, dua jenis hash, status), mana yang perlu ditonjolkan vs disembunyikan default (misal hash hanya muncul saat diklik/hover, bukan selalu terlihat)?
3. **Cara menampilkan hash** yang lebih baik daripada teks monospace dipotong — apakah ada pola visual lain yang lebih ramah non-teknisi tapi tetap bisa diverifikasi power-user?
4. **Identitas penerbit yang cuma UUID** — bagaimana menampilkannya secara visual supaya tidak terasa "kosong"/teknis, mengingat belum ada nama manusiawi di data?
5. **Empty state, loading state, error state** — rekomendasi visual yang lebih baik dari sekadar alert box polos.
6. **Warna & tipografi** — dengan palet di atas (teal/navy/biru), saran kombinasi yang terasa "trustworthy institution" bukan generic admin dashboard.
7. **Kepadatan informasi (density)** untuk kasus ratusan dokumen — apakah butuh mode "compact/comfortable" seperti aplikasi data-heavy (Notion, Linear, Airtable)?

Tolong jawab dengan asumsi implementasi akhirnya tetap harus realistis dikerjakan dengan TailwindCSS + daisyUI + MUI icons di atas struktur komponen yang sudah disebutkan di Bagian 3 — bukan meminta ganti seluruh stack.
