# Design Doc — Publisher Portal

**Status:** Implemented (dengan gap — lihat Open Questions)
**Author:** Tim DELTA-PITS (didokumentasikan ulang oleh Claude Code)
**Reviewer:** —
**Tanggal:** 2026-07-31
**Berkaitan dengan BRD:** `_docs/brd/brd-core.md`
**Definition of Ready:** ✅ terpenuhi (retroaktif)

---

> ⚠️ Sebelum menulis dokumen ini, cek bagian "Prinsip Tidak Bisa Diganggu Gugat" di `CLAUDE.md` project ini.

## TL;DR

Publisher login via Keycloak, diarahkan ke `/publisher` untuk upload & register dokumen, hasil ditampilkan di `/result/*`, dan riwayat registrasi bisa dilihat di `/dashboard`.

---

## Context

Route: `app/publisher/page.tsx` (upload), `app/dashboard/page.tsx` (riwayat), `app/api/register/route.ts` (proxy ke backend). Komponen aktif: `components/FileUpload.tsx`, `components/common/Dropzone.tsx`, `hooks/useUpload.ts`. **Jangan** gunakan komponen di `components/features/upload/` — itu dead code (lihat `_docs/audit/audit-2026-07-31.md` #1).

---

## Goals & Non-Goals

**Goals:**
- Alur upload → register → lihat hasil yang jelas untuk publisher.
- Proteksi route via NextAuth middleware (`proxy.ts`) + `authorized` callback.

**Non-Goals:**
- Validasi tipe/ukuran file di sisi client (belum ada — lihat Open Questions).
- Manajemen role/akun publisher dari frontend.

---

## Arsitektur & Data Flow

```
Publisher → /login (Keycloak via NextAuth) → session tersimpan (auth.ts)
  → /publisher (proteksi via proxy.ts + authorized callback)
  → Dropzone (components/common/Dropzone.tsx) → onDrop → hooks/useUpload.ts
  → POST /api/register (route.ts, server-side, memakai requireAccessToken() dari _lib/requireAuth.ts)
  → parseUpload.ts (validasi: PDF only via ekstensi+MIME, max 20MB — 413/415 kalau gagal)
  → forward ke backend PITS: POST {PITS_BACKEND_REGISTER_URL}
  → hasil disimpan di sessionStorage via lib/resultPayload.ts (bukan query string lagi, sejak 2026-08-02)
  → router.push ke /result/success atau /result/failure (href polos, tanpa data)
```

## Perubahan API / Interface (route Next.js, bukan backend)

```
METHOD   : POST
URL      : /api/register (Next.js API route, server-side)
Auth     : session NextAuth (server-side, via await auth())

Request  : multipart/form-data (diteruskan dari client)
Response : diteruskan dari backend PITS (lihat backend-for-uat/_docs/srs/fr-document-registration.md)
```

```
METHOD   : GET
URL      : /api/records
Auth     : requireAccessToken() (_lib/requireAuth.ts)

⚠️ Route ini TIDAK dipanggil dari mana pun saat ini. app/dashboard/page.tsx (Server
   Component) fetch PITS_BACKEND_RECORDS_URL langsung, server-side, tanpa lewat
   route internal ini. Dipertahankan untuk konsistensi API surface, tapi secara
   fungsional dead code — pertimbangkan dihapus di sesi refactor berikutnya.
```

## Business Logic

```
RULE-1: Route /publisher dan /dashboard wajib login (authorized callback, auth.ts:62-65).
RULE-2: PITS_ISSUER_ID diambil dari env; kalau tidak diset, fallback ke DEFAULT_ISSUER_ID
        hardcoded di app/api/register/route.ts:6 — RISIKO silent misconfiguration,
        lihat audit #8. Jangan hilangkan fallback tanpa memastikan env var
        production selalu diset.
RULE-3: Hasil register (sukses/gagal) disimpan di sessionStorage (lib/resultPayload.ts),
        bukan query string — diperbaiki 2026-08-02, lihat tasks.md #7.
```

## Permission & Access Control

| Role | Akses /publisher | Akses /dashboard |
|------|-----|-----|
| Publisher (login) | ✅ | ✅ |
| Tidak login | ❌ (redirect ke /login) | ❌ (redirect ke /login) |

## Validation Rules

| Field | Aturan | Layer | Pesan Error |
|-------|--------|-------|--------------|
| file | PDF only (ekstensi+MIME), max 20MB | server (`parseUpload.ts`) | 415 (tipe salah) / 413 (terlalu besar) |
| file | PDF only (`accept`), max 20MB (`maxSize`) | client (`Dropzone.tsx`) | pesan inline via `t.dropzone.errorInvalidType`/`errorTooLarge` |

## Testing Plan

```
□ Login publisher → redirect ke /publisher berhasil
□ Upload dokumen valid → register sukses → redirect /result/success dengan detail benar
□ Register gagal (backend error) → redirect /result/failure dengan pesan jelas
□ Akses /publisher tanpa login → redirect ke /login
□ Dashboard menampilkan record sesuai issuer yang login
```
*(Skenario di atas masih manual — belum ada E2E test. Unit test Vitest sudah menutupi logic pendukungnya: `hooks/useUpload.test.ts` (submit register sukses/`already_existed`/tanpa file), `lib/resultPayload.test.ts`, `lib/uploadErrorMessage.test.ts`.)*

---

## File yang HARUS Diubah

| File | Perubahan | Kenapa |
|------|-----------|--------|
| `app/publisher/page.tsx` | Halaman upload | Entry point fitur |
| `components/FileUpload.tsx`, `components/common/Dropzone.tsx` | UI upload | **Bukan** versi di `components/features/upload/` |
| `hooks/useUpload.ts` | Logic submit & redirect hasil | Business logic client |
| `app/api/register/route.ts`, `app/api/_lib/parseUpload.ts` | Proxy ke backend | Server-side handling |
| `app/dashboard/page.tsx` | Riwayat registrasi | Data fetching records |

---

## Security Considerations

- [x] Route dilindungi auth (`requireAccessToken()` di handler + `authorized()` callback di halaman)
- [x] Validasi tipe/ukuran file client-side DAN server-side
- [x] Data hasil tidak ditaruh di query string (dipindah ke `sessionStorage`, 2026-08-02)

## Open Questions

| Pertanyaan | Siapa yang harus menjawab | Deadline |
|------------|-------------------------------|----------|
| Apakah dashboard perlu dipindah ke server component untuk menghindari waterfall fetch? | Tim frontend | Sebelum keluar dari UAT |
| Batasan tipe file apa saja yang valid untuk registrasi (PDF saja? gambar? semua)? | Product Owner | Sebelum menambah validasi client |
