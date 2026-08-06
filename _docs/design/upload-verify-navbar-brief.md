# Brief Konsultasi — Halaman Upload, Verify, Navbar (PITS)

Untuk didiskusikan dengan AI lain (ChatGPT) soal perbaikan visual. Fokus utama: **halaman Upload dan Verify saat ini benar-benar identik secara visual** — ini bukan salah lihat, memang seperti itu by design di kode. Perlu masukan bagaimana membedakannya secara bermakna.

Untuk konteks dashboard (yang sudah lebih dulu direstain), lihat dokumen terpisah: `dashboard-redesign-brief.md`. Untuk referensi warna/tipografi/komponen yang tersedia, lihat `design-system.md` (satu folder yang sama). Dokumen ini fokus ke 3 halaman/komponen yang belum disentuh: Upload, Verify, dan Navbar.

**Tanggal:** 2026-08-01

---

## 1. Konteks Produk (ringkas)

PITS punya dua alur inti:
- **Upload/Register** (`/publisher`, butuh login role publisher) — penerbit mendaftarkan dokumen baru ke sistem.
- **Verify** (`/`, halaman utama, publik tanpa login) — siapa saja mengecek keaslian dokumen yang sudah terdaftar.

Dua alur ini punya **tujuan dan audiens yang sangat berbeda** (staf institusi yang login vs masyarakat umum yang tidak login), tapi secara visual saat ini **sama persis**.

---

## 2. Bukti: Upload dan Verify Memang Pakai Komponen yang Sama

```tsx
// app/publisher/page.tsx (Upload)
export default function PublisherPortal() {
  return (
    <FileUpload
      mode="register"
      title="Register New Document"
      description="Upload and register a new document to the system"
      buttonLabel="Submit Document"
    />
  );
}

// app/page.tsx (Verify — halaman utama)
export default function Home() {
  return (
    <FileUpload
      mode="verify"
      title="Verify a Document"
      description="Upload a document to validate authenticity and integrity"
      buttonLabel="Verify Document"
    />
  );
}
```

Keduanya render komponen `FileUpload` yang SAMA PERSIS — satu-satunya perbedaan adalah string title/description/buttonLabel dan satu ikon tombol (`SendIcon` untuk register vs `CheckIcon` untuk verify). Struktur, warna, layout, dropzone, semuanya identik 1:1.

Isi `FileUpload` (dipakai oleh keduanya):
```
OperationCard (title + description)
  └─ Dropzone (drag & drop area — sama persis, warna teal border-dashed)
  └─ DocumentPreview (muncul setelah file dipilih)
  └─ OperationButton (tombol submit full-width, warna & bentuk sama)
```

Tidak ada perbedaan warna aksen, ikon besar, ilustrasi, atau elemen visual lain yang menandakan "ini mode registrasi (perlu login, hasil = bukti kepemilikan)" vs "ini mode verifikasi (publik, hasil = ya/tidak cocok)".

---

## 3. Kenapa Ini Masalah

- User yang habis login sebagai publisher dan pindah ke halaman verify (untuk cek dokumen orang lain, atau tidak sengaja klik link "Verify Document" di navbar) **tidak dapat sinyal visual** bahwa mereka pindah dari mode "menerbitkan/otoritatif" ke mode "mengecek/publik".
- Dari sisi kepercayaan (trust) — ini produk yang temanya "trust system", tapi tidak ada visual differentiation antara "aksi yang mengikat institusi" (register) vs "aksi lookup publik" (verify). Idealnya register terasa lebih "berat/formal" (karena hasilnya permanen, tercatat ke blockchain atas nama institusi), sedangkan verify terasa lebih "ringan/cepat" (karena cuma pengecekan, bisa diulang kapan saja tanpa konsekuensi).
- Secara navigasi: `Header.tsx` menampilkan link "Verify Document" untuk publik (mengarah ke `/`) DAN untuk yang sudah login ada tambahan "Upload Document" (mengarah ke `/publisher`) — di navbar pun labelnya mirip ("Upload Document" vs "Verify Document"), ditambah dua halaman yang identik secara visual, total pengalaman jadi membingungkan yang mana yang sedang dilakukan user.

---

## 4. Struktur Navbar Saat Ini

```tsx
// Untuk publik (belum login):
[Logo + "Badan Research Dan Inovasi Nasional"]  [Verify Document] [Dashboard*] [Sign in]

// Untuk yang sudah login (publisher):
[Logo + "Badan Research Dan Inovasi Nasional"]  [Upload Document] [Verify Document] [Dashboard] [Sign out]
```
*catatan: link "Dashboard" tetap muncul untuk publik padahal halaman itu route-protected (redirect ke login kalau diklik) — ini juga worth didiskusikan, apakah link ke halaman yang pasti reject akses sebaiknya disembunyikan dari user yang belum login.

- Style: `sticky top-0`, tinggi `56px` (`h-14`), border bawah tipis, tanpa shadow, background solid (bukan blur/transparan).
- Item aktif ditandai `bg-primary/10 text-primary font-medium` (background teal transparan tipis + teks teal).
- Ikon dari `@mdi/react` (Material Design Icons), ukuran kecil (`size={0.7}`).

---

## 5. Yang Ingin Dikonsultasikan

1. **Bagaimana membedakan Upload vs Verify secara visual** tanpa mengubah fakta bahwa keduanya berbagi mekanisme upload file yang sama? Opsi yang mungkin: warna aksen berbeda (misal Upload = navy/secondary, Verify = teal/primary, atau sebaliknya), ikon/ilustrasi header berbeda, badge/label mode yang jelas ("Mode Registrasi" vs "Mode Verifikasi"), copy/tone berbeda?
2. **Apakah dua halaman ini sebaiknya tetap berbagi satu komponen `FileUpload`**, atau lebih baik dipisah jadi dua komponen dengan struktur mirip tapi visual distinct (supaya lebih leluasa beda treatment)? Trade-off: shared component = konsisten & mudah maintain, tapi cenderung menghasilkan tampilan kembar seperti sekarang.
3. **Navbar**: dengan dua label yang mirip ("Upload Document" / "Verify Document") berdampingan, apakah perlu diferensiasi visual (warna beda per menu, icon yang lebih kontras, grouping/separator), atau cukup diperjelas dari sisi label/copy saja?
4. **Link "Dashboard" untuk user yang belum login** — sembunyikan saja, atau tetap tampilkan tapi dengan indikator "perlu login" (ikon gembok, dsb)?
5. Halaman Upload/Verify saat ini pakai `OperationCard` dengan `shadow-md`, sementara dashboard yang baru direstain pakai pola border-based tanpa shadow (lihat `design-system.md` §5) — apakah sebaiknya Upload/Verify ikut diselaraskan ke pola border-based supaya seluruh app konsisten satu bahasa visual?

Jawaban boleh berupa deskripsi layout/warna, tidak harus kode — nanti saya yang implementasikan ke komponen `FileUpload.tsx`, `Dropzone.tsx`, `OperationCard.tsx`, dan `Header.tsx` yang sudah disebutkan di atas.
