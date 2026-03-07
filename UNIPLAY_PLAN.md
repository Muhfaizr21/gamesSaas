# 🎮 UNIPLAY.ID — SAAS SYSTEM PLAN
> **Sumber:** docs.uniplay.id · uniplay.id/syarat-ketentuan-reseller · uniplay.id/affiliate  
> **Status:** Terverifikasi dari dokumentasi resmi  
> **Versi:** Maret 2026

---

## 📋 DAFTAR ISI

1. [Overview Platform](#1-overview-platform)
2. [Arsitektur Sistem & Struktur Menu](#2-arsitektur-sistem--struktur-menu)
3. [SUPER ADMIN — Job & Kewenangan](#3-super-admin)
4. [RESELLER — Job & Alur Kerja Lengkap](#4-reseller)
5. [END USER — Alur Pembelian](#5-end-user)
6. [Sistem Keuangan & Saldo](#6-sistem-keuangan--saldo)
7. [REST API](#7-rest-api)
8. [Program Afiliasi](#8-program-afiliasi)
9. [Batasan & Larangan Per Peran](#9-batasan--larangan-per-peran)
10. [Matriks Hak Akses](#10-matriks-hak-akses)
11. [Checklist Implementasi](#11-checklist-implementasi)

---

## 1. OVERVIEW PLATFORM

```
Nama Platform   : UniPlay.id
Perusahaan      : PT Digivo Kreatif Indonesia, Tangerang, Banten
Model Bisnis    : SaaS B2B2C — Three-Tier (Admin → Reseller → End User)
Produk Utama    : Top-Up Diamond/Token Game + Voucher Digital
USP             : Tanpa deposit awal, langsung bisa jualan setelah daftar
                  Bebas biaya domain selamanya
                  Sistem otomatis 24/7
Garansi         : 7 hari uang kembali (S&K berlaku)
Monetisasi      : Biaya Paket Reseller + Margin Harga Modal
Program Plus    : Afiliasi (komisi 20%) + White-Label Website + REST API
```

### Alur Rantai Nilai (Terverifikasi)

```
[Supplier/Provider Game]
        ↓ stok & harga grosir
[SUPER ADMIN — UniPlay Internal]
        ↓ menetapkan Harga Modal (berbeda tiap paket)
[RESELLER]
  1. Beli Paket Reseller (Tahunan / Lifetime)
  2. Langsung bisa jualan — TANPA harus deposit UniPlay Point dulu
  3. Atur Harga Jual sendiri di panel
  4. Opsional: Deposit UniPlay Point untuk buka akses API
        ↓ website reseller branded / uniplay.id
[END USER]
  → Pilih produk → Isi ID game → Pilih pembayaran → Bayar
        ↓ otomatis, instan (hitungan detik)
[Diamond/Token/Voucher → akun game user]
        ↓ selisih Harga Jual vs Harga Modal
[UniPlay Cash Reseller] → Withdraw ke rekening bank
```

> ⚠️ **PENTING:** UniPlay Point TIDAK wajib diisi untuk mulai berjualan.
> Reseller bisa langsung jualan setelah daftar. UniPlay Point hanya dibutuhkan untuk membuka akses **REST API**.

---

## 2. ARSITEKTUR SISTEM & STRUKTUR MENU

### Struktur Menu Panel Reseller (Verified dari docs.uniplay.id)

```
PANEL RESELLER
├── Overview
├── Pesanan
├── Top Up UniPlay Point
├── Top Up & Voucher
├── Kode Kupon
├── API
├── Bonus
├── Reseller Academy
└── Marketing Kit

KUSTOMISASI
├── Domain Manager
├── Konfigurasi Umum
├── SEO & Pixel
├── Kustomisasi Produk
│   └── Atur Harga Produk
├── Cara Tambah Gambar Slider di Website
├── Cara Membuat Flash Sale Produk
├── Cara Tambah Produk Unggulan
├── Cara Tambah Gambar Pop Up di Website
├── Cara Tambah Widget
├── Cara Tambah Halaman Statis
├── Cara Menambahkan Artikel
├── Penjelasan Payment Channel Management
└── Cara Build APK

DOMPET SAYA
├── Saldo Anda
├── Redeem Voucher
├── Riwayat Transaksi
└── Data Bank

AKUN SAYA
├── Pengaturan Profil
├── Keamanan Akun
├── Ganti Password
└── PIN UniPlay
```

---

## 3. SUPER ADMIN

> Dijalankan oleh: Tim Internal PT Digivo Kreatif Indonesia  
> Kewenangan: Tidak terbatas atas seluruh sistem

### 3.1 Manajemen Produk & Katalog
- [ ] Tambah / edit / nonaktifkan produk top-up dan voucher
- [ ] Kelola katalog: Mobile Legends, Free Fire, CODM, Speed Drifter, Genshin Impact, PUBG, Google Play, dll.
- [ ] Perbarui stok dan ketersediaan real-time
- [ ] Kelola integrasi API provider/supplier game pihak ketiga

### 3.2 Manajemen Harga Modal
- [ ] Tetapkan Harga Modal per produk per denominasi
- [ ] Harga Modal berbeda per paket reseller — Supreme termurah, Newbie termahal
- [ ] UniPlay **berhak mengubah harga modal sewaktu-waktu tanpa pemberitahuan**
- [ ] Reseller bertanggung jawab menyesuaikan harga jual jika harga modal berubah

### 3.3 Manajemen Paket Reseller
- [ ] Kelola jenis paket: **Tahunan** dan **Lifetime**
- [ ] Tingkatan paket: Newbie → Pro → Legend → Supreme
- [ ] UniPlay berhak mengubah harga, benefit, dan ketentuan paket **sewaktu-waktu tanpa pemberitahuan**
- [ ] Perubahan paket **tidak berlaku surut** untuk paket yang sudah aktif (kecuali dinyatakan lain)
- [ ] Kelola fitur upgrade paket — reseller cukup bayar selisih harga

### 3.4 Manajemen Reseller
- [ ] Pantau semua akun reseller terdaftar
- [ ] Setujui / tolak / suspend / tutup akun reseller
- [ ] Verifikasi identitas reseller (nama, email, nomor HP)
- [ ] Deteksi dan tangani akun ganda atau aktivitas fraud
- [ ] Kelola laporan keluhan dan mediasi sengketa

### 3.5 Manajemen UniPlay Point & UniPlay Cash
- [ ] Verifikasi dan konfirmasi deposit UniPlay Point dari reseller
- [ ] Minimum top up UniPlay Point: **Rp 100.000**
- [ ] Pantau dan proses withdrawal UniPlay Cash sesuai jadwal per paket:
  - **Paket Supreme** → Instant Withdrawal kapan saja
  - **Paket Pro & Legend** → 2x seminggu: Senin dan Kamis (hari kerja)
  - Permintaan di luar jadwal → diproses pada jadwal berikutnya
- [ ] UniPlay **berhak memotong biaya administrasi** untuk setiap pencairan saldo
- [ ] Kelola Grace Period — masa tenggang setelah paket berakhir untuk mencairkan saldo

### 3.6 Manajemen Refund
- [ ] Refund transaksi gagal **HANYA dalam bentuk UniPlay Point**, tidak bisa tunai/transfer bank
- [ ] UniPlay Point hasil refund bisa digunakan untuk transaksi berikutnya
- [ ] Proses refund maksimal **1x24 jam kerja** setelah konfirmasi kegagalan transaksi

### 3.7 Manajemen Domain
- [ ] Sediakan infrastruktur Domain Manager
- [ ] Domain yang dibeli via Domain Manager → **tetap terdaftar atas nama UniPlay** (bukan milik reseller)
- [ ] Harga domain bisa berubah sewaktu-waktu tanpa pemberitahuan
- [ ] Domain terhubung langsung dengan website reseller dan dikelola dari dashboard reseller

### 3.8 Manajemen Kustomisasi & Fitur Website
- [ ] Sediakan template/tema website reseller (multiple pilihan tema)
- [ ] Fitur APK Builder — reseller bisa build APK dari website mereka
- [ ] Fitur Flash Sale Produk di website reseller
- [ ] Fitur Produk Unggulan, Gambar Slider, Pop Up, Widget, Halaman Statis, Artikel
- [ ] Fitur SEO & Pixel (tracking marketing)
- [ ] Payment Channel Management — reseller bisa atur metode pembayaran yang aktif

### 3.9 Manajemen Konten & Notifikasi
- [ ] Kelola Reseller Academy — konten video pembelajaran untuk reseller
- [ ] Kelola Marketing Kit — materi promosi untuk reseller
- [ ] Kelola notifikasi sistem (WhatsApp & Email)
- [ ] Kelola dokumentasi API (docs.uniplay.id via GitBook)
- [ ] Update Syarat & Ketentuan platform

### 3.10 Manajemen Program Afiliasi
- [ ] Kelola program afiliasi — komisi **20% dari setiap pendaftaran paket** via link afiliasi
- [ ] Proses pencairan komisi afiliasi **2x sebulan** ke rekening bank
- [ ] Deteksi kecurangan afiliasi (misalnya: link afiliasi dipakai sendiri)
- [ ] Sanksi pelanggaran: komisi tidak cair + akun bisa dihapus

---

## 4. RESELLER

> Panel: panel.uniplay.id/member (login required)  
> Docs: docs.uniplay.id/uniplay-reseller

### 4.1 Jenis Paket Reseller (Terverifikasi)

| Paket | Tipe Durasi | Harga Modal | Withdrawal Cash | API Unlock (Deposit Min.) |
|---|---|---|---|---|
| Newbie | Tahunan | Paling tinggi | Sesuai S&K | Tidak tersedia |
| Pro | Tahunan / Lifetime | Sedang | Senin & Kamis | Deposit min. **Rp 7.500.000** |
| Legend | Tahunan / Lifetime | Lebih rendah | Senin & Kamis | Deposit min. **Rp 5.000.000** |
| Supreme | Tahunan / Lifetime | Termurah | **Instant kapan saja** | Deposit min. **Rp 2.500.000** |

> ⚠️ Berjualan TIDAK memerlukan deposit UniPlay Point. Deposit hanya untuk membuka akses API.

### 4.2 Alur Kerja Reseller — Tahap Demi Tahap

#### TAHAP 1: Pendaftaran
1. Kunjungi `uniplay.id/reseller` → klik **Daftar Sekarang**
2. Pilih paket reseller (Newbie / Pro / Legend / Supreme)
3. Pilih tipe: Tahunan atau Lifetime
4. Isi data: nama lengkap, nomor HP, email, password
5. Pilih metode pembayaran → selesaikan pembayaran
6. Akun aktif otomatis setelah pembayaran terverifikasi — **langsung bisa jualan**
7. Login ke panel reseller

#### TAHAP 2: Setup Akun Dasar
1. **Akun Saya → Pengaturan Profil** — lengkapi data profil
2. **Akun Saya → Ganti Password** — pastikan password kuat
3. **Akun Saya → PIN UniPlay** — aktifkan PIN 6 digit:
   - Klik "Aktivasi PIN"
   - Masukkan 6 digit PIN → klik Lanjutkan
   - Konfirmasi 6 digit PIN → klik Lanjutkan
   - ⚠️ PIN wajib dimasukkan saat **tarik saldo**
4. **Akun Saya → Keamanan Akun** — konfigurasi keamanan tambahan
5. **Dompet Saya → Data Bank** — tambahkan rekening bank untuk withdrawal

#### TAHAP 3: Konfigurasi Website (Kustomisasi → Konfigurasi Umum)
1. Atur URL website / hubungkan domain
2. Upload **Favicon** (icon tab browser, maks. 1 MB)
3. Upload **Site Logo**
4. Isi **Email Toko** (untuk notifikasi resmi)
5. Atur **Username Email Transaksional** (nama pengirim email ke pembeli)
6. Isi **Nomor WhatsApp Support** (tombol bantuan di website)
7. Aktifkan **Live Chat Widget WhatsApp**
8. Aktifkan **WhatsApp Order Notification** (notifikasi otomatis ke pembeli)
9. Tambah link media sosial (Instagram, TikTok, Facebook, X)
10. Pilih **Template / Tema Website**

#### TAHAP 4: Domain Manager (Kustomisasi → Domain Manager)
- **Opsi A:** Beli domain baru melalui Domain Manager UniPlay
  - Domain otomatis terhubung ke website reseller
  - ⚠️ Domain **tetap atas nama UniPlay**, bukan milik reseller
  - Harga domain bisa berubah sewaktu-waktu
- **Opsi B:** Hubungkan domain sendiri dari registrar lain

#### TAHAP 5: Atur Harga Produk (Kustomisasi → Kustomisasi Produk → Atur Harga Produk)
1. Cari produk yang ingin diatur
2. Klik tombol **"Atur Harga Jual"**
3. Pilih metode penetapan:
   - **Manual** → masukkan angka harga jual tetap
   - **Persentase** → masukkan % markup dari harga modal
4. ⚠️ Harga jual **tidak boleh kurang dari harga modal**
5. Simpan — harga langsung tampil di website reseller
6. Ulangi untuk semua produk

#### TAHAP 6: Fitur Kustomisasi Website Lanjutan
- **Flash Sale Produk** — promo harga terbatas waktu
- **Produk Unggulan** — highlight produk di halaman utama
- **Gambar Slider** — banner promosi di halaman utama
- **Pop Up** — pengumuman atau promo via gambar pop up
- **Widget** — tambah widget tambahan ke website
- **Halaman Statis** — tentang kami, kebijakan, dll.
- **Artikel/Blog** — konten SEO untuk website reseller
- **SEO & Pixel** — optimasi pencarian + tracking Meta/Google Pixel
- **Payment Channel Management** — aktifkan/nonaktifkan metode pembayaran di toko
- **Build APK** — buat versi Android dari website reseller

#### TAHAP 7: Kode Kupon (Panel Reseller → Kode Kupon)
- Buat kode kupon diskon untuk pembeli
- Atur periode berlaku dan nominal diskon
- ⚠️ Diskon **dipotong dari komisi reseller**, bukan dari harga produk
  - Contoh: komisi Rp 1.000, diskon 10% = pelanggan hemat Rp 100, komisi jadi Rp 900

#### TAHAP 8: Monitoring Harian (Panel Reseller → Overview)
Dashboard Overview — data per periode:
- **Total Orders** — semua pesanan (dibayar + belum dibayar)
- **Total Paid** — pesanan yang sudah dibayar
- **Paid Ratio** — rasio pesanan terbayar vs total pesanan
- **Unpaid Orders** — pesanan yang belum dibayar / tertunda
- **Gross Revenue** — total pendapatan kotor (sebelum dipotong apapun)
- **Net Revenue** — setelah dipotong Harga Modal (masih ada biaya admin PG)
- **Net Profit** — keuntungan bersih setelah semua potongan → **masuk ke Saldo Anda**
- **Best Seller Products** — produk terlaris di periode tersebut

#### TAHAP 9: Kelola Pesanan (Panel Reseller → Pesanan)
- Lihat dan pantau semua pesanan masuk via website
- Status pesanan: **Pending**, **Completed**, **Cancelled**
- Filter data transaksi per periode tertentu
- Tangani keluhan pembeli via WhatsApp support

#### TAHAP 10: Top Up UniPlay Point (Panel → Top Up UniPlay Point)
> Diperlukan HANYA jika ingin mengakses REST API

1. Klik **Top Up UniPlay Point** di panel
2. Pilih nominal atau isi sendiri (minimum: **Rp 100.000**)
3. Pilih metode pembayaran
4. Diarahkan ke halaman invoice
5. Transfer sesuai nominal yang tertera di invoice (nominal harus tepat)
6. Saldo masuk otomatis setelah terverifikasi

#### TAHAP 11: Top Up & Voucher untuk Diri Sendiri (Panel → Top Up & Voucher)
- Beli top-up dengan harga khusus reseller untuk keperluan sendiri
- Lebih murah dari harga di website uniplay.id publik
- Alur: pilih produk → Direct Top Up atau Voucher → klik Beli → masukkan User ID/Server ID → pilih denom → selesaikan

#### TAHAP 12: Tarik Saldo / Withdrawal (Dompet Saya → Saldo Anda)
1. Akses menu **Saldo Anda**
2. Masukkan nominal penarikan
3. Verifikasi dengan **PIN UniPlay** (6 digit)
4. Submit permintaan
5. Dana diproses sesuai jadwal paket:
   - **Supreme** → Instan kapan saja
   - **Pro & Legend** → Senin & Kamis (hari kerja)
6. Dana masuk ke rekening bank yang terdaftar di **Data Bank**
7. ⚠️ UniPlay berhak memotong biaya administrasi pencairan

#### TAHAP 13: Riwayat & Redeem (Dompet Saya)
- **Riwayat Transaksi** — semua histori transaksi finansial
- **Redeem Voucher** — tukarkan kode voucher dari bonus/promo

#### TAHAP 14: Reseller Academy (Panel → Reseller Academy)
- Akses video pembelajaran cara pakai panel reseller
- Panduan langkah demi langkah fitur-fitur utama
- Cara terbaik memanfaatkan sistem UniPlay

#### TAHAP 15: Marketing Kit (Panel → Marketing Kit)
- Akses materi promosi yang disediakan UniPlay
- Banner, video, dan aset promosi siap pakai

#### TAHAP 16: Aktivasi REST API (Panel → API)
> Syarat: Deposit UniPlay Point sesuai paket

| Paket | Minimum Deposit untuk Buka API |
|---|---|
| Pro | Rp 7.500.000 |
| Legend | Rp 5.000.000 |
| Supreme | Rp 2.500.000 |
| Newbie | Tidak tersedia |

1. Pastikan deposit sudah mencapai minimum sesuai paket
2. Akses menu **API** di panel
3. Dapatkan **API Key** dari halaman member panel
4. Baca dokumentasi: `documenter.getpostman.com/view/2760553/TzsbKnVP`
5. Implementasikan autentikasi **UPL-SIGNATURE** (HMAC SHA512)
6. Fitur: Otomatisasi transaksi, Integrasi fleksibel, Akses data real-time

#### TAHAP 17: Perpanjangan & Upgrade Paket
- **Perpanjangan**: Bayar sebelum masa aktif habis
- **Upgrade**: Cukup bayar **selisih** harga dari panel
- **Grace Period**: Masa tenggang setelah paket berakhir untuk mencairkan saldo
  - ⚠️ Grace Period **hilang** jika reseller perpanjang paket selama periode Grace Period

---

## 5. END USER

> Tidak perlu daftar atau login apapun

### 5.1 Alur Pembelian
1. Akses `uniplay.id` atau website reseller
2. Pilih kategori game / voucher
3. Pilih produk dan denominasi
4. Masukkan ID Game (User ID, Server ID, dll. sesuai game)
5. Pilih metode pembayaran
6. Review pesanan → selesaikan pembayaran
7. Diamond/token/voucher terkirim **otomatis dalam hitungan detik**

### 5.2 Metode Pembayaran (Verified)
- Bank Transfer (BCA, BNI, BRI, Mandiri, dll.)
- GoPay, OVO, ShopeePay
- Virtual Account
- QRIS
- Dan metode lainnya

### 5.3 Produk Tersedia (Contoh Verified)
- Mobile Legends (Diamond), Free Fire (Diamond), CODM (CP)
- Speed Drifter, Genshin Impact, PUBG Mobile (UC)
- Voucher Google Play, dan ratusan produk lainnya

---

## 6. SISTEM KEUANGAN & SALDO

### Definisi Resmi (dari S&K UniPlay)

| Istilah | Definisi Resmi |
|---|---|
| **UniPlay Point** | Poin virtual yang dapat digunakan sebagai saldo di dalam sistem UniPlay |
| **UniPlay Cash** | Saldo akumulasi keuntungan dari selisih Harga Jual vs Harga Modal tiap transaksi sukses |
| **Harga Modal** | Harga dasar produk yang ditetapkan UniPlay kepada Reseller |
| **Harga Jual** | Harga yang ditetapkan Reseller kepada pelanggan akhir |
| **Grace Period** | Masa tenggang setelah Paket Reseller berakhir untuk mencairkan saldo keuntungan |

### Formula Keuntungan (Verified dari docs.uniplay.id)

```
Gross Revenue = Total Harga Jual dari semua transaksi (sebelum potongan apapun)

Net Revenue   = Gross Revenue - Harga Modal
              (masih ada biaya admin payment gateway)

Net Profit    = Net Revenue - Biaya Admin Payment Gateway
              = Keuntungan bersih → MASUK KE SALDO ANDA (UniPlay Cash)
```

### Kebijakan Refund (Verified dari S&K)
- Transaksi gagal → refund **hanya dalam bentuk UniPlay Point** (BUKAN tunai/transfer bank)
- UniPlay Point refund bisa dipakai untuk transaksi berikutnya
- Proses refund: maksimal **1x24 jam kerja** setelah konfirmasi kegagalan
- Reseller wajib menginformasikan kebijakan ini kepada pembeli

### Jadwal Withdrawal (Verified dari S&K)
- **Paket Supreme** → Instant Withdrawal kapan saja
- **Paket Pro & Legend** → Senin dan Kamis (hari kerja)
- Di luar jadwal → diproses pada jadwal berikutnya
- UniPlay berhak potong biaya administrasi pencairan

---

## 7. REST API

### Syarat Deposit Minimum (Verified dari docs.uniplay.id)
| Paket | Deposit Minimum |
|---|---|
| Pro | Rp 7.500.000 |
| Legend | Rp 5.000.000 |
| Supreme | Rp 2.500.000 |
| Newbie | Tidak tersedia |

### Fitur API
- Otomatisasi transaksi top-up dan voucher tanpa masuk panel
- Integrasi ke website / aplikasi mobile eksternal
- Akses real-time: stok, harga, status transaksi
- Sangat cocok untuk platform e-commerce atau aplikasi top-up sendiri

### Teknis
- Dokumentasi: `documenter.getpostman.com/view/2760553/TzsbKnVP`
- Autentikasi: **UPL-SIGNATURE** (HMAC SHA512)
- API Key: didapat dari halaman member panel

---

## 8. PROGRAM AFILIASI

> Sumber: uniplay.id/affiliate (Verified)

```
Komisi        : 20% dari setiap pendaftaran paket reseller via link afiliasi
Daftar        : GRATIS, tanpa syarat mengikat
Cara Daftar   : Via panel Reseller ATAU halaman uniplay.id/affiliate
Pencairan     : 2x sebulan langsung ke rekening bank
Materi        : Banner dan video promosi disediakan oleh UniPlay
Tracking      : Via link afiliasi unik atau kode kupon
```

### Larangan Afiliasi (Verified)
- ❌ Link afiliasi **TIDAK BOLEH dipakai sendiri**
- Jika sistem mendeteksi kecurangan → komisi tidak cair + **akun bisa dihapus**

---

## 9. BATASAN & LARANGAN PER PERAN

### Super Admin
- Wajib mematuhi hukum yang berlaku di Indonesia
- Perubahan harga modal dan paket bisa dilakukan sewaktu-waktu (hak UniPlay per S&K)
- Wajib memproses refund max 1x24 jam kerja setelah konfirmasi kegagalan
- Tidak boleh menyalahgunakan data transaksi pengguna

### Reseller — Yang WAJIB Dilakukan
- [ ] Maksimal **1 akun** per individu / nomor HP / email
- [ ] Memberikan informasi akurat saat pendaftaran
- [ ] Menjaga kerahasiaan password dan PIN akun
- [ ] Menginformasikan kebijakan refund (UniPlay Point, bukan tunai) kepada pembeli
- [ ] Menyesuaikan harga jual jika harga modal berubah

### Reseller — Yang DILARANG
- ❌ Membuat lebih dari 1 akun reseller
- ❌ Menggunakan layanan untuk penipuan atau tindak kriminal
- ❌ Pencucian uang atau aktivitas finansial ilegal
- ❌ Memanipulasi harga, sistem, atau data transaksi
- ❌ Menyalahgunakan promo/cashback secara curang
- ❌ Berbagi akses akun dengan pihak lain
- ❌ Menggunakan link afiliasi sendiri

### Konsekuensi Pelanggaran (dari S&K Resmi)
- Penarikan subsidi / cashback yang sudah diterima
- Pembatalan benefit UniPlay Point
- Pencabutan semua promo aktif
- Pembatalan transaksi mencurigakan
- Pembekuan saldo
- Penurunan reputasi akun
- Penutupan permanen seluruh akun terkait
- Tindakan hukum sesuai peraturan Indonesia

### End User
- Maksimal 1 akun per promo (akun ganda = tidak berhak dapat promo)
- Kesalahan isi ID game = resiko ditanggung pembeli
- Tidak bisa cancel pesanan yang sudah diproses
- Refund mengikuti kebijakan reseller masing-masing

---

## 10. MATRIKS HAK AKSES

| Fitur | Super Admin | Reseller | End User |
|---|---|---|---|
| Kelola Harga Modal | ✅ | ❌ | ❌ |
| Atur Harga Jual | ✅ (semua) | ✅ (toko sendiri) | ❌ |
| Akses Panel Reseller | ✅ (semua) | ✅ (sendiri) | ❌ |
| Buat Website Top-Up | ✅ (infrastruktur) | ✅ (1 website) | ❌ |
| Lihat Transaksi | ✅ (semua) | ✅ (toko sendiri) | ✅ (transaksi sendiri) |
| Akses REST API | ✅ | ✅ (syarat deposit) | ❌ |
| Domain Manager | ✅ (admin) | ✅ (toko sendiri) | ❌ |
| Withdraw UniPlay Cash | ✅ (admin) | ✅ (sesuai jadwal paket) | ❌ |
| Program Afiliasi | ✅ (admin) | ✅ (daftar & promosi) | ❌ |
| Suspend Akun | ✅ | ❌ | ❌ |
| Buat Kode Kupon | ✅ | ✅ (toko sendiri) | ❌ |
| Build APK | N/A | ✅ | ❌ |
| Beli Top-Up Tanpa Login | N/A | ❌ | ✅ |
| Akses Reseller Academy | N/A | ✅ | ❌ |
| SEO & Pixel Tracking | ✅ | ✅ (toko sendiri) | ❌ |
| Flash Sale / Promo Web | ✅ | ✅ (toko sendiri) | ❌ |
| Marketing Kit | N/A | ✅ | ❌ |
| Bonus | ✅ (admin) | ✅ (lihat bonus) | ❌ |

---

## 11. CHECKLIST IMPLEMENTASI

### ✅ Super Admin — Wajib Setup
- [ ] Integrasikan payment gateway (GoPay, OVO, ShopeePay, Bank Transfer, VA, QRIS)
- [ ] Integrasikan API provider/supplier game
- [ ] Buat sistem manajemen paket (Newbie/Pro/Legend/Supreme × Tahunan/Lifetime)
- [ ] Buat sistem Harga Modal berbeda per paket
- [ ] Buat dashboard admin internal
- [ ] Buat sistem UniPlay Point (top up min Rp 100.000, digunakan untuk unlock API)
- [ ] Buat sistem UniPlay Cash (akumulasi otomatis dari Net Profit tiap transaksi)
- [ ] Buat sistem withdrawal: Instant (Supreme) / Senin&Kamis (Pro&Legend)
- [ ] Buat biaya admin pencairan saldo
- [ ] Buat sistem refund — hanya UniPlay Point, max 1x24 jam kerja
- [ ] Buat Domain Manager + hosting semua website reseller
- [ ] Buat template/tema website reseller (multiple pilihan)
- [ ] Buat sistem APK Builder
- [ ] Buat REST API + dokumentasi Postman
- [ ] Buat sistem deposit minimum untuk unlock API per paket (Pro: 7,5jt / Legend: 5jt / Supreme: 2,5jt)
- [ ] Buat notifikasi WhatsApp + email transaksional
- [ ] Buat Program Afiliasi (tracking link + komisi 20% + pencairan 2x/bulan)
- [ ] Buat Reseller Academy (video pembelajaran)
- [ ] Buat Marketing Kit (banner, video promosi)
- [ ] Buat sistem Bonus (menu Bonus di panel)
- [ ] Buat sistem anti-fraud (deteksi akun ganda, link afiliasi dipakai sendiri)
- [ ] Buat sistem PIN UniPlay (6 digit, wajib untuk tarik saldo)
- [ ] Buat Grace Period saat paket berakhir
- [ ] Tulis dan publikasikan Syarat & Ketentuan Reseller
- [ ] Buat sistem Kode Kupon (dipotong dari komisi reseller)
- [ ] Buat fitur: Flash Sale, Produk Unggulan, Slider, Pop Up, Widget, Halaman Statis, Artikel
- [ ] Buat fitur SEO & Pixel
- [ ] Buat Payment Channel Management per reseller
- [ ] Buat menu Riwayat Transaksi + Redeem Voucher di Dompet Saya

### ✅ Reseller — Checklist Onboarding
- [ ] Daftar paket + bayar
- [ ] Login panel → lengkapi profil
- [ ] Aktifkan PIN UniPlay (6 digit)
- [ ] Tambah rekening bank di Data Bank
- [ ] Setup website: logo, favicon, email, WhatsApp, tema
- [ ] Hubungkan / beli domain
- [ ] Atur harga jual semua produk (≥ harga modal)
- [ ] (Opsional) Deposit UniPlay Point untuk buka API
- [ ] Test pembelian pertama
- [ ] Aktifkan notifikasi WhatsApp ke pembeli
- [ ] Mulai promosi via media sosial / komunitas
- [ ] Pantau Overview harian
- [ ] Withdraw UniPlay Cash sesuai jadwal paket (verifikasi PIN)
- [ ] Daftar Program Afiliasi (gratis)
- [ ] Perpanjang / upgrade paket sebelum habis

---

## 📝 KOREKSI DARI DOKUMEN VERSI SEBELUMNYA

| Item | Versi Lama ❌ | Versi Baru ✅ (Terverifikasi) |
|---|---|---|
| Syarat berjualan | Wajib deposit UniPlay Point | **TIDAK perlu deposit** — langsung bisa jualan |
| Minimum top up UPP | Rp 2.000.000 | **Rp 100.000** |
| API unlock | Deposit Rp 2.000.000 | Per paket: Pro Rp 7,5jt / Legend Rp 5jt / Supreme Rp 2,5jt |
| Kepemilikan domain | Bisa milik reseller | **Tetap atas nama UniPlay** |
| Refund | Bisa tunai/transfer | **Hanya UniPlay Point** |
| Proses refund | Tidak spesifik | **Maksimal 1x24 jam kerja** |
| Kode kupon | Diskon dari harga produk | **Dipotong dari komisi reseller** |
| Afiliasi pakai sendiri | Tidak disebut | **Dilarang keras — akun bisa dihapus** |
| Menu panel | Tidak lengkap | Struktur menu lengkap 4 section terverifikasi |

---

*Sumber terverifikasi: `docs.uniplay.id` · `uniplay.id/syarat-ketentuan-reseller` · `uniplay.id/affiliate` · `uniplay.id/reseller`*
