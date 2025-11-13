/**
 * Login Page Logic
 */
(function() {
    'use strict';

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const togglePassword = document.getElementById('togglePassword');

    // Initialize
    function init() {
        // Check if already logged in
        if (authManager.isAuthenticated()) {
            const user = authManager.getCurrentUser();

            console.log('User already logged in:', user);

            // Redirect based on role
            if (user.role === 'admin') {
                window.location.href = '../Admin/dashboard.html';
            } else {
                window.location.href = '../Landing Page/Landing_Page.html';
            }
            return;
        }

        // Setup event listeners
        loginForm.addEventListener('submit', handleLogin);
        togglePassword.addEventListener('click', handleTogglePassword);

        // Clear inputs
        emailInput.value = '';
        passwordInput.value = '';

        console.log('✅ Login page initialized');
    }

    // Handle login
    async function handleLogin(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!email || !password) {
            showError('Email dan password harus diisi.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Format email tidak valid.');
            return;
        }

        // Show loading state
        setLoading(true);
        hideError();
        hideSuccess();

        // Call auth manager
        console.log('Attempting login for:', email);
        const result = await authManager.login(email, password);

        if (result.success) {
            // Success
            const user = result.user;
            console.log('Login successful:', user);

            showSuccess(`Selamat datang, ${user.name}!`);

            // Redirect after short delay
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = '../Admin/dashboard.html';
                } else {
                    window.location.href = '../Landing Page/Landing_Page.html';
                }
            }, 1000);
        } else {
            // Failed
            console.error('Login failed:', result);

            // Show specific error messages
            if (result.status === 422) {
                showError('Email atau password salah. Silakan coba lagi.');
            } else if (result.message) {
                showError(result.message);
            } else {
                showError('Login gagal. Periksa email dan password Anda.');
            }

            // Reset button
            setLoading(false);

            // Mark inputs as invalid
            emailInput.classList.add('is-invalid');
            passwordInput.classList.add('is-invalid');
        }
    }

    // Toggle password visibility
    function handleTogglePassword() {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        const icon = togglePassword.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    }

    // Set loading state
    function setLoading(isLoading) {
        btnLogin.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-block';
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    // Show error
    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
        successAlert.style.display = 'none';
    }

    // Hide error
    function hideError() {
        errorAlert.style.display = 'none';
    }

    // Show success
    function showSuccess(message) {
        successAlert.textContent = message;
        successAlert.style.display = 'block';
        errorAlert.style.display = 'none';
    }

    // Hide success
    function hideSuccess() {
        successAlert.style.display = 'none';
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Remove invalid state on input
    emailInput.addEventListener('input', () => {
        emailInput.classList.remove('is-invalid');
        hideError();
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('is-invalid');
        hideError();
    });

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
