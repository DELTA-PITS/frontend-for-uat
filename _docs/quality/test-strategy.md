# Test Strategy

6 lapis (definisi umum: `_meta/_PROJECT-DOCS-STANDARD.md`), Next.js/NextAuth/Keycloak:

1. **Static** — `tsc --noEmit`, ESLint sebelum commit.
2. **Unit** — Vitest (`npm test` = project `unit`) untuk logic murni (form validation, dsb).
3. **Integration** — Vitest untuk komponen yang panggil API internal.
4. **Feature** — Storybook interaction test (project `storybook`) untuk komponen UI kritikal.
5. **E2E** — manual browser: alur Publisher Portal (registrasi dokumen) + Verification Portal
   (verifikasi publik) end-to-end, termasuk login via Keycloak.
6. **Production smoke test** — setelah deploy: login Keycloak berhasil, 1 dokumen bisa diverifikasi.

Prinsip: **auth via NextAuth+Keycloak adalah dependency eksternal kritis** — test failure path
(Keycloak down/token expired), bukan cuma golden path login sukses.
