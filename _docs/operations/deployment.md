# Deployment

**Environment:** production (target hosting — update dengan detail spesifik, kemungkinan Vercel
mengikuti pola project Next.js lain Ersa, konfirmasi saat deploy pertama).

**Cara deploy:**
1. `next build`
2. Env var NextAuth/Keycloak diset di platform hosting
3. Deploy (auto via git push kalau Vercel, atau manual)

**Trigger:** auto via git push ke main (kalau Vercel) atau manual — konfirmasi saat setup CI/CD.
