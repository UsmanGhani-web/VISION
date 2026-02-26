// Authentication System for Bestro Gaming
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.updateNavbar();
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    // Check authentication status on page load
    checkAuthStatus() {
        const user = this.getCurrentUser();
        if (user) {
            console.log('User is already logged in:', user.firstName);
            // If user is on login/register page, redirect to home
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
                this.showNotification('You are already logged in!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        } else {
            // If user is not logged in and trying to access protected pages, redirect to login
            if (window.location.pathname.includes('profile.html')) {
                this.showNotification('Please login to access your profile', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        }
    }

    // Update navbar based on authentication status
    updateNavbar() {
        const authSection = document.getElementById('nav-auth-section');
        if (!authSection) {
            console.log('Nav auth section not found');
            return;
        }

        const user = this.getCurrentUser();
        console.log('Updating navbar, user:', user ? user.firstName : 'none');
        
        if (user) {
            authSection.innerHTML = `
                <div class="user-profile">
                    <div class="profile-dropdown-btn" id="profile-dropdown-btn">
                        <i class="fas fa-user"></i>
                        <span class="user-name">${user.firstName}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="profile-dropdown" id="profile-dropdown">
                        <a href="profile.html" class="dropdown-item">
                            <i class="fas fa-user"></i>
                            Profile
                        </a>
                        <button class="dropdown-item logout-btn" id="logout-btn">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </button>
                    </div>
                </div>
            `;
            console.log('Navbar updated with user profile');
        } else {
            authSection.innerHTML = `
                <div class="auth-buttons">
                    <a href="login.html" class="auth-btn login-btn">
                        <i class="fas fa-sign-in-alt"></i>
                        Login
                    </a>
                    
                </div>
            `;
            console.log('Navbar updated with auth buttons');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('Setting up auth event listeners...');
        
        // Profile dropdown toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('#profile-dropdown-btn')) {
                const dropdown = document.getElementById('profile-dropdown');
                const button = document.getElementById('profile-dropdown-btn');
                if (dropdown && button) {
                    const isActive = dropdown.classList.contains('active');
                    console.log('Profile dropdown clicked, current state:', isActive ? 'active' : 'inactive');
                    
                    dropdown.classList.toggle('active');
                    button.classList.toggle('active');
                    
                    console.log('Profile dropdown new state:', dropdown.classList.contains('active') ? 'active' : 'inactive');
                } else {
                    console.log('Profile dropdown elements not found:', { dropdown: !!dropdown, button: !!button });
                }
            } else {
                // Close dropdown when clicking outside
                const dropdown = document.getElementById('profile-dropdown');
                const button = document.getElementById('profile-dropdown-btn');
                if (dropdown && button) {
                    dropdown.classList.remove('active');
                    button.classList.remove('active');
                }
            }
        });

        // Logout functionality
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) {
                this.logout();
            }
        });

        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found, adding event listener');
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            console.log('Login form not found');
        }

        // Register form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            console.log('Register form found, adding event listener');
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        } else {
            console.log('Register form not found');
        }

        // Password confirmation validation
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => this.validatePasswordConfirmation(e));
        }
    }

    // Validate password confirmation
    validatePasswordConfirmation(e) {
        const password = document.getElementById('password').value;
        const confirmPassword = e.target.value;
        const formGroup = e.target.closest('.form-group');
        
        if (password !== confirmPassword) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            this.showFieldError(formGroup, 'Passwords do not match');
        } else {
            formGroup.classList.remove('error');
            formGroup.classList.add('success');
            this.clearFieldError(formGroup);
        }
    }

    // Show field-specific error
    showFieldError(formGroup, message) {
        let errorElement = formGroup.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: #ef4444;
                font-size: 0.8rem;
                margin-top: 5px;
                display: flex;
                align-items: center;
                gap: 5px;
            `;
            formGroup.appendChild(errorElement);
        }
        errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
    }

    // Clear field-specific error
    clearFieldError(formGroup) {
        const errorElement = formGroup.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Handle login form submission
    async handleLogin(e) {
        e.preventDefault();
        console.log('Login form submitted');
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        
        console.log('Login attempt:', { email, passwordLength: password?.length });

        // Clear previous errors
        this.clearAllErrors();

        // Validation
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user exists (for demo purposes, create user if not exists)
            let user = this.findUserByEmail(email);
            if (!user) {
                // Create user for demo purposes
                user = {
                    id: Date.now().toString(),
                    firstName: email.split('@')[0] || 'User',
                    lastName: '',
                    email: email,
                    password: password, // In real app, this would be hashed
                    role: 'user',
                    createdAt: new Date().toISOString()
                };
                this.saveUser(user);
            }

            // Verify password (in real app, this would be hashed comparison)
            if (user.password !== password) {
                this.showNotification('Invalid email or password', 'error');
                this.setButtonLoading(submitBtn, false);
                return;
            }

                    // Store user data and token
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        
        // Update last login time
        localStorage.setItem('last_login', new Date().toLocaleDateString());
        
        this.showNotification('Login successful! Welcome back!', 'success');
        
        // Add login activity
        this.addUserActivity('User logged in successfully', 'fas fa-sign-in-alt');
        
        // Update navbar immediately
        this.updateNavbar();
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Handle register form submission
    async handleRegister(e) {
        e.preventDefault();
        console.log('Register form submitted');
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword')
        };
        
        console.log('Registration data:', { ...userData, passwordLength: userData.password?.length });

        // Clear previous errors
        this.clearAllErrors();

        // Validation
        if (!this.validateRegisterForm(userData)) {
            return;
        }

        // Show loading state
        this.setButtonLoading(submitBtn, true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if user already exists
            if (this.findUserByEmail(userData.email)) {
                this.showNotification('User with this email already exists', 'error');
                this.setButtonLoading(submitBtn, false);
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password, // In real app, this would be hashed
                role: 'user',
                createdAt: new Date().toISOString()
            };

            console.log('Creating new user:', newUser);

            // Save user
            this.saveUser(newUser);

                    // Store user data and token
        localStorage.setItem('user', JSON.stringify(newUser));
        localStorage.setItem('token', 'demo-token-' + Date.now());
        
        // Update last login time
        localStorage.setItem('last_login', new Date().toLocaleDateString());
        
        this.showNotification('Registration successful! Welcome to Bestro!', 'success');
        
        // Add registration activity
        this.addUserActivity('Account created successfully', 'fas fa-user-plus');
        
        // Update navbar immediately
        this.updateNavbar();
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
            this.setButtonLoading(submitBtn, false);
        }
    }

    // Validate login form
    validateLoginForm(email, password) {
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return false;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }

        if (!email.includes('@')) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    // Validate register form
    validateRegisterForm(userData) {
        if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.confirmPassword) {
            this.showNotification('Please fill in all fields', 'error');
            return false;
        }

        if (userData.password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }

        if (userData.password !== userData.confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return false;
        }

        if (!userData.email.includes('@')) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }

        return true;
    }

    // Find user by email
    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email === email);
    }

    // Get all users
    getAllUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    // Save user
    saveUser(user) {
        const users = this.getAllUsers();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Set button loading state
    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Clear all form errors
    clearAllErrors() {
        const errorElements = document.querySelectorAll('.field-error');
        errorElements.forEach(element => element.remove());
        
        const formGroups = document.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });
    }

    // Get current user from localStorage
    getCurrentUser() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                return JSON.parse(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
    }

    // Logout functionality
    logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        this.showNotification('Logged out successfully', 'success');
        this.updateNavbar();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
            <span>${message}</span>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Add user activity for profile tracking
    addUserActivity(activityText, icon = 'fas fa-info-circle') {
        const user = this.getCurrentUser();
        if (!user) return;

        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
        const newActivity = {
            id: Date.now().toString(),
            userId: user.id,
            text: activityText,
            icon: icon,
            time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
            timestamp: Date.now()
        };

        activities.unshift(newActivity); // Add to beginning
        
        // Keep only last 20 activities
        if (activities.length > 20) {
            activities.splice(20);
        }

        localStorage.setItem('user_activities', JSON.stringify(activities));
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
    
    // Create demo user for testing (optional)
    if (!localStorage.getItem('user') && !localStorage.getItem('users')) {
        // Uncomment the line below to create a demo user automatically
        // createDemoUser();
    }
});

// Function to create a demo user for testing
function createDemoUser() {
    const demoUser = {
        id: 'demo-001',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@bestro.com',
        password: 'demo123',
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token-001');
    
    // Save to users list
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(demoUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Refresh the page to show the logged-in state
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Add notification animation
const style1 = document.createElement('style');
style1.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.8rem;
        margin-top: 5px;
        display: flex;
        align-items: center;
        gap: 5px;
        animation: slideIn 0.3s ease;
    }
    
    .form-group.error .input-wrapper {
        border-color: #ef4444;
    }
    
    .form-group.success .input-wrapper {
        border-color: #10b981;
    }
`;
document.head.appendChild(style1); 