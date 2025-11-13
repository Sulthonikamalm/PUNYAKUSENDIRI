# SIGAP PPKS - Backend API

API Backend untuk sistem pelaporan kekerasan seksual dan perundungan di kampus Telkom University Surabaya.

## 📋 Requirements

- PHP 8.1+
- MySQL (XAMPP)
- Composer
- HeidiSQL (untuk manajemen database)

## 🚀 Setup Instructions

### 1. Database Setup dengan XAMPP

1. **Start XAMPP**:
   - Buka XAMPP Control Panel
   - Start **Apache** dan **MySQL**

2. **Create Database**:
   - Buka HeidiSQL atau phpMyAdmin (http://localhost/phpmyadmin)
   - Create database baru dengan nama: `sigap_ppks`

   ```sql
   CREATE DATABASE sigap_ppks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 2. Environment Configuration

File `.env` sudah dikonfigurasi untuk XAMPP. Pastikan settingnya seperti ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigap_ppks
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Run Migrations

Jalankan perintah ini untuk membuat table di database:

```bash
php artisan migrate
```

**Table yang akan dibuat**:
- `reports` - Menyimpan semua laporan dari chatbot dan manual
- `users` - User management (untuk admin)
- `cache` - Cache storage
- `jobs` - Background jobs

### 4. Start Development Server

```bash
php artisan serve
```

Server akan berjalan di: **http://localhost:8000**

API endpoint base URL: **http://localhost:8000/api**

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api
```

### 1. **Get All Reports**
```http
GET /api/reports
```

**Query Parameters**:
- `status` - Filter by status (pending, process, complete)
- `kategori` - Filter by kategori
- `start_date` - Filter tanggal mulai (YYYY-MM-DD)
- `end_date` - Filter tanggal akhir (YYYY-MM-DD)
- `sort_by` - Sort by field (default: created_at)
- `sort_order` - Sort order (asc, desc)
- `per_page` - Items per page (default: 15)

**Example Request**:
```
GET /api/reports?status=pending&per_page=10
```

**Response**:
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "id_pelapor": "#876364",
        "source": "chatbot_guided",
        "nama": "Ahmad Yusuf",
        "jenis_kelamin": "Laki-laki",
        "email": "ahmad@example.com",
        "tanggal_kejadian": "2025-11-14",
        "hari_kejadian": "Jumat",
        "lokasi_kejadian": "Gedung A lantai 2",
        "kronologi": "...",
        "kategori": "Perundungan",
        "status": "pending",
        "tingkat_khawatir": "khawatir",
        "resume_laporan": "...",
        "created_at": "2025-11-13T19:30:00.000000Z",
        "updated_at": "2025-11-13T19:30:00.000000Z"
      }
    ],
    "total": 50,
    "per_page": 10
  }
}
```

### 2. **Create New Report (From Chatbot)**
```http
POST /api/reports
```

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "source": "chatbot_guided",
  "nama": "Ahmad Yusuf",
  "jenis_kelamin": "Laki-laki",
  "email": "ahmad@example.com",
  "tanggal_kejadian": "2025-11-14",
  "hari_kejadian": "Jumat",
  "lokasi_kejadian": "Gedung A lantai 2",
  "kronologi": "Saya mengalami perundungan oleh senior...",
  "kategori": "Perundungan",
  "tingkat_khawatir": "khawatir",
  "resume_laporan": "Laporan dari Ahmad Yusuf tentang Perundungan..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": 1,
    "id_pelapor": "#876364",
    "source": "chatbot_guided",
    "nama": "Ahmad Yusuf",
    ...
  }
}
```

### 3. **Get Single Report**
```http
GET /api/reports/{id}
```

**Example**: `GET /api/reports/1`

**Response**:
```json
{
  "success": true,
  "message": "Report retrieved successfully",
  "data": {
    "id": 1,
    "id_pelapor": "#876364",
    ...
  }
}
```

### 4. **Update Report (Admin)**
```http
PUT /api/reports/{id}
PATCH /api/reports/{id}
```

**Request Body** (partial update):
```json
{
  "status": "process",
  "catatan_admin": "Sedang ditindaklanjuti oleh tim PPKS"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": 1,
    "status": "process",
    "catatan_admin": "Sedang ditindaklanjuti oleh tim PPKS",
    ...
  }
}
```

### 5. **Delete Report (Admin)**
```http
DELETE /api/reports/{id}
```

**Response**:
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### 6. **Get Statistics (Dashboard)**
```http
GET /api/reports/stats/overview
```

**Response**:
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 150,
    "pending": 45,
    "process": 60,
    "complete": 45,
    "recent_30_days": 78,
    "by_kategori": [
      {
        "kategori": "Pelecehan Seksual",
        "count": 50
      },
      {
        "kategori": "Perundungan",
        "count": 60
      }
    ],
    "by_tingkat_khawatir": [
      {
        "tingkat_khawatir": "sedikit",
        "count": 30
      },
      {
        "tingkat_khawatir": "khawatir",
        "count": 70
      },
      {
        "tingkat_khawatir": "sangat",
        "count": 50
      }
    ]
  }
}
```

---

## 🗄️ Database Schema

### Table: `reports`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| id_pelapor | string | Unique ID (#876364) |
| source | enum | chatbot_guided, chatbot_curhat, manual |
| nama | string | Nama pelapor |
| jenis_kelamin | enum | Laki-laki, Perempuan |
| email | string | Email pelapor (nullable) |
| tanggal_kejadian | date | Tanggal kejadian |
| hari_kejadian | string | Nama hari (nullable) |
| lokasi_kejadian | text | Lokasi kejadian |
| kronologi | text | Kronologi kejadian |
| kategori | enum | Pelecehan Seksual, Kekerasan Fisik, Kekerasan Psikis, Perundungan, Lainnya |
| status | enum | pending, process, complete |
| tingkat_khawatir | enum | sedikit, khawatir, sangat |
| resume_laporan | text | Resume laporan (nullable) |
| catatan_admin | text | Catatan dari admin (nullable) |
| created_at | timestamp | Waktu dibuat |
| updated_at | timestamp | Waktu diupdate |

---

## 🧪 Testing API

### 1. Using cURL

**Create Report**:
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -d '{
    "source": "chatbot_guided",
    "nama": "Test User",
    "tanggal_kejadian": "2025-11-14",
    "lokasi_kejadian": "Gedung A",
    "kronologi": "Test kronologi",
    "kategori": "Perundungan"
  }'
```

**Get All Reports**:
```bash
curl http://localhost:8000/api/reports
```

**Get Statistics**:
```bash
curl http://localhost:8000/api/reports/stats/overview
```

### 2. Using Postman

1. Import collection dari URL: `http://localhost:8000/api`
2. Test semua endpoints
3. Check response dan status codes

### 3. Using Browser (GET requests)

- Get Reports: http://localhost:8000/api/reports
- Get Stats: http://localhost:8000/api/reports/stats/overview
- Get Single Report: http://localhost:8000/api/reports/1

---

## 🔌 Integrasi dengan Frontend

### Update File `guided-mode.js`

Di function `DBHandler.save()` (line ~600), update API endpoint:

```javascript
const API_ENDPOINT = 'http://localhost:8000/api/reports';

async function save(reportData) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(reportData)
        });

        const result = await response.json();

        if (result.success) {
            console.log('[DBHandler] Report saved:', result.data.id_pelapor);
            return { success: true, id: result.data.id_pelapor };
        }

        throw new Error(result.message || 'Failed to save report');
    } catch (error) {
        console.error('[DBHandler] Save failed:', error);

        // Fallback to localStorage
        const reportId = '#' + Date.now().toString().slice(-6);
        reportData.id_pelapor = reportId;
        localStorage.setItem(`report_${reportId}`, JSON.stringify(reportData));

        return { success: true, id: reportId, savedToLocal: true };
    }
}
```

### Update Admin Dashboard

Di file `Admin/dashboard.html`, tambahkan script untuk fetch data:

```javascript
async function loadReports() {
    try {
        const response = await fetch('http://localhost:8000/api/reports?per_page=50');
        const result = await response.json();

        if (result.success) {
            displayReports(result.data.data);
        }
    } catch (error) {
        console.error('Failed to load reports:', error);
    }
}

function displayReports(reports) {
    const container = document.querySelector('.case-list');
    container.innerHTML = reports.map(report => `
        <a href="detail-kasus.html?id=${report.id}" class="case-item-link">
            <div class="case-item">
                <div class="row g-0 align-items-center w-100">
                    <div class="col-auto me-3">
                        <input class="form-check-input" type="checkbox">
                    </div>
                    <div class="col-lg-1">
                        <span class="case-id">${report.id_pelapor}</span>
                    </div>
                    <div class="col-lg-2">
                        <div class="khawatir-bar ${report.tingkat_khawatir}"></div>
                    </div>
                    <div class="col-lg-3">
                        <i class="bi bi-envelope-fill me-2 text-muted"></i>
                        ${report.email || 'No email'}
                    </div>
                    <div class="col-lg-2">
                        <i class="bi bi-calendar-event-fill me-2 text-muted"></i>
                        ${new Date(report.tanggal_kejadian).toLocaleDateString('id-ID')}
                    </div>
                    <div class="col-lg-2">
                        <span class="status-badge status-${report.status}">
                            ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        </a>
    `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadReports);
```

---

## 🛠️ Troubleshooting

### Error: "Connection refused"

**Solusi**:
1. Pastikan XAMPP MySQL sudah running
2. Check di HeidiSQL apakah bisa connect ke MySQL
3. Pastikan port 3306 tidak digunakan aplikasi lain

### Error: "Database does not exist"

**Solusi**:
```sql
CREATE DATABASE sigap_ppks;
```

### Error: "Table not found"

**Solusi**:
```bash
php artisan migrate
```

### CORS Error dari Frontend

**Solusi** (untuk production):
1. Tambahkan domain frontend di `.env`:
   ```env
   FRONTEND_URL=http://localhost:5500
   ```

2. Update `bootstrap/app.php` jika perlu custom CORS

---

## 📊 Progress Backend: 50% ✅

### ✅ Selesai:
1. ✅ Laravel project setup
2. ✅ Database configuration (XAMPP MySQL)
3. ✅ Migration untuk table reports
4. ✅ Model Report dengan auto-generate ID & scopes
5. ✅ Controller dengan CRUD lengkap & validation
6. ✅ API Routes untuk semua operations
7. ✅ Statistics endpoint untuk dashboard
8. ✅ CORS support untuk frontend

### 🔄 Belum Selesai (50% lagi):
1. ⏳ Authentication & Authorization (Admin login)
2. ⏳ File upload untuk bukti laporan
3. ⏳ Email notifications
4. ⏳ Export laporan (PDF/Excel)
5. ⏳ Advanced filtering & search
6. ⏳ API documentation dengan Swagger/OpenAPI
7. ⏳ Unit testing
8. ⏳ Deployment configuration

---

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check error log di `storage/logs/laravel.log`
2. Run `php artisan route:list` untuk melihat semua routes
3. Test API dengan Postman atau cURL

---

**Developed by**: SIGAP PPKS Team
**Last Updated**: November 13, 2025
