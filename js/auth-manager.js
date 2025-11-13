/**
 * Authentication Manager
 * Handles user authentication, login, logout, and authorization checks
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadUserFromStorage();
    }

    /**
     * Load user from localStorage
     */
    loadUserFromStorage() {
        const userData = localStorage.getItem(APP_CONFIG.AUTH.USER_KEY);
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                this.logout();
            }
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = localStorage.getItem(APP_CONFIG.AUTH.TOKEN_KEY);
        return token !== null && this.currentUser !== null;
    }

    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Get current user's role
     */
    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    /**
     * Login
     */
    async login(email, password) {
        try {
            const result = await apiClient.post(
                APP_CONFIG.API.ENDPOINTS.AUTH_LOGIN,
                { email, password },
                { auth: false } // Don't send auth header for login
            );

            if (result.success) {
                // Store token
                apiClient.setAuthToken(result.data.token);

                // Store user data
                this.currentUser = result.data.user;
                localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(result.data.user));

                // Store expiry (optional, for future use)
                const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
                localStorage.setItem(APP_CONFIG.AUTH.TOKEN_EXPIRY_KEY, expiryTime);

                console.log('✅ Login successful:', this.currentUser.name);
                return { success: true, user: this.currentUser };
            }

            return result;
        } catch (error) {
            console.error('[AuthManager] Login error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Gagal login. Periksa koneksi Anda.'
            };
        }
    }

    /**
     * Register
     */
    async register(data) {
        try {
            const result = await apiClient.post(
                APP_CONFIG.API.ENDPOINTS.AUTH_REGISTER,
                data,
                { auth: false }
            );

            if (result.success) {
                // Auto-login after register
                apiClient.setAuthToken(result.data.token);
                this.currentUser = result.data.user;
                localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(result.data.user));

                const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
                localStorage.setItem(APP_CONFIG.AUTH.TOKEN_EXPIRY_KEY, expiryTime);

                console.log('✅ Registration successful:', this.currentUser.name);
                return { success: true, user: this.currentUser };
            }

            return result;
        } catch (error) {
            console.error('[AuthManager] Register error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Gagal registrasi. Silakan coba lagi.'
            };
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            // Call backend logout (optional, best practice)
            await apiClient.post(APP_CONFIG.API.ENDPOINTS.AUTH_LOGOUT, {});
        } catch (error) {
            console.warn('Logout API call failed:', error);
        }

        // Clear local storage
        apiClient.clearAuthToken();
        this.currentUser = null;

        console.log('✅ Logout successful');

        // Redirect to login
        window.location.href = '../auth/login.html';
    }

    /**
     * Get current user from server (verify token)
     */
    async verifyToken() {
        const result = await apiClient.get(APP_CONFIG.API.ENDPOINTS.AUTH_ME);

        if (result.success) {
            this.currentUser = result.data;
            localStorage.setItem(APP_CONFIG.AUTH.USER_KEY, JSON.stringify(result.data));
            return true;
        }

        // Token invalid
        this.logout();
        return false;
    }

    /**
     * Require authentication (use in pages that need auth)
     * Returns true if authenticated, false otherwise (and redirects)
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            alert('Anda harus login terlebih dahulu.');

            // Determine redirect path based on current location
            const currentPath = window.location.pathname;
            if (currentPath.includes('/auth/')) {
                window.location.href = 'login.html';
            } else {
                window.location.href = '../auth/login.html';
            }
            return false;
        }
        return true;
    }

    /**
     * Require admin role
     * Returns true if user is admin, false otherwise (and redirects)
     */
    requireAdmin() {
        if (!this.requireAuth()) return false;

        if (!this.isAdmin()) {
            alert('Akses ditolak. Anda bukan admin.');
            window.location.href = '../Landing Page/Landing_Page.html';
            return false;
        }

        return true;
    }

    /**
     * Add logout button handler (helper method)
     */
    attachLogoutHandler(buttonSelector) {
        const logoutBtn = document.querySelector(buttonSelector);
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    this.logout();
                }
            });
            console.log('✅ Logout handler attached to:', buttonSelector);
        } else {
            console.warn('⚠️  Logout button not found:', buttonSelector);
        }
    }

    /**
     * Update UI with user info (helper method)
     */
    updateUIWithUserInfo(nameSelector) {
        if (!this.isAuthenticated()) return;

        const nameElement = document.querySelector(nameSelector);
        if (nameElement) {
            nameElement.textContent = this.currentUser.name;
            console.log('✅ User info displayed:', this.currentUser.name);
        }
    }

    /**
     * Show/hide elements based on authentication
     */
    showForAuth(selector) {
        if (this.isAuthenticated()) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'block');
        }
    }

    hideForAuth(selector) {
        if (this.isAuthenticated()) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'none');
        }
    }

    showForGuest(selector) {
        if (!this.isAuthenticated()) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'block');
        }
    }

    hideForGuest(selector) {
        if (!this.isAuthenticated()) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.style.display = 'none');
        }
    }
}

// Create global instance
window.authManager = new AuthManager();

console.log('✅ AuthManager initialized');
console.log('📍 Authenticated:', authManager.isAuthenticated());
if (authManager.isAuthenticated()) {
    console.log('👤 Current user:', authManager.getCurrentUser().name);
    console.log('🔑 Role:', authManager.getUserRole());
}
