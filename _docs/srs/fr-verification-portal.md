# Design Doc — Verification Portal

**Status:** Implemented (dengan gap route — lihat Open Questions)
**Author:** Tim DELTA-PITS (didokumentasikan ulang oleh Claude Code)
**Reviewer:** —
**Tanggal:** 2026-07-31
**Berkaitan dengan BRD:** `_docs/brd/brd-core.md`
**Definition of Ready:** ✅ terpenuhi (retroaktif)

---

## TL;DR

Pengunjung tanpa login upload dokumen di halaman utama (`/`), frontend meneruskan ke backend `/api/v1/verify`, dan hasil ditampilkan di `/result/success` atau `/result/failure`.

---

## Context

Fungsi verifikasi utama berjalan di `app/page.tsx` (root), **bukan** `app/verify/page.tsx` yang saat ini hanya placeholder statis dan tidak terhubung navigasi (lihat `_docs/audit/audit-2026-07-31.md` #9). Komponen: `components/ResultView.tsx`, `components/common/Dropzone.tsx`, `hooks/useUpload.ts`.

---

## Goals & Non-Goals

**Goals:**
- Verifikasi tanpa login, alur sesingkat mungkin.
- Hasil ditampilkan dengan jelas (terverifikasi/tidak, beserta detail issuer & tanggal).

**Non-Goals:**
- Menjelaskan detail teknis hash/blockchain ke verifier awam (di luar scope UI dasar saat ini).

---

## Arsitektur & Data Flow

```
Verifier (tanpa login) → "/" (app/page.tsx)
  → Dropzone → onDrop → hooks/useUpload.ts
  → POST /api/verify (Next.js API route) → app/api/verify/route.ts
  → forward ke backend PITS: POST {PITS_BACKEND_VERIFY_URL}
  → hasil di-serialize ke query string via lib/resultPayload.ts
  → router.push ke /result/success atau /result/failure
  → components/ResultView.tsx menampilkan detail hasil
```

## Perubahan API / Interface (route Next.js)

```
METHOD   : POST
URL      : /api/verify
Auth     : none

Request  : multipart/form-data
Response : diteruskan dari backend PITS (lihat backend-for-uat/_docs/srs/fr-document-verification.md)
```

## Business Logic

```
RULE-1: Halaman verifikasi TIDAK PERNAH memerlukan login — jangan tambahkan
        auth check di sini (lihat CLAUDE.md § Constitution).
RULE-2: Hasil verifikasi (matched/not-matched + metadata) di-serialize ke query
        string payload (lib/resultPayload.ts) — lihat audit #7 untuk risiko privasi.
```

## Permission & Access Control

| Role | Akses halaman verifikasi |
|------|-----|
| Publik (tanpa login) | ✅ |

## Testing Plan

```
□ Upload dokumen yang sudah terdaftar → hasil "terverifikasi" dengan detail benar
□ Upload dokumen yang tidak terdaftar → hasil "tidak ditemukan"
□ Backend verify error/timeout → pesan error jelas, bukan crash halaman
□ Akses halaman verifikasi tanpa login → tetap bisa diakses (regression check)
```
*(Belum ada test otomatis — lihat `_docs/audit/audit-2026-07-31.md` #3.)*

---

## File yang HARUS Diubah

| File | Perubahan | Kenapa |
|------|-----------|--------|
| `app/page.tsx` | Entry point verifikasi | Halaman utama |
| `components/ResultView.tsx` | Tampilan hasil | **Bukan** versi `components/features/result/` |
| `hooks/useUpload.ts` | Logic submit & redirect | Shared dengan Publisher Portal |
| `app/api/verify/route.ts` | Proxy ke backend | Server-side handling |

---

## Security Considerations

- [x] Tidak memerlukan auth (by design)
- [ ] Data hasil tidak ditaruh di query string — **saat ini masih ditaruh**

## Open Questions

| Pertanyaan | Siapa yang harus menjawab | Deadline |
|------------|-------------------------------|----------|
| Apakah route `/verify` (placeholder) akan dilanjutkan jadi entry point resmi verifikasi, menggantikan `/`? Atau dihapus? | Product Owner / Tim frontend | Sebelum keluar dari UAT |
