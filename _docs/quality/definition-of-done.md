# Definition of Done

Kriteria eksplisit kapan sebuah task/fitur dianggap selesai. File tetap — bukan per-fitur.

- [ ] Kode berjalan sesuai acceptance criteria di BRD/Design Doc
- [ ] Golden path + edge case sudah ditest manual (browser) — Claude Code tidak bisa akses browser user
- [ ] `npm run lint` (Oxlint) bersih (0 error), `tsc` type-check bersih
- [ ] Tidak ada `console.log`/debug output tertinggal
- [ ] Tidak ada secret/credential hardcoded, tidak ada nilai `NEXT_PUBLIC_*` yang seharusnya rahasia
- [ ] Tidak menambah/mengedit file di `components/features/` atau `components/ui/` (dead code) tanpa keputusan eksplisit
- [ ] Dokumentasi terkait sudah diupdate (BRD/Design Doc status → Implemented)
- [ ] Sudah di-review (self-review atau reviewer kedua)
- [ ] `tasks.md` sudah dipindahkan ke status selesai
