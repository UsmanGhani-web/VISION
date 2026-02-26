// Shopping Cart Database and Management
class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.updateCartDisplay();
    }

    // Load cart from localStorage (database)
    loadCart() {
        const savedCart = localStorage.getItem('gamingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // Save cart to localStorage (database)
    saveCart() {
        localStorage.setItem('gamingCart', JSON.stringify(this.cart));
    }

    // Add item to cart (supports quantity)
    addToCart(product, qty = 1) {
        const quantity = Math.max(1, parseInt(qty || 1));
        const existingItem = this.cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity
            });
        }
        this.saveCart();
        this.updateCartDisplay();
        // Use global notification function
        showNotification(`${quantity} x ${product.name} added to cart!`);
    }

    // Remove item from cart
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }

    // Get cart count
    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    // Update cart display
    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (cartCount) cartCount.textContent = this.getCartCount();
        if (cartTotal) cartTotal.textContent = `PKR ${(this.getCartTotal() * 280).toFixed(2)}`;
        
        if (cartItems) {
            cartItems.innerHTML = '';
            
            if (this.cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            } else {
                this.cart.forEach(item => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-image">
                            <img src="${item.image || 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=60&h=60&fit=crop&crop=center'}" alt="${item.name}">
                        </div>
                        <div class="cart-item-info">
                            <h4>${item.name}</h4>
                            <p>$${item.price}</p>
                        </div>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            <button class="remove-btn" onclick="cartManager.removeFromCart('${item.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    cartItems.appendChild(cartItem);
                });
            }
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.classList.remove('active');
        }
    });
});

// Cart Sidebar Toggle
const cartIcon = document.getElementById('cart-icon');
const cartSidebar = document.getElementById('cart-sidebar');
const closeCart = document.getElementById('close-cart');

if (cartIcon && cartSidebar) {
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
    });
}

if (closeCart && cartSidebar) {
    closeCart.addEventListener('click', () => {
        cartSidebar.classList.remove('active');
    });
}

// Close cart when clicking outside
document.addEventListener('click', (e) => {
    if (!cartSidebar) return;
    // Use composedPath to reliably determine original click context
    const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
    const clickedInsideCart = cartSidebar.contains(e.target) || path.includes(cartSidebar);
    const clickedCartIcon = cartIcon && (cartIcon.contains(e.target) || path.includes(cartIcon));
    if (!clickedInsideCart && !clickedCartIcon) {
        cartSidebar.classList.remove('active');
    }
});

// Global Buy/Add buttons -> open modal first
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-now-btn, .add-to-cart');
    if (!btn) return;
    e.preventDefault();

    const productId = btn.getAttribute('data-product-id');
    const productName = btn.getAttribute('data-product-name');
    const productPrice = btn.getAttribute('data-product-price');
    const productCard = btn.closest('.product-card');
    const productImage = productCard ? (productCard.querySelector('.product-image img')?.src || '') : '';

    const product = { id: productId, name: productName, price: productPrice, image: productImage };
    openAddToCartModal(product, btn.classList.contains('buy-now-btn'));
});

// Checkout Button
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cartManager.cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        
        // Save cart data for checkout page
        localStorage.setItem('shopping_cart', JSON.stringify(cartManager.cart));
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    });
}

// Continue Shopping Button
const continueShoppingBtn = document.getElementById('continue-shopping-btn');
if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener('click', () => {
        // Close cart sidebar
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
        }
    });
}



// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
});

// Products Page Functionality
const categoryBtns = document.querySelectorAll('.category-btn');
const productCards = document.querySelectorAll('.product-card');

if (categoryBtns.length > 0) {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            
            // Show/hide products based on category
            productCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Custom Build Page Functionality
const cpuSelect = document.getElementById('cpu-select');
const gpuSelect = document.getElementById('gpu-select');
const ramSelect = document.getElementById('ram-select');
const storageSelect = document.getElementById('storage-select');
const buildPcBtn = document.getElementById('build-pc-btn');
const totalPriceElement = document.getElementById('total-price');
const performanceEstimate = document.getElementById('performance-estimate');
const selectedComponents = document.getElementById('selected-components');

if (cpuSelect && gpuSelect && ramSelect && storageSelect) {
    // Add event listeners to all component selects
    [cpuSelect, gpuSelect, ramSelect, storageSelect].forEach(select => {
        select.addEventListener('change', updateBuildInfo);
    });
}

function updateBuildInfo() {
    let totalPrice = 0;
    const selectedParts = [];
    
    // Calculate total price and collect selected parts
    if (cpuSelect && cpuSelect.value) {
        const price = parseFloat(cpuSelect.options[cpuSelect.selectedIndex].getAttribute('data-price'));
        totalPrice += price;
        selectedParts.push(cpuSelect.options[cpuSelect.selectedIndex].textContent);
    }
    
    if (gpuSelect && gpuSelect.value) {
        const price = parseFloat(gpuSelect.options[gpuSelect.selectedIndex].getAttribute('data-price'));
        totalPrice += price;
        selectedParts.push(gpuSelect.options[gpuSelect.selectedIndex].textContent);
    }
    
    if (ramSelect && ramSelect.value) {
        const price = parseFloat(ramSelect.options[ramSelect.selectedIndex].getAttribute('data-price'));
        totalPrice += price;
        selectedParts.push(ramSelect.options[ramSelect.selectedIndex].textContent);
    }
    
    if (storageSelect && storageSelect.value) {
        const price = parseFloat(storageSelect.options[storageSelect.selectedIndex].getAttribute('data-price'));
        totalPrice += price;
        selectedParts.push(storageSelect.options[storageSelect.selectedIndex].textContent);
    }
    
    // Update total price
    if (totalPriceElement) {
        totalPriceElement.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    }
    
    // Update performance estimate
    if (performanceEstimate) {
        let performance = 'Select components';
        if (totalPrice >= 3000) performance = 'Ultra 4K Gaming';
        else if (totalPrice >= 2000) performance = 'High 1440p Gaming';
        else if (totalPrice >= 1000) performance = 'Medium 1080p Gaming';
        else if (totalPrice > 0) performance = 'Basic Gaming';
        
        performanceEstimate.textContent = `Estimated Performance: ${performance}`;
    }
    
    // Update selected components display
    if (selectedComponents) {
        selectedComponents.innerHTML = '';
        selectedParts.forEach(part => {
            const componentDiv = document.createElement('div');
            componentDiv.className = 'selected-component';
            componentDiv.innerHTML = `<strong>${part.split(' - ')[0]}</strong>`;
            selectedComponents.appendChild(componentDiv);
        });
    }
    
    // Enable/disable build button
    if (buildPcBtn) {
        buildPcBtn.disabled = selectedParts.length < 4;
    }
}

// Build PC Button Functionality
if (buildPcBtn) {
    buildPcBtn.addEventListener('click', () => {
        const totalPrice = totalPriceElement ? parseFloat(totalPriceElement.textContent.split('$')[1]) : 0;
        const performance = performanceEstimate ? performanceEstimate.textContent.split(': ')[1] : '';
        
        if (totalPrice > 0) {
            alert(`Your custom PC build is ready!\n\nTotal Price: $${totalPrice.toFixed(2)}\nPerformance: ${performance}\n\nComponents selected:\n${selectedComponents ? selectedComponents.innerText : ''}`);
        } else {
            alert('Please select all components for your custom build!');
        }
    });
}

// Components Page Functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Show corresponding content
            const targetTab = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`${targetTab}-content`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// Contact Form Functionality
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        if (name && email && subject && message) {
            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('Message sent successfully! We\'ll get back to you soon.');
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        } else {
            showNotification('Please fill in all fields!', 'error');
        }
    });
}

// Newsletter Form Functionality
const newsletterForms = document.querySelectorAll('.newsletter-form');

newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput.value;
        
        if (email) {
            showNotification('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        } else {
            showNotification('Please enter a valid email address!', 'error');
        }
    });
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--neon-blue)' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground && hero) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.product-card, .component-item, .contact-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Floating Cards Animation Enhancement
const floatingCards = document.querySelectorAll('.floating-card');

floatingCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-30px) scale(1.1)';
        card.style.boxShadow = '0 20px 40px rgba(0, 212, 255, 0.4)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
    });
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(() => {
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(15, 23, 42, 0.98)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
}, 16)); // 60fps

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial price for custom build page
    if (totalPriceElement) {
        updateBuildInfo();
    }
    
    // Add loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}); 

// Fix navbar on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(2, 6, 23, 0.98)';
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(2, 6, 23, 0.98)';
        navbar.style.boxShadow = 'none';
    }
});

// Ensure navbar is properly positioned on page load
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    navbar.style.position = 'fixed';
    navbar.style.top = '0';
    navbar.style.left = '0';
    navbar.style.right = '0';
    navbar.style.zIndex = '1000';
});


// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
    
    // Create global Add-to-Cart Modal (used across all pages)
    const atcOverlay = document.createElement('div');
    atcOverlay.className = 'atc-overlay';
    atcOverlay.innerHTML = `
      <div class="atc-modal">
        <button class="atc-close" aria-label="Close">&times;</button>
        <div class="atc-body">
          <img class="atc-image" alt="Product">
          <div class="atc-info">
            <h3 class="atc-name"></h3>
            <div class="atc-price"></div>
            <div class="atc-qty">
              <button class="qty-btn minus">-</button>
              <input type="number" class="qty-input" value="1" min="1">
              <button class="qty-btn plus">+</button>
            </div>
            <div class="atc-actions">
              <button class="btn btn-primary atc-confirm"><i class="fas fa-cart-plus"></i> Add to Cart</button>
              <button class="btn btn-secondary atc-cancel">Continue Shopping</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(atcOverlay);

    // Modal element refs
    const modal = atcOverlay.querySelector('.atc-modal');
    const closeBtn = atcOverlay.querySelector('.atc-close');
    const cancelBtn = atcOverlay.querySelector('.atc-cancel');
    const confirmBtn = atcOverlay.querySelector('.atc-confirm');
    const nameEl = atcOverlay.querySelector('.atc-name');
    const priceEl = atcOverlay.querySelector('.atc-price');
    const imgEl = atcOverlay.querySelector('.atc-image');
    const qtyInput = atcOverlay.querySelector('.qty-input');
    const minus = atcOverlay.querySelector('.qty-btn.minus');
    const plus = atcOverlay.querySelector('.qty-btn.plus');

    // Keep current product in state
    let currentProduct = null;
    let openShouldOpenCart = false;

    window.openAddToCartModal = function(product, openCartAfter = false) {
        currentProduct = product;
        openShouldOpenCart = openCartAfter;
        nameEl.textContent = product.name || 'Item';
        priceEl.textContent = product.price ? `$${parseFloat(product.price).toFixed(2)}` : '';
        if (product.image) imgEl.src = product.image;
        qtyInput.value = 1;
        atcOverlay.classList.add('active');
        setTimeout(() => modal.classList.add('in'), 10);
    }

    function closeAtc() {
        modal.classList.remove('in');
        setTimeout(() => atcOverlay.classList.remove('active'), 150);
    }

    // Direct listeners
    [closeBtn, cancelBtn].forEach(el => el && el.addEventListener('click', (e)=>{ e.stopPropagation(); closeAtc(); }));
    // Delegated listeners on overlay (bulletproof)
    atcOverlay.addEventListener('click', (e) => {
        if (e.target === atcOverlay) { closeAtc(); return; }
        const closeHit = e.target.closest('.atc-close');
        if (closeHit) { closeAtc(); }
    });
    // Capture-phase global handler to defeat interfering listeners
    document.addEventListener('click', (e) => {
        if (!atcOverlay.classList.contains('active')) return;
        const closeHit = e.target.closest('.atc-close');
        if (closeHit) {
            e.preventDefault();
            e.stopPropagation();
            closeAtc();
        }
    }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && atcOverlay.classList.contains('active')) closeAtc(); });
    // Global delegated close as final fallback
    document.addEventListener('click', (e) => {
        const closeAny = e.target.closest('.atc-close');
        if (closeAny && atcOverlay.classList.contains('active')) {
            e.stopPropagation();
            closeAtc();
        }
    });

    minus.addEventListener('click', (e) => {
        e.stopPropagation();
        const v = Math.max(1, parseInt(qtyInput.value || '1') - 1);
        qtyInput.value = v;
    });
    plus.addEventListener('click', (e) => {
        e.stopPropagation();
        const v = Math.max(1, parseInt(qtyInput.value || '1') + 1);
        qtyInput.value = v;
    });

    confirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentProduct) return;
        const qty = Math.max(1, parseInt(qtyInput.value || '1'));
        cartManager.addToCart(currentProduct, qty);
        closeAtc();
        // Show confirmation dialog with OK
        showAddConfirm(`${qty} x ${currentProduct.name} added to cart.` , () => {
            if (openShouldOpenCart && cartSidebar) {
                cartSidebar.classList.add('active');
            }
        });
    });

    // Lightweight confirmation modal with OK
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'atc-overlay';
    confirmOverlay.innerHTML = `
      <div class="atc-modal">
        <button class="atc-close" aria-label="Close">&times;</button>
        <div class="atc-body" style="grid-template-columns: 1fr">
          <div class="atc-info" style="text-align:center">
            <h3 class="atc-name" id="confirm-message">Added to cart</h3>
            <div class="atc-actions" style="justify-content:center;margin-top:8px">
              <button class="btn btn-primary atc-ok">OK</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(confirmOverlay);
    const confirmModal = confirmOverlay.querySelector('.atc-modal');
    const confirmClose = confirmOverlay.querySelector('.atc-close');
    const confirmOk = confirmOverlay.querySelector('.atc-ok');

    function openConfirm(msg) {
        const msgEl = confirmOverlay.querySelector('#confirm-message');
        if (msgEl) msgEl.textContent = msg || 'Added to cart';
        confirmOverlay.classList.add('active');
        setTimeout(() => confirmModal.classList.add('in'), 10);
    }
    function closeConfirm() {
        confirmModal.classList.remove('in');
        setTimeout(() => confirmOverlay.classList.remove('active'), 150);
    }
    [confirmClose, confirmOk].forEach(el => el && el.addEventListener('click', (e)=>{ e.stopPropagation(); closeConfirm(); }));
    confirmOverlay.addEventListener('click', (e) => {
        if (e.target === confirmOverlay) closeConfirm();
        const closeHit = e.target.closest('.atc-close');
        if (closeHit) closeConfirm();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && confirmOverlay.classList.contains('active')) closeConfirm(); });

    function showAddConfirm(message, onOk) {
        openConfirm(message);
        const handler = () => {
            confirmOk.removeEventListener('click', handler);
            // Close then callback
            closeConfirm();
            if (typeof onOk === 'function') onOk();
        };
        confirmOk.addEventListener('click', handler, { once: true });
    }
});