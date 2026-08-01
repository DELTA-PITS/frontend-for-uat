# Semua Teks UI — PITS Frontend (ID & EN)

Sumber: `lib/i18n/translations.ts`. Format: **Kunci** → 🇮🇩 Indonesia / 🇬🇧 English

> **Riwayat revisi:**
> - 2026-08-02 (ronde 1) — copy diperbarui menyeluruh berdasarkan audit UX writing (ChatGPT), 3 tingkat prioritas (Sangat disarankan + Disarankan + Opsional) diterapkan sekaligus. Termasuk fix konsistensi `registerHero.title` ("Registrasi Dokumen" → "Daftarkan Dokumen") supaya cocok dengan label nav "Daftarkan Dokumen".
> - 2026-08-02 (ronde 2, audit ulang dari nol) — polish lanjutan: **unifikasi terminologi "Publisher"** (hapus semua pemakaian "Penerbit"), dropzone kasih konteks file tipe ("Seret file PDF ke sini" / "Drag your PDF here"), beberapa kalimat dibuat lebih ringan (hindari kata birokratis seperti "diregistrasikan"→"didaftarkan" di beberapa tempat, "sebelumnya" yang redundant dihapus), Title Case konsisten untuk step titles bahasa Inggris.
>
> **Aturan konsistensi terminologi (berlaku permanen ke depan):**
> - **Hash** — jangan pernah kembali ke "sidik jari digital".
> - **Blockchain** — dipakai di teks user-facing; "on-chain" hanya untuk status/badge teknis (`table.onChain`), bukan kalimat naratif.
> - **Publisher** — nama role aplikasi, jangan diterjemahkan jadi "Penerbit" di teks Indonesia manapun.
> - **Record ID** — tidak diterjemahkan di kedua bahasa.

---

## Header (Navbar)

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| orgName | Badan Riset dan Inovasi Nasional | National Research and Innovation Agency |
| orgSubtitle | Platform Registrasi & Verifikasi Dokumen | Document Registration & Verification Platform |
| navGroupLabel | Layanan Dokumen | Document Services |
| navRegister | Daftarkan Dokumen | Register Document |
| navVerify | Verifikasi Dokumen | Verify Document |
| navDashboard | Dashboard | Dashboard |
| signIn | Masuk | Sign In |
| signOut | Keluar | Sign Out |
| openMenu | Buka menu | Open menu |
| closeMenu | Tutup menu | Close menu |
| language | Bahasa | Language |
| loggedOutMessage | Kamu berhasil keluar. | You have been signed out. |

## Verify Hero

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| badge | Akses Publik | Public Access |
| title | Verifikasi Dokumen Resmi | Verify an Official Document |
| subtitle | Pastikan dokumen yang Anda terima cocok dengan catatan resmi yang telah didaftarkan di blockchain. | Confirm that the document you received matches the official record registered on the blockchain. |
| meta | PDF • Maks. 20 MB • Tanpa login | PDF • Max 20 MB • No sign-in required |

## Verify Form

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| button | Verifikasi Dokumen | Verify Document |

## Tips ("Mengapa Memverifikasi Dokumen?")

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Mengapa Memverifikasi Dokumen? | Why Verify Documents? |
| items[0] | Dokumen tidak disimpan secara permanen | Documents are not stored permanently |
| items[1] | Verifikasi selesai dalam hitungan detik | Verification completes within seconds |
| items[2] | Verifikasi menggunakan hash SHA-256 | Verification uses a SHA-256 hash |
| items[3] | Dicocokkan dengan catatan resmi di blockchain | Matched against the official record on the blockchain |

## How It Works ("Cara Kerja")

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Cara Kerja | How It Works |
| stepLabel | Langkah | Step |
| steps[0].title | Unggah dokumen | Upload the Document |
| steps[0].description | Pilih file PDF yang ingin diperiksa. | Choose the PDF file you want to check. |
| steps[1].title | Buat hash dokumen | Generate a Document Hash |
| steps[1].description | Sistem menghasilkan hash SHA-256 dari isi dokumen. | The system generates a SHA-256 hash of the document contents. |
| steps[2].title | Cocokkan dengan blockchain | Match Against the Blockchain |
| steps[2].description | Hash dokumen dicocokkan dengan catatan yang tersimpan di blockchain. | The document hash is compared against the record stored on the blockchain. |
| steps[3].title | Lihat hasil | View the Result |
| steps[3].description | Sistem menampilkan status terverifikasi atau tidak ditemukan. | The system shows whether the document is verified or not found. |

## FAQ ("Pertanyaan Umum")

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Pertanyaan Umum | Frequently Asked Questions |
| items[0].q | Apa yang terjadi setelah saya mengunggah dokumen? | What happens after I upload a document? |
| items[0].a | Sistem menghitung hash dokumen, lalu mencocokkannya dengan catatan resmi yang tersimpan di blockchain. File tidak disimpan secara permanen. | The system computes the document's hash, then compares it against the official record stored on the blockchain. The file is not stored permanently. |
| items[1].q | Apakah dokumen saya disimpan di sistem? | Is my document stored in the system? |
| items[1].a | Tidak. Sistem hanya menyimpan hash dokumen dan metadata registrasi. File asli tidak disimpan. | No. The system only stores the document hash and registration metadata. The original file is not stored. |
| items[2].q | Kenapa verifikasi saya gagal / dokumen tidak ditemukan? | Why did my verification fail / document not found? |
| items[2].a | Kemungkinan dokumen belum pernah didaftarkan, atau isinya sudah berubah walau sedikit (mis. hasil scan ulang, edit, atau kompresi) sehingga hash dokumen berbeda dari yang terdaftar. | The document may never have been registered, or its contents changed even slightly (e.g. re-scanned, edited, or compressed) so the document hash no longer matches the registered one. |

## Register Hero

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| badge | Khusus Publisher | Publisher Only |
| title | Daftarkan Dokumen | Register Document |
| subtitle | Daftarkan dokumen resmi agar dapat diverifikasi kapan saja melalui blockchain. | Register official documents so they can be verified at any time on the blockchain. |

## Register Form

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| button | Kirim Dokumen | Submit Document |

## Before Submit Checklist

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Sebelum Mengirim | Before You Submit |
| body | Dokumen yang telah didaftarkan tidak dapat diubah maupun dihapus. Pastikan file yang dikirim adalah versi final. | A registered document cannot be changed or deleted afterwards. Make sure the file you submit is the final version. |

## Metadata Card (Informasi File)

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Informasi File | File Information |
| name | Nama | Name |
| size | Ukuran | Size |
| hash | SHA-256 | SHA-256 |
| status | Status | Status |
| hashing | Menghitung... | Computing... |
| empty | — | — |
| waiting | Menunggu file | Waiting for file |
| ready | Siap diregistrasikan | Ready to register |

## Requirement Card (Persyaratan Dokumen)

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| heading | Persyaratan Dokumen | Document Requirements |
| items[0] | Format PDF | PDF format |
| items[1] | Ukuran maksimal 20 MB | Maximum 20 MB |
| items[2] | Dokumen dapat dibaca dengan jelas (bukan hasil scan buram) | Document is clearly legible (not a blurry scan) |
| items[3] | Tidak diproteksi kata sandi | Not password-protected |

## Dropzone

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| dragActive | Lepaskan file di sini ... | Drop the file here ... |
| titleStrong | Seret file PDF ke sini | Drag your PDF here |
| titleRest | *(kosong)* | *(kosong)* |
| or | atau | or |
| browse | Pilih File | Choose File |
| meta | PDF • Maks. 20 MB | PDF • Max 20 MB |
| errorTooLarge | Ukuran file melebihi 20 MB. | File size exceeds 20 MB. |
| errorInvalidType | Hanya file PDF yang didukung. | Only PDF files are supported. |
| errorGeneric | File tidak dapat digunakan. Coba file lain. | This file cannot be used. Try another file. |

## Document Preview

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| readyRegister | Siap didaftarkan | Ready to Register |
| readyVerify | Siap diverifikasi | Ready to Verify |

## Loading Card

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| title | Memuat... | Loading... |
| subtitle | Mohon tunggu, dokumen sedang diproses... | Please wait, your document is being processed... |

## Top-level Strings

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| uploadTooltip | Unggah dokumen terlebih dahulu untuk melanjutkan | Please upload a document first to continue |
| uploading | Mengunggah... | Uploading... |

## Dashboard

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| title | Dokumen Terdaftar | Registered Documents |
| subtitle | Seluruh dokumen resmi yang telah didaftarkan oleh Publisher. | All official documents registered by Publishers. |
| registerCta | Daftarkan Dokumen | Register Document |
| errorNoBackend | PITS_BACKEND_RECORDS_URL belum dikonfigurasi | PITS_BACKEND_RECORDS_URL is not configured |
| errorNoToken | Token akses Keycloak tidak ditemukan | Keycloak access token not found |
| errorLoad | Gagal memuat data dokumen | Failed to load document data |
| errorConn | Tidak bisa terhubung ke layanan backend | Could not reach the backend service |
| errorSessionExpired | Sesi kamu sudah berakhir. Silakan masuk kembali. | Your session has expired. Please sign in again. |
| statusSummary(count) | Semua {count} dokumen berhasil diregistrasikan dan tercatat di blockchain. | All {count} documents have been successfully registered and recorded on the blockchain. |

## Stats Cards

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| total | Total Dokumen | Total Documents |
| publisher | Publisher | Publishers |
| thisMonth | Bulan Ini | This Month |
| status | Status Sistem | System Status |
| normal | Normal | Normal |

## Toolbar

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| searchPlaceholder | Cari berdasarkan nama file, hash, atau Record ID... | Search by filename, hash, or Record ID... |
| allTypes | Semua jenis | All types |
| newest | Terbaru | Newest |
| oldest | Terlama | Oldest |
| nameAsc | Nama A-Z | Name A-Z |
| comfortable | Comfortable | Comfortable |
| compact | Compact | Compact |
| updated | Diperbarui | Updated |
| refresh | Segarkan | Refresh |

## Records Table

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| document | Dokumen | Document |
| registered | Terdaftar | Registered |
| publisher | Publisher | Publisher |
| status | Status | Status |
| unknownFile | Nama file tidak tersedia | File name unavailable |
| unknownType | Jenis tidak diketahui | Unknown type |
| unknownPublisher | Publisher tidak diketahui | Unknown publisher |
| onChain | On-chain | On-chain |
| emptyFilteredTitle | Tidak ada dokumen ditemukan | No documents found |
| emptyFilteredBody | Coba ubah kata kunci pencarian atau filter yang sedang aktif. | Try changing your search keyword or active filter. |
| emptyAllTitle | Belum ada dokumen | No documents yet |
| emptyAllBody | Silakan registrasikan dokumen pertama untuk mulai membangun arsip digital institusi. | Register your first document to start building the institution's digital archive. |
| registerCta | Daftarkan Dokumen | Register Document |

## Pagination

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| showing(start,end,total) | Menampilkan {start}–{end} dari {total} dokumen | Showing {start}–{end} of {total} documents |
| perPage | / halaman | / page |
| page(p,total) | Halaman {p} dari {total} | Page {p} of {total} |
| prev | Halaman sebelumnya | Previous page |
| next | Halaman berikutnya | Next page |

## Record Detail Drawer

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| verified | Berhasil diverifikasi di blockchain | Successfully verified on the blockchain |
| document | Dokumen | Document |
| fileType | Jenis file | File type |
| registered | Terdaftar | Registered |
| issuer | Publisher (Issuer ID) | Publisher (Issuer ID) |
| blockchainProof | Bukti Blockchain | Blockchain Proof |
| network | Jaringan | Network |
| recordId | Record ID | Record ID |
| contentHash | Content hash (SHA-256) | Content hash (SHA-256) |
| txHash | Transaction hash | Transaction hash |
| close | Tutup | Close |
| unknown | Tidak diketahui | Unknown |

## Result Page

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| mismatchWarning | Data ini bukan untuk halaman hasil ini. | This data does not belong to this result page. |
| registerSuccessTitle | Registrasi Berhasil | Registration Successful |
| registerSuccessBody | Dokumen berhasil didaftarkan dan dicatat ke blockchain secara permanen. | The document was successfully registered and permanently recorded on the blockchain. |
| documentSection | Dokumen | Document |
| blockchainSection | Bukti Blockchain | Blockchain Proof |
| filename | Nama file | Filename |
| registeredAt | Terdaftar | Registered |
| recordId | Record ID | Record ID |
| contentHash | Content hash | Content hash |
| txHash | Transaction hash | Transaction hash |
| verifySuccessTitle | Dokumen Terverifikasi | Document Verified |
| verifySuccessBody | Dokumen ini cocok dengan catatan resmi yang terdaftar. Hasil ini hanya memverifikasi keaslian dan integritas dokumen, bukan kebenaran isi dokumen. | This document matches the registered official record. This result only verifies the document's authenticity and integrity, not the truthfulness of its content. |
| integrity | Integritas | Integrity |
| valid | Valid | Valid |
| blockchain | Blockchain | Blockchain |
| recorded | Tercatat | Recorded |
| notFoundTitle | Dokumen Tidak Ditemukan | Document Not Found |
| notFoundBody | Dokumen ini tidak ditemukan dalam catatan resmi sistem. | This document was not found in the system's official records. |
| possibleCauses | Kemungkinan Penyebab | Possible Causes |
| causeWrongFile | File yang diunggah salah | The uploaded file is incorrect |
| causeModified | Dokumen sudah diubah sejak didaftarkan (mis. hasil scan ulang, edit, atau kompresi) | The document was modified after registration (e.g. re-scanned, edited, or compressed) |
| causeNeverRegistered | Dokumen memang belum pernah didaftarkan | The document was never registered |
| registerFailTitle | Registrasi Gagal | Registration Failed |
| genericErrorTitle | Terjadi Kesalahan | Something Went Wrong |
| notAvailable | Tidak tersedia | Not available |
| backToRegister | Kembali ke Registrasi | Back to Register |
| backToHome | Kembali ke Beranda | Back to Home |

## Upload Errors

| Kunci | 🇮🇩 Indonesia | 🇬🇧 English |
|---|---|---|
| operationRegister | registrasi | registration |
| operationVerify | verifikasi | verification |
| invalidRequest(op) | Permintaan {op} tidak valid. Periksa kembali file dan coba lagi. | The {op} request was invalid. Please check the file and try again. |
| unauthorized | Hanya publisher yang terdaftar yang dapat mendaftarkan dokumen. Masuk dengan akun publisher dan coba lagi. | Only registered publishers can register documents. Please sign in with a publisher account and retry. |
| forbidden | Kamu tidak memiliki izin untuk melakukan tindakan ini. | You do not have permission to perform this action. |
| notFound | Layanan yang diminta tidak ditemukan. Coba lagi nanti. | The requested service was not found. Please try again later. |
| timeout(op) | Permintaan {op} melebihi batas waktu. Coba lagi. | The {op} request timed out. Please retry. |
| alreadyRegistered | Dokumen ini sudah terdaftar. | This document is already registered. |
| conflict(op) | Permintaan {op} bertentangan dengan kondisi server saat ini. | The {op} request conflicts with the current server state. |
| tooLarge | Ukuran file yang diunggah terlalu besar. Pilih file yang lebih kecil. | The uploaded file is too large. Please select a smaller file. |
| unsupportedType | Jenis file ini tidak didukung. | This file type is not supported. |
| unprocessable(op) | Permintaan {op} tidak dapat diproses. Periksa kembali file dan coba lagi. | The {op} request could not be processed. Please check the file and retry. |
| tooManyRequests | Terlalu banyak permintaan dikirim. Tunggu sebentar lalu coba lagi. | Too many requests were sent. Please wait a moment and try again. |
| serverError | Server mengalami kesalahan internal. Coba lagi nanti. | The server encountered an internal error. Please try again later. |
| badGateway | Layanan upstream memberikan respons tidak valid. Coba lagi. | The upstream service returned an invalid response. Please try again. |
| unavailable | Layanan sedang tidak tersedia sementara. Coba lagi nanti. | The service is temporarily unavailable. Please try again later. |
| gatewayTimeout | Layanan membutuhkan waktu terlalu lama untuk merespons. Coba lagi nanti. | The service took too long to respond. Please try again later. |
| genericFailure(op) | Proses {op} gagal. Silakan coba lagi. | The {op} process failed. Please try again. |
