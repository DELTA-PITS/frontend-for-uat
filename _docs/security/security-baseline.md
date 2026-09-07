# Security Baseline

- **Auth**: NextAuth + Keycloak — validasi token di server-side (middleware/route handler), jangan
  cuma cek session di client.
- **Authorization**: Publisher Portal (butuh login) vs Verification Portal (publik) — pastikan route
  publisher benar-benar diproteksi middleware, bukan cuma disembunyikan di UI.
- **Public identifier**: dokumen yang diverifikasi publik pakai opaque ID, bukan sekuensial (dokumen
  trust system — ID predictable = risiko orang lain bisa cek/enumerate dokumen tanpa izin).
- **CSRF**: NextAuth built-in protection untuk form auth.
- **Secrets**: Keycloak client secret dari env var, tidak pernah di bundle client-side.
- **Output escaping**: React default escape — hindari `dangerouslySetInnerHTML` untuk data dari user.
