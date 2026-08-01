# Architecture Decision Records — Index

| ADR | Judul | Status |
|-----|-------|--------|
| [ADR-001](adr-001-nextauth-keycloak.md) | Autentikasi via NextAuth + Keycloak provider | Accepted |

## Kapan Bikin ADR Baru

Setiap keputusan arsitektur yang sulit di-reverse — pilihan auth strategy, third-party lock-in, breaking API change, atau keputusan menyelesaikan/menghapus migrasi `components/features/` vs `components/common/` (lihat `tasks/tasks.md`). Kalau keputusan berubah, tulis ADR baru yang supersede ADR lama.
