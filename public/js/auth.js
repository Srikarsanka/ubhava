const Auth = {
    user: null,

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                this.user = await response.json();
                this.updateUI(true);
                return this.user;
            } else {
                this.user = null;
                this.updateUI(false);
                // DISABLED: Don't force login on page load - let users browse freely
                // this.openModal('login');
                return null;
            }
        } catch (error) {
            console.error('Auth Check Error:', error);
            this.updateUI(false);
            return null;
        }
    },
    
    // Alias for compatibility with shop.js
    showLoginModal() {
        this.openModal('login');
    },

    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                // If backend crashes/returns HTML (500/502), read as text
                const text = await response.text();
                throw new Error(`Server Error: ${response.status} ${response.statusText}\n${text.substring(0, 100)}...`);
            }

            if (response.ok) {
                this.user = data;
                this.updateUI(true);
                this.closeModal();
                showToast('Login Successful!', 'success');
                
                // Admin Redirect
                if (this.user.role === 'admin') {
                    window.location.href = 'admin.html';
                }
                
                return true;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login Error:', error);
            showToast(error.message, 'error');
            return false;
        }
    },

    async register(fullName, email, password, phoneNumber) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password, phoneNumber })
            });

            const data = await response.json();

            if (response.ok) {
                this.user = data;
                this.updateUI(true);
                this.closeModal();
                showToast('Registration Successful!', 'success');
                return true;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            showToast(error.message, 'error');
            return false;
        }
    },

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.user = null;
            this.updateUI(false);
            showToast('Logged Out', 'info');
            window.location.reload();
        } catch (error) {
            console.error('Logout Error:', error);
        }
    },

    updateUI(isLoggedIn) {
        const loginBtn = document.getElementById('nav-login-btn');
        const logoutBtn = document.getElementById('nav-logout-btn');
        const userDisplay = document.getElementById('nav-user-display');

        if (isLoggedIn && this.user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            if (userDisplay) {
                userDisplay.textContent = `Hello, ${this.user.fullName}`;
                userDisplay.style.display = 'inline-block';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userDisplay) userDisplay.style.display = 'none';
        }
    },

    openModal(mode = 'login') {
        const modal = document.getElementById('auth-modal');
        const loginForm = document.getElementById('login-form-container');
        const registerForm = document.getElementById('register-form-container');
        const modalTitle = document.getElementById('auth-modal-title');

        if (modal) {
            modal.style.display = 'flex';
            if (mode === 'login') {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                modalTitle.textContent = 'Login';
            } else {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                modalTitle.textContent = 'Sign Up';
            }
        }
    },

    closeModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) modal.style.display = 'none';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Auth.checkAuth();

    // Event Listeners for Modal
    const modalClose = document.getElementById('auth-modal-close');
    if (modalClose) modalClose.addEventListener('click', () => Auth.closeModal());
    
    // Switch to Register
    const toRegisterBtn = document.getElementById('switch-to-register');
    if(toRegisterBtn) toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('register');
    });

    // Switch to Login
    const toLoginBtn = document.getElementById('switch-to-login');
    if(toLoginBtn) toLoginBtn.addEventListener('click', (e) => {
         e.preventDefault();
         Auth.openModal('login');
    });

    // Login Form Submit
    const loginForm = document.getElementById('auth-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            Auth.login(email, password);
        });
    }

    // Register Form Submit
    const registerForm = document.getElementById('auth-register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = registerForm.fullName.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const phone = registerForm.phone.value;
            Auth.register(fullName, email, password, phone);
        });
    }

    // Nav Button Listeners (Assuming IDs exist in HTML)
    const navLogin = document.getElementById('nav-login-btn');
    if (navLogin) navLogin.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.openModal('login'); 
    });

    const navLogout = document.getElementById('nav-logout-btn');
    if (navLogout) navLogout.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
    });
});
