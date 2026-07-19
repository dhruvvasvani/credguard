document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authView = document.getElementById('authView');
    const dashboardView = document.getElementById('dashboardView');
    
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    const loginError = document.getElementById('loginError');
    const regError = document.getElementById('regError');
    
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        fetchProfile(token);
    }

    // Toggle logic
    showLoginBtn.addEventListener('click', () => {
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        regError.textContent = ''; // clear errors
    });

    showRegisterBtn.addEventListener('click', () => {
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginError.textContent = ''; // clear errors
    });

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        await handleAuth('/api/auth/login', { email, password }, loginError, 'loginSubmitBtn');
    });

    // Register Form Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        await handleAuth('/api/auth/register', { name, email, password }, regError, 'regSubmitBtn');
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        dashboardView.classList.add('hidden');
        authView.classList.remove('hidden');
        loginForm.reset();
        registerForm.reset();
    });

    // Core Auth Function
    async function handleAuth(url, data, errorElement, btnId) {
        const btn = document.getElementById(btnId);
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.loader');

        // Loading state
        errorElement.textContent = '';
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        btn.disabled = true;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                // Handle express-validator errors or general errors
                if (result.errors && result.errors.length > 0) {
                    throw new Error(result.errors[0].msg);
                }
                throw new Error(result.message || 'Authentication failed');
            }

            // Success
            localStorage.setItem('token', result.token);
            await fetchProfile(result.token);

        } catch (err) {
            errorElement.textContent = err.message;
        } finally {
            // Restore button
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btn.disabled = false;
        }
    }

    // Fetch Profile
    async function fetchProfile(token) {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                localStorage.removeItem('token');
                throw new Error(result.message);
            }

            // Populate dashboard
            document.getElementById('profileName').textContent = result.data.name;
            document.getElementById('profileEmail').textContent = result.data.email;
            document.getElementById('profileId').textContent = '#' + result.data.id;

            // Show dashboard
            authView.classList.add('hidden');
            dashboardView.classList.remove('hidden');

        } catch (err) {
            console.error('Session expired or invalid:', err);
            authView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        }
    }
});
