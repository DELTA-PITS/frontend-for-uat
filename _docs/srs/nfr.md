# Non-Functional Requirements — PITS Frontend

Berlaku global untuk seluruh project — bukan per-fitur.

## Timezone

Timestamp dari backend dalam UTC — konversi ke timezone lokal user dilakukan di layer presentasi (komponen React), bukan di backend.

## Keamanan & Privasi Data

- Jangan taruh data hasil registrasi/verifikasi (hash, record ID, pesan error backend) mentah di query string URL tanpa mempertimbangkan risiko privasi (browser history, access log) — lihat gap di `lib/resultPayload.ts` (audit #7).
- Kredensial Keycloak (`AUTH_KEYCLOAK_SECRET`) hanya server-side, tidak pernah di-expose via `NEXT_PUBLIC_*`.
- Validasi upload (tipe, ukuran) harus ada di client sebagai UX guard DAN di server sebagai pertahanan utama — jangan andalkan salah satu saja.

## Availability & Error Handling

- Kalau backend PITS tidak bisa dihubungi, tampilkan pesan error yang jelas ke user — jangan biarkan halaman blank/crash.
- Refresh token NextAuth harus menangani kegagalan dengan graceful (flag `error` di session, bukan throw) — pola ini sudah benar di `auth.ts`, pertahankan.

## Performance Targets

- Hindari client-side fetch-on-mount untuk data yang bisa di-fetch di server component (lihat gap `app/dashboard/page.tsx` — audit #12).
- Gunakan `next/image` untuk semua gambar statis (lihat inkonsistensi `BgHeader.tsx` vs `layout/Header.tsx` — audit #10).

## Constraint Teknis

- Next.js App Router, React 19, TypeScript strict mode aktif.
- Linting: Oxlint (bukan ESLint) — CI linting saat ini tidak aktif (lihat audit #4), harus diaktifkan kembali sebelum keluar dari UAT.
- Test runner: Vitest (wired ke Storybook interaction test) — `jest.config.ts` ada tapi tidak efektif (nol test file, environment default salah).
