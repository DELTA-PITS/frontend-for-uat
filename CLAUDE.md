# PITS Frontend — Claude Code Instructions

Aplikasi Next.js (App Router) untuk **Public Information Trust System (PITS)** — dua portal: Publisher Portal (registrasi dokumen) dan Verification Portal (verifikasi publik). Auth via NextAuth + Keycloak. Styling TailwindCSS + daisyUI. Testing via Vitest (`npm test` = project `unit`; Storybook interaction test = project `storybook`) — lihat coding-standards.md.

---

## Shortcut: Source of Truth

```
Fitur spesifik (teknis)    → _docs/srs/fr-publisher-portal.md, _docs/srs/fr-verification-portal.md
Fitur spesifik (bisnis)    → _docs/brd/brd-core.md
Arsitektur                 → _docs/architecture/system-overview.md
Code style & project rules → _docs/referensi/coding-standards.md
Boleh mulai coding kalau   → _docs/quality/definition-of-ready.md
Definisi "selesai"         → _docs/quality/definition-of-done.md
Checklist sebelum lapor    → _docs/ai/review-checklist.md
Pekerjaan aktif            → _docs/tasks/tasks.md
Log progress per sesi      → _docs/status/log.md
Hasil audit awal           → _docs/audit/audit-2026-07-31.md
```

## Prinsip Tidak Bisa Diganggu Gugat (Constitution)

- Data hasil registrasi/verifikasi (hash, record ID, error backend) **tidak boleh** ditaruh mentah di query string URL — sejak 2026-08-02 `lib/resultPayload.ts` menyimpannya di `sessionStorage` (`buildResultHref`/`readResultPayload`), href-nya polos `/result/<status>`. Jangan kembalikan ke pola query-string di tempat lain.
- Route `/publisher` dan `/dashboard` **selalu** wajib login (role publisher via Keycloak) — jangan buka akses tanpa auth check tanpa keputusan eksplisit.
- Route `/verify` **selalu** publik tanpa login — jangan tambahkan auth requirement tanpa mendiskusikan dampaknya ke BRD.
- Tidak ada kredensial/secret Keycloak yang ditulis langsung di kode — selalu lewat environment variable (`AUTH_KEYCLOAK_*` server-side, `NEXT_PUBLIC_AUTH_KEYCLOAK_*` client-side).

Setiap Technical Design wajib dicek tidak melanggar bagian ini sebelum coding.

## Wajib Sebelum Coding Fitur

1. Cek fitur di `_docs/srs/` → baca SRS-nya.
2. Cek BRD di `_docs/brd/brd-core.md` → pahami konteks bisnis, persona, journey.
3. Jika belum ada → buat BRD + SRS dulu, update `_docs/README.md`.
4. Cek `_docs/quality/definition-of-ready.md` — semua item tercentang sebelum mulai coding.
5. Sebelum lapor selesai → jalankan `_docs/ai/review-checklist.md`.

## Aturan Kritis

- `components/features/` dan `components/ui/` (dead code lama, divergen dari komponen aktif) **sudah dihapus** (2026-08-01). Komponen aktif ada di `components/{common,auth,layout,verify,register,dashboard}/` + file top-level.
- **Semua teks yang tampil ke user WAJIB lewat sistem i18n** (`lib/i18n/translations.ts` + `useLocale()`) — jangan hardcode string ID/EN langsung di JSX. Lihat `_docs/referensi/coding-standards.md` §2 untuk pola lengkap termasuk cara handle Server Component.
- **Warna selalu lewat token daisyUI** (`styles/globals.css`), jangan hardcode hex di komponen — brand color utama saat ini merah BRIN asli (`#E62F2A`, dicek langsung dari brin.go.id), bukan biru.
- Port dev server default: `3000`.
- Env var Keycloak ada dua set (server-side tanpa prefix, client-side dengan `NEXT_PUBLIC_`) — kalau mengubah salah satu, cek keduanya tetap sinkron (lihat audit #6).
- Test runner-nya Vitest (`jest.config.ts` sudah dihapus 2026-08-02, jangan ditambah lagi). Unit test baru (`*.test.ts`/`*.test.tsx`) otomatis masuk project `unit` (jsdom) di `vitest.config.ts` — jalankan dengan `npm test`. Route handler API (`app/api/*/route.ts`) yang butuh session sekarang pakai `app/api/_lib/requireAuth.ts`, jangan cek `auth()` manual berulang di tiap route.

## Status Update (WAJIB)

Sebelum mengakhiri sesi kerja, **tambah entry baru di paling atas** `_docs/status/log.md` (jangan timpa/hapus entry lama). Isi: progress %, yang diselesaikan sesi ini, blocker/keputusan yang dibutuhkan, next steps. Commit bareng perubahan kode.
