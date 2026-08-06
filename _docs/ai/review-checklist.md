# AI Review Checklist

Checklist yang WAJIB dijalankan Claude sendiri sebelum menyatakan pekerjaan selesai — sebelum lapor ke user.

- [ ] `npm run lint` / `tsc --noEmit` — 0 error
- [ ] Test golden path + minimal edge case sudah dijalankan (Vitest/Storybook, atau diminta user jalankan manual di browser)
- [ ] Tidak ada TODO/FIXME/dead code baru tersisa tanpa alasan jelas
- [ ] Tidak ada data sensitif ter-expose (query string, log, client-side bundle)
- [ ] Konsisten dengan requirement di BRD/Design Doc — tidak ada penyimpangan tanpa konfirmasi
- [ ] Semua file yang seharusnya diubah (sesuai Design Doc) sudah diubah — tidak ada yang terlewat
- [ ] Dokumentasi terkait diupdate kalau ada perubahan signifikan
- [ ] Tidak melanggar "Prinsip Tidak Bisa Diganggu Gugat" di `CLAUDE.md` project ini
- [ ] Kalau menyentuh komponen: dipastikan mengedit versi aktif (bukan `components/features/`/`components/ui/`)
- [ ] Reminder ke user: manual test di browser diperlukan sebelum deploy — Claude Code tidak bisa verifikasi UI/perilaku runtime sendiri
