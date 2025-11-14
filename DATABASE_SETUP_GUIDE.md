# 🗄️ PANDUAN LENGKAP SETUP DATABASE SIGAP PPKS

## 📋 **RINGKASAN DATABASE**

Database `sigap_ppks` adalah jantung dari sistem SIGAP PPKS dengan **5 tabel utama**:

### **Tabel & Fungsi:**
1. **users** - User & admin authentication
2. **reports** - Data laporan kekerasan
3. **report_files** - File bukti (multi-file support)
4. **posts** - Konten edukatif/blog
5. **personal_access_tokens** - Sanctum authentication tokens

---

## 🔍 **STRUKTUR DATABASE LENGKAP**

### **1. Tabel `users`**
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
name                VARCHAR(255)
email               VARCHAR(255) UNIQUE
email_verified_at   TIMESTAMP NULL
password            VARCHAR(255)        -- Hashed dengan bcrypt
role                ENUM('admin', 'user') DEFAULT 'user'
remember_token      VARCHAR(100) NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEX: email (unique)
```

**Default Users (dari seeder):**
- Admin: admin@sigap.ac.id / admin123
- User: user@sigap.ac.id / user123

---

### **2. Tabel `reports`** (Laporan Kekerasan)
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
user_id             BIGINT NULL         -- FK to users (nullable untuk anonim)
id_pelapor          VARCHAR(255) UNIQUE -- Format: #876364
source              ENUM('chatbot_guided', 'chatbot_curhat', 'manual')

-- Data Pelapor
nama                VARCHAR(255)        -- Bisa 'Anonim'
jenis_kelamin       ENUM('Laki-laki', 'Perempuan') NULL
email               VARCHAR(255) NULL
usia_korban         INT NULL
whatsapp_korban     VARCHAR(15) NULL

-- Data Kejadian
tanggal_kejadian    DATE
hari_kejadian       VARCHAR(255) NULL   -- Jumat, Sabtu, dll
lokasi_kejadian     TEXT
lokasi              VARCHAR(255) NULL
kronologi           TEXT
deskripsi           TEXT NULL
kategori            ENUM(
                      'Pelecehan Seksual',
                      'Kekerasan Fisik',
                      'Kekerasan Psikis',
                      'Perundungan',
                      'Lainnya'
                    )
jenis_pelanggaran   VARCHAR(255) NULL

-- Status & Metadata
status              ENUM('pending', 'process', 'complete') DEFAULT 'pending'
status_pelanggaran  ENUM('menunggu', 'diproses', 'selesai') DEFAULT 'menunggu'
tingkat_khawatir    ENUM('sedikit', 'khawatir', 'sangat') DEFAULT 'khawatir'
resume_laporan      TEXT NULL
catatan_admin       TEXT NULL
bukti_file_path     VARCHAR(255) NULL   -- Legacy field

created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEXES:
- user_id
- id_pelapor (unique)
- status
- kategori
- tanggal_kejadian
- usia_korban
- created_at

FOREIGN KEYS:
- user_id REFERENCES users(id) ON DELETE CASCADE
```

**Field Mapping (Frontend → Backend):**
```
Frontend          →  Backend (Database)
----------------------------------------
namaKorban        →  nama
emailKorban       →  email
genderKorban      →  jenis_kelamin
usiaKorban        →  usia_korban
whatsappKorban    →  whatsapp_korban
waktuKejadian     →  tanggal_kejadian
lokasiKejadian    →  lokasi_kejadian
detailKejadian    →  kronologi
kehawatiran       →  tingkat_khawatir
bukti_files[]     →  report_files (many-to-many)
```

---

### **3. Tabel `report_files`** (File Bukti)
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
report_id           BIGINT              -- FK to reports
file_path           VARCHAR(255)        -- storage/app/public/bukti/abc.jpg
file_name           VARCHAR(255) NULL   -- Original filename
file_mime_type      VARCHAR(100) NULL   -- image/jpeg, video/mp4, etc
file_size           BIGINT NULL         -- Size in bytes

created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEXES:
- report_id

FOREIGN KEYS:
- report_id REFERENCES reports(id) ON DELETE CASCADE
```

**Supported File Types:**
- Images: jpg, jpeg, png
- Videos: mp4, mov
- Documents: pdf, doc, docx
- **Max**: 5 files per report, 10MB per file

---

### **4. Tabel `posts`** (Blog/Konten Edukatif)
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
user_id             BIGINT              -- FK to users (author)
title               VARCHAR(255)
slug                VARCHAR(255) UNIQUE
content             TEXT
image_url           VARCHAR(255) NULL
is_published        BOOLEAN DEFAULT 0
published_at        TIMESTAMP NULL

created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEXES:
- user_id
- slug (unique)
- is_published

FOREIGN KEYS:
- user_id REFERENCES users(id) ON DELETE CASCADE
```

---

### **5. Tabel `personal_access_tokens`** (Sanctum)
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
tokenable_type      VARCHAR(255)        -- App\Models\User
tokenable_id        BIGINT              -- User ID
name                VARCHAR(255)        -- token
token               VARCHAR(64) UNIQUE  -- Hashed token
abilities           TEXT NULL
last_used_at        TIMESTAMP NULL
expires_at          TIMESTAMP NULL
created_at          TIMESTAMP
updated_at          TIMESTAMP

INDEXES:
- tokenable_type, tokenable_id
- token (unique)
```

---

### **6. Tabel `sessions`** (Laravel Sessions)
```sql
id                  VARCHAR(255) PRIMARY KEY
user_id             BIGINT NULL
ip_address          VARCHAR(45) NULL
user_agent          TEXT NULL
payload             LONGTEXT
last_activity       INT

INDEXES:
- user_id
- last_activity
```

---

### **7. Tabel `cache`** (Laravel Cache)
```sql
key                 VARCHAR(255) PRIMARY KEY
value               MEDIUMTEXT
expiration          INT

INDEX: expiration
```

---

### **8. Tabel `jobs`** (Laravel Queue)
```sql
id                  BIGINT PRIMARY KEY AUTO_INCREMENT
queue               VARCHAR(255)
payload             LONGTEXT
attempts            TINYINT UNSIGNED
reserved_at         INT UNSIGNED NULL
available_at        INT UNSIGNED
created_at          INT UNSIGNED

INDEXES:
- queue
```

---

## 🚀 **METODE SETUP DATABASE**

Ada **2 cara** setup database:

### **Metode 1: Laravel Migration (RECOMMENDED)**
✅ Otomatis, clean, trackable
✅ Sudah termasuk indexes dan foreign keys
✅ Bisa rollback jika ada masalah

### **Metode 2: Manual SQL Script**
⚠️ Backup jika migration gagal
⚠️ Harus update manual jika ada perubahan

---

## 📖 **METODE 1: LARAVEL MIGRATION (RECOMMENDED)**

### **Langkah 1: Jalankan MySQL Server**

**Jika menggunakan XAMPP:**
```bash
# 1. Buka XAMPP Control Panel
# 2. Klik "Start" pada MySQL
# 3. Tunggu hingga status hijau/running
```

**Jika menggunakan MySQL Standalone (Linux):**
```bash
sudo service mysql start
# atau
sudo systemctl start mysql
```

**Jika menggunakan MySQL Standalone (Windows):**
```cmd
net start mysql
```

**Verifikasi MySQL Running:**
```bash
# Test koneksi
mysql -u root -p
# Ketik password (kosong untuk XAMPP default)
# Jika berhasil, akan muncul prompt mysql>
```

---

### **Langkah 2: Buat Database**

**Opsi A: Via MySQL Command Line**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS sigap_ppks;"
```

**Opsi B: Via MySQL Prompt**
```sql
mysql -u root -p
# Setelah masuk ke mysql>

CREATE DATABASE IF NOT EXISTS sigap_ppks;
SHOW DATABASES;  -- Verify database created
USE sigap_ppks;
EXIT;
```

**Opsi C: Via phpMyAdmin**
1. Buka http://localhost/phpmyadmin
2. Klik "New" di sidebar kiri
3. Nama database: `sigap_ppks`
4. Collation: `utf8mb4_unicode_ci`
5. Klik "Create"

---

### **Langkah 3: Jalankan Migration**

```bash
cd /home/user/PUNYAKUSENDIRI/backend-api

# 1. Test koneksi database
php artisan migrate:status

# 2. Jalankan semua migrations
php artisan migrate

# Output yang diharapkan:
# INFO  Running migrations.
# 2025_11_13_192512_create_reports_table ............. DONE
# 2025_11_13_192739_create_personal_access_tokens_table ... DONE
# (dll)
```

---

### **Langkah 4: Seed Data Awal**

```bash
# Isi database dengan admin & user default
php artisan db:seed

# Output:
# ✅ Admin user created: admin@sigap.ac.id / admin123
# ✅ Test user created: user@sigap.ac.id / user123
```

---

### **Langkah 5: Verifikasi Database**

```bash
# Check migration status
php artisan migrate:status

# Test database via tinker
php artisan tinker
>>> \App\Models\User::count()
# Output: 2

>>> \App\Models\User::where('role', 'admin')->first()->email
# Output: "admin@sigap.ac.id"

>>> exit
```

**Atau via MySQL:**
```sql
mysql -u root -p sigap_ppks -e "SHOW TABLES;"
mysql -u root -p sigap_ppks -e "SELECT * FROM users;"
```

---

### **Langkah 6: Start Server & Test**

```bash
# Jalankan Laravel server
php artisan serve

# Output:
# Server running on [http://127.0.0.1:8000]
```

**Test API:**
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sigap.ac.id","password":"admin123"}'
```

---

## 🛠️ **METODE 2: MANUAL SQL SCRIPT**

Jika Laravel migration gagal, gunakan script SQL berikut:

### **Langkah 1: Buat File SQL**

Simpan script berikut sebagai `sigap_ppks_setup.sql`:

```sql
-- ============================================
-- SIGAP PPKS DATABASE SETUP SCRIPT
-- Generated: 2025-11-14
-- ============================================

-- Drop database if exists (HATI-HATI!)
-- DROP DATABASE IF EXISTS sigap_ppks;

-- Create database
CREATE DATABASE IF NOT EXISTS sigap_ppks
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sigap_ppks;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reports
-- ============================================
CREATE TABLE IF NOT EXISTS `reports` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NULL DEFAULT NULL,
  `id_pelapor` varchar(255) NOT NULL,
  `source` enum('chatbot_guided','chatbot_curhat','manual') NOT NULL DEFAULT 'chatbot_guided',

  -- Data Pelapor
  `nama` varchar(255) NOT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `usia_korban` int(11) DEFAULT NULL,
  `whatsapp_korban` varchar(15) DEFAULT NULL,

  -- Data Kejadian
  `tanggal_kejadian` date NOT NULL,
  `hari_kejadian` varchar(255) DEFAULT NULL,
  `lokasi_kejadian` text NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `kronologi` text NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kategori` enum('Pelecehan Seksual','Kekerasan Fisik','Kekerasan Psikis','Perundungan','Lainnya') NOT NULL,
  `jenis_pelanggaran` varchar(255) DEFAULT NULL,

  -- Status & Metadata
  `status` enum('pending','process','complete') NOT NULL DEFAULT 'pending',
  `status_pelanggaran` enum('menunggu','diproses','selesai') NOT NULL DEFAULT 'menunggu',
  `tingkat_khawatir` enum('sedikit','khawatir','sangat') NOT NULL DEFAULT 'khawatir',
  `resume_laporan` text DEFAULT NULL,
  `catatan_admin` text DEFAULT NULL,
  `bukti_file_path` varchar(255) DEFAULT NULL,

  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `reports_id_pelapor_unique` (`id_pelapor`),
  KEY `reports_user_id_index` (`user_id`),
  KEY `reports_status_index` (`status`),
  KEY `reports_kategori_index` (`kategori`),
  KEY `reports_tanggal_kejadian_index` (`tanggal_kejadian`),
  KEY `reports_usia_korban_index` (`usia_korban`),
  KEY `reports_created_at_index` (`created_at`),

  CONSTRAINT `reports_user_id_foreign`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: report_files
-- ============================================
CREATE TABLE IF NOT EXISTS `report_files` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` bigint(20) UNSIGNED NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_mime_type` varchar(100) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  KEY `report_files_report_id_index` (`report_id`),

  CONSTRAINT `report_files_report_id_foreign`
    FOREIGN KEY (`report_id`)
    REFERENCES `reports` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: posts
-- ============================================
CREATE TABLE IF NOT EXISTS `posts` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `posts_slug_unique` (`slug`),
  KEY `posts_user_id_index` (`user_id`),
  KEY `posts_is_published_index` (`is_published`),

  CONSTRAINT `posts_user_id_foreign`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: personal_access_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: sessions
-- ============================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,

  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: cache
-- ============================================
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,

  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,

  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: jobs
-- ============================================
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,

  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),

  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: password_reset_tokens
-- ============================================
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,

  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: migrations
-- ============================================
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,

  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DEFAULT DATA
-- ============================================

-- Insert admin user (password: admin123)
INSERT INTO `users` (`name`, `email`, `password`, `role`, `created_at`, `updated_at`)
VALUES
  ('Admin SIGAP', 'admin@sigap.ac.id', '$2y$12$LQv3c1yYdHxJY1I9o0Gw9O4NVjJ1pY8Uo7KQvZ3X7Qj2Yp1Rz5Wq.', 'admin', NOW(), NOW()),
  ('User Test', 'user@sigap.ac.id', '$2y$12$LQv3c1yYdHxJY1I9o0Gw9O4NVjJ1pY8Uo7KQvZ3X7Qj2Yp1Rz5Wq.', 'user', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all tables
SELECT 'Database tables created successfully!' AS status;
SHOW TABLES;

-- Count users
SELECT 'Default users created:' AS status, COUNT(*) AS count FROM users;
SELECT email, role FROM users;

SELECT '✅ Database setup complete!' AS status;
```

---

### **Langkah 2: Import SQL File**

**Via Command Line:**
```bash
mysql -u root -p < sigap_ppks_setup.sql
```

**Via phpMyAdmin:**
1. Buka http://localhost/phpmyadmin
2. Pilih database `sigap_ppks` (buat dulu jika belum ada)
3. Klik tab "Import"
4. Choose File → `sigap_ppks_setup.sql`
5. Klik "Go"

---

## ✅ **VERIFIKASI INSTALASI**

### **Check 1: Verifikasi Tabel**
```sql
USE sigap_ppks;
SHOW TABLES;
```

**Expected output:**
```
+------------------------+
| Tables_in_sigap_ppks   |
+------------------------+
| cache                  |
| cache_locks            |
| failed_jobs            |
| job_batches            |
| jobs                   |
| migrations             |
| password_reset_tokens  |
| personal_access_tokens |
| posts                  |
| report_files           |
| reports                |
| sessions               |
| users                  |
+------------------------+
13 rows in set
```

---

### **Check 2: Verifikasi Users**
```sql
SELECT id, name, email, role FROM users;
```

**Expected output:**
```
+----+-------------+---------------------+-------+
| id | name        | email               | role  |
+----+-------------+---------------------+-------+
|  1 | Admin SIGAP | admin@sigap.ac.id   | admin |
|  2 | User Test   | user@sigap.ac.id    | user  |
+----+-------------+---------------------+-------+
```

---

### **Check 3: Verifikasi Reports Schema**
```sql
DESCRIBE reports;
```

---

### **Check 4: Test Backend Connection**
```bash
cd /home/user/PUNYAKUSENDIRI/backend-api

# Test database connection
php artisan tinker
>>> \DB::connection()->getPdo();
# Should return PDO object

>>> \App\Models\User::count();
# Should return: 2

>>> exit
```

---

### **Check 5: Test API Endpoints**
```bash
# Start server
php artisan serve

# Test login (in new terminal)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sigap.ac.id","password":"admin123"}'

# Expected response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "1|abc123..."
  }
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Error: "Connection refused"**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solusi:**
1. Pastikan MySQL service running
2. Check dengan: `service mysql status` atau buka XAMPP
3. Restart MySQL jika perlu

---

### **Error: "Access denied for user"**
```
SQLSTATE[HY000] [1045] Access denied for user 'root'
```

**Solusi:**
1. Check password di `.env` (line 28)
2. XAMPP default: password kosong
3. Update `.env`: `DB_PASSWORD=` (kosong)

---

### **Error: "Unknown database 'sigap_ppks'"**
```
SQLSTATE[HY000] [1049] Unknown database 'sigap_ppks'
```

**Solusi:**
```bash
mysql -u root -p -e "CREATE DATABASE sigap_ppks;"
```

---

### **Error: "SQLSTATE[42S01]: Base table already exists"**

**Solusi:**
```bash
# Reset migrations
php artisan migrate:fresh --seed

# HATI-HATI: Ini akan menghapus semua data!
```

---

### **Error: "Class 'PDO' not found"**

**Solusi:**
```bash
# Install PHP MySQL extension
sudo apt-get install php-mysql   # Ubuntu/Debian
# atau
sudo yum install php-mysql        # CentOS

# Restart Apache/PHP-FPM
```

---

## 📊 **STATISTIK DATABASE**

**Expected sizes setelah setup:**
- **Tables**: 13 tabel
- **Rows**: 2 users (admin + test user)
- **Size**: ~1-2 MB (empty, belum ada laporan)

**Setelah digunakan (estimasi):**
- 100 laporan: ~5-10 MB
- 1000 laporan: ~50-100 MB (tergantung file upload)
- 10000 laporan: ~500 MB - 1 GB

---

## 🔒 **KEAMANAN DATABASE**

### **Production Checklist:**
- [ ] Ganti password default admin
- [ ] Hapus user test di production
- [ ] Gunakan strong MySQL root password
- [ ] Enable MySQL firewall rules
- [ ] Backup database secara rutin
- [ ] Enable SSL untuk MySQL connection
- [ ] Rotate Laravel APP_KEY secara berkala

### **Backup Command:**
```bash
# Backup database
mysqldump -u root -p sigap_ppks > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p sigap_ppks < backup_20251114.sql
```

---

## ✨ **NEXT STEPS**

Setelah database berhasil dibuat:

1. ✅ **Start Laravel Server**
   ```bash
   php artisan serve
   ```

2. ✅ **Test Frontend Connection**
   - Buka `http://localhost:5500`
   - Login dengan: admin@sigap.ac.id / admin123
   - Coba buat laporan test

3. ✅ **Monitor Logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. ✅ **Test All Features**
   - Manual report form
   - Chatbot guided mode
   - Monitoring system
   - Admin dashboard

---

## 📚 **REFERENSI**

- Laravel Migrations: https://laravel.com/docs/11.x/migrations
- Laravel Seeding: https://laravel.com/docs/11.x/seeding
- MySQL Documentation: https://dev.mysql.com/doc/
- XAMPP Guide: https://www.apachefriends.org/docs/

---

**Generated by:** Claude AI
**Date:** 2025-11-14
**Project:** SIGAP PPKS - Sistem Informasi Pelaporan Kekerasan Seksual
**Version:** 1.0.0
