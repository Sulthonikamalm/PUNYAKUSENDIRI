# ⚡ QUICK START GUIDE - SIGAP PPKS Backend

## 🚀 Setup Cepat (5 Menit)

### 1. Prerequisites
```bash
✅ XAMPP MySQL running
✅ Composer installed
✅ PHP 8.1+
```

### 2. Installation
```bash
cd backend-api
composer install
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup
```sql
-- Di HeidiSQL, run:
CREATE DATABASE sigap_ppks CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure `.env`
```env
DB_DATABASE=sigap_ppks
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Migrate & Seed
```bash
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve
```

---

## 🔑 Default Login

**Admin:**
- Email: `admin@sigap.ac.id`
- Password: `admin123`

**User:**
- Email: `user@sigap.ac.id`
- Password: `user123`

---

## 📡 Quick API Reference

### Base URL
```
http://localhost:8000/api
```

### Authentication
```bash
# Login
POST /auth/login
{
  "email": "admin@sigap.ac.id",
  "password": "admin123"
}

# Get token from response, use as:
Authorization: Bearer {token}
```

### User Endpoints (Auth Required)
```bash
POST   /reports              # Create report + file upload
GET    /reports              # Get my reports
GET    /reports/{id}         # Get single report
```

### Admin Endpoints (Admin Only)
```bash
GET    /admin/reports                   # Get ALL reports
PATCH  /admin/reports/{id}/status       # Update status ⭐
DELETE /admin/reports/{id}              # Delete report
GET    /admin/reports/statistics        # Get stats

POST   /admin/posts                     # Create post + thumbnail
PUT    /admin/posts/{id}                # Update post
PATCH  /admin/posts/{id}/publish        # Toggle publish
DELETE /admin/posts/{id}                # Delete post
```

### Public Endpoints
```bash
GET    /posts               # Get published posts
GET    /posts/{slug}        # Get post by slug
GET    /health              # Health check
```

---

## 📤 File Upload Example

### Using cURL
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "nama=Ahmad" \
  -F "tanggal_kejadian=2025-11-14" \
  -F "lokasi_kejadian=Gedung A" \
  -F "kronologi=Kronologi kejadian" \
  -F "kategori=Perundungan" \
  -F "bukti_file=@/path/to/evidence.pdf"
```

### Using Postman
1. Set method: POST
2. URL: `http://localhost:8000/api/reports`
3. Headers: `Authorization: Bearer {token}`
4. Body: Form-data
5. Add fields + select file for `bukti_file`

---

## 🐛 Common Issues

### "Storage symlink not found"
```bash
php artisan storage:link
```

### "CORS error"
Already configured. If issues persist, check `config/cors.php`

### "Unauthenticated"
- Check token in header: `Authorization: Bearer {token}`
- Token might be expired, login again

### "Forbidden 403"
- User role doesn't match (need admin token for admin routes)

---

## 📊 Role-Based Access

| Route | Public | User | Admin |
|-------|--------|------|-------|
| POST /auth/register | ✅ | ✅ | ✅ |
| POST /auth/login | ✅ | ✅ | ✅ |
| POST /reports | ❌ | ✅ | ✅ |
| GET /admin/reports | ❌ | ❌ | ✅ |
| PATCH /admin/reports/{id}/status | ❌ | ❌ | ✅ |
| POST /admin/posts | ❌ | ❌ | ✅ |
| GET /posts | ✅ | ✅ | ✅ |

---

## 📁 Project Structure
```
backend-api/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── ReportController.php
│   │   │   ├── AdminReportController.php
│   │   │   ├── PostController.php
│   │   │   └── AdminPostController.php
│   │   ├── Middleware/
│   │   │   └── EnsureUserRoleIs.php
│   │   └── Requests/
│   │       ├── StoreReportRequest.php
│   │       ├── UpdateReportStatusRequest.php
│   │       ├── StorePostRequest.php
│   │       └── UpdatePostRequest.php
│   └── Models/
│       ├── User.php (role: admin/user)
│       ├── Report.php
│       └── Post.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── AdminUserSeeder.php
├── routes/
│   └── api.php
├── storage/app/public/
│   ├── bukti/        # Evidence files
│   └── thumbnails/   # Post images
└── BACKEND_MASTER_DOCS.md  # Full documentation
```

---

## 🎯 Next Steps

1. ✅ Setup completed
2. ⏭️ Test endpoints with Postman
3. ⏭️ Integrate with frontend
4. ⏭️ Deploy to production

**Full Docs:** See `BACKEND_MASTER_DOCS.md`

---

**Quick Contact:**
- Issues? Check troubleshooting in full docs
- Questions? Read API reference above
