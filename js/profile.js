// Enhanced Profile Page Functionality for Beastro Gaming
class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.orderHistory = JSON.parse(localStorage.getItem('order_history') || '[]');
        this.init();
    }

    init() {
        // Check authentication first
        if (!this.checkAuthentication()) {
            return;
        }
        
        this.loadUserData();
        this.setupEventListeners();
        this.loadProfileData();
        this.updateCartDisplay();
        
        // Listen for cart updates
        window.addEventListener('storage', (e) => {
            if (e.key === 'shopping_cart') {
                this.updateCartDisplay();
            }
        });
    }

    // Update cart display from global cart manager
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount && window.cartManager) {
            const count = window.cartManager.getCartCount();
            cartCount.textContent = count;
            
            // Add animation
            cartCount.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Check if user is authenticated
    checkAuthentication() {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!user || !token) {
            // User is not authenticated, redirect to login
            this.showMessage('Please login to access your profile', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return false;
        }
        
        return true;
    }

    // Load current user data
    loadUserData() {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                this.currentUser = JSON.parse(storedUser);
                this.updateProfileHeader();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.showMessage('Error loading user data', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
        } else {
            // No user data found, redirect to login
            this.showMessage('Please login to access your profile', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }
    }

    // Update profile header with user information
    updateProfileHeader() {
        if (!this.currentUser) return;

        document.getElementById('profile-name').textContent = `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || 'User';
        document.getElementById('profile-email').textContent = this.currentUser.email || '';
        document.getElementById('profile-role').textContent = this.currentUser.role || 'User';
        
        // Update form fields
        document.getElementById('edit-first-name').value = this.currentUser.firstName || '';
        document.getElementById('edit-last-name').value = this.currentUser.lastName || '';
        document.getElementById('edit-phone').value = this.currentUser.phone || '';
        document.getElementById('edit-address').value = this.currentUser.address || '';
        document.getElementById('current-email').value = this.currentUser.email || '';
    }

    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Form submissions
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        const changeEmailForm = document.getElementById('change-email-form');
        if (changeEmailForm) {
            changeEmailForm.addEventListener('submit', (e) => this.handleChangeEmail(e));
        }

        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Delete account button
        const deleteAccountBtn = document.getElementById('delete-account-btn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
        }

        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.toggleCart());
        }

        // Close cart
        const closeCart = document.getElementById('close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        // Continue shopping button
        const continueBtn = document.getElementById('continue-shopping-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                window.location.href = 'products.html';
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (window.cartManager && window.cartManager.getCartCount() > 0) {
                    window.location.href = 'checkout.html';
                } else {
                    this.showMessage('Your cart is empty!', 'error');
                }
            });
        }

        // Security toggles
        const twoFactorToggle = document.getElementById('2fa-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.addEventListener('change', (e) => this.handleTwoFactorToggle(e));
        }

        const loginNotificationsToggle = document.getElementById('login-notifications');
        if (loginNotificationsToggle) {
            loginNotificationsToggle.addEventListener('change', (e) => this.handleLoginNotificationsToggle(e));
        }

        // Notification toggles
        const orderNotificationsToggle = document.getElementById('order-notifications');
        if (orderNotificationsToggle) {
            orderNotificationsToggle.addEventListener('change', (e) => this.handleOrderNotificationsToggle(e));
        }

        const promoNotificationsToggle = document.getElementById('promo-notifications');
        if (promoNotificationsToggle) {
            promoNotificationsToggle.addEventListener('change', (e) => this.handlePromoNotificationsToggle(e));
        }

        const newsletterToggle = document.getElementById('newsletter-notifications');
        if (newsletterToggle) {
            newsletterToggle.addEventListener('change', (e) => this.handleNewsletterToggle(e));
        }

        // Click outside cart to close
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartIcon = document.getElementById('cart-icon');
            if (cartSidebar && cartSidebar.classList.contains('active') && 
                !cartSidebar.contains(e.target) && 
                !cartIcon.contains(e.target)) {
                this.closeCart();
            }
        });
    }

    // Toggle cart sidebar
    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.toggle('active');
            
            // Create overlay if it doesn't exist
            let overlay = document.querySelector('.cart-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'cart-overlay';
                overlay.addEventListener('click', () => this.closeCart());
                document.body.appendChild(overlay);
            }
            
            if (cartSidebar.classList.contains('active')) {
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Refresh cart display
                if (window.cartManager) {
                    window.cartManager.updateCartSidebar();
                }
            } else {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    // Close cart sidebar
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const overlay = document.querySelector('.cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
        
        document.body.style.overflow = '';
    }

    // Switch between tabs
    switchTab(tabName) {
        // Hide all tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // Remove active class from all tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));

        // Show selected tab content
        const selectedContent = document.getElementById(`${tabName}-content`);
        if (selectedContent) {
            selectedContent.classList.add('active');
        }

        // Add active class to selected tab button
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Load specific tab data
        this.loadTabData(tabName);
    }

    // Load data for specific tabs
    loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadOverviewData();
                break;
            case 'orders':
                this.loadOrdersData();
                break;
            case 'payments':
                this.loadPaymentsData();
                break;
            case 'security':
                this.loadSecurityData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    // Load overview data
    loadOverviewData() {
        // Load user statistics
        this.loadUserStats();
        // Load recent activity
        this.loadRecentActivity();
    }

    // Load user statistics
    loadUserStats() {
        // Get user data from localStorage
        const userData = this.currentUser;
        
        // Get order history
        const totalOrders = this.orderHistory.length;
        const totalSpent = this.orderHistory.reduce((sum, order) => {
            return sum + (order.total || 0);
        }, 0);
        
        // Update statistics
        const totalOrdersElement = document.getElementById('total-orders');
        const totalSpentElement = document.getElementById('total-spent');
        const memberSinceElement = document.getElementById('member-since');
        const lastLoginElement = document.getElementById('last-login');
        
        if (totalOrdersElement) {
            totalOrdersElement.textContent = totalOrders;
        }
        
        if (totalSpentElement) {
            totalSpentElement.textContent = `PKR ${totalSpent.toFixed(2)}`;
        }
        
        // Format member since date
        if (memberSinceElement) {
            if (userData.createdAt) {
                try {
                    const createdDate = new Date(userData.createdAt);
                    if (!isNaN(createdDate.getTime())) {
                        memberSinceElement.textContent = createdDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    } else {
                        memberSinceElement.textContent = 'Today';
                    }
                } catch (error) {
                    memberSinceElement.textContent = 'Today';
                }
            } else {
                memberSinceElement.textContent = 'Today';
            }
        }
        
        // Format last login date
        if (lastLoginElement) {
            const lastLogin = localStorage.getItem('last_login');
            if (lastLogin && lastLogin !== 'Today') {
                try {
                    const loginDate = new Date(lastLogin);
                    if (!isNaN(loginDate.getTime())) {
                        lastLoginElement.textContent = loginDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });
                    } else {
                        lastLoginElement.textContent = 'Today';
                    }
                } catch (error) {
                    lastLoginElement.textContent = 'Today';
                }
            } else {
                lastLoginElement.textContent = 'Today';
            }
        }
    }

    // Load recent activity
    loadRecentActivity() {
        const activityList = document.getElementById('recent-activity');
        if (!activityList) return;

        // Get activities from localStorage
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');

        if (activities.length === 0) {
            // Show default activities
            activityList.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-user-plus"></i>
                    <span>Account created successfully</span>
                    <small>${new Date().toLocaleDateString()}</small>
                </div>
            `;
        } else {
            activityList.innerHTML = activities.slice(0, 5).map(activity => `
                <div class="activity-item">
                    <i class="${activity.icon}"></i>
                    <span>${activity.text}</span>
                    <small>${activity.time}</small>
                </div>
            `).join('');
        }
    }

    // Load orders data
    loadOrdersData() {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        if (this.orderHistory.length === 0) {
            ordersList.innerHTML = `
                <div class="no-orders">
                    <i class="fas fa-shopping-bag"></i>
                    <p>No orders yet</p>
                    <a href="products.html" class="btn btn-primary">Start Shopping</a>
                </div>
            `;
        } else {
            this.displayOrders(this.orderHistory);
        }
    }

    // Display orders
    displayOrders(orders) {
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        ordersList.innerHTML = orders.slice().reverse().map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.orderId}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                    <span class="order-status">${order.status || 'Completed'}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>PKR ${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-total">Total: PKR ${order.total.toFixed(2)}</span>
                    <button class="btn btn-secondary" onclick="profileManager.viewOrder('${order.orderId}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    // View order details
    viewOrder(orderId) {
        const order = this.orderHistory.find(o => o.orderId === orderId);
        if (order) {
            // Show order details in a modal or expand view
            alert(`Order #${orderId}\n\nItems:\n${order.items.map(item => 
                `${item.name} x${item.quantity} - PKR ${(item.price * item.quantity).toFixed(2)}`
            ).join('\n')}\n\nTotal: PKR ${order.total.toFixed(2)}`);
        }
    }

    // Load payments data
    loadPaymentsData() {
        const paymentsList = document.getElementById('payments-list');
        if (!paymentsList) return;

        if (this.orderHistory.length === 0) {
            paymentsList.innerHTML = `
                <div class="no-payments">
                    <i class="fas fa-credit-card"></i>
                    <p>No payment history yet</p>
                </div>
            `;
        } else {
            this.displayPayments(this.orderHistory);
        }
    }

    // Display payments
    displayPayments(orders) {
        const paymentsList = document.getElementById('payments-list');
        if (!paymentsList) return;

        paymentsList.innerHTML = orders.slice().reverse().map(order => `
            <div class="payment-card">
                <div class="payment-icon">
                    <i class="fas ${order.payment?.method === 'card' ? 'fa-credit-card' : 
                                     order.payment?.method === 'jazzcash' ? 'fa-mobile-alt' : 
                                     order.payment?.method === 'easypaisa' ? 'fa-mobile-alt' : 'fa-university'}"></i>
                </div>
                <div class="payment-details">
                    <div class="payment-order">Order #${order.orderId}</div>
                    <div class="payment-method">${order.payment?.methodName || 'Card Payment'}</div>
                    <div class="payment-date">${new Date(order.date).toLocaleDateString()}</div>
                </div>
                <div class="payment-amount">PKR ${order.total.toFixed(2)}</div>
            </div>
        `).join('');
    }

    // Load security data
    loadSecurityData() {
        // Load security preferences from localStorage
        const twoFactorEnabled = localStorage.getItem('2fa_enabled') === 'true';
        const loginNotificationsEnabled = localStorage.getItem('login_notifications') !== 'false';

        // Update toggles
        const twoFactorToggle = document.getElementById('2fa-toggle');
        if (twoFactorToggle) {
            twoFactorToggle.checked = twoFactorEnabled;
        }

        const loginNotificationsToggle = document.getElementById('login-notifications');
        if (loginNotificationsToggle) {
            loginNotificationsToggle.checked = loginNotificationsEnabled;
        }
    }

    // Load settings data
    loadSettingsData() {
        // Load notification preferences from localStorage
        const orderNotifications = localStorage.getItem('order_notifications') !== 'false';
        const promoNotifications = localStorage.getItem('promo_notifications') === 'true';
        const newsletterNotifications = localStorage.getItem('newsletter_notifications') === 'true';

        // Update toggles
        const orderNotificationsToggle = document.getElementById('order-notifications');
        if (orderNotificationsToggle) {
            orderNotificationsToggle.checked = orderNotifications;
        }

        const promoNotificationsToggle = document.getElementById('promo-notifications');
        if (promoNotificationsToggle) {
            promoNotificationsToggle.checked = promoNotifications;
        }

        const newsletterToggle = document.getElementById('newsletter-notifications');
        if (newsletterToggle) {
            newsletterToggle.checked = newsletterNotifications;
        }
    }

    // Handle password change
    async handleChangePassword(e) {
        e.preventDefault();
        
        const form = e.target;
        const currentPassword = form.currentPassword.value;
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmNewPassword.value;

        // Validation
        if (newPassword !== confirmPassword) {
            this.showMessage('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            // Update user data in localStorage
            this.currentUser.password = newPassword;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            // Also update in users list if exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Add to recent activity
            this.addActivity('Password changed successfully', 'fas fa-key');
            
            this.showMessage('Password changed successfully', 'success');
            form.reset();
            
        } catch (error) {
            this.showMessage('Failed to change password', 'error');
        }
    }

    // Handle email change
    async handleChangeEmail(e) {
        e.preventDefault();
        
        const form = e.target;
        const newEmail = form.newEmail.value;
        const password = form.emailPassword.value;

        // Validation
        if (!newEmail || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            this.showMessage('Please enter a valid email address', 'error');
            return;
        }

        try {
            // Update user data in localStorage
            this.currentUser.email = newEmail;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            // Also update in users list if exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].email = newEmail;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update profile header
            this.updateProfileHeader();
            
            // Add to recent activity
            this.addActivity('Email changed successfully', 'fas fa-envelope');
            
            this.showMessage('Email changed successfully', 'success');
            form.reset();
            
        } catch (error) {
            this.showMessage('Failed to change email', 'error');
        }
    }

    // Handle profile update
    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const phone = form.phone.value;
        const address = form.address.value;

        try {
            // Update user data in localStorage
            this.currentUser.firstName = firstName;
            this.currentUser.lastName = lastName;
            this.currentUser.phone = phone;
            this.currentUser.address = address;
            
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            // Also update in users list if exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...this.currentUser };
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Update profile header
            this.updateProfileHeader();
            
            // Add to recent activity
            this.addActivity('Profile information updated', 'fas fa-user-edit');
            
            this.showMessage('Profile updated successfully', 'success');
            
        } catch (error) {
            this.showMessage('Failed to update profile', 'error');
        }
    }

    // Handle delete account
    handleDeleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // Clear all user data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('shopping_cart');
            localStorage.removeItem('order_history');
            localStorage.removeItem('user_settings');
            localStorage.removeItem('user_activities');
            
            // Remove from users list if exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.filter(u => u.id !== this.currentUser.id);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            
            // Clear cart in cart manager
            if (window.cartManager) {
                window.cartManager.clearCart();
            }
            
            this.showMessage('Account deleted successfully', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    // Handle two-factor authentication toggle
    handleTwoFactorToggle(e) {
        const enabled = e.target.checked;
        localStorage.setItem('2fa_enabled', enabled);
        
        this.showMessage(
            enabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
            enabled ? 'success' : 'info'
        );
    }

    // Handle login notifications toggle
    handleLoginNotificationsToggle(e) {
        const enabled = e.target.checked;
        localStorage.setItem('login_notifications', enabled);
        this.showMessage('Login notifications updated', 'success');
    }

    // Handle order notifications toggle
    handleOrderNotificationsToggle(e) {
        const enabled = e.target.checked;
        localStorage.setItem('order_notifications', enabled);
        this.showMessage('Order notifications updated', 'success');
    }

    // Handle promotional notifications toggle
    handlePromoNotificationsToggle(e) {
        const enabled = e.target.checked;
        localStorage.setItem('promo_notifications', enabled);
        this.showMessage('Promotional notifications updated', 'success');
    }

    // Handle newsletter toggle
    handleNewsletterToggle(e) {
        const enabled = e.target.checked;
        localStorage.setItem('newsletter_notifications', enabled);
        this.showMessage('Newsletter preferences updated', 'success');
    }

    // Add activity to recent activity list
    addActivity(text, icon) {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
        
        activities.unshift({
            icon: icon,
            text: text,
            time: 'Just now'
        });
        
        // Keep only last 10 activities
        if (activities.length > 10) {
            activities.pop();
        }
        
        localStorage.setItem('user_activities', JSON.stringify(activities));
        
        // Update recent activity display if on overview tab
        if (document.getElementById('overview-content').classList.contains('active')) {
            this.loadRecentActivity();
        }
    }

    // Show message
    showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.profile-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `profile-message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(messageDiv);

        // Show message
        setTimeout(() => messageDiv.classList.add('show'), 100);

        // Remove message after 3 seconds
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
    }

    // Load profile data
    loadProfileData() {
        // Load initial data for overview tab
        this.loadOverviewData();
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Add message styles
const messageStyles = document.createElement('style');
messageStyles.textContent = `
    .profile-message {
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 10px;
        padding: 15px 20px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        max-width: 350px;
    }

    .profile-message.show {
        transform: translateX(0);
    }

    .message-success {
        border-left: 4px solid #10b981;
    }

    .message-error {
        border-left: 4px solid #ef4444;
    }

    .message-info {
        border-left: 4px solid #3b82f6;
    }

    .profile-message i {
        font-size: 1.2rem;
    }

    .message-success i {
        color: #10b981;
    }

    .message-error i {
        color: #ef4444;
    }

    .message-info i {
        color: #3b82f6;
    }

    /* Cart overlay styles */
    .cart-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(3px);
        z-index: 999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }

    .cart-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    /* Order card styles */
    .order-card {
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        transition: all 0.3s ease;
    }

    .order-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.2);
    }

    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .order-id {
        font-weight: bold;
        color: var(--neon-blue);
    }

    .order-date {
        color: var(--light-blue);
        font-size: 0.9rem;
    }

    .order-status {
        padding: 4px 12px;
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid #10b981;
        border-radius: 20px;
        color: #10b981;
        font-size: 0.8rem;
    }

    .order-items {
        margin-bottom: 15px;
    }

    .order-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        color: var(--white);
        font-size: 0.9rem;
    }

    .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .order-total {
        font-weight: bold;
        color: var(--neon-blue);
    }

    /* Payment card styles */
    .payment-card {
        display: flex;
        align-items: center;
        gap: 15px;
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(0, 212, 255, 0.2);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
        transition: all 0.3s ease;
    }

    .payment-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 212, 255, 0.2);
    }

    .payment-icon {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .payment-details {
        flex: 1;
    }

    .payment-order {
        font-weight: bold;
        color: var(--white);
        margin-bottom: 5px;
    }

    .payment-method {
        color: var(--light-blue);
        font-size: 0.9rem;
    }

    .payment-date {
        color: var(--gray);
        font-size: 0.8rem;
    }

    .payment-amount {
        font-weight: bold;
        color: var(--neon-blue);
        font-size: 1.1rem;
    }

    /* Cart count animation */
    #cart-count {
        transition: transform 0.2s ease;
    }
`;
document.head.appendChild(messageStyles);
