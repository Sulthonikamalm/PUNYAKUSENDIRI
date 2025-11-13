# 🚀 SIGAP PPKS - FULL-STACK BACKEND API DOCUMENTATION

**Complete Laravel Backend API dengan Authentication, File Upload, dan Role-Based Authorization**

---

## 📋 TABLE OF CONTENTS

1. [Setup & Installation](#setup--installation)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [File Upload](#file-upload)
6. [Security & Authorization](#security--authorization)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🛠️ SETUP & INSTALLATION

### Prerequisites

- PHP 8.1+
- MySQL (XAMPP)
- Composer
- HeidiSQL atau phpMyAdmin

### Installation Steps

```bash
# 1. Navigate to backend directory
cd backend-api

# 2. Install dependencies (if needed)
composer install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sigap_ppks
DB_USERNAME=root
DB_PASSWORD=

# 5. Create database in HeidiSQL
CREATE DATABASE sigap_ppks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 6. Run migrations
php artisan migrate

# 7. Run seeders (create admin user)
php artisan db:seed

# 8. Create storage symbolic link for file uploads
php artisan storage:link

# 9. Start development server
php artisan serve
```

**Default Credentials:**
- Admin: `admin@sigap.ac.id` / `admin123`
- User: `user@sigap.ac.id` / `user123`

---

## 🗄️ DATABASE SCHEMA

### Table: `users`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | string | User name |
| email | string | Unique email |
| password | string | Hashed password |
| role | enum | admin, user (default: user) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Update time |

### Table: `reports`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | FK to users (nullable) |
| id_pelapor | string | Unique ID (#876364) |
| source | enum | chatbot_guided, chatbot_curhat, manual |
| nama | string | Reporter name |
| jenis_kelamin | enum | Laki-laki, Perempuan |
| email | string | Reporter email (nullable) |
| tanggal_kejadian | date | Incident date |
| hari_kejadian | string | Day name (nullable) |
| lokasi_kejadian | text | Incident location |
| lokasi | string | Location (new format) |
| kronologi | text | Chronology |
| deskripsi | text | Description (new) |
| kategori | enum | 5 categories |
| jenis_pelanggaran | string | Violation type (new) |
| status | enum | pending, process, complete |
| status_pelanggaran | enum | menunggu, diproses, selesai |
| tingkat_khawatir | enum | sedikit, khawatir, sangat |
| resume_laporan | text | Report summary (nullable) |
| catatan_admin | text | Admin notes (nullable) |
| bukti_file_path | string | Evidence file path (nullable) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Update time |

### Table: `posts`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | FK to users (admin) |
| judul | string | Post title |
| slug | string | Unique slug (auto-generated) |
| konten | longtext | Post content |
| thumbnail_path | string | Thumbnail path (nullable) |
| is_published | boolean | Published status (default: false) |
| created_at | timestamp | Creation time |
| updated_at | timestamp | Update time |

---

## 📡 API ENDPOINTS

### Base URL
```
http://localhost:8000/api
```

---

### 🔐 AUTHENTICATION ENDPOINTS

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "access_token": "1|xxxxxxxxxxxxxx",
    "token_type": "Bearer"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request:**
```json
{
  "email": "admin@sigap.ac.id",
  "password": "admin123"
}
```

**Response (200):**
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
    "access_token": "2|xxxxxxxxxxxxxx",
    "token_type": "Bearer"
  }
}
```

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "Admin SIGAP",
    "email": "admin@sigap.ac.id",
    "role": "admin"
  }
}
```

#### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

### 📝 USER REPORTS ENDPOINTS (Auth Required)

#### 1. Create Report (with File Upload)
```http
POST /api/reports
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
nama: Ahmad Yusuf
jenis_kelamin: Laki-laki
email: ahmad@example.com
tanggal_kejadian: 2025-11-14
hari_kejadian: Jumat
lokasi_kejadian: Gedung A lantai 2
kronologi: Saya mengalami perundungan...
kategori: Perundungan
jenis_pelanggaran: Perundungan verbal
deskripsi: Detail deskripsi kejadian
lokasi: Gedung A
bukti_file: [FILE] (max 5MB, jpg/png/pdf/doc/docx)
```

**Response (201):**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": 1,
    "user_id": 2,
    "id_pelapor": "#876364",
    "nama": "Ahmad Yusuf",
    "bukti_file_path": "bukti/xxxxx.pdf",
    ...
  }
}
```

#### 2. Get All Reports (User's own)
```http
GET /api/reports
Authorization: Bearer {token}
```

#### 3. Get Statistics
```http
GET /api/reports/stats/overview
Authorization: Bearer {token}
```

---

### 👨‍💼 ADMIN REPORTS ENDPOINTS (Admin Only)

#### 1. Get ALL Reports
```http
GET /api/admin/reports
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status` - Filter by status (pending/process/complete)
- `status_pelanggaran` - Filter (menunggu/diproses/selesai)
- `kategori` - Filter by category
- `user_id` - Filter by user
- `search` - Search by name/id/email
- `start_date`, `end_date` - Date range
- `sort_by`, `sort_order` - Sorting
- `per_page` - Pagination

**Response (200):**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "user": {
          "id": 2,
          "name": "User Test"
        },
        ...
      }
    ],
    "total": 50
  }
}
```

#### 2. Update Report Status (CRITICAL)
```http
PATCH /api/admin/reports/{id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "process",
  "status_pelanggaran": "diproses",
  "catatan_admin": "Sedang ditindaklanjuti"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Report status updated successfully",
  "data": {
    "id": 1,
    "status": "process",
    "status_pelanggaran": "diproses",
    "catatan_admin": "Sedang ditindaklanjuti",
    ...
  }
}
```

#### 3. Delete Report
```http
DELETE /api/admin/reports/{id}
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### 📰 PUBLIC POSTS ENDPOINTS (No Auth)

#### 1. Get Published Posts
```http
GET /api/posts
```

**Query Parameters:**
- `search` - Search by title/content
- `sort_by`, `sort_order` - Sorting
- `per_page` - Pagination (default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "judul": "Panduan Melaporkan Kekerasan",
        "slug": "panduan-melaporkan-kekerasan",
        "konten": "...",
        "thumbnail_path": "thumbnails/xxxxx.jpg",
        "is_published": true,
        "user": {
          "name": "Admin SIGAP"
        }
      }
    ]
  }
}
```

#### 2. Get Post by Slug
```http
GET /api/posts/{slug}
```

**Example:** `GET /api/posts/panduan-melaporkan-kekerasan`

---

### 👨‍💼 ADMIN POSTS ENDPOINTS (Admin Only)

#### 1. Create Post (with Thumbnail)
```http
POST /api/admin/posts
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
judul: Panduan Melaporkan Kekerasan
slug: panduan-melaporkan-kekerasan (optional, auto-generated)
konten: Konten lengkap post...
thumbnail: [IMAGE FILE] (max 2MB, jpg/png/webp)
is_published: false
```

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "judul": "Panduan Melaporkan Kekerasan",
    "slug": "panduan-melaporkan-kekerasan",
    "thumbnail_path": "thumbnails/xxxxx.jpg",
    ...
  }
}
```

#### 2. Update Post
```http
PUT /api/admin/posts/{id}
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Request (Form Data - all optional):**
```
judul: Updated Title
konten: Updated content
thumbnail: [NEW IMAGE] (replaces old one)
is_published: true
```

#### 3. Toggle Publish Status
```http
PATCH /api/admin/posts/{id}/publish
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post published successfully",
  "data": {
    "id": 1,
    "is_published": true,
    ...
  }
}
```

#### 4. Delete Post
```http
DELETE /api/admin/posts/{id}
Authorization: Bearer {admin_token}
```

---

## 🔒 SECURITY & AUTHORIZATION

### Role-Based Middleware

**Usage in Routes:**
```php
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // Admin-only routes
});
```

**Roles:**
- `admin` - Full access to all endpoints
- `user` - Limited access (create reports, view own data)

### Authorization Failures

**Response (403):**
```json
{
  "success": false,
  "message": "Forbidden. You do not have permission to access this resource.",
  "required_role": "admin",
  "your_role": "user"
}
```

---

## 📤 FILE UPLOAD

### Storage Configuration

**Uploads are stored in:**
```
storage/app/public/bukti/       - Report evidence files
storage/app/public/thumbnails/  - Post thumbnails
```

**Access uploaded files:**
```
http://localhost:8000/storage/bukti/filename.pdf
http://localhost:8000/storage/thumbnails/image.jpg
```

### File Upload Validation

**Report Evidence:**
- Max size: 5MB
- Allowed types: jpg, jpeg, png, pdf, doc, docx

**Post Thumbnails:**
- Max size: 2MB
- Allowed types: jpg, jpeg, png, webp

### Security

- File paths are stored in database (NOT actual files)
- Files are validated before upload
- Old files are deleted when updated
- Files are deleted when parent record is deleted

---

## 🧪 TESTING

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sigap.ac.id","password":"admin123"}'
```

**Create Report with File:**
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "nama=Test User" \
  -F "tanggal_kejadian=2025-11-14" \
  -F "lokasi_kejadian=Gedung A" \
  -F "kronologi=Test kronologi" \
  -F "kategori=Perundungan" \
  -F "bukti_file=@/path/to/file.pdf"
```

**Update Status (Admin):**
```bash
curl -X PATCH http://localhost:8000/api/admin/reports/1/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"process","catatan_admin":"Ditindaklanjuti"}'
```

### Using Postman

1. Import endpoints collection
2. Set environment variable `BASE_URL=http://localhost:8000/api`
3. Login to get token
4. Add token to Authorization header: `Bearer {token}`
5. Test all endpoints

---

## 🐛 TROUBLESHOOTING

### Error: "Storage symlink not found"

**Solution:**
```bash
php artisan storage:link
```

### Error: "CORS policy"

**Solution:** Add frontend URL to `config/cors.php` or middleware.

### Error: "Unauthenticated"

**Check:**
1. Token is valid and not expired
2. Token is sent in header: `Authorization: Bearer {token}`
3. User still exists in database

### Error: "Forbidden" (403)

**Check:**
1. User role matches required role
2. Admin routes require `role:admin`
3. Check middleware is applied

### Error: "File too large"

**Check:**
1. File size limits in validation
2. PHP `upload_max_filesize` in `php.ini`
3. PHP `post_max_size` in `php.ini`

### Error: "Database connection refused"

**Check:**
1. XAMPP MySQL is running
2. Database name in `.env` matches HeidiSQL
3. Port 3306 is correct

---

## 📊 STATISTICS & ANALYTICS

### Admin Statistics Endpoint

```http
GET /api/admin/reports/statistics
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 45,
    "process": 60,
    "complete": 45,
    "menunggu": 30,
    "diproses": 70,
    "selesai": 50,
    "recent_30_days": 78,
    "by_kategori": [
      {"kategori": "Pelecehan Seksual", "count": 50},
      {"kategori": "Perundungan", "count": 60}
    ]
  }
}
```

---

## 🎯 BEST PRACTICES

1. **Always use HTTPS in production**
2. **Never commit `.env` file**
3. **Rotate API tokens regularly**
4. **Validate all file uploads**
5. **Use Form Requests for validation**
6. **Log all admin actions**
7. **Implement rate limiting**
8. **Backup database regularly**

---

## 📞 SUPPORT

**Documentation:** This file  
**Laravel Docs:** https://laravel.com/docs  
**Sanctum Docs:** https://laravel.com/docs/sanctum

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0  
**Developed by:** SIGAP PPKS Team
