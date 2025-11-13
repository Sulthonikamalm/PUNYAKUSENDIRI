/**
 * Register Page Logic
 */
(function() {
    'use strict';

    // DOM Elements
    const registerForm = document.getElementById('registerForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password_confirmation');
    const btnRegister = document.getElementById('btnRegister');
    const btnText = btnRegister.querySelector('.btn-text');
    const btnLoader = btnRegister.querySelector('.btn-loader');
    const errorAlert = document.getElementById('errorAlert');
    const successAlert = document.getElementById('successAlert');
    const togglePassword = document.getElementById('togglePassword');
    const togglePasswordConfirm = document.getElementById('togglePasswordConfirm');

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
        registerForm.addEventListener('submit', handleRegister);
        togglePassword.addEventListener('click', () => handleTogglePassword(passwordInput, togglePassword));
        togglePasswordConfirm.addEventListener('click', () => handleTogglePassword(passwordConfirmInput, togglePasswordConfirm));

        // Clear inputs
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        passwordConfirmInput.value = '';

        console.log('✅ Register page initialized');
    }

    // Handle register
    async function handleRegister(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const passwordConfirm = passwordConfirmInput.value;

        // Clear all invalid states
        clearInvalidStates();

        // Validation
        let hasError = false;

        if (!name || name.length < 3) {
            showFieldError(nameInput, 'nameError', 'Nama harus minimal 3 karakter.');
            hasError = true;
        }

        if (!email || !isValidEmail(email)) {
            showFieldError(emailInput, 'emailError', 'Format email tidak valid.');
            hasError = true;
        }

        if (!password || password.length < 8) {
            showFieldError(passwordInput, 'passwordError', 'Password harus minimal 8 karakter.');
            hasError = true;
        }

        if (password !== passwordConfirm) {
            showFieldError(passwordConfirmInput, 'passwordConfirmError', 'Konfirmasi password tidak cocok.');
            hasError = true;
        }

        if (hasError) {
            showError('Mohon periksa kembali form Anda.');
            return;
        }

        // Show loading state
        setLoading(true);
        hideError();
        hideSuccess();

        // Call auth manager
        console.log('Attempting registration for:', email);
        const result = await authManager.register({
            name: name,
            email: email,
            password: password,
            password_confirmation: passwordConfirm
        });

        if (result.success) {
            // Success
            const user = result.user;
            console.log('Registration successful:', user);

            showSuccess(`Selamat datang, ${user.name}! Akun Anda berhasil dibuat.`);

            // Redirect after short delay
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = '../Admin/dashboard.html';
                } else {
                    window.location.href = '../Landing Page/Landing_Page.html';
                }
            }, 1500);
        } else {
            // Failed
            console.error('Registration failed:', result);

            // Show specific error messages
            if (result.details && Object.keys(result.details).length > 0) {
                // Show field-specific errors
                for (const [field, messages] of Object.entries(result.details)) {
                    const errorMessage = Array.isArray(messages) ? messages[0] : messages;

                    if (field === 'name') {
                        showFieldError(nameInput, 'nameError', errorMessage);
                    } else if (field === 'email') {
                        showFieldError(emailInput, 'emailError', errorMessage);
                    } else if (field === 'password') {
                        showFieldError(passwordInput, 'passwordError', errorMessage);
                    }
                }

                showError('Mohon periksa kembali form Anda.');
            } else if (result.message) {
                showError(result.message);
            } else {
                showError('Registrasi gagal. Silakan coba lagi.');
            }

            // Reset button
            setLoading(false);
        }
    }

    // Toggle password visibility
    function handleTogglePassword(inputElement, buttonElement) {
        const type = inputElement.type === 'password' ? 'text' : 'password';
        inputElement.type = type;

        const icon = buttonElement.querySelector('i');
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
        btnRegister.disabled = isLoading;
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

    // Show field-specific error
    function showFieldError(inputElement, errorElementId, message) {
        inputElement.classList.add('is-invalid');
        const errorElement = document.getElementById(errorElementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    // Clear all invalid states
    function clearInvalidStates() {
        const inputs = [nameInput, emailInput, passwordInput, passwordConfirmInput];
        inputs.forEach(input => input.classList.remove('is-invalid'));

        const errorIds = ['nameError', 'emailError', 'passwordError', 'passwordConfirmError'];
        errorIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '';
        });
    }

    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Remove invalid state on input
    nameInput.addEventListener('input', () => {
        nameInput.classList.remove('is-invalid');
        hideError();
    });

    emailInput.addEventListener('input', () => {
        emailInput.classList.remove('is-invalid');
        hideError();
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('is-invalid');
        hideError();
    });

    passwordConfirmInput.addEventListener('input', () => {
        passwordConfirmInput.classList.remove('is-invalid');
        hideError();
    });

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
