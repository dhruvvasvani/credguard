document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authView = document.getElementById('authView');
    
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    const loginError = document.getElementById('loginError');
    const regError = document.getElementById('regError');
    
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/welcome.html';
        return;
    }

    // Toggle logic
    showLoginBtn.addEventListener('click', () => {
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        regError.textContent = '';
    });

    showRegisterBtn.addEventListener('click', () => {
        showRegisterBtn.classList.add('active');
        showLoginBtn.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        loginError.textContent = '';
    });

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('loginIdentifier').value;
        const password = document.getElementById('loginPassword').value;
        
        await handleAuth('/api/auth/login', { identifier, password }, loginError, 'loginSubmitBtn');
    });

    // Location Data logic
    const regCountry = document.getElementById('regCountry');
    const regState = document.getElementById('regState');
    const regCity = document.getElementById('regCity');
    const regPincode = document.getElementById('regPincode');
    let countryDialCodeMap = {};

    // Fetch Countries (with fallback)
    fetch('https://countriesnow.space/api/v0.1/countries/codes')
        .then(res => res.json())
        .then(data => {
            if (!data.error && data.data) {
                populateCountries(data.data);
            } else {
                useFallbackCountries();
            }
        })
        .catch(err => {
            console.error('API failed, using fallback', err);
            useFallbackCountries();
        });

    function populateCountries(countriesList) {
        const sorted = countriesList.sort((a, b) => a.name.localeCompare(b.name));
        sorted.forEach(c => {
            countryDialCodeMap[c.name] = c.dial_code;
            const option = document.createElement('option');
            option.value = c.name;
            option.textContent = `${c.name} (${c.dial_code})`;
            regCountry.appendChild(option);
        });
    }

    function useFallbackCountries() {
        const fallbacks = [
            { name: "India", dial_code: "+91" },
            { name: "United States", dial_code: "+1" },
            { name: "United Kingdom", dial_code: "+44" },
            { name: "Canada", dial_code: "+1" },
            { name: "Australia", dial_code: "+61" }
        ];
        populateCountries(fallbacks);
    }

    // On Country Change -> Fetch States
    regCountry.addEventListener('change', async (e) => {
        const country = e.target.value;
        regState.innerHTML = '<option value="" disabled selected>Loading states...</option>';
        regState.disabled = true;
        regCity.innerHTML = '<option value="" disabled selected>Select City</option>';
        regCity.disabled = true;

        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country })
            });
            const data = await res.json();
            if (!data.error && data.data.states && data.data.states.length > 0) {
                regState.innerHTML = '<option value="" disabled selected>Select State</option>';
                data.data.states.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.name;
                    option.textContent = s.name;
                    regState.appendChild(option);
                });
                regState.disabled = false;
            } else {
                throw new Error("No states found from API");
            }
        } catch (err) {
            console.error('Error fetching states, using fallback', err);
            // Fallback
            regState.innerHTML = '<option value="" disabled selected>Select State</option>';
            ['State 1', 'State 2', 'State 3'].forEach(s => {
                const option = document.createElement('option');
                option.value = s;
                option.textContent = s;
                regState.appendChild(option);
            });
            regState.disabled = false;
        }
    });

    // On State Change -> Fetch Cities
    regState.addEventListener('change', async (e) => {
        const country = regCountry.value;
        const state = e.target.value;
        regCity.innerHTML = '<option value="" disabled selected>Loading cities...</option>';
        regCity.disabled = true;

        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country, state })
            });
            const data = await res.json();
            if (!data.error && data.data && data.data.length > 0) {
                regCity.innerHTML = '<option value="" disabled selected>Select City</option>';
                data.data.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c;
                    option.textContent = c;
                    regCity.appendChild(option);
                });
                regCity.disabled = false;
            } else {
                throw new Error("No cities found from API");
            }
        } catch (err) {
            console.error('Error fetching cities, using fallback', err);
            // Fallback
            regCity.innerHTML = '<option value="" disabled selected>Select City</option>';
            ['City A', 'City B', 'City C'].forEach(c => {
                const option = document.createElement('option');
                option.value = c;
                option.textContent = c;
                regCity.appendChild(option);
            });
            regCity.disabled = false;
        }
    });

    // Register Form Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const localPhone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const country = regCountry.value;
        const state = regState.value;
        const city = regCity.value;
        const pincode = regPincode.value;
        
        // prepend dial code
        const dialCode = countryDialCodeMap[country] || '';
        const phone = dialCode + localPhone;
        
        await handleAuth('/api/auth/register', { name, email, phone, password, country, state, city, pincode }, regError, 'regSubmitBtn');
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
                credentials: 'same-origin',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors && result.errors.length > 0) {
                    throw new Error(result.errors[0].msg);
                }
                throw new Error(result.message || 'Authentication failed');
            }

            // Success - Redirect to Welcome Page
            localStorage.setItem('token', result.token);
            window.location.href = '/welcome.html';

        } catch (err) {
            errorElement.textContent = err.message;
        } finally {
            // Restore button
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
            btn.disabled = false;
        }
    }
});
