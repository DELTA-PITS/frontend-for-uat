# Status — PITS Frontend

File ini diupdate Claude Code **setiap sesi kerja selesai**. Entry terbaru selalu ditambah di **paling atas** (append, jangan timpa/hapus entry lama).

---

## [2026-08-02 09:00] — Claude Code

- **Progress**: Sinkronisasi dokumentasi menyeluruh atas permintaan user ("update semua md tanpa terkecuali") — memastikan semua `.md` di repo konsisten dengan state kode terkini (setup test Vitest, validasi upload server, `sessionStorage` result payload, `requireAuth.ts`, `lucide-react` dihapus). Juga verifikasi git/GitHub attribution atas pertanyaan user.
- **Selesai sesi ini**:
  - Grep seluruh `*.md` di repo untuk kata kunci stale (`jest`, `resultPayload`/`query string`, `lucide`, `parseUpload`/validasi) — ditemukan 8 file dengan referensi usang.
  - **Diupdate**: `CLAUDE.md` (root — testing section, constitution query-string, aturan kritis jest→vitest+requireAuth), `README.md` (root — tree struktur folder disinkronkan penuh dengan struktur aktual saat ini, bukan cuma testing section; tree lama masih menyebut `components/features/`/`ui/` yang sudah dihapus sejak 2026-08-01), `ONBOARDING.md` (5 poin "paling penting" diupdate + prioritas kerja), `_docs/referensi/coding-standards.md` (§1 testing, §3 upload/result payload/auth route protection), `_docs/architecture/system-overview.md` (resultPayload, catatan `proxy.ts` tidak proteksi `/api/*` + `requireAuth.ts`), `_docs/srs/fr-publisher-portal.md` (data flow, validation rules table, security checklist — 2 dari 3 checkbox yang tadinya kosong sekarang tercentang), `_docs/srs/nfr.md` (keamanan, performance, constraint teknis), `_docs/brd/brd-core.md` (tabel risiko ditambah kolom Status + 1 risiko baru untuk validasi server, keputusan test runner difinalkan), `_docs/audit/audit-2026-07-31.md` (ditambah catatan status resolusi di atas — **tidak** mengubah temuan asli, itu snapshot historis), `_docs/README.md` (tanggal).
  - **Sengaja TIDAK diubah**: `_docs/status/log.md` & `_docs/tasks/tasks.md` (sudah disinkronkan di entry sebelumnya), `_docs/quality/*.md` & `_docs/ai/review-checklist.md` (aturan generik, tidak stale), dokumen `_docs/design/*.md` lain (di luar scope perubahan sesi ini, sudah disinkronkan sesi-sesi desain sebelumnya), `CONTRIBUTE.md` (tidak menyebut jest/lucide/resultPayload sama sekali).
  - Diverifikasi ulang setelah semua edit dokumentasi: `tsc --noEmit`, `oxlint`, `npm test` (30/30) tetap bersih — dokumentasi tidak menyentuh kode tapi dipastikan tidak ada regresi tidak sengaja.
  - **Cek atribusi Git/GitHub** (dipicu pertanyaan user): `git log --all --grep` untuk "claude"/"anthropic" — nihil, tidak ada trailer `Co-Authored-By: Claude` di commit manapun (aturan global sudah diikuti sejak awal). Repo (`origin` → `github.com/DELTA-PITS/frontend-for-uat.git`) dicek dengan `git fetch` + `git status -sb`: branch kerja (`redesign/ui-i18n-layout-mobile`) **belum pernah di-push**, tidak ada tracking branch di remote. Jadi belum ada risiko atribusi AI muncul di GitHub sama sekali — karena memang belum ada yang di-push.
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: semua perubahan (kode dari sesi 08:00 + dokumentasi sesi ini) masih **belum di-commit**. Kalau mau di-push ke GitHub, commit dulu (tanpa co-author trailer, sesuai aturan global) baru `git push -u origin redesign/ui-i18n-layout-mobile`.

---

## [2026-08-02 08:00] — Claude Code

- **Progress**: 5 item backlog security/quality dikerjakan sekaligus atas permintaan user: #2b (validasi upload server), #3 (setup test), #6 (proteksi API), #7 (hash/record ID di query string), #9b (dependency tidak terpakai). Diverifikasi type-check, lint, 30 unit test baru (semua lulus), dan cek visual di browser untuk perubahan yang observable.
- **Selesai sesi ini**:
  - **#2b — Validasi upload server-side**: `app/api/_lib/parseUpload.ts` diubah dari `File | null` ke `ParseUploadResult` diskriminatif (`{ ok: true, file, filename } | { ok: false, status, message }`), menolak file >20MB (413) dan non-PDF berdasar ekstensi+MIME (415), mencerminkan aturan yang sudah ada di client `Dropzone`. `register`/`verify` route diupdate untuk consume shape baru dan meneruskan `status`/`message` apa adanya — client sudah otomatis menampilkan pesan yang tepat karena `uploadErrorMessage.ts` sudah punya mapping 413/415.
  - **#3 — Setup test**: `jest.config.ts` (0 test file, environment salah) dihapus beserta dependency `jest`/`jest-environment-jsdom`/`@types/jest`/`ts-node` (`ts-node` cuma dipakai untuk load config Jest itu). `vitest.config.ts` ditambah project `unit` (environment `jsdom`) plus `resolve.alias` yang mencerminkan `tsconfig.json` paths (`@lib`, `@components`, dst — Vitest tidak baca tsconfig otomatis). `package.json#test` → `vitest run --project unit`. 30 unit test baru: `lib/resultPayload.test.ts`, `lib/dateFormat.test.ts`, `lib/fileExtension.test.ts`, `lib/fileSizeCalc.test.ts`, `lib/uploadErrorMessage.test.ts`, `lib/i18n/translations.test.ts` (parity key ID vs EN + no-empty-string check), `hooks/useUpload.test.ts` (alur register sukses, `already_existed` → failure, submit tanpa file). Ketemu 1 gotcha saat setup: `jsdom` package ternyata hanya ada di node_modules sebagai transitive dependency dari `jest-environment-jsdom` yang baru dihapus — jadi harus ditambah eksplisit sebagai devDependency, bukan asumsi "sudah ada".
  - **#6 — Proteksi API**: dianalisis dulu — `authorized()` callback di `auth.ts` cuma proteksi `/publisher` & `/dashboard` (redirect ke halaman sign-in), TIDAK proteksi `/api/*`. Tapi `register`/`records` route sudah punya pengecekan `auth()` manual di handler. Menambah proteksi lewat `proxy.ts`/middleware dianggap **berisiko** — kalau `authorized()` reject, NextAuth redirect ke halaman HTML, padahal client fetch API mengharapkan JSON, berpotensi merusak alur upload yang sudah jalan. Solusi yang dipilih: ekstrak pengecekan yang terduplikasi jadi `app/api/_lib/requireAuth.ts` (satu sumber kebenaran, defense-in-depth via konsistensi bukan lewat middleware). **Temuan sampingan**: `app/api/records/route.ts` ternyata tidak dipakai sama sekali — `app/dashboard/page.tsx` fetch `PITS_BACKEND_RECORDS_URL` langsung server-side, bukan lewat route internal ini. Tetap diupdate untuk konsistensi tapi dead-code-nya dibiarkan (di luar scope task ini, layak jadi item backlog baru kalau mau dibersihkan).
  - **#7 — Hash/record ID di query string**: `lib/resultPayload.ts` dirombak dari `buildResultHref`/`parseResultPayload` (JSON di query string `?payload=...`) jadi `buildResultHref`/`readResultPayload` berbasis `sessionStorage` (key `pits:resultPayload`) — href sekarang `/result/<status>` polos, tanpa data sensitif di URL/browser history/server access log. `ResultView.tsx` diubah dari `useSearchParams()`+`useMemo` (SSR-safe karena query string ada di server) jadi `useState`+`useEffect` (perlu `useEffect` karena `sessionStorage` cuma ada di client — kalau baca lewat `useMemo` langsung, hasil SSR (`null`) vs client-pertama (`window` sudah ada) akan beda dan bikin hydration mismatch). Diverifikasi di browser: halaman `/result/success` render tanpa error React, tidak crash.
  - **#9b — Dependency tidak terpakai**: `lucide-react` (0 import di seluruh kode) dihapus dari `package.json`.
  - Dokumentasi disinkronkan: `tasks/tasks.md` (5 item dipindah ke "Selesai" dengan detail implementasi).
- **Temuan sampingan (bukan bug baru, sudah ada sebelumnya)**: `ResultView.tsx` — kondisi banner "Data ini bukan untuk halaman hasil ini" (`payload?.status !== status`) ternyata true juga kalau `payload` itu `null` (belum ada data sama sekali, misal user refresh halaman `/result/success` langsung tanpa lewat flow upload) — bukan cuma saat benar-benar mismatch status. Perilaku ini identik dengan kode lama (query-string based), jadi bukan regresi dari perubahan #7, tapi layak jadi item backlog kecil kalau mau dirapikan (tambah pengecekan `payload &&` di depan kondisi).
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: `4 high severity vulnerabilities` muncul di `npm audit` setelah `npm uninstall` (pre-existing, bukan dari paket yang baru ditambah/dihapus sesi ini) — belum diinvestigasi, disarankan `npm audit` terpisah kalau mau ditindaklanjuti. Backlog lama masih terbuka: #4 (CI linting), #5 (upgrade next-auth), #8 (.env.example), #11 (nasib route /verify placeholder), plus temuan baru sesi ini (dead code `app/api/records/route.ts`, banner mismatch saat payload null).

---

## [2026-08-02 07:00] — Claude Code

- **Progress**: Update status saja, tidak ada perubahan kode. Blocker Keycloak (task #22) sudah diselesaikan Ersa di luar sesi coding.
- **Selesai sesi ini**:
  - Task #22 (post-logout redirect URI Keycloak belum terdaftar, logout error "Invalid redirect uri") dikonfirmasi Ersa sudah diperbaiki & disimpan di admin console Keycloak. Dipindah dari "Belum Dikerjakan" ke "Selesai" di `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada lagi blocker terbuka untuk item ini.
- **Next steps**: disarankan uji ulang alur logout end-to-end (klik Keluar → cek tidak ada lagi error "Invalid redirect uri" dari Keycloak) untuk konfirmasi fix berfungsi. Backlog lain masih terbuka seperti tercatat di entry sebelumnya (#2b, #3, dll).

---

## [2026-08-02 06:00] — Claude Code

- **Progress**: Lanjutan sesi session-auth — 3 pekerjaan terpisah: (1) polish UI kecil (sub-nav sembunyi saat logout, desain ulang box upload Dropzone), (2) audit & revisi copywriting UX (2 ronde, dipicu masukan ChatGPT eksternal user), (3) audit arsitektur komponen + refactor konsolidasi + fix 1 bug tersembunyi. Semua diverifikasi type-check bersih dan visual di browser.
- **Selesai sesi ini**:
  - **UI kecil**: sub-nav "Layanan Dokumen" sekarang cuma render kalau ada >1 link (dulu tampil dengan 1 tab kosong pas belum login) — `Header.tsx`. FAQ accordion: area klik dilebarkan ke seluruh kotak (padding dipindah dari div ke `<button>`), icon panah diganti `ExpandMoreIcon` (MUI) — `FAQSection.tsx`.
  - **Redesign Dropzone**: dari gaya dashed-border 2018 ke border solid + icon badge lingkaran + teks 1 baris ringkas — `Dropzone.tsx`. Proses ini menemukan **bug tersembunyi daisyUI**: `.card-body p { flex-grow: 1 }` bikin `<p>` di dalam `OperationCard` melar aneh kalau jadi flex-item di container sendiri — awalnya ditambal lokal di `Dropzone.tsx`, lalu di sesi ini dipindah jadi fix permanen di `OperationCard.tsx` (`[&_p]:grow-0` di div `card-body`) supaya kelas bug ini tidak muncul lagi di komponen manapun ke depan.
  - **Copywriting UX — 2 ronde revisi penuh** ke `lib/i18n/translations.ts` (ID & EN), dipicu 2 audit terpisah dari ChatGPT (user minta dump semua teks ke markdown untuk dibawa ke sana). Ronde 1: rombak subtitle/heading/CTA di hampir semua section (Header, Verify/Register Hero, Tips, How It Works, FAQ, Dashboard, Result, error messages) — istilah "sidik jari digital" diganti "hash" secara konsisten. Ronde 2 (audit ulang dari nol, skor naik dari 9.3 ke 9.8/10): **unifikasi terminologi "Publisher"** (hapus semua "Penerbit"), dropzone kasih konteks tipe file eksplisit, beberapa kalimat dibuat kurang birokratis. Ditemukan & diperbaiki 1 inkonsistensi lolos ronde 1: `registerHero.title` masih "Registrasi Dokumen" padahal nav sudah "Daftarkan Dokumen" (dilaporkan user lewat screenshot).
  - Dokumentasi referensi teks (`_docs/referensi/teks-ui-id-en.md`, baru dibuat ronde 1) diperbarui 2x supaya selalu sinkron dengan `translations.ts` — juga jadi tempat mencatat 4 aturan konsistensi terminologi permanen (hash / blockchain / Publisher / Record ID).
  - **Audit arsitektur komponen** (diminta user: "apakah design system sudah diterapkan konsisten, ada kode berulang yang bisa disatukan?") menemukan: Header sudah benar-benar reusable (1x mount di root layout); Footer TIDAK ada isinya (`<footer />` kosong di `app/layout.tsx`, bukan bug, cuma belum diisi); `VerifyHero.tsx`/`RegisterHero.tsx` adalah 2 file JSX ~95% identik yang disinkronkan manual (ada komentar eksplisit "jangan ubah salah satu tanpa menyamakan yang lain" — tanda jelas seharusnya 1 komponen); `TipsCard.tsx`/`RequirementCard.tsx` juga duplikat pola "card + heading + bullet list".
  - **Refactor konsolidasi** (setelah user konfirmasi "kerjakan semuanya 1-3 termasuk bugnya"): `PageHero.tsx` (baru, `components/common/`) — `VerifyHero`/`RegisterHero` sekarang thin wrapper yang lempar copy+ikon+accent ke situ. `InfoListCard.tsx` (baru, `components/common/`) — `TipsCard`/`RequirementCard` sekarang thin wrapper dengan prop `headingIcon?`/`columns`/`bullet`. `design-system.md` §4 diupdate: 2 komponen baru dicatat, gotcha daisyUI didokumentasikan eksplisit biar tidak terulang.
- **Blocker / butuh keputusan dari Ersa**: tidak ada yang baru sesi ini. Item lama masih terbuka: Keycloak post-logout redirect URI (task #22, butuh klik manual di admin console — lihat entry 03:00 di bawah).
- **Next steps**: kalau mau, isi `<footer />` yang masih kosong di `app/layout.tsx` (bukan urgent, cuma temuan audit). Belum di-commit — tunggu konfirmasi user sebelum commit.

---

## [2026-08-02 03:00] — Claude Code

- **Progress**: Audit sesi login/logout (dipicu laporan user: `/publisher` masih terlihat setelah logout, back button menampilkan Dashboard lama, logout Keycloak error "Invalid redirect uri") disusun jadi dokumen, lalu diimplementasikan penuh setelah user konfirmasi "ok implementasi". Ditemukan 1 koreksi penting terhadap audit sendiri saat implementasi. Diverifikasi type-check, lint, dan langsung di browser.
- **Selesai sesi ini**:
  - **Koreksi penting ditemukan saat implementasi**: mencoba menambah `middleware.ts` bikin dev server GAGAL start — ternyata project ini sudah pakai **Next.js 16**, yang mengganti konvensi `middleware.ts` jadi `proxy.ts`. File `proxy.ts` **sudah ada** sejak awal, sudah meng-export `auth as proxy` dengan matcher yang mencakup hampir semua route — artinya `authorized()` callback di `auth.ts` **sudah aktif sepanjang waktu**, bukan dead code seperti dugaan awal audit. `middleware.ts` yang sempat dibuat langsung dihapus lagi. Root cause asli yang dilaporkan user 100% adalah fenomena back/forward cache (bfcache) browser, bukan celah proteksi route.
  - **Auth guard eksplisit (defense-in-depth)** ditambah di `app/publisher/page.tsx` dan `app/dashboard/page.tsx` — keduanya sekarang `redirect('/')` kalau tidak ada sesi, plus `export const dynamic = 'force-dynamic'` supaya halaman tidak pernah di-cache. `app/publisher/page.tsx` diubah dari client component murni jadi async Server Component; JSX aslinya dipindah ke `components/register/PublisherPortalClient.tsx`.
  - **`BfcacheRefresh`** (komponen baru, `components/layout/BfcacheRefresh.tsx`) — listener global `pageshow`, kalau `event.persisted` true (halaman dipulihkan dari bfcache, misal lewat tombol back) langsung `router.refresh()` supaya data/sesi selalu ke-cek ulang. Di-mount sekali di `app/layout.tsx`.
  - **Redirect target login diarahkan ke Verify**: `auth.ts` ditambah `pages: { signIn: '/' }` — user tanpa sesi yang coba akses route privat sekarang mendarat di halaman Verify (`/?callbackUrl=...`), bukan halaman default NextAuth yang polos.
  - **Banner konfirmasi logout**: `app/api/auth/logout/route.ts` redirect ke `/?loggedOut=1`, ditangkap `components/verify/LogoutBanner.tsx` (baru) yang menampilkan "Kamu berhasil keluar." lalu membersihkan query param — sebelumnya logout sukses tidak memberi feedback apapun ke user.
  - **Logout Keycloak "Invalid redirect uri" TIDAK bisa diperbaiki dari sesi ini** — butuh akses ke Keycloak admin console (realm → client → Valid Post Logout Redirect URIs) untuk mendaftarkan `http://localhost:3000/api/auth/logout`. Dicatat sebagai backlog #22 (prioritas High, blocker fungsional).
  - Dev server sempat macet dengan error stale module (`EmptyState defined multiple times`) dari cache `.next` lama peninggalan sesi sebelumnya — di-clear (`rm -rf .next`) dan restart bersih, tidak terkait kode aktual (`tsc`/`oxlint` sudah bersih sebelum itu).
  - Dokumentasi disinkronkan: `session-auth-audit-2026-08-02.md` (status → DIIMPLEMENTASIKAN, koreksi ditulis eksplisit di bagian atas + §12 log implementasi, acceptance criteria dicentang), `tasks/tasks.md` (#22 baru untuk item Keycloak yang masih terbuka).
- **Blocker / butuh keputusan dari Ersa**: akses Keycloak admin console untuk memperbaiki §5.3 (post-logout redirect URI) — di luar kendali sesi coding, perlu dikoordinasikan dengan siapa pun yang pegang akses admin realm ini.
- **Next steps**: setelah Keycloak diperbaiki, uji ulang alur logout end-to-end. Backlog lama masih terbuka: #2b (validasi server), #3 (cleanup test), #6 (proteksi middleware/proxy untuk route API — belum disentuh sesi ini, beda dari proteksi halaman yang baru dikerjakan).

---

## [2026-08-02 01:00] — Claude Code

- **Progress**: Design Language v2 — audit "bahasa visual" (bukan layout) atas kritik user bahwa PITS masih terasa dashboard 2019–2022, disusun jadi dokumen (`design-language-v2.md`), lalu diterapkan penuh setelah user konfirmasi "lanjut kerjakan 1-4". Diverifikasi type-check, lint, dan visual di browser (termasuk scroll behavior navbar via `getComputedStyle`).
- **Selesai sesi ini**:
  - **Background/Surface ditukar perannya**: `base-100` (card) `#F9F9F9`→`#FFFFFF` (putih murni), `base-200` (page bg) `oklch(97% 0 0)`→`#F5F6F8`. Sebelumnya keduanya nyaris sama terang (beda ~2%) sehingga card cuma kelihatan dari border; sekarang card benar-benar "mengambang" dari page background.
  - **Border dihaluskan**: `base-300` `#C3BEBE`→`#E8E9EC`, ketebalan `1.5px`→`1px` (light mode saja, dark mode belum diaudit — backlog #20). Token baru `--color-divider-strong` ditambah sebagai cadangan (belum dipakai).
  - **Shadow ditambah ke SEMUA card** (utility class baru `.shadow-card`, `0 1px 2px rgba(15,23,42,.04)` — nyaris tak terlihat sendirian) — **membalikkan prinsip lama** "card border-only, tanpa shadow sama sekali" yang baru ditetapkan 2 sesi lalu. Overlay (drawer) tetap `shadow-2xl`, jauh lebih kuat, supaya beda tingkat elevasi.
  - **Navbar shadow-on-scroll**: border bawah statis dihapus, diganti `bg-base-100/90 backdrop-blur-sm` + `shadow-sm` yang cuma muncul setelah `scrollY > 4` (state React + scroll listener) — diverifikasi bekerja lewat `getComputedStyle(header).boxShadow` di browser.
  - **`OperationCard` naik ke `rounded-3xl`** (satu-satunya "hero-level card"), card besar lain tetap `rounded-2xl`.
  - **Peran warna merah (`primary`) dibatasi drastis**: audit lewat grep menemukan 24 titik pemakaian lintas-peran di 12 file (nav aktif, nav hover, ikon default, border dropzone, hover card/FAQ). Semua diganti netral kecuali CTA/badge/state penting: nav aktif & hover → `bg-base-200`/`text-base-content` (bukan merah), `FilledIcon` default → `bg-secondary/10 text-secondary` (navy, bukan merah — berdampak ke `StatsCards` & `HowItWorks` yang tidak eksplisit override warna), `Dropzone` idle border → netral (`primary` HANYA saat `isDragActive`), hover border card (`OperationCard`/`RecordsTable`/`FAQSection`) → `hover:border-base-content/20`, `CopyButton` hover → netral, `MetadataCard` status "siap dikirim" → `text-success` (bukan primary, karena semantiknya "siap/baik").
  - **Tipografi dinaikkan lagi**: Page Title 30→32px, Section Title 20→22px — keduanya arbitrary value (`text-[2rem]`, `text-[1.375rem]`) karena tidak match step Tailwind manapun. Card Title/Subsection/Body/Caption SENGAJA tidak diubah (dianggap sudah final dari revisi sebelumnya).
  - Dokumentasi disinkronkan: `design-language-v2.md` (status PROPOSAL → DITERAPKAN, §11 detail penerapan aktual), `design-system.md` (§2 Warna, §3 Tipografi, §5 Pola Layout, §6 changelog), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah konfirmasi eksplisit ("lanjut kerjkan 1-4") untuk semua 4 keputusan yang sebelumnya diajukan sebagai pertanyaan terbuka.
- **Next steps**: backlog #19 (audit ritme layout & whitespace) dan #20 (audit dark mode mandiri — border/shadow/surface dark belum ikut direvisi di sesi ini) masih terbuka, disepakati butuh sesi tersendiri. Token `--color-divider-strong` tersedia tapi belum dipakai di komponen manapun (#18).

---

## [2026-08-01 22:00] — Claude Code

- **Progress**: Diskusi layout tablet/`md` (dilanjutkan ke ChatGPT), audit alignment bug (`OperationCard` vs section lain), riset tren desain 2026 (disaring untuk konteks aplikasi pemerintah), dan implementasi motion system — semua sudah diverifikasi (type-check, lint, dan cek visual di browser untuk yang bisa diakses tanpa login). Siap di-commit.
- **Selesai sesi ini**:
  - **Layout system dibangun**: komponen baru `components/layout/PageContainer.tsx` (`narrow`/`content`/`wide`/`full`) jadi satu-satunya sumber lebar+padding halaman, menggantikan `max-w`/`mx-auto`/padding manual ad hoc per halaman. Diterapkan ke Verify, Register, Dashboard.
  - **Bug alignment ditemukan & diperbaiki 2x**: (1) `OperationCard` (`max-w-4xl`) vs card lain (`max-w-3xl`) di Verify/Register — beda lebar independen-center bikin tidak sejajar (screenshot user). (2) `FAQSection` yang sengaja dibuat lebih sempit demi keterbacaan malah terlihat "tidak lurus" saat scroll — diperbaiki dengan cap lebar di teks jawaban saja (`max-w-2xl` pada `<p>`), bukan di seluruh section. Root-cause kedua kasus: pengecualian lebar di level section berisiko terbaca sebagai bug, lebih aman batasi di level elemen kecil.
  - **Judul redundan dihapus**: `OperationCard` title/description ("Verifikasi Dokumen"/"Registrasi Dokumen Baru" + deskripsi) yang mengulang isi Hero di atasnya dihapus dari Verify & Register — prop jadi opsional, section header tidak render kalau kosong. Key i18n mati (`verifyForm.title/description`, `registerForm.title/description`) dibersihkan dari kedua bahasa.
  - **Background band per section** ditambahkan di halaman Verify (Hero gradient → Form+Tips polos → Cara Kerja+FAQ `bg-base-200`) supaya batas antar section terlihat jelas, tidak menyatu.
  - **Riset tren desain 2026** (`_docs/design/2026-design-trend-research.md`) — web search utk tren UI/UX 2026, dashboard SaaS enterprise, GOV.UK/USWDS, lalu disaring khusus untuk PITS sebagai aplikasi pemerintah (banyak tren seperti Y2K color, 3D/AR, glassmorphism dekoratif, bento grid EKSPLISIT direkomendasikan dihindari karena merusak kredibilitas). Kesimpulan bareng user: PITS bukan "jadul", tapi "terlalu utilitarian" — kurang di hierarki visual, ritme layout, motion, dan depth, bukan di palet/tipografi/struktur yang sudah solid.
  - **Motion system diimplementasikan** sesuai prioritas ROI tertinggi dari user: hover-lift (150ms) hanya di elemen clickable (card record mobile), slide-in 200ms untuk `RecordDetailDrawer` + drawer mobile navbar (pakai varian `starting:` Tailwind v4 / `@starting-style`, CSS murni), FAQ accordion diganti dari native `<details>` (instan) jadi `<button aria-expanded>` + trik `grid-template-rows` (animasi 200ms, tetap accessible) — sudah diverifikasi bekerja di browser.
  - **Depth terbatas untuk overlay**: `shadow-2xl` ditambahkan HANYA ke `RecordDetailDrawer` dan drawer mobile navbar (satu-satunya elemen dengan shadow di seluruh app) — prinsip border-only untuk card biasa dipertahankan sesuai keinginan user.
  - **Border radius hierarki**: card besar (`OperationCard`, stat tile, step card, FAQ box, tabel wrapper, dll) `rounded-xl` → `rounded-2xl`; elemen kecil tetap radius lebih kecil.
  - **Progressive disclosure Dashboard**: `StatusSummary` baru di `DashboardView.tsx` — ringkasan "Semua N dokumen tercatat on-chain" ditampilkan SEBELUM stat card detail, sesuai pola dashboard SaaS 2026 (jawaban singkat dulu, breakdown belakangan).
  - Dokumentasi disinkronkan menyeluruh: `design-system.md` (§7 Layout System dirombak, §8 Motion System baru, §9 backlog diperbarui), `architecture/system-overview.md` (navbar, FAQ, Dashboard, PageContainer, EmptyState), `ONBOARDING.md` (aturan card+shadow+motion+PageContainer), `referensi/coding-standards.md` (aturan sama), `_docs/README.md` (link riset baru), `tasks/tasks.md`.
- **Blocker / butuh keputusan dari Ersa**: tidak ada.
- **Next steps**: backlog baru dari riset tren (#19 audit ritme layout & whitespace, #20 audit dark mode mandiri, #21 diferensiasi Upload vs Verify) — semua sengaja ditunda, butuh sesi tersendiri. Backlog lama masih terbuka: #2b (validasi server), #3 (cleanup test), #16 (quick-action Verifikasi di Dashboard).

---

## [2026-08-01 18:00] — Claude Code

- **Progress**: Navbar direstrukturisasi ("Layanan Dokumen" jadi menu utama), type scale diaudit dan direvisi 2x (termasuk ditemukan bug CSS global kritis), lalu review desain menyeluruh (skor 9/10-an dari user) diikuti perbaikan layout & mobile responsiveness — semua sudah diverifikasi visual di browser (desktop & mobile 375px). Akan di-commit ke branch baru (bukan `main`), tidak di-push.
- **Selesai sesi ini**:
  - **Navbar direstrukturisasi**: dari 2 baris (Dashboard di baris identitas + baris menu selalu tampil) jadi 1 baris utama ("Layanan Dokumen" sejajar Dashboard/Bahasa/Keluar) + sub-nav Registrasi/Verifikasi yang hanya tampil di section dokumen.
  - **Type scale diaudit & direvisi 2 kali**: revisi pertama menghapus level 24px (`text-2xl`) yang terlanjur dipakai untuk 3 peran berbeda, menambah level `text-lg` (Subsection); revisi kedua memadatkan seluruh scale turun 1 step (H1 36px→30px, Section 30px→20px, dst) setelah user menilai skala pertama masih kegedean untuk aplikasi enterprise/internal.
  - **Bug kritis ditemukan & diperbaiki**: rule global `h2 { font-size: 2rem }` dan `h4 { font-size: 1.25rem }` di `globals.css`, ditulis di luar `@layer` sehingga mengalahkan SEMUA class `text-*` Tailwind di elemen `<h2>`/`<h4>` — baru ketahuan saat verifikasi visual mobile (computed style `text-lg` yang harusnya 18px ternyata 32px). Ini artinya beberapa perubahan type-scale di sesi sebelumnya (OperationCard, HowItWorks, FAQSection, DashboardView heading) sebenarnya tidak pernah terlihat efeknya sampai bug ini dihapus.
  - **Review desain menyeluruh** (relay dari ChatGPT, dinilai user 9-9.5/10 untuk design system/konsistensi, tapi 7/10 untuk mobile) diikuti implementasi sebagian besar rekomendasi:
    - Hero Verify/Register disederhanakan: avatar ikon lingkaran besar dihapus, padding dipadatkan (`py-12`→`py-8 sm:py-10`), H1 lebih kecil di mobile (`text-2xl sm:text-3xl`).
    - Navbar mobile: dari kompresi ikon-only jadi hamburger + drawer (Dashboard, grup Layanan Dokumen, bahasa, sign in/out).
    - `RecordDetailDrawer`: drawer kanan di ≥sm, bottom sheet (drag-handle, `rounded-t-2xl`, `max-h-[85vh]`) di <sm.
    - `Dropzone`: teks "Seret & Lepas/atau" disembunyikan di mobile (drag-and-drop tidak relevan di touch), hanya sisakan "Klik untuk Pilih File".
    - Tombol submit `FileUpload`: sticky di bawah viewport pada mobile.
    - `EmptyState` diekstrak jadi komponen reusable (`components/common/EmptyState.tsx`), dipakai di `RecordsTable`.
    - Focus state global (`*:focus-visible`, ring primary 2px) ditambah — sebelumnya tidak eksplisit.
    - Padding halaman jadi responsif (`px-4 sm:px-6 lg:px-8`) di Verify/Register/Dashboard.
    - Ternyata mobile card table di `RecordsTable`, grid responsif `StatsCards`, dan skeleton loading (`app/dashboard/loading.tsx`) **sudah** diimplementasikan di sesi sebelumnya tapi belum tercatat di `design-system.md` — dokumentasi disinkronkan.
  - Type-check (`tsc --noEmit`) dan lint (`oxlint`) bersih untuk semua file yang diubah.
  - `design-system.md` ditambah §7 (Breakpoint & Layout) dan §8 (Backlog Desain — item yang sengaja belum dikerjakan).
- **Blocker / butuh keputusan dari Ersa**: tidak ada — user sudah minta commit langsung ke branch baru.
- **Next steps**: lanjutkan backlog `tasks.md` #15–18 (animasi drawer/accordion, quick-action Verifikasi di Dashboard, komponen generik tambahan, border hierarchy) kalau relevan; lanjutkan juga backlog lama #2b (validasi server) dan #3 (cleanup test) yang masih prioritas tinggi.

---

## [2026-08-01 12:00] — Claude Code

- **Progress**: Redesain UI penuh (Verify/Register/Dashboard/Result/Navbar) + sistem i18n penuh + rebrand warna ke identitas BRIN asli — sudah selesai dan diverifikasi manual di browser (light & dark mode, ID & EN). Belum di-commit.
- **Selesai sesi ini**:
  - **Redesain UI menyeluruh** berdasar dua putaran review UX (relay dari ChatGPT): hero Verify/Register diseragamkan ukuran & style; copywriting "hash" → "sidik jari digital" di teks publik; metadata file 2-kolom + tombol copy; notice sebelum submit diubah dari gaya warning (kuning) ke info (biru); Dashboard direstrukturisasi total — dari 1 hero besar + 3 card kecil menjadi 4 stat tile setara, toolbar menyatu dengan tabel dalam satu card, modal detail diganti drawer kanan.
  - **Navbar direstrukturisasi**: Dashboard dipindah ke baris identitas (sebelah tombol Keluar), dipisah dari menu dokumen karena sebelumnya "seolah-olah beda platform". Menu Registrasi/Verifikasi diberi label grup **"Layanan Dokumen"**. Tab aktif diperkuat (border 3px + background tint) setelah feedback "jelek" pada versi underline tipis.
  - **Sistem i18n penuh (ID/EN), fungsional bukan placeholder**: dibangun dari nol — `lib/i18n/translations.ts` (kamus terpusat), `lib/i18n/LocaleContext.tsx` (`LocaleProvider` + `useLocale()`, persist ke `localStorage`), `LanguageSwitcher.tsx` di navbar. Seluruh teks UI (termasuk pesan error upload, format tanggal, pagination) dipindah dari hardcode ke kamus. Pola khusus untuk Server Component (Dashboard) yang tidak bisa akses `localStorage`: kirim kode error, terjemahkan di client component kecil (`DashboardErrorAlert.tsx`).
  - **Rebrand warna ke merah BRIN asli**: sempat rebrand ke biru institusional berdasar asumsi keliru, lalu dicek langsung ke brin.go.id (color-frequency analysis via browser) — ternyata warna identitas BRIN yang sebenarnya adalah merah `#E62F2A` + navy-teal `#17384C`. Palet final diganti total ke warna ini (`styles/globals.css`), `error` token dibuat sengaja lebih gelap (`#991B1B`) untuk dibedakan dari `primary`.
  - **Pagination diperbaiki** (feedback "jelek"): pola `.join` dengan fake button-span dihapus, diganti dua tombol persegi ghost mengapit label teks polos.
  - **Dead code dihapus**: `components/features/` dan `components/ui/` (15 file, sudah divergen, jadi sumber error `tsc`) — dihapus setelah dikonfirmasi via grep tidak ada referensi eksternal.
  - **Dokumentasi diperbarui menyeluruh**: `_docs/tasks/tasks.md`, `_docs/architecture/system-overview.md`, `_docs/referensi/coding-standards.md` (section i18n baru), `_docs/design/design-system.md` (warna, komponen, layout, changelog), `CLAUDE.md` (root) — semua disinkronkan dengan state kode saat ini.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan sesi ini (kode + dokumentasi).
  - Kontras `primary` (merah) vs `error` (merah tua) belum diaudit aksesibilitas formal — lihat `tasks/tasks.md` #14.
- **Next steps**:
  - Setelah dapat konfirmasi, commit seluruh perubahan (tanpa co-author Claude).
  - Update `ONBOARDING.md` supaya sinkron dengan state terbaru (beberapa "known issue" yang disebut di situ — duplikasi component tree, tidak ada validasi upload — sudah tidak berlaku lagi/berubah statusnya).
  - Lanjutkan backlog terbuka: validasi server-side (#2b), cleanup test (#3), CI (#4), dan item baru dari sesi ini (server-side pagination #12, type scale #13, contrast review #14).

---

## [2026-08-01 00:00] — Claude Code

- **Progress**: Handoff dokumentasi selesai — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Dibuat `ONBOARDING.md` (root) untuk developer yang akan melanjutkan project: setup cepat, hal-hal kritis (component tree terduplikasi, route verify orphan, gap validasi upload, setup test membingungkan), prioritas kerja.
  - `_docs/README.md` diupdate — tambah link ke `ONBOARDING.md` di navigasi cepat.
  - Aturan baru (global, semua project): commit git tidak lagi menyertakan trailer `Co-Authored-By: Claude` — supaya riwayat commit tidak menampilkan atribusi AI di GitHub.
- **Blocker / butuh keputusan dari Ersa**:
  - Belum di-commit/push atas permintaan eksplisit — menunggu konfirmasi sebelum commit pertama untuk seluruh perubahan dokumentasi (`CLAUDE.md`, `_docs/`, `ONBOARDING.md`).
- **Next steps**:
  - Setelah dapat konfirmasi, commit dokumentasi ini (tanpa co-author Claude) sebelum mulai kerjakan backlog di `tasks/tasks.md`.

---

## [2026-07-31 00:00] — Claude Code

- **Progress**: Dokumentasi baseline `_docs/` selesai dibuat (retroaktif) — belum ada perubahan kode.
- **Selesai sesi ini**:
  - Audit menyeluruh codebase (`_docs/audit/audit-2026-07-31.md`) — 12 temuan, termasuk 3 High (component tree duplikat, tidak ada validasi upload, setup test bermasalah).
  - Scaffolding `_docs/` lengkap: CLAUDE.md, BRD, SRS (Publisher Portal + Verification Portal + NFR), 1 ADR (NextAuth + Keycloak), architecture overview, coding standards, Definition of Ready/Done, AI review checklist.
  - Backlog awal (`tasks/tasks.md`) diisi dari temuan audit, diurutkan prioritas.
- **Blocker / butuh keputusan dari Ersa**:
  - Keputusan arsitektur: hapus `components/features/`+`components/ui/` (dead code) atau selesaikan migrasi — butuh keputusan sebelum siapa pun mengedit area component lebih jauh.
  - Keputusan produk: nasib route `/verify` placeholder.
- **Next steps**:
  - Mulai kerjakan backlog dari prioritas tertinggi (task #1–#3 di `tasks/tasks.md`).

---

<!-- Entry lama di bawah sini, urut dari terbaru ke terlama -->
