# 🎓 TUTORIAL LENGKAP: Setup Backend SIGAP PPKS dari NOL

## 📋 Daftar Isi
1. [Persiapan Awal](#1-persiapan-awal)
2. [Setup XAMPP](#2-setup-xampp)
3. [Install Composer](#3-install-composer)
4. [Setup Database](#4-setup-database)
5. [Install Backend Laravel](#5-install-backend-laravel)
6. [Jalankan Backend](#6-jalankan-backend)
7. [Test Backend](#7-test-backend)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Persiapan Awal

### ✅ Yang Sudah Anda Install:
- ✅ XAMPP (PHP + MySQL)
- ✅ HeidiSQL (Database Manager)

### 📦 Yang Perlu Diinstall:
- ⏳ Composer (Package Manager untuk PHP)

### 📂 Lokasi Project:
```
PUNYAKUSENDIRI/
├── backend-api/        # ← Backend Laravel (ini yang akan kita setup)
├── Admin/              # Frontend Admin
├── Lapor/              # Frontend Lapor
├── Monitoring/         # Frontend Monitoring
└── ...
```

---

## 2. Setup XAMPP

### Langkah 2.1: Buka XAMPP Control Panel

**Windows:**
1. Tekan tombol **Windows** di keyboard
2. Ketik: `xampp`
3. Klik **XAMPP Control Panel**

**Atau:**
- Buka folder: `C:\xampp\`
- Double-klik file: `xampp-control.exe`

### Langkah 2.2: Start Apache & MySQL

Di XAMPP Control Panel, Anda akan lihat daftar seperti ini:

```
┌──────────────────────────────────────────┐
│ XAMPP Control Panel v3.3.0               │
├──────────────────────────────────────────┤
│ Module    │ PID(s) │ Port(s) │ Actions   │
├───────────┼────────┼─────────┼───────────┤
│ Apache    │        │ 80, 443 │ [Start]   │ ← Klik tombol Start ini
│ MySQL     │        │ 3306    │ [Start]   │ ← Klik tombol Start ini
│ FileZilla │        │         │ [Start]   │ ← JANGAN diklik
│ Mercury   │        │         │ [Start]   │ ← JANGAN diklik
│ Tomcat    │        │         │ [Start]   │ ← JANGAN diklik
└───────────┴────────┴─────────┴───────────┘
```

**Klik tombol "Start" untuk:**
1. ✅ **Apache** (klik tombol Start di sebelah kanan Apache)
2. ✅ **MySQL** (klik tombol Start di sebelah kanan MySQL)

**Tunggu sampai:**
- Background Apache berubah jadi **HIJAU**
- Background MySQL berubah jadi **HIJAU**
- Tombol "Start" berubah jadi **"Stop"**

**Contoh setelah running:**
```
┌──────────────────────────────────────────┐
│ Apache    │ 1234   │ 80, 443 │ [Stop]    │ ← Background HIJAU
│ MySQL     │ 5678   │ 3306    │ [Stop]    │ ← Background HIJAU
└───────────┴────────┴─────────┴───────────┘
```

### Langkah 2.3: Test Apache Berjalan

1. Buka browser (Chrome/Firefox/Edge)
2. Ketik di address bar: `http://localhost`
3. Tekan **Enter**
4. Jika muncul halaman **"Welcome to XAMPP"** → ✅ Berhasil!

### Langkah 2.4: Test MySQL Berjalan

1. Di browser, ketik: `http://localhost/phpmyadmin`
2. Tekan **Enter**
3. Jika muncul halaman **phpMyAdmin** → ✅ Berhasil!

---

## 3. Install Composer

### Apa itu Composer?
Composer = Package Manager untuk PHP (seperti npm untuk Node.js)
Laravel butuh Composer untuk install dependencies.

### Langkah 3.1: Download Composer

1. Buka browser
2. Pergi ke: **https://getcomposer.org/download/**
3. Klik link **"Composer-Setup.exe"** (untuk Windows)
4. File `Composer-Setup.exe` akan terdownload

### Langkah 3.2: Install Composer

1. Buka folder **Downloads**
2. Double-klik file **Composer-Setup.exe**
3. Akan muncul **"Composer Setup"** wizard

**Langkah-langkah di wizard:**

#### Screen 1: Welcome
```
┌─────────────────────────────────────────┐
│ Welcome to Composer Setup               │
│                                         │
│ This will install Composer...          │
│                                         │
│                    [Next >]  [Cancel]   │
└─────────────────────────────────────────┘
```
**→ Klik tombol "Next >"**

#### Screen 2: Choose Install Mode
```
┌─────────────────────────────────────────┐
│ Choose Install Mode                     │
│                                         │
│ ☑ Install for all users (recommended)  │ ← Centang ini
│ ☐ Install for current user only        │
│                                         │
│                    [Next >]  [Cancel]   │
└─────────────────────────────────────────┘
```
**→ Centang "Install for all users"**
**→ Klik tombol "Next >"**

#### Screen 3: Choose PHP Path
```
┌─────────────────────────────────────────┐
│ PHP Path                                │
│                                         │
│ The installer will search for php.exe  │
│                                         │
│ Path: C:\xampp\php\php.exe              │ ← Harusnya otomatis terdeteksi
│                                         │
│                    [Next >]  [Cancel]   │
└─────────────────────────────────────────┘
```

**Jika path kosong atau salah:**
1. Klik tombol **"Browse..."**
2. Cari folder: `C:\xampp\php\`
3. Pilih file: `php.exe`
4. Klik **"Open"**

**→ Klik tombol "Next >"**

#### Screen 4: Proxy Settings
```
┌─────────────────────────────────────────┐
│ Proxy Settings                          │
│                                         │
│ ☐ Use a proxy server to connect        │ ← JANGAN dicentang
│                                         │
│                    [Next >]  [Cancel]   │
└─────────────────────────────────────────┘
```
**→ JANGAN centang apapun**
**→ Klik tombol "Next >"**

#### Screen 5: Ready to Install
```
┌─────────────────────────────────────────┐
│ Ready to Install                        │
│                                         │
│ Click Install to continue...            │
│                                         │
│                  [Install]  [Cancel]    │
└─────────────────────────────────────────┘
```
**→ Klik tombol "Install"**

**Tunggu proses install...**

#### Screen 6: Finish
```
┌─────────────────────────────────────────┐
│ Completing Composer Setup               │
│                                         │
│ Installation complete!                  │
│                                         │
│                   [Finish]              │
└─────────────────────────────────────────┘
```
**→ Klik tombol "Finish"**

### Langkah 3.3: Verifikasi Composer Terinstall

1. Tekan **Windows + R**
2. Ketik: `cmd`
3. Tekan **Enter** (akan buka Command Prompt)
4. Di Command Prompt, ketik: `composer --version`
5. Tekan **Enter**

**Output yang benar:**
```
Composer version 2.7.1 2024-02-09 15:26:28
```

**Jika muncul error "composer is not recognized":**
- Close semua Command Prompt
- Buka Command Prompt baru (restart)
- Coba lagi: `composer --version`

---

## 4. Setup Database

### Langkah 4.1: Buka HeidiSQL

1. Tekan tombol **Windows**
2. Ketik: `heidisql`
3. Klik **HeidiSQL**

**Atau dari XAMPP Control Panel:**
1. Di baris **MySQL**, klik tombol **"Admin"**
2. Akan buka HeidiSQL otomatis

### Langkah 4.2: Connect ke MySQL

**Jika belum ada koneksi:**

1. Klik menu **File** → **Connect**
2. Akan muncul **"Session manager"**

**Setup koneksi baru:**
```
┌──────────────────────────────────────────────────┐
│ Session manager                                  │
├──────────────────────────────────────────────────┤
│ Network type: MySQL (TCP/IP)                     │
│ Library:      libmysql.dll                       │
│                                                  │
│ Settings:                                        │
│   Hostname / IP: 127.0.0.1                       │ ← Ketik ini
│   User:          root                            │ ← Ketik ini
│   Password:      (kosong, jangan isi)            │ ← KOSONGKAN
│   Port:          3306                            │ ← Ketik ini
│                                                  │
│                             [Open]  [Cancel]     │
└──────────────────────────────────────────────────┘
```

**Detail yang harus diisi:**
- **Hostname/IP:** `127.0.0.1`
- **User:** `root`
- **Password:** (kosong, JANGAN diisi)
- **Port:** `3306`

**→ Klik tombol "Open"**

**Jika berhasil connect:**
- Di panel kiri akan muncul list database
- Ada database: `information_schema`, `mysql`, `performance_schema`, dll

### Langkah 4.3: Buat Database Baru

**Di HeidiSQL:**

1. Klik kanan pada **"Unnamed"** (di panel kiri atas)
2. Pilih **"Create new"** → **"Database"**

**Akan muncul dialog:**
```
┌──────────────────────────────────────────────────┐
│ Create database                                  │
├──────────────────────────────────────────────────┤
│ Name:      sigap_ppks                            │ ← Ketik ini
│ Collation: utf8mb4_unicode_ci                    │ ← Pilih ini
│                                                  │
│                               [OK]  [Cancel]     │
└──────────────────────────────────────────────────┘
```

**Detail yang harus diisi:**
- **Name:** `sigap_ppks` (huruf kecil semua, underscore)
- **Collation:** Cari dan pilih `utf8mb4_unicode_ci`

**→ Klik tombol "OK"**

**Jika berhasil:**
- Di panel kiri akan muncul database baru: **sigap_ppks**
- Warna biru/bold

---

## 5. Install Backend Laravel

### Langkah 5.1: Buka Command Prompt di Folder Project

**Cara 1: Via File Explorer**

1. Buka **File Explorer**
2. Navigate ke folder project Anda, contoh:
   ```
   C:\Users\YourName\Documents\PUNYAKUSENDIRI\
   ```
3. Masuk ke folder **backend-api**:
   ```
   C:\Users\YourName\Documents\PUNYAKUSENDIRI\backend-api\
   ```
4. Klik di **address bar** (tempat alamat folder)
5. Ketik: `cmd`
6. Tekan **Enter**
7. Command Prompt akan terbuka di folder tersebut

**Cara 2: Via Command Prompt Manual**

1. Tekan **Windows + R**
2. Ketik: `cmd`
3. Tekan **Enter**
4. Di Command Prompt, ketik:
   ```bash
   cd C:\Users\YourName\Documents\PUNYAKUSENDIRI\backend-api
   ```
   (sesuaikan path dengan lokasi folder Anda)
5. Tekan **Enter**

**Pastikan Anda ada di folder `backend-api`:**
```
C:\Users\YourName\Documents\PUNYAKUSENDIRI\backend-api>
```

### Langkah 5.2: Install Dependencies

Di Command Prompt, ketik:
```bash
composer install
```
Tekan **Enter**

**Proses yang terjadi:**
```
Loading composer repositories with package information
Installing dependencies from lock file
Verifying lock file contents can be installed on current platform.
Package operations: 150 installs, 0 updates, 0 removals
  - Downloading laravel/framework (v11.x-dev)
  - Installing laravel/framework (v11.x-dev): Extracting archive
  ...
```

**Tunggu sampai selesai (2-5 menit tergantung internet)**

**Output akhir jika berhasil:**
```
Generating optimized autoload files
> Illuminate\Foundation\ComposerScripts::postAutoloadDump
> @php artisan package:discover --ansi
Discovered Package: laravel/sanctum
Discovered Package: laravel/tinker
...
116 packages you are using are looking for funding.
Use the `composer fund` command to find out more!
> @php artisan vendor:publish --tag=laravel-assets --ansi --force
No publishable resources for tag [laravel-assets].
No security vulnerability advisories found
```

### Langkah 5.3: Copy File `.env`

**Di Command Prompt, ketik:**
```bash
copy .env.example .env
```
Tekan **Enter**

**Output jika berhasil:**
```
        1 file(s) copied.
```

### Langkah 5.4: Generate Application Key

**Di Command Prompt, ketik:**
```bash
php artisan key:generate
```
Tekan **Enter**

**Output jika berhasil:**
```
Application key set successfully.
```

### Langkah 5.5: Edit File `.env`

**Buka file `.env` dengan Notepad:**

1. Buka **File Explorer**
2. Navigate ke folder: `backend-api`
3. Cari file: `.env` (tanpa extension)
4. Klik kanan → **Open with** → **Notepad**

**Cari bagian Database (sekitar baris 20-25):**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

**Ubah menjadi:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigap_ppks
DB_USERNAME=root
DB_PASSWORD=
```

**Yang diubah:**
- `DB_DATABASE=laravel` → `DB_DATABASE=sigap_ppks`
- `DB_PASSWORD=` → tetap kosong (jangan diisi)

**Save file:**
1. Klik menu **File** → **Save**
2. Atau tekan **Ctrl + S**
3. Close Notepad

### Langkah 5.6: Migrate Database (Buat Tabel)

**Kembali ke Command Prompt, ketik:**
```bash
php artisan migrate
```
Tekan **Enter**

**Output yang terjadi:**
```
   INFO  Preparing database.

  Creating migration table ................................... 15ms DONE

   INFO  Running migrations.

  0001_01_01_000000_create_users_table ....................... 25ms DONE
  0001_01_01_000001_create_cache_table ....................... 12ms DONE
  0001_01_01_000002_create_jobs_table ........................ 18ms DONE
  2024_11_13_123456_create_reports_table ..................... 20ms DONE
  2024_11_13_123457_create_posts_table ....................... 15ms DONE
```

**Jika berhasil:**
- Muncul "DONE" untuk setiap tabel
- Tidak ada error merah

**Cek di HeidiSQL:**
1. Buka HeidiSQL
2. Klik database **sigap_ppks** di panel kiri
3. Klik tombol **Refresh** (atau tekan F5)
4. Akan muncul tabel-tabel baru:
   - `users`
   - `reports`
   - `posts`
   - `cache`
   - `jobs`
   - `migrations`
   - dll

### Langkah 5.7: Seed Database (Insert Data Awal)

**Di Command Prompt, ketik:**
```bash
php artisan db:seed
```
Tekan **Enter**

**Output jika berhasil:**
```
   INFO  Seeding database.

  Database\Seeders\AdminUserSeeder .......................... RUNNING
  Database\Seeders\AdminUserSeeder .......................... 50ms DONE
```

**Ini akan create 2 user:**
- Admin: `admin@sigap.ac.id` / `admin123`
- User: `user@sigap.ac.id` / `user123`

**Cek di HeidiSQL:**
1. Klik tabel **users**
2. Klik tab **Data**
3. Akan muncul 2 baris data (2 users)

### Langkah 5.8: Create Storage Symlink

**Di Command Prompt, ketik:**
```bash
php artisan storage:link
```
Tekan **Enter**

**Output jika berhasil:**
```
The [public/storage] link has been connected to [storage/app/public].
The links have been created.
```

**Ini untuk upload file (bukti, foto, dll)**

---

## 6. Jalankan Backend

### Langkah 6.1: Start Laravel Server

**Di Command Prompt (masih di folder backend-api), ketik:**
```bash
php artisan serve
```
Tekan **Enter**

**Output jika berhasil:**
```
   INFO  Server running on [http://127.0.0.1:8000].

  Press Ctrl+C to stop the server
```

**Backend sekarang RUNNING di:** `http://localhost:8000`

**JANGAN CLOSE COMMAND PROMPT INI!**
- Biarkan Command Prompt tetap terbuka
- Jika di-close, server akan mati
- Untuk stop server: tekan **Ctrl + C**

---

## 7. Test Backend

### Langkah 7.1: Test Health Check

**Buka browser baru:**

1. Buka Chrome/Firefox/Edge
2. Di address bar, ketik: `http://localhost:8000/api/health`
3. Tekan **Enter**

**Jika berhasil, akan muncul:**
```json
{
    "status": "ok",
    "message": "SIGAP PPKS API is running",
    "timestamp": "2025-11-13T12:34:56.000000Z",
    "version": "1.0.0"
}
```

**Jika muncul JSON di atas → ✅ Backend berjalan sempurna!**

### Langkah 7.2: Test Login API

**Gunakan browser atau Postman:**

**Via Browser (Simple Test):**

1. Install extension **JSON Viewer** (optional, untuk view JSON lebih bagus)
2. Buka browser
3. Anda perlu tool untuk POST request (browser default hanya GET)

**Via Postman (Recommended):**

1. Download Postman: https://www.postman.com/downloads/
2. Install Postman
3. Buka Postman

**Test Login:**
- **Method:** POST
- **URL:** `http://localhost:8000/api/auth/login`
- **Headers:**
  - `Content-Type`: `application/json`
  - `Accept`: `application/json`
- **Body (raw JSON):**
  ```json
  {
      "email": "admin@sigap.ac.id",
      "password": "admin123"
  }
  ```
- **Klik "Send"**

**Response jika berhasil:**
```json
{
    "success": true,
    "message": "Login berhasil",
    "data": {
        "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "user": {
            "id": 1,
            "name": "Admin SIGAP",
            "email": "admin@sigap.ac.id",
            "role": "admin"
        }
    }
}
```

**Jika dapat response di atas → ✅ Login API berjalan!**

### Langkah 7.3: Test Frontend Login

**Sekarang test dengan frontend:**

1. Buka **File Explorer**
2. Navigate ke folder: `PUNYAKUSENDIRI\auth\`
3. Klik kanan file: `login.html`
4. Pilih **Open with** → **Chrome** (atau browser lain)

**Atau gunakan Live Server (jika pakai VS Code):**
1. Buka VS Code
2. Buka folder: `PUNYAKUSENDIRI`
3. Klik kanan file: `auth/login.html`
4. Pilih **Open with Live Server**

**Di halaman login:**
1. Email: `admin@sigap.ac.id`
2. Password: `admin123`
3. Klik **Login**

**Jika berhasil:**
- Redirect ke dashboard
- Atau lihat console browser (F12 → Console tab)
- Muncul: `✅ Login successful`

---

## 8. Troubleshooting

### ❌ Error: "composer: command not found"

**Solusi:**
1. Close semua Command Prompt
2. Buka Command Prompt BARU
3. Coba lagi: `composer --version`
4. Jika masih error:
   - Restart komputer
   - Coba lagi

### ❌ Error: "php: command not found"

**Solusi:**
1. Pastikan XAMPP sudah terinstall
2. Add PHP ke PATH:
   - Tekan **Windows + R**
   - Ketik: `sysdm.cpl`
   - Tab **Advanced** → **Environment Variables**
   - Di **System variables**, cari **Path**
   - Klik **Edit**
   - Klik **New**
   - Tambahkan: `C:\xampp\php`
   - Klik **OK** semua dialog
   - Restart Command Prompt

### ❌ Error: "SQLSTATE[HY000] [2002] No connection could be made"

**Penyebab:** MySQL tidak jalan

**Solusi:**
1. Buka XAMPP Control Panel
2. Pastikan MySQL **HIJAU** (running)
3. Jika tidak, klik tombol **Start** di MySQL
4. Coba lagi: `php artisan migrate`

### ❌ Error: "Access denied for user 'root'@'localhost'"

**Penyebab:** Password MySQL salah

**Solusi:**
1. Buka file `.env`
2. Cek baris:
   ```env
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Pastikan `DB_PASSWORD` **KOSONG** (untuk XAMPP default)
4. Jika pakai password, isi password yang benar
5. Save file
6. Coba lagi: `php artisan migrate`

### ❌ Error: "Class 'ZipArchive' not found"

**Penyebab:** Extension PHP tidak aktif

**Solusi:**
1. Buka folder: `C:\xampp\php\`
2. Edit file: `php.ini` dengan Notepad
3. Cari baris: `;extension=zip` (ada titik koma di depan)
4. Hapus titik koma jadi: `extension=zip`
5. Save file
6. Restart Command Prompt
7. Coba lagi: `composer install`

### ❌ Error: "The stream or file ... could not be opened"

**Penyebab:** Permission error

**Solusi:**
```bash
php artisan cache:clear
php artisan config:clear
```

### ❌ Port 8000 sudah dipakai

**Solusi:** Gunakan port lain
```bash
php artisan serve --port=8001
```

Backend akan jalan di: `http://localhost:8001`

---

## 9. Workflow Harian

### 🌅 Saat Mulai Develop (Pagi/Kapanpun)

**Step 1: Start XAMPP**
1. Buka XAMPP Control Panel
2. Klik **Start** untuk Apache
3. Klik **Start** untuk MySQL
4. Tunggu sampai background HIJAU

**Step 2: Start Backend**
1. Buka Command Prompt di folder `backend-api`
2. Ketik: `php artisan serve`
3. Tekan Enter
4. **JANGAN CLOSE** Command Prompt ini

**Step 3: Develop**
1. Buka browser
2. Test: `http://localhost:8000/api/health`
3. Jika OK → mulai coding!

### 🌙 Saat Selesai Develop (Malam/Istirahat)

**Step 1: Stop Backend**
1. Di Command Prompt yang running `php artisan serve`
2. Tekan **Ctrl + C**
3. Close Command Prompt

**Step 2: Stop XAMPP**
1. Buka XAMPP Control Panel
2. Klik **Stop** untuk MySQL
3. Klik **Stop** untuk Apache
4. Close XAMPP Control Panel

**Step 3: Optional**
- Shutdown komputer
- Atau lanjut kerja lain

---

## 10. Checklist Final

Pastikan semua ini ✅:

### Software Installed
- ✅ XAMPP (Apache + MySQL)
- ✅ HeidiSQL
- ✅ Composer
- ✅ Backend dependencies (`composer install`)

### Database
- ✅ Database `sigap_ppks` sudah dibuat
- ✅ Tabel sudah ada (users, reports, posts, dll)
- ✅ User admin & user sudah ada di tabel `users`

### Backend Running
- ✅ `php artisan serve` running
- ✅ `http://localhost:8000/api/health` return JSON OK
- ✅ Login API berfungsi

### Frontend Testing
- ✅ Bisa login via `auth/login.html`
- ✅ Bisa submit laporan di `Lapor/lapor.html`
- ✅ Bisa tracking di `Monitoring/monitoring.html`
- ✅ Admin bisa akses `Admin/dashboard.html`

---

## 📞 Bantuan Tambahan

### Jika Masih Error:

1. **Screenshot error message**
2. **Copy full error text** dari Command Prompt
3. **Catat langkah yang sedang dijalankan**
4. **Tanya di forum** atau contact support

### Command Berguna

**Cek versi software:**
```bash
php --version          # Cek PHP version
composer --version     # Cek Composer version
```

**Laravel commands:**
```bash
php artisan list              # Lihat semua command
php artisan migrate:status    # Cek status migrations
php artisan db:show           # Info database
php artisan cache:clear       # Clear cache
php artisan config:clear      # Clear config
php artisan route:list        # Lihat semua routes
```

**Database commands:**
```bash
php artisan migrate:fresh     # Drop all tables & migrate ulang (HATI-HATI: hapus semua data!)
php artisan migrate:fresh --seed   # Migrate ulang + seed data
php artisan db:seed --class=AdminUserSeeder   # Seed ulang admin user
```

---

## 🎉 Selamat!

Jika semua langkah sudah selesai, backend Laravel Anda sudah running!

**Next steps:**
1. Test semua endpoint API
2. Integrate dengan frontend
3. Deploy ke production server (optional)

**Happy Coding! 🚀**

---

**Dibuat:** 13 November 2025
**Untuk:** SIGAP PPKS Project
**Level:** Pemula (Step-by-step dari nol)
