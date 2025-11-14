# 🚀 PANDUAN STEP-BY-STEP: Setup Database Sampai Website Jalan

## 📋 **CHECKLIST LENGKAP**

Ikuti langkah-langkah ini secara berurutan. Jangan skip!

- [ ] **Step 1**: Setup MySQL Server
- [ ] **Step 2**: Buat Database
- [ ] **Step 3**: Jalankan Migrations
- [ ] **Step 4**: Seed Data Awal
- [ ] **Step 5**: Start Backend Server
- [ ] **Step 6**: Test Backend API
- [ ] **Step 7**: Start Frontend Server
- [ ] **Step 8**: Test Login
- [ ] **Step 9**: Test Buat Laporan
- [ ] **Step 10**: Verify Everything Works! 🎉

---

## 🎯 **STEP 1: SETUP MYSQL SERVER**

### **Cek apakah MySQL sudah terinstall:**

```bash
# Test 1: Cek MySQL installed
mysql --version

# Test 2: Coba connect
mysql -u root

# Jika berhasil masuk ke mysql>, ketik:
EXIT;
```

### **Jika MySQL BELUM terinstall:**

**Opsi A: Install MySQL di Linux**
```bash
# Update package list
sudo apt update

# Install MySQL Server
sudo apt install mysql-server -y

# Start MySQL service
sudo service mysql start

# Secure installation (optional - bisa skip untuk development)
# sudo mysql_secure_installation

# Test connection
mysql -u root
EXIT;
```

**Opsi B: Install XAMPP (Recommended untuk pemula)**
```bash
# Download XAMPP for Linux
wget https://sourceforge.net/projects/xampp/files/XAMPP%20Linux/8.2.12/xampp-linux-x64-8.2.12-0-installer.run

# Make it executable
chmod +x xampp-linux-x64-8.2.12-0-installer.run

# Install (requires sudo)
sudo ./xampp-linux-x64-8.2.12-0-installer.run

# Start XAMPP
sudo /opt/lampp/lampp start

# Access phpMyAdmin: http://localhost/phpmyadmin
```

### **✅ Verifikasi MySQL Running:**

```bash
# Test koneksi (NO PASSWORD)
mysql -u root

# Jika berhasil muncul:
# Welcome to the MySQL monitor...
# mysql>

# Berarti MySQL sudah running! ✅
# Ketik EXIT; untuk keluar
```

**❌ Jika error "command not found":**
- MySQL belum terinstall → Install dulu (lihat di atas)

**❌ Jika error "Connection refused":**
- MySQL belum running → Start service: `sudo service mysql start`

---

## 🎯 **STEP 2: BUAT DATABASE**

### **Metode 1: Via Command Line (Recommended)**

```bash
# Buat database langsung
mysql -u root -e "CREATE DATABASE IF NOT EXISTS sigap_ppks;"

# Verifikasi database created
mysql -u root -e "SHOW DATABASES LIKE 'sigap_ppks';"
```

**Expected Output:**
```
+-------------------------+
| Database (sigap_ppks)   |
+-------------------------+
| sigap_ppks              |
+-------------------------+
```

### **Metode 2: Via MySQL Prompt**

```bash
# Masuk ke MySQL
mysql -u root

# Di dalam mysql>, jalankan:
CREATE DATABASE IF NOT EXISTS sigap_ppks;
SHOW DATABASES;
USE sigap_ppks;
SHOW TABLES;  -- Harusnya kosong dulu
EXIT;
```

### **Metode 3: Via phpMyAdmin (Jika pakai XAMPP)**

1. Buka browser: http://localhost/phpmyadmin
2. Klik "**New**" di sidebar kiri
3. Database name: `sigap_ppks`
4. Collation: `utf8mb4_unicode_ci`
5. Klik "**Create**"

### **✅ Verifikasi Database Berhasil Dibuat:**

```bash
mysql -u root sigap_ppks -e "SELECT DATABASE();"
```

**Expected Output:**
```
+------------+
| DATABASE() |
+------------+
| sigap_ppks |
+------------+
```

---

## 🎯 **STEP 3: JALANKAN MIGRATIONS**

Migrations akan membuat semua tabel yang dibutuhkan.

```bash
# 1. Masuk ke folder backend
cd /home/user/PUNYAKUSENDIRI/backend-api

# 2. Cek koneksi database dulu
php artisan migrate:status
```

**Jika ERROR "Connection refused":**
```bash
# MySQL belum running, start dulu:
sudo service mysql start
# Lalu coba lagi: php artisan migrate:status
```

**Jika ERROR "Unknown database":**
```bash
# Database belum dibuat, buat dulu (lihat Step 2)
mysql -u root -e "CREATE DATABASE sigap_ppks;"
```

**Jika SUKSES, lanjut:**

```bash
# 3. Jalankan migrations
php artisan migrate

# Akan muncul output seperti ini:
# INFO  Running migrations.
#   2025_11_13_192512_create_reports_table ................ DONE
#   2025_11_13_192739_create_personal_access_tokens_table . DONE
#   2025_11_13_195221_add_role_to_users_table ............. DONE
#   2025_11_13_195255_create_posts_table .................. DONE
#   2025_11_13_195349_add_additional_fields_to_reports_table DONE
#   2025_11_13_201421_add_victim_fields_to_reports_table .. DONE
#   2025_11_13_201500_create_report_files_table ........... DONE
#   0001_01_01_000000_create_users_table .................. DONE
#   0001_01_01_000001_create_cache_table .................. DONE
#   0001_01_01_000002_create_jobs_table ................... DONE
```

### **✅ Verifikasi Migrations Berhasil:**

```bash
# Check tabel yang dibuat
mysql -u root sigap_ppks -e "SHOW TABLES;"
```

**Expected Output (13 tabel):**
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
```

**✅ Jika ada 13 tabel → SUKSES!** 🎉

---

## 🎯 **STEP 4: SEED DATA AWAL**

Ini akan membuat:
- 1 Admin user: admin@sigap.ac.id / admin123
- 1 Test user: user@sigap.ac.id / user123

```bash
# Masih di folder backend-api
php artisan db:seed

# Output:
# ✅ Admin user created: admin@sigap.ac.id / admin123
# ✅ Test user created: user@sigap.ac.id / user123
```

### **✅ Verifikasi Users Created:**

```bash
mysql -u root sigap_ppks -e "SELECT id, name, email, role FROM users;"
```

**Expected Output:**
```
+----+-------------+---------------------+-------+
| id | name        | email               | role  |
+----+-------------+---------------------+-------+
|  1 | Admin SIGAP | admin@sigap.ac.id   | admin |
|  2 | User Test   | user@sigap.ac.id    | user  |
+----+-------------+---------------------+-------+
```

**✅ Jika ada 2 users → SUKSES!** 🎉

---

## 🎯 **STEP 5: START BACKEND SERVER**

```bash
# Masih di folder backend-api
php artisan serve

# Output:
#   INFO  Server running on [http://127.0.0.1:8000].
#
#   Press Ctrl+C to stop the server
```

**✅ JANGAN TUTUP TERMINAL INI!** Server harus tetap running.

### **Test Backend dari Terminal Baru:**

Buka **terminal baru** (jangan tutup yang server), lalu:

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected response:
# {"status":"ok","message":"API is running"}
```

**✅ Jika dapat response JSON → Backend running!** 🎉

---

## 🎯 **STEP 6: TEST BACKEND API**

Masih di terminal baru, test login admin:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sigap.ac.id",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin SIGAP",
      "email": "admin@sigap.ac.id",
      "role": "admin"
    },
    "token": "1|abcdefghijklmnopqrstuvwxyz..."
  }
}
```

**✅ Jika dapat token → API works!** 🎉

### **Test Reports API:**

```bash
# Get all reports (should be empty)
curl http://localhost:8000/api/reports

# Expected response:
# {"success":true,"data":[],"meta":{"total":0,...}}
```

**✅ Backend API fully working!** 🎉

---

## 🎯 **STEP 7: START FRONTEND SERVER**

Buka **terminal ketiga** (backend masih running di terminal 1):

```bash
# Masuk ke folder root project
cd /home/user/PUNYAKUSENDIRI

# Start frontend dengan Python HTTP server
python3 -m http.server 5500

# Output:
# Serving HTTP on 0.0.0.0 port 5500 (http://0.0.0.0:5500/) ...
```

**✅ JANGAN TUTUP TERMINAL INI!** Frontend server harus running.

### **Alternatif: VS Code Live Server**

Jika pakai VS Code:
1. Install extension "Live Server"
2. Right-click pada `Landing Page/Landing_Page.html`
3. Pilih "Open with Live Server"
4. Otomatis buka di http://localhost:5500

---

## 🎯 **STEP 8: TEST LOGIN**

### **Buka Browser:**

1. **Buka**: http://localhost:5500/Landing%20Page/Landing_Page.html
2. Klik menu "**Login**" di navbar
3. Atau langsung ke: http://localhost:5500/auth/login.html

### **Login sebagai Admin:**

```
Email: admin@sigap.ac.id
Password: admin123
```

**Klik "Masuk"**

### **✅ Verifikasi Login Berhasil:**

- ✅ Redirect ke dashboard (jika admin) atau homepage
- ✅ Muncul nama "Admin SIGAP" di navbar
- ✅ Menu "Dashboard" muncul (untuk admin)
- ✅ Console browser tidak ada error

**Cek Console Browser:**
```
Press F12 → Console tab
Should see:
✅ API client initialized
✅ Login successful
✅ Redirecting to dashboard...
```

**✅ Login works!** 🎉

---

## 🎯 **STEP 9: TEST BUAT LAPORAN**

### **Test Manual Report Form:**

1. **Logout** dulu (jika masih login)
2. Buka: http://localhost:5500/Lapor/lapor.html
3. Isi form dengan data test:

**Step 1: Keadaan Darurat**
- Pilih: "Tidak, saya bisa melaporkan sendiri"
- Klik "Lanjutkan"

**Step 2: Status Korban & Kehawatiran**
- Korban: Pilih "Saya Sendiri"
- Tingkat Kehawatiran: Pilih "Khawatir"
- Klik "Lanjutkan"

**Step 3: Data Korban**
- Nama: `Test Korban` (atau "Anonim")
- Email: `test@example.com` (optional)
- Gender: Pilih salah satu
- Usia: `20`
- WhatsApp: `081234567890` (optional)
- Klik "Lanjutkan"

**Step 4: Detail Kejadian**
- Waktu: Pilih tanggal kemarin
- Lokasi: `Gedung A Lantai 2`
- Detail: `Ini adalah test laporan untuk verifikasi sistem`
- Upload file: (optional - skip saja untuk test cepat)
- Klik "Lanjutkan"

**Step 5: Review & Submit**
- Review semua data
- Klik "**Kirim Pengaduan**"

### **✅ Verifikasi Laporan Berhasil:**

**Jika Sukses:**
- ✅ Muncul alert: "✅ Pengaduan Berhasil Dikirim! Kode Laporan: #123456"
- ✅ Auto redirect ke halaman Monitoring
- ✅ Di halaman Monitoring, bisa lihat status laporan

**Cek di Database:**
```bash
mysql -u root sigap_ppks -e "SELECT id_pelapor, nama, kategori, status FROM reports;"
```

**Expected Output:**
```
+-------------+-------------+---------+---------+
| id_pelapor  | nama        | kategori| status  |
+-------------+-------------+---------+---------+
| #123456     | Test Korban | Lainnya | pending |
+-------------+-------------+---------+---------+
```

**✅ Report created successfully!** 🎉

---

## 🎯 **STEP 10: TEST MONITORING SYSTEM**

1. **Copy kode laporan** dari alert (contoh: #123456)
2. Buka: http://localhost:5500/Monitoring/monitoring.html
3. **Paste** kode laporan di kolom pencarian
4. Klik "**Cek Status**"

### **✅ Verifikasi Monitoring Works:**

- ✅ Muncul detail laporan
- ✅ Status: "Pending" dengan warna kuning
- ✅ Timeline menunjukkan tanggal submit
- ✅ Semua data sesuai yang diinput

**✅ Monitoring works!** 🎉

---

## 🎯 **STEP 11: TEST ADMIN DASHBOARD**

1. **Login** sebagai admin lagi
2. Buka: http://localhost:5500/Admin/dashboard.html

### **✅ Verifikasi Dashboard Works:**

- ✅ Muncul statistik (1 laporan pending)
- ✅ Tabel laporan menampilkan laporan yang baru dibuat
- ✅ Bisa klik "Detail" untuk lihat laporan
- ✅ Bisa update status laporan

**Test Update Status:**
1. Klik "Detail" pada laporan
2. Ubah status dari "Pending" → "Process"
3. Tambahkan catatan admin (optional)
4. Klik "Update Status"

**Verifikasi:**
```bash
mysql -u root sigap_ppks -e "SELECT id_pelapor, status FROM reports;"
```

**Expected:**
```
+-------------+---------+
| id_pelapor  | status  |
+-------------+---------+
| #123456     | process |
+-------------+---------+
```

**✅ Admin dashboard works!** 🎉

---

## 🎯 **STEP 12: TEST CHATBOT**

1. **Logout** (agar test sebagai anonymous user)
2. Buka: http://localhost:5500/ChatBot/chatbot.html
3. Pilih mode "**Panduan Terstruktur**"

### **Test Guided Chatbot:**

**Chatbot akan tanya:**
```
1. Nama Anda? → Ketik: Anonim
2. Tanggal kejadian? → Ketik: kemarin
3. Lokasi kejadian? → Ketik: Kampus
4. Ceritakan kejadian? → Ketik: Test chatbot
5. Tingkat kekhawatiran? → Ketik: khawatir
```

**Setelah selesai:**
- ✅ Chatbot generate ringkasan
- ✅ Tanya konfirmasi submit
- ✅ Ketik "ya" untuk submit
- ✅ Laporan berhasil dikirim dengan kode baru

**Verifikasi:**
```bash
mysql -u root sigap_ppks -e "SELECT id_pelapor, source FROM reports ORDER BY id DESC LIMIT 2;"
```

**Expected:**
```
+-------------+-----------------+
| id_pelapor  | source          |
+-------------+-----------------+
| #789012     | chatbot_guided  |
| #123456     | manual          |
+-------------+-----------------+
```

**✅ Chatbot works!** 🎉

---

## 🎯 **FULL SYSTEM VERIFICATION**

### **Checklist Akhir:**

- [x] MySQL server running
- [x] Database `sigap_ppks` created
- [x] 13 tabel berhasil dibuat (migrations)
- [x] 2 users created (admin + user)
- [x] Backend API running on http://localhost:8000
- [x] Frontend running on http://localhost:5500
- [x] Login works (admin & user)
- [x] Manual report form works
- [x] Chatbot works
- [x] Monitoring system works
- [x] Admin dashboard works
- [x] Database menyimpan laporan dengan benar

### **✅ SEMUA WORKS! SISTEM BERJALAN SEMPURNA!** 🎉🎉🎉

---

## 🎨 **ARCHITECTURE DIAGRAM**

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│         http://localhost:5500                       │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Landing  │  │  Lapor   │  │ ChatBot  │         │
│  │   Page   │  │   Form   │  │  (AI)    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Login   │  │Monitor   │  │  Admin   │         │
│  │  Auth    │  │ Tracking │  │Dashboard │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────┬───────────────────────────────────────┘
              │
              │ REST API (JSON)
              ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Laravel 11)                   │
│         http://localhost:8000/api                   │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ AuthController│  │ReportController│              │
│  │  - Login     │  │  - Create    │               │
│  │  - Register  │  │  - Read      │               │
│  │  - Logout    │  │  - Update    │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │AdminController│  │PostController│               │
│  │ - Dashboard  │  │  - Blog      │               │
│  │ - Management │  │  - Content   │               │
│  └──────────────┘  └──────────────┘               │
└─────────────┬───────────────────────────────────────┘
              │
              │ MySQL Driver
              ▼
┌─────────────────────────────────────────────────────┐
│              DATABASE (MySQL)                       │
│            mysql://localhost:3306                   │
│                                                     │
│  Database: sigap_ppks                              │
│                                                     │
│  ┌──────┐  ┌─────────┐  ┌──────────────┐          │
│  │users │  │ reports │  │ report_files │          │
│  └──────┘  └─────────┘  └──────────────┘          │
│                                                     │
│  ┌──────┐  ┌───────────────────────┐              │
│  │posts │  │ personal_access_tokens│              │
│  └──────┘  └───────────────────────┘              │
└─────────────────────────────────────────────────────┘
```

---

## 🐛 **TROUBLESHOOTING COMMON ISSUES**

### **Issue 1: Backend tidak bisa connect ke database**

**Error:** `SQLSTATE[HY000] [2002] Connection refused`

**Solusi:**
```bash
# Start MySQL
sudo service mysql start

# Verify running
mysql -u root -e "SELECT 1;"
```

---

### **Issue 2: Frontend tidak bisa fetch API**

**Error di Console:** `Failed to fetch` atau `CORS error`

**Cek:**
1. Backend running? → http://localhost:8000/api/health
2. Config API URL benar? → Check `js/config.js` line 3

**Fix config jika salah:**
```javascript
// File: js/config.js
const APP_CONFIG = {
    API: {
        BASE_URL: 'http://localhost:8000',  // ← Pastikan ini
        // ...
    }
}
```

---

### **Issue 3: Login gagal terus**

**Cek database:**
```bash
mysql -u root sigap_ppks -e "SELECT email FROM users;"
```

**Reset password admin:**
```bash
cd backend-api
php artisan tinker

>>> $admin = \App\Models\User::where('email', 'admin@sigap.ac.id')->first();
>>> $admin->password = \Hash::make('admin123');
>>> $admin->save();
>>> exit
```

---

### **Issue 4: File upload gagal**

**Cek storage symlink:**
```bash
cd backend-api
ls -la public/storage

# Jika tidak ada atau broken:
php artisan storage:link
```

**Cek permissions:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

---

### **Issue 5: Migration error "Table already exists"**

**Reset migrations (HATI-HATI: hapus semua data!):**
```bash
php artisan migrate:fresh --seed
```

---

## 📝 **DAILY DEVELOPMENT WORKFLOW**

### **Setiap kali mau develop:**

```bash
# Terminal 1: Start MySQL
sudo service mysql start

# Terminal 2: Start Backend
cd /home/user/PUNYAKUSENDIRI/backend-api
php artisan serve

# Terminal 3: Start Frontend
cd /home/user/PUNYAKUSENDIRI
python3 -m http.server 5500

# Browser: Open
http://localhost:5500/Landing%20Page/Landing_Page.html
```

### **Setelah selesai develop:**

```bash
# Terminal 2 & 3: Press Ctrl+C to stop servers

# Optional: Stop MySQL (jika tidak dipakai)
sudo service mysql stop
```

---

## 🎓 **DEFAULT CREDENTIALS**

Untuk testing & development:

**Admin:**
```
URL: http://localhost:5500/auth/login.html
Email: admin@sigap.ac.id
Password: admin123
```

**Regular User:**
```
Email: user@sigap.ac.id
Password: user123
```

**Database:**
```
Host: 127.0.0.1
Port: 3306
Database: sigap_ppks
Username: root
Password: (empty/kosong)
```

---

## 🚀 **NEXT LEVEL**

Setelah semua jalan:

1. **Test semua fitur** (lapor, monitoring, admin dashboard)
2. **Buat laporan test** dengan berbagai kategori
3. **Test upload file** (gambar, video, pdf)
4. **Test chatbot** guided & curhat mode
5. **Explore admin features** (update status, catatan, dll)

---

## 📚 **USEFUL COMMANDS**

### **Database:**
```bash
# Masuk MySQL
mysql -u root sigap_ppks

# Export database
mysqldump -u root sigap_ppks > backup.sql

# Import database
mysql -u root sigap_ppks < backup.sql

# Drop & recreate (fresh start)
mysql -u root -e "DROP DATABASE IF EXISTS sigap_ppks; CREATE DATABASE sigap_ppks;"
cd backend-api && php artisan migrate:fresh --seed
```

### **Laravel:**
```bash
# Clear all cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Check logs
tail -f storage/logs/laravel.log

# Tinker (Laravel REPL)
php artisan tinker
```

### **Frontend:**
```bash
# Check JavaScript errors
# Open browser → F12 → Console tab

# Reload without cache
# Ctrl + Shift + R (Linux/Windows)
# Cmd + Shift + R (Mac)
```

---

**Selamat! Anda sudah menyelesaikan full setup SIGAP PPKS!** 🎉

Jika ada error di langkah manapun, lihat section Troubleshooting atau tanya saya!
