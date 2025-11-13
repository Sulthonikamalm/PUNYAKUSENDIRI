/**
 * API Client - Centralized HTTP requests with authentication
 * Handles all API communication with the backend Laravel API
 */
class APIClient {
    constructor() {
        this.baseURL = APP_CONFIG.API.BASE_URL;
        this.timeout = APP_CONFIG.API.TIMEOUT;
    }

    /**
     * Get auth token from storage
     */
    getAuthToken() {
        return localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
    }

    /**
     * Set auth token
     */
    setAuthToken(token) {
        localStorage.setItem(APP_CONFIG.AUTH.TOKEN_KEY, token);
    }

    /**
     * Clear auth token (logout)
     */
    clearAuthToken() {
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_KEY);
        localStorage.removeItem(APP_CONFIG.AUTH.USER_KEY);
        localStorage.removeItem(APP_CONFIG.AUTH.TOKEN_EXPIRY_KEY);
    }

    /**
     * Build headers with authentication
     */
    buildHeaders(customHeaders = {}, includeAuth = true) {
        const headers = {
            'Accept': 'application/json',
            ...customHeaders
        };

        // Add auth token if available and required
        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders(options.headers, options.auth !== false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * POST request (JSON)
     */
    async post(endpoint, data, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders({
            'Content-Type': 'application/json',
            ...options.headers
        }, options.auth !== false);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * POST request (FormData for file upload)
     * IMPORTANT: Don't set Content-Type header for FormData (browser handles it)
     */
    async postFormData(endpoint, formData, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        // DON'T set Content-Type for FormData (browser sets it automatically with boundary)
        const headers = this.buildHeaders(options.headers, options.auth !== false);
        delete headers['Content-Type']; // Important!

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * PUT request (JSON)
     */
    async put(endpoint, data, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders({
            'Content-Type': 'application/json',
            ...options.headers
        }, options.auth !== false);

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data),
            });

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders({
            'Content-Type': 'application/json',
            ...options.headers
        }, options.auth !== false);

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify(data),
            });

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = this.buildHeaders(options.headers, options.auth !== false);

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: headers,
            });

            return await this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle response
     */
    async handleResponse(response) {
        // Handle 401 Unauthorized - auto redirect to login
        if (response.status === 401) {
            this.clearAuthToken();

            // Only redirect if not already on login page
            if (!window.location.pathname.includes('login.html')) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                window.location.href = '../auth/login.html';
            }

            return {
                success: false,
                error: 'Unauthorized',
                message: 'Sesi telah berakhir',
                status: 401
            };
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
            return {
                success: false,
                error: 'Forbidden',
                message: 'Akses ditolak. Anda tidak memiliki izin.',
                status: 403
            };
        }

        // Parse JSON response
        let data;
        try {
            data = await response.json();
        } catch (error) {
            return {
                success: false,
                error: 'Invalid JSON response',
                message: 'Server mengembalikan response yang tidak valid',
                status: response.status
            };
        }

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Request failed',
                details: data.errors || {},
                status: response.status
            };
        }

        return {
            success: true,
            data: data.data || data,
            message: data.message,
            status: response.status
        };
    }

    /**
     * Handle errors (network, timeout, etc)
     */
    handleError(error) {
        console.error('[APIClient] Error:', error);

        if (error.name === 'AbortError') {
            return {
                success: false,
                error: 'Request timeout',
                message: 'Koneksi timeout. Periksa internet Anda.'
            };
        }

        if (error.message === 'Failed to fetch') {
            return {
                success: false,
                error: 'Network error',
                message: 'Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.'
            };
        }

        return {
            success: false,
            error: error.message,
            message: 'Terjadi kesalahan. Silakan coba lagi.'
        };
    }

    /**
     * Helper: Replace URL parameters (e.g., /api/reports/{id} -> /api/reports/123)
     */
    replaceUrlParams(endpoint, params) {
        let url = endpoint;
        for (const [key, value] of Object.entries(params)) {
            url = url.replace(`{${key}}`, value);
        }
        return url;
    }
}

// Create global instance
window.apiClient = new APIClient();

console.log('✅ APIClient initialized');
console.log(`📍 Base URL: ${window.apiClient.baseURL}`);
