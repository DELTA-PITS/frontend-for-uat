# Audit: Custom Keycloak Login Theme (PITS)

**Tanggal:** 2026-09-07
**Konteks:** Halaman login default Keycloak (dark polygon background, judul realm mentah "nextjs-kc") diminta di-redesain supaya konsisten dengan design system aplikasi PITS (Next.js + daisyUI, warna merah BRIN). Dikerjakan sebagai custom Keycloak theme (CSS-only, tanpa override template FTL), di-deploy ke server production, dan diiterasi berdasarkan feedback visual langsung.

Dokumen ini dibuat untuk direview pihak lain (ChatGPT) — isinya keputusan desain, kode CSS final, dan terutama **pitfall teknis Keycloak/PatternFly yang tidak jelas dari luar** dan sempat bikin beberapa iterasi salah sebelum ketemu akar masalahnya.

---

## Update — Round 2 (setelah review ChatGPT)

Review ChatGPT atas dokumen ini akurat: fondasi CSS sudah benar, tapi **fix Google button sebelumnya (§4.4 versi awal) ternyata tidak benar-benar menghilangkan warna merah** — cuma menyamarkan gejalanya. Border merah yang terus-menerus terlihat berasal dari sumber yang sama sekali berbeda dari yang dikira sebelumnya.

**Root cause sebenarnya:** PatternFly v5 button TIDAK menggambar border lewat properti `border` milik elemen — border digambar lewat **pseudo-element `::after`** terpisah, warnanya dikontrol CSS custom property `--pf-v5-c-button--m-secondary--after--BorderColor`, yang defaultnya `var(--pf-v5-global--primary-color--100)`. Override `border-color: #dadce0 !important` pada elemen itu sendiri (yang dilakukan Round 1) **tidak berpengaruh sama sekali** ke pseudo-element ini — makanya border merah selalu kembali meski `getComputedStyle(btn).borderColor` sempat terlihat benar (itu mengecek properti elemen, bukan pseudo-element yang benar-benar dirender).

Fix yang benar: override variable-nya langsung (lihat §3 CSS final, bagian `.pf-v5-c-button.pf-m-secondary`), untuk state default + hover + focus + active.

**Pelajaran tambahan:** kalau `getComputedStyle(el).properti` terlihat "benar" tapi visual tetap salah, cek pseudo-element-nya juga: `getComputedStyle(el, '::before')` / `getComputedStyle(el, '::after')`. PatternFly v5 banyak memakai teknik ini (border, focus ring, hover state) lewat pseudo-element, bukan properti langsung.

**Perubahan lain di Round 2** (detail lengkap ada di CSS §3, sudah termasuk versi terbaru):
- Unified control system: input/Sign In/Google sekarang eksplisit `height: 44px`, radius `0.6rem`, font `0.875rem` (14px) — sebelumnya tersebar/tidak konsisten antar komponen.
- Border input diubah dari gaya "underline focus" (PatternFly default, cuma border-bawah yang berubah warna saat fokus) jadi full box border 4 sisi, konsisten dengan tombol.
- Native browser focus outline pada `<input>` dimatikan (`outline: none`) karena dobel dengan custom focus border kita — sebelumnya kelihatan 2 cincin (oranye dari browser + merah dari kita).
- Label form dari uppercase+letter-spacing jadi sentence-case biasa.
- Shadow card diperhalus (dari `0 20px 50px` jadi `0 4px 16px`, opacity diturunkan).
- Divider "Or sign in with" tetap dihapus (sesuai keputusan sebelumnya, tidak dikembalikan).
- Disclaimer dipersingkat jadi 2 kalimat.
- Vertical rhythm form diberi jarak eksplisit antar field group.

**Diverifikasi ulang** (computed style, bukan visual saja) di 1280×900, 1440×900, 390×844, 360×800 — semua fit tanpa scroll horizontal, Sign In & Google sekarang identik: height 44px, radius 9.6px, computed border Google `1px solid rgb(209,213,219)` (bukan merah). Login flow end-to-end (submit form → session valid → dashboard load) dikonfirmasi tidak regresi.

---

## 1. Arsitektur

- **Mekanisme:** Keycloak custom theme (`parent=keycloak.v2`, cuma override `login/resources/css/styles.css` + 1 file logo). Tidak menyentuh template `.ftl` sama sekali — semua perubahan visual murni CSS.
- **Lokasi di server** (bukan di repo git — ini infra Keycloak, terpisah dari codebase Next.js):
  ```
  /home/hamka/pits/backend-for-uat/docker/themes/pits/login/
    theme.properties
    resources/css/styles.css
    resources/img/logo.png
  ```
- **Deploy:** Volume-mount ke container Keycloak (`docker-compose.yml`: `./themes/pits:/opt/keycloak/themes/pits:ro`), lalu `docker compose up -d --force-recreate keycloak` supaya Keycloak scan ulang folder theme dari disk.
- **Aktivasi:** Realm `nextjs-kc` di-set `loginTheme: "pits"` + `displayName: "PITS · Badan Riset dan Inovasi Nasional"` via Keycloak Admin REST API.
- **Stack rendering:** Keycloak 26.6.2, theme `keycloak.v2` (bukan legacy), berbasis **PatternFly v5** (class `pf-v5-c-*`).

## 2. Token desain (disamakan dengan app)

Sumber: `styles/globals.css` (daisyUI theme "light") di repo `frontend-for-uat`.

| Token | Value | Dipakai untuk |
|---|---|---|
| `--color-primary` (brand red BRIN) | `#E62F2A` | Tombol Sign In, border-radius, accent |
| `--color-primary` dark variant | `#A8211D` | Hover/active state tombol primary |
| `--color-secondary` (navy) | `#17384C` | Judul, badge logo, teks header |
| Font heading | Plus Jakarta Sans (600/700) | `<h1>` "Sign in to your account" |
| Font body | Inter (400/500/600) | Semua teks lain, input |
| Border radius | `0.5–0.6rem` (form/button), `1.25rem` (card) | Konsisten dengan `--radius-field`/`--radius-box` app |

Font di-load via Google Fonts `@import` (bukan self-host seperti di Next.js app) — karena custom theme Keycloak tidak punya build step untuk `next/font/google`.

## 3. CSS final lengkap

```css
/* Custom "styles" in theme.properties REPLACES the parent theme's list
   entirely rather than appending to it — pull keycloak.v2's own base
   stylesheet back in first, then layer our overrides on top of it.
   DO NOT REMOVE — see _docs/design/keycloak-login-theme-audit.md §4.1. */
@import url('../../keycloak.v2/css/styles.css');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap');

:root {
  --keycloak-bg-logo-url: none;
  --keycloak-card-top-color: transparent;

  --pf-v5-global--primary-color--100: #E62F2A;
  --pf-v5-global--primary-color--200: #A8211D;
  --pf-v5-global--primary-color--300: #E62F2A;
  --pf-v5-global--primary-color--400: #ffffff;
  --pf-v5-global--primary-color--light-100: #E62F2A;
  --pf-v5-global--primary-color--dark-100: #A8211D;

  --pf-v5-global--FontFamily--sans-serif: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

html,
body,
.login-pf body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

body,
.login-pf body {
  background: #fafbfc !important;
  position: relative;
}

/* Soft blurred brand-color blobs behind the card — tinted with the app's
   brand red/navy. Fixed + behind everything (z-index -1) so it can never
   overlap or push page content around. */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(600px circle at 80% 15%, rgba(230, 47, 42, 0.14), transparent 60%),
    radial-gradient(500px circle at 10% 85%, rgba(23, 56, 76, 0.1), transparent 60%);
  filter: blur(40px);
}

/* Base PatternFly sets .pf-v5-c-login to min-height:100vh so the login
   panel is vertically centered in the viewport — with our disclaimer
   appended after it, that forces at least one full viewport of height
   before the disclaimer can even start, guaranteeing a scroll. Let the
   page size to its actual content instead.
   DO NOT REMOVE — see _docs/design/keycloak-login-theme-audit.md §4.2. */
.pf-v5-c-login {
  min-height: auto !important;
  padding-block: 1rem !important;
}

.pf-v5-c-login__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.pf-v5-c-login__header::before {
  content: "";
  display: block;
  width: 48px;
  height: 48px;
  border-radius: 0.85rem;
  background: #17384C url('../img/logo.png') no-repeat center center;
  background-size: 30px 30px;
  margin-bottom: 0.6rem;
  box-shadow: 0 4px 10px rgba(23, 56, 76, 0.16);
}

#kc-header-wrapper {
  color: #17384C !important;
  text-transform: none;
  letter-spacing: normal;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
}

/* Padding used to be split across 3 PatternFly-defined zones (header/
   body/footer), each with its own independent top/side/bottom values —
   that's what made the card feel uneven. Zero out the zones' own padding
   and control all spacing from this one rule instead. Shadow kept soft/
   flat rather than a floating-modal look. */
.pf-v5-c-login__main {
  background: #ffffff;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(23, 56, 76, 0.08);
  border: 1px solid rgba(23, 56, 76, 0.06);
  padding: 2rem;
}

.pf-v5-c-login__main-header,
.pf-v5-c-login__main-body {
  padding: 0 !important;
  background: #ffffff;
}

.pf-v5-c-login__main-header {
  text-align: center;
  padding-bottom: 1.5rem !important;
}

/* Vertical rhythm inside the form: consistent gap between field groups,
   and a clear break before the primary action and the social-login tier. */
.pf-v5-c-form__group + .pf-v5-c-form__group {
  margin-top: 1.25rem;
}

.pf-v5-c-form__group:has(+ .pf-v5-c-form__actions) {
  margin-bottom: 1.5rem;
}

.pf-v5-c-login__main-footer-band:first-child {
  margin-top: 1.5rem !important;
}

/* The "Or sign in with" divider line — remove it, the spacing alone
   already separates the password form from the social-login button.
   DO NOT bring this border back — see audit §4.6. */
.pf-v5-c-login__main-footer-band {
  border-top: none !important;
  padding-bottom: 1rem !important;
}

.pf-v5-c-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  color: #17384C;
  font-size: 1.35rem;
}

/* Labels: plain sentence case, not the uppercase enterprise-legacy look. */
.pf-v5-c-form__label-text {
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
  color: #374151;
}

/* ===== Unified control system =====
   Email input / password input / Sign In / Google all share one height,
   radius, and type scale so they read as one component family instead of
   independently-styled elements. */
.pf-v5-c-form-control,
.pf-v5-c-button {
  border-radius: 0.6rem !important;
}

.pf-v5-c-form-control {
  height: 44px;
  background: #fff;
}

/* PatternFly's text input renders its border as two stacked pseudo-
   elements: ::before draws the top/left/right edge, ::after draws only a
   bottom "underline" that changes color on focus (Material-style). We
   want a plain full-perimeter box instead, consistent with the buttons —
   so give ::before all 4 sides and turn ::after's border off. */
.pf-v5-c-form-control::before {
  border-width: 1px !important;
  border-color: #D1D5DB !important;
  border-radius: 0.6rem !important;
}

.pf-v5-c-form-control::after {
  border-width: 0 !important;
}

.pf-v5-c-form-control:focus-within::before {
  border-color: #E62F2A !important;
  border-width: 1.5px !important;
}

.pf-v5-c-form-control input {
  padding-left: 14px;
  font-size: 0.875rem;
}

/* The browser's native focus outline on the raw <input> would otherwise
   double up with the focus border above (visible as two stacked rings,
   one often an amber/orange UA default) — our :focus-within border on
   the wrapping span is the intended visible focus indicator. */
.pf-v5-c-form-control input:focus {
  outline: none;
}

.pf-v5-c-button.pf-m-primary,
.pf-v5-c-button.pf-m-secondary {
  height: 44px;
  padding: 0 16px;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Google button: the visible border here is NOT the element's own
   `border` property — PatternFly renders it via a ::after pseudo-element
   whose color is driven by --pf-v5-c-button--m-secondary--after--BorderColor,
   which by default equals --pf-v5-global--primary-color--100. Since that
   variable was repointed to brand red above (for the Sign In button), the
   Google button's border silently inherited red too. Overriding the
   element's own `border-color` (as a previous pass did) has no effect on
   this pseudo-element — the CSS custom property itself must be
   overridden, for the default state and every interaction state. */
.pf-v5-c-button.pf-m-secondary {
  --pf-v5-c-button--m-secondary--after--BorderColor: #D1D5DB;
  --pf-v5-c-button--m-secondary--hover--after--BorderColor: #9CA3AF;
  --pf-v5-c-button--m-secondary--focus--after--BorderColor: #9CA3AF;
  --pf-v5-c-button--m-secondary--active--after--BorderColor: #9CA3AF;
  color: #374151 !important;
  background-color: #ffffff !important;
}

.pf-v5-c-button.pf-m-secondary:hover {
  background-color: #F9FAFB !important;
}

/* The Google button's icon + label default to justify-content:space-between
   (icon pinned left, label pushed right by its own margin:auto) — group
   them as a centered unit instead, matching standard Google button design. */
#social-google {
  justify-content: center !important;
  gap: 0.6rem;
}

#social-google .pf-v5-u-m-auto {
  margin: 0 !important;
}

#social-google svg.google {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Research-transparency disclaimer — this app runs on Keycloak as its
   identity provider; state that plainly since the deployment is used for
   research and the underlying system needs to be documented for readers.
   Normal document flow (not fixed) so it never overlaps the card — it
   just sits below it. Kept as generated CSS content for now (see audit
   §6 open question re: accessibility/semantics of this approach). */
body::after {
  content: "Sistem autentikasi PITS menggunakan Keycloak. Aplikasi ini dikembangkan untuk keperluan penelitian.";
  display: block;
  width: 100%;
  max-width: 26rem;
  margin: 1.5rem auto 0;
  padding: 0 1rem 1.25rem;
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.5;
  color: #6b7280;
}
```

### 3.1 `theme.properties`

```properties
parent=keycloak.v2
import=common/keycloak
styles=css/styles.css
```

## 4. Pitfall teknis yang ditemukan (PENTING — baca ini sebelum ubah CSS lagi)

Ini bagian paling berharga dari dokumen ini. Setiap poin di bawah sempat bikin 1 iterasi visual rusak sebelum ketemu akar masalahnya.

### 4.1 `theme.properties` `styles=` REPLACE, bukan APPEND
Custom theme dengan `parent=keycloak.v2` dan `styles=css/styles.css` **tidak** otomatis mewarisi stylesheet CSS milik parent — properti `styles` di-replace total. Akibatnya base CSS `keycloak.v2` (yang isinya penting: ukuran icon Google, `grid-template-areas` untuk layout header/main, dll) hilang total, bikin layout berantakan (card sempit, icon Google raksasa).

**Fix:** `@import` manual stylesheet parent di baris pertama CSS custom:
```css
@import url('../../keycloak.v2/css/styles.css');
```
Path relatif ini dihitung dari **URL yang di-serve**, bukan dari struktur folder disk — pola URL Keycloak: `/resources/{cache-key}/login/{theme}/css/{file}`, jadi dari `login/pits/css/` ke `login/keycloak.v2/css/` cuma butuh `../../keycloak.v2/css/...` (naik ke level `login/`, turun ke tema lain).

### 4.2 `.pf-v5-c-login` punya `min-height: 100vh` bawaan
Base PatternFly CSS set `.pf-v5-c-login { display:flex; min-height:100vh; align-items:center }` — dipakai untuk vertically-center card di layar. Ini **tidak kelihatan masalahnya sampai nambah elemen setelah card** (misal disclaimer footer via `body::after`): apapun konten setelah `.pf-v5-c-login`, otomatis butuh scroll karena div itu sendiri sudah minimal 100% tinggi viewport.

**Fix:** `min-height: auto !important;` pada `.pf-v5-c-login`, ganti dengan `padding-block` kecil untuk spacing.

### 4.3 Class yang sama muncul 2x di DOM dengan isi beda
`.pf-v5-c-login__main-footer` muncul **2 kali** di HTML (1 isi konten asli, 1 `<div>` kosong sisa template). Selector CSS berbasis class (`.pf-v5-c-login__main-footer::after`) kena ke KEDUANYA → teks disclaimer muncul dobel.

**Pelajaran:** kalau nambah konten via `::before`/`::after` pada elemen struktural Keycloak, **cek dulu jumlah elemen yang match** (`document.querySelectorAll(selector).length`) sebelum percaya class itu unik. Fix akhirnya: pindahkan ke elemen yang pasti tunggal (`body::after`, karena `<body>` selalu 1).

### 4.4 Override warna "primary" scale itu global, bukan cuma untuk 1 tombol
Override `--pf-v5-global--primary-color--100` (dkk) untuk mewarnai tombol "Sign In" jadi merah brand, **ikut kepakai** oleh tombol Google (`pf-m-secondary`) — border & teksnya ikut merah, padahal seharusnya abu-abu netral sesuai brand guideline Google.

**Fix:** override eksplisit `border-color`/`color` pada `.pf-v5-c-button.pf-m-secondary` setelah override warna global, supaya menang lewat urutan CSS + specificity yang sama (pakai `!important` untuk pasti menang atas variable chain).

### 4.5 Padding tersebar di 3 "zona" independen
PatternFly login card dibagi jadi `__main-header`, `__main-body`, `__main-footer`, masing-masing punya padding sendiri-sendiri dari variable berbeda (`--pf-v5-c-login__main-header--PaddingTop`, dst). Kalau cuma sebagian yang dikecilkan (misal cuma header top), hasilnya terasa "tidak seragam" karena sisi lain (kiri-kanan, body bottom) masih pakai default besar (48px).

**Fix:** reset padding SEMUA zona ke `0`, pindahkan kontrol spacing sepenuhnya ke 1 tempat (`.pf-v5-c-login__main { padding: 2rem }`), supaya konsisten di 4 sisi.

### 4.6 Garis divider "Or sign in with" bukan `<hr>`
Bukan elemen `<hr>` terpisah — itu `border-top` pada `.pf-v5-c-login__main-footer-band` (elemen yang juga membungkus teks "Or sign in with"). Cari `getComputedStyle(el).borderTop` untuk elemen di sekitar teks itu kalau mau menghilangkan/ubah garis serupa di halaman Keycloak lain.

### 4.7 Cache theme di sisi Keycloak (bukan cuma browser cache)
Setelah edit file CSS di disk, **request ke URL stylesheet lama kadang masih balikin isi lama** meski sudah diedit — perlu `docker compose up -d --force-recreate keycloak` (bukan cuma restart) supaya Keycloak baca ulang folder theme dari disk. Startup mode `start-dev` (dipakai di sini) seharusnya disable cache, tapi pengalaman langsung menunjukkan **recreate container tetap perlu** setiap kali file theme berubah.

### 4.8 Workflow yang terbukti efektif: uji-coba via `<style>` injeksi JS sebelum deploy
Karena setiap iterasi butuh: edit file → tar → scp ke server → extract → `docker compose up -d --force-recreate keycloak` → tunggu ~10 detik startup → refresh browser — siklusnya lambat (~30 detik/iterasi) dan gampang salah kalau nebak-nebak. Cara yang jauh lebih cepat: suntik `<style>` tag sementara lewat `document.head.appendChild()` di browser yang sudah terbuka, screenshot, ukur `getComputedStyle(...)`/`document.body.scrollHeight` buat verifikasi angka pasti (bukan cuma "kelihatannya udah bener") — baru kalau sudah pas, salin ke file CSS asli dan deploy sekali.

## 5. Status saat ini (2026-09-07)

Sudah live di production, terverifikasi (`document.body.scrollHeight === window.innerHeight` pada viewport 1280×900, tidak perlu scroll):

- ✅ Background blur merah/navy lembut (bukan biru generik)
- ✅ Card putih rounded, shadow halus, logo BRIN dalam badge rounded di atas
- ✅ Tombol "Sign In" merah brand, tombol Google netral (abu-abu, bukan ikut merah)
- ✅ Icon + teks Google dikelompokkan center (bukan `justify-content: space-between` bawaan)
- ✅ Padding card seragam 4 sisi (2rem)
- ✅ Garis divider "Or sign in with" dihapus
- ✅ Disclaimer riset ("menggunakan Keycloak... untuk keperluan penelitian") di bawah card, jarak cukup, tidak overlap
- ✅ Muat 1 layar penuh tanpa scroll di viewport standar (1280×900)

## 6. Pertanyaan untuk direview

1. Apakah pendekatan CSS-only (tanpa override `.ftl`) ini cukup maintainable jangka panjang, atau lebih baik override template langsung untuk kontrol lebih besar (misal ganti wording "Sign in to your account" jadi Bahasa Indonesia, tambah subtitle)?
2. Apakah ada risiko upgrade Keycloak versi berikutnya (>26.6.2) mengubah struktur class PatternFly (`pf-v5-*` → `pf-v6-*`?) yang bisa mematahkan seluruh custom CSS ini?
3. Disclaimer riset ditaruh sebagai CSS `content` property (`body::after`), bukan HTML asli — apakah ini masalah dari sisi aksesibilitas (screen reader) atau SEO/indexing? Perlu dipertimbangkan pindah ke override `.ftl` kalau iya.
4. Apakah warna kontras disclaimer (`#6b7280` di atas background gradient sangat terang) sudah cukup accessible (WCAG AA)?
