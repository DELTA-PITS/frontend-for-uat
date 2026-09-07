# Release Checklist

## Pre-Release
- [ ] `tsc --noEmit` bersih, ESLint bersih
- [ ] `npm test` (Vitest unit) + Storybook interaction test hijau
- [ ] Tidak ada Keycloak client secret ter-commit

## Deploy
- [ ] Build production (`next build`)
- [ ] Env var NextAuth/Keycloak (issuer URL, client ID/secret) sudah diset di environment target

## Post-Deploy
- [ ] Homepage 200
- [ ] Login via Keycloak berhasil (Publisher Portal)
- [ ] Verifikasi 1 dokumen publik berhasil (Verification Portal, tanpa login)

## Rollback Decision
- Trigger: login Keycloak gagal total ATAU verifikasi publik error untuk semua dokumen.
- Lihat `operations/rollback.md`.
