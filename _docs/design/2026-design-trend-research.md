# Riset Tren Desain 2026 — Relevansinya untuk PITS

**Tanggal:** 2026-08-01
**Konteks:** User merasa UI PITS masih terasa "jadul", bukan desain-desain terbaru. Dokumen ini merangkum riset tren UI/UX 2026 dari web, lalu menyaring mana yang benar-benar cocok untuk PITS — aplikasi verifikasi dokumen **pemerintah** (BRIN) yang butuh kredibilitas/trust, bukan aplikasi marketing/konsumer.

**Peringatan penting di depan**: beberapa tren 2026 yang paling "eye-catching" (warna Y2K mencolok, elemen 3D/AR, bento grid ala landing page) justru **kontraproduktif** untuk aplikasi trust/pemerintah — bisa membuat PITS terkesan kurang serius, bukan lebih modern. Riset ini secara sengaja memisahkan "tren yang layak diikuti" vs "tren yang harus dihindari" untuk konteks PITS.

---

## 1. Tren 2026 secara Umum (Web/UI Konsumer)

Sumber: [Envato Elements](https://elements.excite.com/learn/ux-ui-design-trends), [Lyssna](https://www.lyssna.com/blog/ux-design-trends/), [Tubik Studio](https://tubikstudio.com/blog/ui-design-trends-2026/), [UX Collective](https://uxdesign.cc/the-most-popular-experience-design-trends-of-2026-3ca85c8a3e3d), [Figma](https://www.figma.com/resource-library/web-design-trends/)

- **Calm, simplified interfaces** — mengurangi cognitive load, membuang dekorasi yang tidak perlu, alur yang tenang.
- **AI sebagai "copilot" bukan "autopilot"** — AI hadir opsional, minta izin dulu sebelum bertindak (tidak relevan untuk PITS — belum ada fitur AI).
- **Crafted, personality-driven design** — motion yang menjelaskan, tipografi yang "bernapas" (banyak whitespace, ukuran bervariasi jelas).
- **Warna cerah & nostalgia Y2K, "dopamine design"** — palet saturasi tinggi, pola retro.
- **3D/AR immersive** — WebGL, model interaktif, animasi scroll-triggered.
- **Sustainability** — kode ringan, gambar teroptimasi.

## 2. Tren Dashboard/SaaS Enterprise 2026 (paling relevan untuk PITS)

Sumber: [SaaSFrame](https://www.saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns), [SaaS UI Design](https://www.saasui.design/blog/7-saas-ui-design-trends-2026), [Mantlr — Stripe/Linear/Vercel](https://mantlr.com/blog/stripe-linear-vercel-premium-ui)

- **AI-native surfaces** — ringkasan/insight AI sebagai bagian utama UI (tidak relevan untuk PITS saat ini).
- **Role-based personalization** — UI beda bukan cuma soal permission, tapi pengalaman berbeda sesuai peran (relevan: publisher vs pengunjung publik di PITS sudah beda halaman, tapi bisa diperdalam).
- **Modular/configurable interface** — widget bisa diatur ulang drag-and-drop, filter global.
- **Progressive disclosure** — tampilkan SATU metrik "apakah semuanya baik-baik saja" dulu, baru drill-down ke detail.
- **Dark-first design** — aplikasi yang dipakai seharian didesain dark mode dulu, baru light mode.
- **Data tables lebih diutamakan daripada chart** — Stripe & Linear pakai tabel terstruktur, chart hanya kalau tren benar-benar butuh bentuk visual (**PITS sudah begini** — dashboard tabel dokumen tanpa chart-chart hiasan. Ini justru sudah SESUAI tren 2026, bukan "jadul").
- **User confidence over feature breadth** — desain fokus bikin user yakin, bukan menumpuk fitur.

## 3. Bento Grid & Glassmorphism (evolusi 2026)

Sumber: [Line25](https://line25.com/articles/web-design-trends-2026/), [Gezar](https://gezar.dk/en/blog/web-design-trends-2026), [RageDesigner](https://ragedesigner.com/2026-design-trends)

- **Bento grid**: layout modular ala "kotak bento" Jepang, dipopulerkan Apple — kotak-kotak dengan ukuran bervariasi, sudut membulat ekstra, micro-interaction di tiap kotak.
- **Glassmorphism 2026**: bukan lagi kaca buram dekoratif seperti 2021 — sekarang "layered translucency" dipakai SENGAJA untuk bikin hierarki kedalaman (elemen mana di atas mana), paling efektif di dark mode.

## 4. Standar Desain Pemerintah (paling relevan secara konteks)

Sumber: [GOV.UK Design System](https://digitalgovernmenthub.org/examples/gov-uk-design-system/), [USWDS](https://designsystem.digital.gov/), [GDS Blog — Juli 2026](https://gds.blog.gov.uk/2026/07/02/evolving-the-service-standard-for-the-future-of-public-services/)

Design system pemerintah terkemuka (GOV.UK, USWDS) di 2026 **tidak** mengejar tren visual musiman — fokusnya tetap: aksesibilitas (WCAG), konsistensi lintas layanan, mobile-friendly, dan kejelasan bahasa. "Modern" untuk aplikasi pemerintah berarti **cepat, jelas, dan bisa diakses semua orang** — bukan efek visual yang mencolok.

---

## 5. Apa yang Membuat PITS Terasa "Jadul" — Analisis

Membandingkan PITS saat ini dengan tren di atas, kemungkinan sumber kesan "jadul":

| Elemen PITS saat ini | Kesan | Tren 2026 pembanding |
|---|---|---|
| Card border-only, flat, tanpa depth sama sekali | Datar, kurang "hidup" | Layered translucency (glassmorphism evolusi) dipakai TERBATAS untuk hierarki kedalaman, bukan flat 100% |
| Tidak ada motion/animasi masuk sama sekali (drawer, accordion muncul instan) | Terasa kaku, statis | "Crafted design" — motion yang menjelaskan transisi, bukan instan |
| Dark mode ada tapi dibangun sebagai varian dari light mode (light-first) | Dark mode terasa "tempelan" | Dark-first design — dark mode dirancang duluan lalu diturunkan ke light |
| Warna cuma 2 aksen (merah + navy), dipakai flat di mana-mana | Monoton | Bukan berarti harus warna-warni Y2K (TIDAK cocok untuk PITS) — tapi variasi *shade*/tint dari 2 warna yang ada bisa dieksplorasi lebih |
| Tidak ada progressive disclosure di Dashboard — semua stat + tabel langsung tampil rata | Terasa seperti "form generator" bukan produk yang dirancang | Progressive disclosure: satu ringkasan status dulu, baru detail |
| Border radius kecil-sedang, seragam semua elemen | Kurang "tactile" | Sudut membulat lebih besar + variasi (dipakai bento grid 2026) bikin terasa lebih lembut/modern |

## 6. Rekomendasi — Disaring untuk Konteks PITS

### ✅ Layak diadopsi (cocok untuk aplikasi trust/pemerintah)

| Rekomendasi | Kenapa cocok untuk PITS |
|---|---|
| **Motion/transisi halus** untuk drawer (slide 250ms), accordion FAQ (200ms), hover card (lift tipis + shadow lembut saat hover) | Sudah jadi item backlog (#15) — riset ini memperkuat alasannya: motion adalah salah satu penanda paling jelas "modern vs jadul", risiko rendah, tidak mengubah identitas visual |
| **Depth terbatas & sengaja** — bukan flat 100%, tapi subtle shadow/translucency di elemen yang benar-benar perlu terasa "di atas" (drawer, dropdown, modal) — BUKAN di semua card | Selaras dengan prinsip "border-only" yang sudah ada, hanya menambah 1 tingkat depth untuk elemen overlay, bukan mengubah seluruh sistem card |
| **Progressive disclosure di Dashboard** — 1 ringkasan status paling atas ("4 dokumen terdaftar, semua on-chain, tidak ada isu") sebelum stat card detail | Sesuai temuan riset SaaS 2026 paling relevan; juga menjawab kritik "dashboard terasa seperti form generator" |
| **Border radius sedikit lebih besar + variasi** (`rounded-xl` → `rounded-2xl` di card besar, radius lebih kecil di elemen kecil) | Perubahan kecil, dampak visual langsung terasa "lebih lunak/modern" tanpa mengubah struktur |
| **Dark mode dirancang lebih serius** (bukan cuma invert warna) — cek ulang kontras & depth khusus dark mode | Selaras "dark-first" trend, sudah ada infrastruktur (2 tema daisyUI), tinggal diperhalus |
| **Aksesibilitas & kejelasan bahasa** (fokus GOV.UK/USWDS) | Sudah sebagian dikerjakan (focus state global), tapi ini yang paling penting untuk aplikasi pemerintah — bukan visual "wah" |

### ⚠️ Layak dipertimbangkan, tapi ada trade-off

| Rekomendasi | Trade-off |
|---|---|
| **Bento grid untuk Dashboard stat card** (ukuran kotak bervariasi, bukan seragam) | Bertentangan dengan prinsip lama "dashboard = workspace, stats sengaja TIDAK dominan" (`StatsCards.tsx` komentar eksplisit). Kalau mau bento, berarti mengubah filosofi itu |
| **Role-based personalization lebih dalam** (misal: publisher yang sering upload dapat shortcut khusus) | Butuh data usage nyata untuk tahu personalisasi apa yang berguna — spekulatif tanpa itu |

### ❌ Sebaiknya dihindari untuk PITS

| Tren | Kenapa TIDAK cocok |
|---|---|
| Warna cerah/Y2K, "dopamine design" | PITS adalah sistem verifikasi dokumen resmi pemerintah — warna playful merusak kesan kredibel/trust |
| 3D/AR immersive, WebGL | Overkill, menambah beban performa, tidak ada kebutuhan konten 3D di PITS |
| AI sebagai fitur utama UI | PITS tidak (belum) punya fitur AI — memaksakan ini jadi fitur-mengejar-tren, bukan kebutuhan nyata |
| Glassmorphism dekoratif berlebihan (frosted glass di semua card) | Riset sendiri bilang versi 2026 dipakai TERBATAS untuk hierarki, bukan dekorasi massal — kalau diterapkan ke semua card, PITS jadi tren-2021 bukan tren-2026 |

---

## 7. Pertanyaan untuk Diputuskan

1. Mau mulai dari yang mana? Saran urutan: (1) motion/transisi [risiko rendah, dampak langsung terlihat], (2) depth terbatas di overlay (drawer/dropdown), (3) progressive disclosure Dashboard, (4) border radius, (5) dark mode audit.
2. Untuk "depth terbatas" — oke ditambahkan HANYA di drawer/dropdown/modal (bukan di card biasa), supaya tidak bertentangan dengan prinsip border-only yang sudah mapan?
3. Untuk Dashboard progressive disclosure — ringkasan status di paling atas itu bentuknya kalimat singkat ("Semua 4 dokumen berhasil tercatat on-chain, tidak ada isu.") atau tetap dalam bentuk card kecil?
4. Bento grid stat card — mau dipertahankan filosofi lama (stats sengaja kecil/tidak dominan), atau mau direvisi ikut tren bento?

## 8. Cara Pakai Dokumen Ini

Bawa §5–§7 ke ChatGPT atau diskusikan langsung di sini untuk memutuskan prioritas & detail implementasi, lalu balik ke saya untuk diterapkan — sama seperti pola audit type-scale dan layout sebelumnya.
