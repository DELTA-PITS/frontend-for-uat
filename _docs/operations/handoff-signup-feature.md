# Handoff: Fitur Sign Up (Self-Registration)

**Status:** Belum dikerjakan — didokumentasikan untuk sesi berikutnya.
**Konteks:** User bertanya kenapa tidak ada tombol "Sign up" di halaman login, dan minta dibuatkan sistemnya.

## Kondisi saat ini

Realm Keycloak `nextjs-kc` sengaja dikonfigurasi:
```
registrationAllowed: false
resetPasswordAllowed: false
```
Ini keputusan sesi sebelumnya (2026-09-07), bukan bug — satu-satunya jalan user baru masuk sistem adalah lewat Google login (auto-provision) atau dibuat manual oleh admin lewat Keycloak console.

**Keputusan terkait yang harus diingat**: karena `registrationAllowed: false`, role `publisher` dijadikan **default role realm** (`default-roles-nextjs-kc` composite ditambah `publisher`) — asumsinya, tidak akan ada jalur self-registration jadi aman semua default role otomatis publisher. **Kalau sign-up diaktifkan, asumsi ini berubah** — perlu direview ulang (lihat §3 di bawah).

## Yang dibutuhkan untuk mengaktifkan Sign Up

1. **Set `registrationAllowed: true`** di realm `nextjs-kc` (via admin API atau console) — Keycloak otomatis menampilkan link "Register" di halaman login bawaan.
2. **Tentukan field apa yang wajib diisi** saat registrasi — default Keycloak: username, email, first name, last name, password. Bisa dikustomisasi lewat **User Profile** (realm settings) kalau mau tambah/kurangi field.
3. **Email verification** — apakah email perlu diverifikasi sebelum akun aktif? Kalau ya, perlu setting SMTP di realm (`Realm Settings → Email`) supaya Keycloak bisa kirim email verifikasi — **belum ada SMTP dikonfigurasi di realm ini sama sekali**, ini pending item terpisah.
4. **Styling halaman register** — theme custom `pits` yang sudah ada (CSS di `docker/themes/pits/login/`) kemungkinan besar perlu override tambahan khusus untuk `register.ftl` (field tambahan, layout beda dari login) — belum ditest sama sekali karena `registrationAllowed` masih `false`.

## ⚠️ Pertimbangan keamanan (WAJIB direview sebelum aktifkan)

Karena `publisher` sekarang default role realm, **mengaktifkan self-registration otomatis berarti siapa pun yang mendaftar sendiri langsung dapat izin register dokumen resmi ke blockchain** — sama persis risiko yang sudah dibahas untuk Google login (dan waktu itu user sengaja pilih "auto-approve semua" untuk fase UAT). Kalau sign-up diaktifkan untuk PRODUCTION (bukan UAT lagi), opsi yang perlu didiskusikan ulang:

1. **Tetap auto-approve** — konsisten dengan keputusan Google login, tapi risiko sama: siapa saja bisa daftar & langsung jadi publisher.
2. **Cabut `publisher` dari default role**, ganti dengan approval flow — user baru (baik dari sign-up maupun Google) masuk dengan role kosong dulu, admin approve manual baru dapat `publisher`. Lebih aman tapi butuh UI admin approval (belum ada) atau tetap manual lewat Keycloak console.
3. **Batasi sign-up ke domain email tertentu** (misal `@brin.go.id`) via custom validator/authentication flow — approach yang sempat ditawarkan untuk Google login juga tapi tidak dipakai (user pilih auto-approve semua).

## Rekomendasi langkah berikutnya

Jangan langsung `registrationAllowed: true` tanpa jawab dulu:
- Sign-up ini untuk siapa? Publik luas, atau internal tim riset yang jumlahnya terbatas?
- Kalau internal & terbatas, mungkin **tidak perlu sign-up sama sekali** — cukup terus pakai cara sekarang (admin buatkan akun manual, sudah terbukti jalan untuk `test-publisher`/`uat-tester`).
- Kalau butuh publik, putuskan dulu opsi keamanan di atas (1/2/3) sebelum implementasi.

## Referensi

- Audit theme login lengkap: `_docs/design/keycloak-login-theme-audit.md`
- Kredensial & detail realm: `_credentials/19-project-trustmark-pits.md` (lokal, di luar repo)
- Log sesi terkait: `_docs/status/log.md` entry `[2026-09-07]` (beberapa entry, cari "Google login" dan "default role")
