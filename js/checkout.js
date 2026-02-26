// Checkout System for GamingTech Pro
class CheckoutSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        this.promoCodes = {
            'WELCOME10': { discount: 0.10, description: '10% off for new customers' },
            'GAMING20': { discount: 0.20, description: '20% off gaming accessories' },
            'SAVE15': { discount: 0.15, description: '15% off all products' },
            'STUDENT': { discount: 0.12, description: '12% off for students' }
        };
        this.appliedPromo = null;
        this.init();
    }

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.calculateTotals();
        this.setupFormValidation();
    }

    loadCart() {
        const checkoutItems = document.getElementById('checkout-items');
        if (!checkoutItems) return;

        if (this.cart.length === 0) {
            checkoutItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="btn btn-primary">Continue Shopping</a>
                </div>
            `;
            return;
        }

        checkoutItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=60&h=60&fit=crop&crop=center'}" 
                     alt="${item.name}" class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">Qty: ${item.quantity}</div>
                    <div class="item-price">PKR ${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.handlePaymentMethodChange(e.target.value);
            });
        });

        // Promo code
        const applyPromoBtn = document.getElementById('apply-promo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => this.applyPromoCode());
        }

        const promoInput = document.getElementById('promo-code');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyPromoCode();
                }
            });
        }

        // Place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => this.placeOrder());
        }

        // Card number formatting
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', this.formatCardNumber);
        }

        // Card expiry formatting
        const cardExpiryInput = document.getElementById('card-expiry');
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', this.formatCardExpiry);
        }

        // CVV validation
        const cardCvvInput = document.getElementById('card-cvv');
        if (cardCvvInput) {
            cardCvvInput.addEventListener('input', this.formatCVV);
        }

        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', this.formatPhoneNumber);
        });
    }

    handlePaymentMethodChange(method) {
        console.log('Payment method selected:', method);
        
        // Update UI based on selected payment method
        const paymentForms = document.querySelectorAll('.payment-form');
        paymentForms.forEach(form => {
            form.style.display = 'none';
        });

        const selectedForm = document.querySelector(`.${method}-form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }
    }

    formatCardNumber(e) {
        let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        if (formattedValue.length > 19) formattedValue = formattedValue.substr(0, 19);
        e.target.value = formattedValue;
    }

    formatCardExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    }

    formatCVV(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('92')) {
            value = '+' + value;
        } else if (value.startsWith('03')) {
            value = '+92' + value.substring(1);
        }
        e.target.value = value;
    }

    calculateTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 5000 ? 0 : 250; // Free shipping over PKR 5000
        const taxRate = 0.17; // 17% GST
        const tax = subtotal * taxRate;
        
        let discount = 0;
        if (this.appliedPromo) {
            discount = subtotal * this.appliedPromo.discount;
        }

        const total = subtotal + shipping + tax - discount;

        // Update UI
        document.getElementById('subtotal').textContent = `PKR ${subtotal.toFixed(2)}`;
        document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `PKR ${shipping.toFixed(2)}`;
        document.getElementById('tax').textContent = `PKR ${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `PKR ${total.toFixed(2)}`;

        const discountLine = document.getElementById('discount-line');
        if (discount > 0) {
            discountLine.style.display = 'flex';
            document.getElementById('discount').textContent = `-PKR ${discount.toFixed(2)}`;
        } else {
            discountLine.style.display = 'none';
        }
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promo-code');
        const promoCode = promoInput.value.trim().toUpperCase();

        if (!promoCode) {
            this.showNotification('Please enter a promo code', 'error');
            return;
        }

        if (this.promoCodes[promoCode]) {
            this.appliedPromo = this.promoCodes[promoCode];
            this.calculateTotals();
            this.showNotification(`Promo code applied! ${this.appliedPromo.description}`, 'success');
            promoInput.value = '';
            
            // Update button to show removal option
            const applyBtn = document.getElementById('apply-promo');
            applyBtn.textContent = 'Remove';
            applyBtn.onclick = () => this.removePromoCode();
        } else {
            this.showNotification('Invalid promo code', 'error');
        }
    }

    removePromoCode() {
        this.appliedPromo = null;
        this.calculateTotals();
        this.showNotification('Promo code removed', 'info');
        
        // Reset button
        const applyBtn = document.getElementById('apply-promo');
        applyBtn.textContent = 'Apply';
        applyBtn.onclick = () => this.applyPromoCode();
    }

    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[required], select[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        } else if (field.id === 'card-number' && value && !this.isValidCardNumber(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid card number';
        } else if (field.id === 'card-expiry' && value && !this.isValidExpiry(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid expiry date';
        } else if (field.id === 'card-cvv' && value && !this.isValidCVV(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid CVV';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^\+92[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isValidCardNumber(cardNumber) {
        const cleaned = cardNumber.replace(/\s/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
    }

    isValidExpiry(expiry) {
        const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!regex.test(expiry)) return false;
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = parseInt(year);
        const expMonth = parseInt(month);
        
        return (expYear > currentYear) || (expYear === currentYear && expMonth >= currentMonth);
    }

    isValidCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    validateAllForms() {
        let isValid = true;
        const requiredFields = document.querySelectorAll('input[required], select[required]');
        
        requiredFields.forEach(field => {
            // Only validate visible fields
            if (field.offsetParent !== null) {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            }
        });

        // Check if payment method is selected
        const selectedPayment = document.querySelector('input[name="payment_method"]:checked');
        if (!selectedPayment) {
            this.showNotification('Please select a payment method', 'error');
            isValid = false;
        }

        return isValid;
    }

    async placeOrder() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }

        if (!this.validateAllForms()) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        const placeOrderBtn = document.getElementById('place-order-btn');
        const originalText = placeOrderBtn.innerHTML;
        
        // Show loading state
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        placeOrderBtn.disabled = true;

        try {
            // Simulate order processing
            await this.processOrder();
            
            // Clear cart
            localStorage.removeItem('shopping_cart');
            
            // Show success message
            this.showOrderSuccess();
            
        } catch (error) {
            console.error('Order processing failed:', error);
            this.showNotification('Order processing failed. Please try again.', 'error');
        } finally {
            // Reset button
            placeOrderBtn.innerHTML = originalText;
            placeOrderBtn.disabled = false;
        }
    }

    async processOrder() {
        return new Promise((resolve) => {
            // Simulate API call delay
            setTimeout(() => {
                console.log('Order processed successfully');
                resolve();
            }, 2000);
        });
    }

    showOrderSuccess() {
        const main = document.querySelector('.checkout-main');
        main.innerHTML = `
            <div class="container">
                <div class="order-success">
                    <div class="success-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>
                    <div class="order-details">
                        <h3>Order Details</h3>
                        <p><strong>Order ID:</strong> #GT${Date.now()}</p>
                        <p><strong>Total Amount:</strong> ${document.getElementById('total').textContent}</p>
                        <p><strong>Payment Method:</strong> ${this.getSelectedPaymentMethod()}</p>
                    </div>
                    <div class="success-actions">
                        <a href="index.html" class="btn btn-primary">Continue Shopping</a>
                        <a href="profile.html" class="btn btn-secondary">View Orders</a>
                    </div>
                </div>
            </div>
        `;

        // Add success page styles
        const style = document.createElement('style');
        style.textContent = `
            .order-success {
                text-align: center;
                max-width: 600px;
                margin: 50px auto;
                padding: 50px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            .success-icon {
                font-size: 5rem;
                color: #10b981;
                margin-bottom: 30px;
            }
            .order-success h1 {
                color: var(--white);
                margin-bottom: 20px;
            }
            .order-success p {
                color: rgba(255, 255, 255, 0.8);
                margin-bottom: 30px;
            }
            .order-details {
                background: rgba(255, 255, 255, 0.05);
                padding: 25px;
                border-radius: 15px;
                margin: 30px 0;
            }
            .order-details h3 {
                color: var(--white);
                margin-bottom: 15px;
            }
            .order-details p {
                margin: 10px 0;
                text-align: left;
            }
            .success-actions {
                display: flex;
                gap: 20px;
                justify-content: center;
                flex-wrap: wrap;
            }
        `;
        document.head.appendChild(style);
    }

    getSelectedPaymentMethod() {
        const selected = document.querySelector('input[name="payment_method"]:checked');
        if (!selected) return 'Not selected';
        
        const paymentNames = {
            'jazzcash': 'JazzCash',
            'easypaisa': 'Easypaisa',
            'card': 'Credit/Debit Card',
            'bank': 'Bank Transfer'
        };
        
        return paymentNames[selected.value] || selected.value;
    }

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
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize checkout system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkoutSystem = new CheckoutSystem();
});

// Add notification animation
const style = document.createElement('style');
style.textContent = `
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
    
    .form-group input.error,
    .form-group select.error {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(style); 