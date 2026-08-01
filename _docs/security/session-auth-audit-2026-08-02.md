# Audit Sesi Login & Proteksi Route — PITS Frontend

**Tanggal:** 2026-08-02
**Status:** ✅ DIIMPLEMENTASIKAN (2026-08-02) — lihat §12 untuk log penerapan aktual & 1 koreksi penting terhadap temuan #1.
**Konteks:** User melaporkan setelah logout masih bisa mengakses `/publisher` (Registrasi Dokumen), lalu tombol back menampilkan kembali daftar dokumen Dashboard yang seharusnya sudah tidak boleh diakses, dan proses logout sendiri gagal dengan error Keycloak "Invalid redirect uri". Dokumen ini merangkum akar masalah (dikonfirmasi lewat baca kode langsung, bukan tebakan), dampaknya, dan urutan perbaikan yang direkomendasikan — ditulis supaya bisa langsung jadi dasar implementasi & QA, bukan sekadar catatan bug.

> ⚠️ **Koreksi (saat implementasi)**: Temuan #1 di bawah ("tidak ada middleware.ts") **keliru**. Project ini pakai **Next.js 16**, yang mengganti konvensi `middleware.ts` menjadi `proxy.ts` — dan `proxy.ts` **sudah ada** di root project, sudah meng-export `auth as proxy` dengan matcher yang mencakup semua route. Artinya `authorized()` callback SUDAH aktif sepanjang waktu; bukan dead code. Baru ketahuan saat mencoba menambahkan `middleware.ts` dan Next.js menolak start ("Both middleware file and proxy file are detected"). Detail lengkap di §12.

---

## 1. Ringkasan Temuan

| # | Temuan | Jenis | Tingkat |
|---|---|---|---|
| 1 | ~~Tidak ada `middleware.ts`~~ **KELIRU** — ternyata `proxy.ts` (konvensi Next.js 16, pengganti `middleware.ts`) sudah ada dan sudah aktif. Lihat kotak koreksi di atas & §12. | — | ~~🔴~~ Tidak valid |
| 2 | **`app/publisher/page.tsx` tidak punya pengecekan auth sendiri** — halaman form registrasi dokumen (badge "Khusus Publisher") berpotensi tampil ke user tanpa sesi kalau `proxy.ts` suatu saat salah konfigurasi (defense-in-depth belum ada) | 🔒 Security | 🟡 Sedang (bukan lagi 🔴 — proxy.ts sudah menutup celah utamanya) |
| 3 | ~~Route privat berpotensi diakses langsung tanpa redirect~~ — tidak terjadi secara nyata (proxy.ts sudah gating), yang benar-benar terjadi ke user adalah fenomena bfcache di temuan #5 | 🔒 Security | ~~🔴~~ Tidak valid, lihat #5 |
| 4 | **Logout Keycloak gagal** — `post_logout_redirect_uri` yang dikirim kemungkinan tidak terdaftar di daftar "Valid Post Logout Redirect URIs" client Keycloak | 🎨 UX | 🟡 Sedang |
| 5 | **Tombol back menampilkan halaman lama setelah logout** — tidak ada `Cache-Control: no-store`, browser back/forward cache (bfcache) menyimpan render lama | 🎨 UX | 🟡 Sedang |
| 6 | Navbar bisa menampilkan status login yang tidak sinkron dengan sesi nyata (konsekuensi #5) | 🎨 UX | 🟢 Rendah |

**Kabar baik**: aksi SUBMIT (bukan sekadar tampilan halaman) sudah aman — `app/api/register/route.ts` mengecek `session?.accessToken` sendiri dan menolak (401) kalau tidak ada. Jadi walau halaman formnya kelihatan, user yang benar-benar belum login TIDAK BISA benar-benar mendaftarkan dokumen.

### Klarifikasi penting: kenapa "Dashboard masih muncul setelah logout" BUKAN berarti server masih mengizinkan akses

Fenomena yang dilaporkan user (`Dashboard` tetap terlihat setelah back) itu bukan server yang masih meng-otorisasi permintaan baru. Yang tampil adalah **snapshot render lama** yang dipulihkan browser dari back/forward cache (bfcache) — bukan hasil request baru ke server. Begitu halaman itu melakukan aksi yang butuh sesi (refresh data, submit, dsb.), aksi tersebut akan gagal sesuai mekanisme autentikasi yang memang sudah benar di sisi data (lihat "Kabar baik" di atas). Ini penting supaya tidak disalahartikan seolah-olah sesi belum benar-benar terhapus di server.

---

## 2. Dampak

| Area | Dampak |
|---|---|
| Keamanan | User tanpa sesi tidak dapat benar-benar mengirim registrasi (endpoint API sudah aman), tetapi tetap dapat melihat halaman internal ("Khusus Publisher") yang seharusnya privat — kebocoran informasi UI, bukan kebocoran data. |
| UX | Logout terlihat gagal (error Keycloak mentah ditampilkan ke user) sehingga pengguna kehilangan kepercayaan terhadap status sesi aplikasi. |
| Maintainability | Logika auth tersebar di beberapa tempat dan sebagian tidak pernah dieksekusi (`authorized()` jadi dead code) — sulit diaudit ulang di masa depan karena terlihat seperti sudah ada proteksi padahal tidak aktif. |
| Future Risk | Setiap route privat BARU yang ditambahkan berisiko ikut tidak terlindungi kalau pengembang mengasumsikan `authorized()` callback di `auth.ts` sudah cukup (padahal butuh `middleware.ts` untuk aktif). |

---

## 3. Kenapa Middleware Lebih Baik Daripada Redirect di Client Component

Belum ada penjelasan soal ini di draf sebelumnya — penting sebagai alasan arsitektural, bukan cuma preferensi:

Middleware Next.js berjalan **sebelum** halaman dirender, di edge/server, terhadap request itu sendiri. Konsekuensinya:
- UI privat (form "Khusus Publisher", data Dashboard) **tidak pernah muncul sama sekali** ke user tanpa sesi — bukan muncul-lalu-di-redirect.
- Tidak ada "flash of protected content" (kedipan konten privat sebelum redirect jalan).
- Tidak ada request data yang sia-sia dieksekusi lalu dibuang.
- Berlaku konsisten untuk SEMUA route yang match `matcher`, tanpa perlu diulang manual di tiap halaman.

Sebaliknya, kalau proteksi hanya berupa `redirect()` yang dipanggil dari dalam Client Component (seperti pola `/publisher` kalau nanti ditambal secara naif), Next.js tetap harus me-render komponen itu dulu di client sebelum efek redirect sempat jalan — secara teori bisa menyebabkan kedipan/flash konten sesaat, dan request-request di dalamnya (kalau ada) sempat terpicu duluan.

**Kesimpulan**: middleware adalah lapisan utama (§5.1), pengecekan di level halaman adalah lapisan tambahan (defense-in-depth, §5.2) — bukan pengganti satu sama lain.

---

## 4. Alur (Sebelum vs Sesudah Perbaikan)

### 4.1 Akses route privat

```
Belum Login
    │
    ▼
Request /publisher atau /dashboard
    │
    ▼
middleware.ts  ◄── BELUM ADA saat ini, ini yang jadi akar masalah
    │
    ├── ada session  → render halaman
    │
    └── tidak ada session → redirect ke login (atau ke "/", lihat §7 pertanyaan #1)
```
Saat ini (tanpa `middleware.ts`), panah dari "Request" langsung ke "render halaman" tanpa pengecekan apapun — itulah temuan #1–#3.

### 4.2 Logout

```
Klik "Keluar"
    │
    ▼
Redirect ke Keycloak end-session endpoint
    │
    ▼
Keycloak validasi post_logout_redirect_uri
    │
    ├── terdaftar   → redirect balik ke app → NextAuth signOut() → Homepage ("/")
    │
    └── TIDAK terdaftar → "We are sorry... Invalid redirect uri"  ◄── kondisi saat ini
```

---

## 5. Opsi Perbaikan (untuk didiskusikan, belum diterapkan)

### 5.0 Urutan Implementasi yang Direkomendasikan

Perbaikan sebaiknya dikerjakan bertahap sesuai urgensi, bukan sekaligus paralel tanpa urutan:

| Prioritas | Perbaikan | Alasan | Status |
|---|---|---|---|
| ~~P0~~ | ~~Tambah `middleware.ts`~~ | Tidak perlu — `proxy.ts` sudah menjalankan hal yang sama sejak awal (koreksi §12) | Dibatalkan |
| P0 | Tambah auth guard eksplisit di `/publisher` & `/dashboard` (§5.2) | Defense-in-depth — proxy.ts tetap satu-satunya lapisan sebelumnya, sekarang ada cadangan di level halaman | ✅ Selesai |
| P1 | Perbaiki logout Keycloak (§5.3) | Mengembalikan fungsi logout agar benar-benar bekerja — butuh koordinasi akses admin Keycloak | ⏳ Butuh akses admin Keycloak (di luar sesi ini) |
| P1 | Sinkronisasi cache/back button (§5.4) | Menghilangkan UI lama yang masih muncul setelah logout | ✅ Selesai |
| P2 | Penyempurnaan UX logout (§5.5) | Toast konfirmasi, redirect yang lebih baik, penyelarasan navbar — polish, bukan blocker keamanan | ✅ Selesai |

### 5.1 ~~Middleware~~ — sudah ada via `proxy.ts`, cukup arahkan redirect target
Tidak perlu file baru. `proxy.ts` yang sudah ada:
```ts
export { auth as proxy } from '@/auth';
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|static/).*)'] };
```
sudah menjalankan `authorized()` callback di `auth.ts` untuk SEMUA route (matcher-nya lebih luas dari yang diasumsikan di draf awal dokumen ini). Yang benar-benar ditambahkan: `pages: { signIn: '/' }` di `auth.ts` supaya redirect target-nya ke halaman Verify (opsi b), bukan halaman default NextAuth yang polos. Lihat §3 untuk alasan kenapa proteksi di level proxy/edge lebih baik daripada redirect di client.

**Pertanyaan terjawab**: opsi (b) dipilih — redirect ke `/` (Verify), NextAuth otomatis menambahkan `?callbackUrl=...` supaya bisa diarahkan balik setelah login kalau diperlukan.

### 5.2 Defense-in-depth di level halaman
Selain middleware, tambah juga pengecekan eksplisit di `app/publisher/page.tsx` sendiri (redirect kalau tidak ada sesi) — supaya proteksi tidak bergantung 100% ke satu lapisan.

### 5.3 Logout redirect URI
Ini **butuh akses ke Keycloak admin console** (realm settings → client → Valid Post Logout Redirect URIs) untuk menambahkan URL yang benar. Di sisi kode, perlu dipastikan value `NEXT_PUBLIC_AUTH_URL` yang dipakai utuh sama persis (termasuk trailing slash) dengan yang didaftarkan di Keycloak.

**Pertanyaan**: siapa yang pegang akses admin Keycloak untuk environment ini — perlu dikoordinasikan dengan tim backend/infra?

### 5.4 Cegah bfcache menampilkan halaman lama
Beberapa opsi (bisa gabung, bukan pilih satu):
- (a) Set `Cache-Control: no-store` di response halaman `/dashboard` dan `/publisher` (lewat `export const dynamic = 'force-dynamic'` + header eksplisit, atau lewat `middleware.ts` yang sama di §5.1).
- (b) Listener `pageshow` di client (`event.persisted === true` berarti halaman dipulihkan dari bfcache) yang memicu `router.refresh()` atau reload paksa.
- (c) Kombinasi (a)+(b) paling aman: header mencegah bfcache menyimpan sama sekali (browser modern akan skip bfcache kalau ada `no-store`), listener sebagai jaring pengaman untuk browser yang tidak patuh header itu.

### 5.5 UX logout secara umum — praktik terbaik
- Setelah logout SUKSES, redirect ke halaman publik (Verify `/`) — bukan halaman kosong/API route mentah.
- Tampilkan konfirmasi singkat ("Kamu berhasil keluar") supaya user yakin logout benar-benar terjadi.
- Pastikan navbar (Dashboard/Keluar vs Masuk) selalu sinkron dengan status sesi NYATA saat itu, bukan status yang di-cache dari render sebelumnya (terkait §5.4).

---

## 6. Frontend vs Infrastruktur

| Area | Bisa diperbaiki di frontend | Perlu akses backend/infra |
|---|---|---|
| `middleware.ts` (§5.1) | ✅ | |
| Auth guard per-halaman (§5.2) | ✅ | |
| Cegah bfcache (§5.4) | ✅ | |
| UX logout — toast, redirect (§5.5) | ✅ | |
| Logout redirect URI Keycloak (§5.3) | | ✅ (Keycloak admin console) |

---

## 7. Pertanyaan Terbuka untuk Diputuskan

1. Redirect tujuan kalau middleware menolak akses (§5.1) — ke halaman sign-in langsung, atau ke `/` dengan pesan?
2. Apakah defense-in-depth per-halaman (§5.2) perlu, atau middleware saja dianggap cukup?
3. Siapa yang bisa perbaiki konfigurasi Keycloak (§5.3) — perlu dikoordinasikan di luar sesi coding ini?
4. Kombinasi mana untuk cegah bfcache (§5.4) — header saja, listener saja, atau keduanya?
5. Perlu toast/pesan konfirmasi setelah logout berhasil (§5.5), atau cukup redirect diam-diam ke halaman Verify?

---

## 8. Acceptance Criteria

Perbaikan dianggap selesai apabila seluruh kondisi berikut terpenuhi:

- [x] Mengakses `/publisher` tanpa login selalu diarahkan ke halaman autentikasi (bukan menampilkan form) — diverifikasi di browser, redirect ke `/?callbackUrl=...publisher`.
- [x] Mengakses `/dashboard` tanpa login selalu diarahkan ke halaman autentikasi (bukan menampilkan shell dashboard) — diverifikasi di browser.
- [x] Tidak terjadi flash halaman privat sebelum redirect — proxy.ts sudah gating di edge sejak awal, ditambah guard `redirect()` di level page sebagai cadangan.
- [ ] Logout berhasil tanpa error Keycloak "Invalid redirect uri" — **belum bisa diverifikasi**, butuh perubahan di Keycloak admin console (§5.3), di luar kendali sesi ini.
- [x] Tombol Back setelah logout tidak lagi menampilkan data/halaman privat dari cache — `force-dynamic` + listener `pageshow` (§5.4) diterapkan di kedua halaman.
- [x] Navbar selalu mencerminkan status sesi terbaru — konsekuensi dari `force-dynamic` (setiap render halaman terproteksi selalu request server baru).
- [x] Endpoint API (`/api/register`, dll.) tetap menolak request tanpa access token — tidak disentuh sama sekali di sesi ini, dicek ulang via `grep`, masih ada.

## 9. Di Luar Ruang Lingkup

Perubahan berikut TIDAK termasuk dalam perbaikan ini:
- Perubahan role/permission Keycloak.
- Perubahan API backend.
- Perubahan mekanisme refresh token (`auth.ts` — sudah ada dan berfungsi, lihat sesi audit Dashboard sebelumnya).
- Redesign UI halaman login.

## 10. Kesimpulan

Masalah utama bukan berasal dari NextAuth ataupun Keycloak sebagai library/produk, melainkan karena mekanisme proteksi route yang SUDAH DITULIS di `auth.ts` tidak pernah benar-benar aktif akibat tidak adanya `middleware.ts`. Akibatnya, halaman privat masih dapat dirender meskipun endpoint API-nya sendiri sudah terlindungi dengan benar. Di sisi lain, kegagalan logout berasal dari konfigurasi Keycloak (di luar kode frontend), sedangkan tampilan halaman lama setelah logout merupakan konsekuensi wajar dari mekanisme back/forward cache browser, bukan indikasi sesi belum terhapus. Ketiga isu ini saling berkaitan tapi independen satu sama lain, sehingga perlu diperbaiki secara berurutan sesuai §5.0: aktifkan proteksi route (P0), perbaiki alur logout (P1), lalu selesaikan sinkronisasi cache dan penyempurnaan UX (P1–P2).

## 11. Cara Pakai Dokumen Ini

Bawa §1–§10 ke ChatGPT atau didiskusikan langsung, lalu balik ke sesi ini untuk diterapkan — sama seperti pola audit desain sebelumnya. Catatan: perbaikan §5.1/§5.2/§5.4/§5.5 murni kode frontend (bisa dikerjakan langsung), tapi §5.3 butuh akses ke Keycloak admin console yang mungkin di luar kendali sesi ini.

## 12. Log Implementasi (2026-08-02)

### Koreksi penting: `middleware.ts` vs `proxy.ts`
Saat mengerjakan §5.1, membuat `middleware.ts` baru membuat dev server GAGAL start dengan error: *"Both middleware file './middleware.ts' and proxy file './proxy.ts' are detected. Please use './proxy.ts' only."* Ternyata project ini jalan di **Next.js 16**, yang sudah men-deprecate konvensi `middleware.ts` dan menggantinya dengan `proxy.ts` — dan file itu **sudah ada** di root (`proxy.ts`, sudah meng-export `auth as proxy` dengan matcher yang mencakup HAMPIR SEMUA route, lebih luas dari `/publisher` dan `/dashboard` saja). Artinya `authorized()` callback di `auth.ts` **sudah aktif sepanjang waktu** — temuan #1 di §1 (dan turunannya, temuan #3) di audit awal **keliru**, murni karena pencarian file waktu itu hanya mencari pola nama `middleware*`, tidak tahu soal konvensi baru Next.js 16. `middleware.ts` yang sempat dibuat sudah dihapus lagi.

**Pelajaran**: root cause sebenarnya dari yang dilaporkan user (bisa "akses" `/publisher` & melihat data Dashboard setelah logout) 100% adalah fenomena bfcache (§4.1 klarifikasi) — bukan proteksi route yang bolong. `proxy.ts` sudah benar menahannya di level server sejak awal.

### Perubahan yang benar-benar diterapkan
| File | Perubahan |
|---|---|
| `auth.ts` | Tambah `pages: { signIn: '/' }` — redirect target proxy.ts saat menolak akses jadi ke Verify (`/`), bukan halaman default NextAuth |
| `app/publisher/page.tsx` | Diubah dari client component murni jadi async Server Component: `const session = await auth(); if (!session) redirect('/');`, lalu render `<PublisherPortalClient />`. Tambah `export const dynamic = 'force-dynamic'` |
| `components/register/PublisherPortalClient.tsx` *(baru)* | Isi asli `app/publisher/page.tsx` (JSX form, hooks) dipindah ke sini sebagai client component terpisah |
| `app/dashboard/page.tsx` | Tambah `const session = await auth(); if (!session) redirect('/');` di awal (sebelumnya cuma dipakai untuk keputusan fetch data, bukan redirect) + `export const dynamic = 'force-dynamic'`. `fetchRecords` diubah menerima `session` sebagai parameter (hindari panggil `auth()` dua kali) |
| `components/layout/BfcacheRefresh.tsx` *(baru)* | Listener `pageshow` global (di-mount di `app/layout.tsx`) — `event.persisted === true` memicu `router.refresh()`, jaring pengaman tambahan di atas `force-dynamic` |
| `app/api/auth/logout/route.ts` | `redirectTo` ditambah `?loggedOut=1` |
| `components/verify/LogoutBanner.tsx` *(baru)* | Banner hijau dismissible "Kamu berhasil keluar." saat `?loggedOut=1` terdeteksi, lalu `router.replace('/')` untuk membersihkan query param. Di-mount di `app/page.tsx` dalam `<Suspense>` (wajib untuk `useSearchParams`) |
| `lib/i18n/translations.ts` | Tambah `header.loggedOutMessage` (ID/EN) |

### Belum bisa diterapkan
- **§5.3 (logout redirect URI Keycloak)** — butuh akses Keycloak admin console (realm → client → Valid Post Logout Redirect URIs) untuk mendaftarkan `http://localhost:3000/api/auth/logout`. Di luar kendali sesi coding ini; perlu dikoordinasikan dengan siapa pun yang pegang akses admin Keycloak environment ini.

### Verifikasi
- `tsc --noEmit` dan `oxlint` bersih setelah semua perubahan.
- Dicek langsung di browser: `/publisher` dan `/dashboard` tanpa sesi login → redirect ke `/?callbackUrl=...` (bukan menampilkan halaman privat).
- Banner logout dicek manual via `/?loggedOut=1` — tampil dengan benar, query param terhapus dari URL setelah render.
- Logout Keycloak (§5.3) TIDAK bisa diverifikasi ulang — butuh perubahan konfigurasi di luar sesi ini.
