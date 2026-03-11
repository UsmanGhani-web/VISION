// Global Cart Manager - Ensures cart state is consistent across all pages
class CartManager {
    constructor() {
        this.cartKey = 'shopping_cart';
        this.orderHistoryKey = 'order_history';
        this.cart = this.loadCart();
        this.init();
    }

    init() {
        // Listen for cart updates across tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === this.cartKey) {
                this.cart = this.loadCart();
                this.updateAllCartDisplays();
            }
        });

        // Update cart displays on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateAllCartDisplays();
        });
    }

    loadCart() {
        try {
            return JSON.parse(localStorage.getItem(this.cartKey)) || [];
        } catch {
            return [];
        }
    }

    saveCart() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
        // Trigger storage event for other tabs
        window.dispatchEvent(new Event('storage'));
        this.updateAllCartDisplays();
    }

    getCart() {
        return this.cart;
    }

    getCartCount() {
        return this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    }

    addItem(item) {
        const existingItem = this.cart.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
        } else {
            this.cart.push({
                ...item,
                quantity: item.quantity || 1
            });
        }
        
        this.saveCart();
        this.showNotification('Item added to cart!', 'success');
    }

    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.showNotification('Item removed from cart', 'info');
    }

    updateQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        console.log('Cart cleared successfully');
    }

    updateAllCartDisplays() {
        // Update cart count in navigation
        const cartCountElements = document.querySelectorAll('#cart-count');
        const count = this.getCartCount();
        
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                // Add animation
                element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        });

        // Update cart sidebar if it exists
        this.updateCartSidebar();
        
        // Update checkout page if it exists
        this.updateCheckoutDisplay();
    }

    updateCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (!cartSidebar) return;

        const cartItemsContainer = cartSidebar.querySelector('#cart-items');
        const cartTotalElement = cartSidebar.querySelector('#cart-total');

        if (!cartItemsContainer) return;

        if (this.cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: rgba(255,255,255,0.2); margin-bottom: 15px;"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartTotalElement) cartTotalElement.textContent = '0.00';
            return;
        }

        let itemsHtml = '';
        let total = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * (item.quantity || 1);
            total += itemTotal;
            
            itemsHtml += `
                <div class="cart-sidebar-item" data-id="${item.id}">
                    <img src="${item.image || 'https://via.placeholder.com/50'}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h4 class="item-name">${item.name}</h4>
                        <p class="item-price">PKR ${item.price.toLocaleString()}</p>
                        <div class="item-quantity-controls">
                            <button onclick="cartManager.updateQuantity('${item.id}', ${(item.quantity || 1) - 1})" class="quantity-btn">-</button>
                            <span class="quantity">${item.quantity || 1}</span>
                            <button onclick="cartManager.updateQuantity('${item.id}', ${(item.quantity || 1) + 1})" class="quantity-btn">+</button>
                        </div>
                    </div>
                    <div class="item-total">PKR ${itemTotal.toLocaleString()}</div>
                    <button onclick="cartManager.removeItem('${item.id}')" class="remove-item">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = itemsHtml;
        if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2);
    }

    updateCheckoutDisplay() {
        // Update checkout page if it exists
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

        let itemsHtml = '';
        let subtotal = 0;

        this.cart.forEach(item => {
            const itemTotal = item.price * (item.quantity || 1);
            subtotal += itemTotal;
            
            itemsHtml += `
                <div class="cart-item" data-product-id="${item.id}">
                    <img src="${item.image || 'https://via.placeholder.com/60'}" 
                         alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-quantity">Qty: ${item.quantity}</div>
                        <div class="item-price">PKR ${itemTotal.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });

        checkoutItems.innerHTML = itemsHtml;

        // Update totals
        const subtotalElement = document.getElementById('subtotal');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');
        
        if (subtotalElement) {
            const shipping = 250;
            const tax = subtotal * 0.17;
            const total = subtotal + shipping + tax;
            
            subtotalElement.textContent = `PKR ${subtotal.toFixed(2)}`;
            if (taxElement) taxElement.textContent = `PKR ${tax.toFixed(2)}`;
            if (totalElement) totalElement.textContent = `PKR ${total.toFixed(2)}`;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                         'linear-gradient(135deg, #3b82f6, #2563eb)'};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// Initialize global cart manager
window.cartManager = new CartManager();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .cart-sidebar-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        animation: fadeIn 0.3s ease;
    }
    
    .cart-sidebar-item .item-image {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
    }
    
    .cart-sidebar-item .item-details {
        flex: 1;
    }
    
    .cart-sidebar-item .item-name {
        font-size: 0.9rem;
        margin-bottom: 5px;
    }
    
    .cart-sidebar-item .item-price {
        font-size: 0.8rem;
        color: #888;
    }
    
    .cart-sidebar-item .item-quantity-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 5px;
    }
    
    .quantity-btn {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .quantity-btn:hover {
        background: var(--neon-blue);
        border-color: var(--neon-blue);
    }
    
    .cart-sidebar-item .quantity {
        min-width: 20px;
        text-align: center;
    }
    
    .cart-sidebar-item .item-total {
        font-weight: bold;
        color: var(--neon-blue);
        font-size: 0.9rem;
    }
    
    .cart-sidebar-item .remove-item {
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        padding: 5px;
        transition: color 0.3s ease;
    }
    
    .cart-sidebar-item .remove-item:hover {
        color: #ef4444;
    }
    
    .empty-cart-message {
        text-align: center;
        padding: 40px 20px;
        color: rgba(255,255,255,0.6);
    }
    
    #cart-count {
        transition: transform 0.2s ease;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);