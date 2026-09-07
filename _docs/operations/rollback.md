# Rollback

- **Aplikasi**: kalau Vercel — instant rollback ke deployment sebelumnya via dashboard. Kalau hosting
  lain — revert commit + redeploy manual.
- **Auth config**: kalau Keycloak realm/client config yang berubah menyebabkan masalah, revert
  konfigurasi di Keycloak Admin Console (terpisah dari rollback kode).
- **Verifikasi rollback berhasil**: login Keycloak + verifikasi 1 dokumen publik berhasil lagi.
