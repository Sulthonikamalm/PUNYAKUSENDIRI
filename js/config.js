/**
 * Centralized Configuration for SIGAP PPKS
 * This file contains all API endpoints, authentication settings, and app configuration
 */
const APP_CONFIG = {
    // API Configuration
    API: {
        BASE_URL: 'http://localhost:8000',
        TIMEOUT: 30000, // 30 seconds

        ENDPOINTS: {
            // Auth endpoints
            AUTH_LOGIN: '/api/auth/login',
            AUTH_REGISTER: '/api/auth/register',
            AUTH_ME: '/api/auth/me',
            AUTH_LOGOUT: '/api/auth/logout',

            // Reports endpoints (user)
            REPORTS: '/api/reports',
            REPORTS_STATS: '/api/reports/stats/overview',
            REPORT_BY_ID: '/api/reports/{id}',

            // Admin Reports endpoints
            ADMIN_REPORTS: '/api/admin/reports',
            ADMIN_REPORT_BY_ID: '/api/admin/reports/{id}',
            ADMIN_REPORT_UPDATE_STATUS: '/api/admin/reports/{id}/status',

            // Posts endpoints
            POSTS: '/api/posts',
            POST_BY_ID: '/api/posts/{id}',

            // Admin Posts endpoints
            ADMIN_POSTS: '/api/admin/posts',
            ADMIN_POST_BY_ID: '/api/admin/posts/{id}',
        }
    },

    // Authentication Configuration
    AUTH: {
        TOKEN_KEY: 'sigap_auth_token',
        USER_KEY: 'sigap_user',
        TOKEN_EXPIRY_KEY: 'sigap_token_expiry',
    },

    // App Settings
    APP: {
        NAME: 'SIGAP PPKS',
        FULL_NAME: 'Sistem Informasi Pelaporan Kekerasan Seksual',
        VERSION: '1.0.0',
    },

    // File Upload Settings (aligned with backend)
    UPLOAD: {
        MAX_FILES: 5,
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
        ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf',
                       'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'video/mp4', 'video/quicktime'],
        ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'mp4', 'mov']
    },

    // Report Categories
    CATEGORIES: [
        'Pelecehan Seksual',
        'Kekerasan Fisik',
        'Kekerasan Psikis',
        'Perundungan',
        'Eksploitasi Seksual',
        'Lainnya'
    ],

    // Report Status
    STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        RESOLVED: 'resolved',
        REJECTED: 'rejected'
    },

    // Status Pelanggaran
    STATUS_PELANGGARAN: {
        MENUNGGU: 'menunggu',
        PELANGGARAN: 'pelanggaran',
        BUKAN_PELANGGARAN: 'bukan_pelanggaran'
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}

// Log initialization
console.log('✅ APP_CONFIG initialized');
console.log(`📍 API Base URL: ${APP_CONFIG.API.BASE_URL}`);
