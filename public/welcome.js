document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    // If no token, redirect to login page
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    const profileForm = document.getElementById('profileForm');
    const profileError = document.getElementById('profileError');
    const profileSuccess = document.getElementById('profileSuccess');
    
    // Logout logic
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        } catch (e) {}
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    });

    // Fetch Profile and populate form
    async function fetchProfile() {
        try {
            const response = await fetch('/api/profile', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                localStorage.removeItem('token');
                throw new Error(result.message);
            }

            // Display welcome name
            document.getElementById('welcomeName').textContent = result.data.name;
            const wn2 = document.getElementById('welcomeName2');
            if (wn2) wn2.textContent = result.data.name;

            // Pre-fill optional fields if they exist
            if (result.data.age) document.getElementById('profileAge').value = result.data.age;
            if (result.data.country) document.getElementById('profileCountry').value = result.data.country;
            if (result.data.state) document.getElementById('profileState').value = result.data.state;
            if (result.data.city) document.getElementById('profileCity').value = result.data.city;
            if (result.data.pincode) document.getElementById('profilePincode').value = result.data.pincode;

        } catch (err) {
            console.error('Session expired or invalid:', err);
            localStorage.removeItem('token');
            window.location.href = '/index.html';
        }
    }

    // Save Profile
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('profileSubmitBtn');
        const btnText = btn.querySelector('.btn-text');
        const loader = btn.querySelector('.loader');

        profileError.textContent = '';
        profileSuccess.textContent = '';
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        btn.disabled = true;

        const payload = {
            age: document.getElementById('profileAge').value || null,
            country: document.getElementById('profileCountry').value || null,
            state: document.getElementById('profileState').value || null,
            city: document.getElementById('profileCity').value || null,
            pincode: document.getElementById('profilePincode').value || null,
        };

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors && result.errors.length > 0) {
                    throw new Error(result.errors[0].msg);
                }
                throw new Error(result.message || 'Update failed');
            }

            profileSuccess.textContent = 'Profile updated successfully!';

        } catch (err) {
            profileError.textContent = err.message;
        } finally {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btn.disabled = false;
        }
    });

    fetchProfile();
});
