# Non-Functional Requirements — PITS Frontend

Berlaku global untuk seluruh project — bukan per-fitur.

## Timezone

Timestamp dari backend dalam UTC — konversi ke timezone lokal user dilakukan di layer presentasi (komponen React), bukan di backend.

## Keamanan & Privasi Data

- Jangan taruh data hasil registrasi/verifikasi (hash, record ID, pesan error backend) mentah di query string URL tanpa mempertimbangkan risiko privasi (browser history, access log) — sejak 2026-08-02 `lib/resultPayload.ts` menyimpannya di `sessionStorage`, bukan lagi query string.
- Kredensial Keycloak (`AUTH_KEYCLOAK_SECRET`) hanya server-side, tidak pernah di-expose via `NEXT_PUBLIC_*`.
- Validasi upload (tipe, ukuran) ada di client sebagai UX guard DAN di server (`app/api/_lib/parseUpload.ts`) sebagai pertahanan utama — jangan andalkan salah satu saja.

## Availability & Error Handling

- Kalau backend PITS tidak bisa dihubungi, tampilkan pesan error yang jelas ke user — jangan biarkan halaman blank/crash.
- Refresh token NextAuth harus menangani kegagalan dengan graceful (flag `error` di session, bukan throw) — pola ini sudah benar di `auth.ts`, pertahankan.

## Performance Targets

- Hindari client-side fetch-on-mount untuk data yang bisa di-fetch di server component — `app/dashboard/page.tsx` sudah Server Component (fetch server-side langsung), pertahankan pola ini untuk halaman data baru.
- Gunakan `next/image` untuk semua gambar statis (lihat inkonsistensi `BgHeader.tsx` vs `layout/Header.tsx` — audit #10).

## Constraint Teknis

- Next.js App Router, React 19, TypeScript strict mode aktif.
- Linting: Oxlint (bukan ESLint) — CI linting saat ini tidak aktif (lihat audit #4), harus diaktifkan kembali sebelum keluar dari UAT.
- Test runner: Vitest — project `unit` (jsdom, `lib/*.ts` + hooks, `npm test`) dan project `storybook` (interaction test). `jest.config.ts` sudah dihapus (2026-08-02).
