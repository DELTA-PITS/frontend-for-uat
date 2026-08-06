# ADR-001 — Autentikasi via NextAuth + Keycloak Provider

**Status:** Accepted
**Tanggal:** 2026-07-31 (didokumentasikan retroaktif)

## Konteks

Frontend perlu autentikasi untuk membatasi akses Publisher Portal (`/publisher`, `/dashboard`), sekaligus konsisten dengan backend yang sudah memakai Keycloak sebagai identity provider (lihat `backend-for-uat/_docs/decisions/adr-002-keycloak-oidc-auth.md`).

## Keputusan

Gunakan **NextAuth v5 (beta)** dengan Keycloak sebagai OAuth/OIDC provider (`auth.ts`). Session di-refresh otomatis via `refreshAccessToken`, token disimpan di JWT session (module augmentation di `types/next-auth.d.ts`).

## Alternatif yang Dipertimbangkan

| Opsi | Kelebihan | Kekurangan | Keputusan |
|------|-----------|-----------|-----------|
| Session custom (cookie manual + backend session store) | Kontrol penuh | Harus reimplementasi refresh token flow, rawan bug keamanan | ❌ Tidak dipilih |
| NextAuth v4 (stabil) + Keycloak | Versi stabil, dukungan App Router terbatas | App Router adalah pola utama project ini — v4 kurang idiomatis untuk App Router | ❌ Tidak dipilih |
| NextAuth v5 (beta) + Keycloak — dipilih | Didesain untuk App Router, integrasi provider Keycloak siap pakai | Masih beta — API bisa berubah tanpa semver stabil (lihat audit #5) | ✅ Dipilih, dengan catatan risiko |

## Konsekuensi

**Positif:** Konsisten dengan backend (satu realm Keycloak dipakai keduanya), pola App Router idiomatis, refresh token ditangani dengan graceful error handling.

**Negatif/Risiko:** Ketergantungan pada versi beta `next-auth@5.0.0-beta.31` di produksi — upgrade patch berikutnya berpotensi breaking change tanpa jaminan semver stabil. Perlu dipantau rilis stabil NextAuth v5 dan direncanakan upgrade begitu tersedia.

**Aturan turunan:** Konfigurasi Keycloak (client ID, issuer) harus disinkronkan manual antara env var server-side (`AUTH_KEYCLOAK_*`) dan client-side (`NEXT_PUBLIC_AUTH_KEYCLOAK_*`) — lihat audit #6 untuk risiko drift.

---

*ADR tidak pernah dihapus/diedit setelah Accepted. Kalau keputusan berubah (misal pindah ke NextAuth v5 stabil atau provider lain), buat ADR baru yang mem-supersede ADR ini.*
