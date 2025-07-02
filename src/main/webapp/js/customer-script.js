/**
 * Pahana Edu Dashboard JavaScript
 * Minimal JavaScript for enhanced user experience
 */

(function() {
    'use strict';

    // ===== VARIABLES =====
    const navbar = document.querySelector('.custom-navbar');
    const animatedElements = document.querySelectorAll('[class*="animate-"]');
    
    // ===== NAVBAR SCROLL EFFECT =====
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== SMOOTH SCROLLING FOR ANCHOR LINKS =====
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
    function initAnimationObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Pause animations initially and observe elements
        animatedElements.forEach(element => {
            element.style.animationPlayState = 'paused';
            observer.observe(element);
        });
    }

    // ===== BOOK CARD INTERACTIONS =====
    function initBookCardInteractions() {
        const bookCards = document.querySelectorAll('.book-card');
        
        bookCards.forEach(card => {
            const addToCartBtn = card.querySelector('.btn-primary');
            const wishlistBtn = card.querySelector('.btn-outline-primary');
            
            // Add to Cart functionality
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Add loading state
                    this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
                    this.disabled = true;
                    
                    // Simulate API call
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-check me-2"></i>Added!';
                        this.classList.remove('btn-primary');
                        this.classList.add('btn-success');
                        
                        // Update cart count (if you have a cart counter)
                        updateCartCount();
                        
                        // Revert after 2 seconds
                        setTimeout(() => {
                            this.innerHTML = 'Add to Cart';
                            this.classList.remove('btn-success');
                            this.classList.add('btn-primary');
                            this.disabled = false;
                        }, 2000);
                    }, 1000);
                });
            }
            
            // Wishlist functionality
            if (wishlistBtn) {
                wishlistBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const icon = this.querySelector('i');
                    if (icon.classList.contains('fas')) {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        this.classList.remove('btn-outline-primary');
                        this.classList.add('btn-outline-secondary');
                    } else {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        this.classList.remove('btn-outline-secondary');
                        this.classList.add('btn-outline-primary');
                    }
                    
                    // Add animation
                    icon.style.animation = 'pulse 0.3s ease-in-out';
                    setTimeout(() => {
                        icon.style.animation = '';
                    }, 300);
                });
            }
        });
    }

    // ===== UPDATE CART COUNT =====
    function updateCartCount() {
        const cartCounters = document.querySelectorAll('.stat-number');
        cartCounters.forEach(counter => {
            if (counter.parentElement.querySelector('.fa-shopping-cart')) {
                let currentCount = parseInt(counter.textContent) || 0;
                counter.textContent = currentCount + 1;
                
                // Add animation
                counter.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => {
                    counter.style.animation = '';
                }, 500);
            }
        });
    }

    // ===== NEWSLETTER FORM =====
    function initNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            const input = newsletterForm.querySelector('input[type="email"]');
            const button = newsletterForm.querySelector('button');
            
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const email = input.value.trim();
                if (!email || !isValidEmail(email)) {
                    showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Add loading state
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Subscribing...';
                button.disabled = true;
                
                // Simulate API call
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-check me-2"></i>Subscribed!';
                    input.value = '';
                    showNotification('Successfully subscribed to newsletter!', 'success');
                    
                    // Revert button
                    setTimeout(() => {
                        button.innerHTML = 'Subscribe';
                        button.disabled = false;
                    }, 3000);
                }, 1500);
            });
        }
    }

    // ===== EMAIL VALIDATION =====
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== NOTIFICATION SYSTEM =====
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `custom-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#38B000' : type === 'error' ? '#D00000' : '#0077B6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 9999;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 350px;
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // ===== QUICK VIEW FUNCTIONALITY =====
    function initQuickView() {
        const quickViewBtns = document.querySelectorAll('.btn-quick-view');
        
        quickViewBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const bookCard = this.closest('.book-card');
                const bookTitle = bookCard.querySelector('h5').textContent;
                const bookAuthor = bookCard.querySelector('.book-author').textContent;
                const bookImage = bookCard.querySelector('img').src;
                const bookPrice = bookCard.querySelector('.offer-price').textContent;
                
                showQuickViewModal({
                    title: bookTitle,
                    author: bookAuthor,
                    image: bookImage,
                    price: bookPrice
                });
            });
        });
    }

    // ===== QUICK VIEW MODAL =====
    function showQuickViewModal(bookData) {
        // Remove existing modal
        const existingModal = document.querySelector('.quick-view-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="modal-body">
                        <div class="modal-image">
                            <img src="${bookData.image}" alt="${bookData.title}">
                        </div>
                        <div class="modal-info">
                            <h3>${bookData.title}</h3>
                            <p class="modal-author">${bookData.author}</p>
                            <div class="modal-price">${bookData.price}</div>
                            <div class="modal-description">
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div class="modal-actions">
                                <button class="btn btn-primary">Add to Cart</button>
                                <button class="btn btn-outline-primary"><i class="fas fa-heart me-2"></i>Wishlist</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        // Add modal styles to head
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .modal-overlay {
                background: rgba(0, 0, 0, 0.8);
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            .modal-content {
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                font-size: 1.5rem;
                color: #6C757D;
                cursor: pointer;
                z-index: 1;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .modal-close:hover {
                background: #f8f9fa;
                color: #212529;
            }
            .modal-body {
                display: flex;
                gap: 2rem;
                padding: 2rem;
            }
            .modal-image {
                flex: 1;
                max-width: 300px;
            }
            .modal-image img {
                width: 100%;
                height: auto;
                border-radius: 12px;
            }
            .modal-info {
                flex: 1;
            }
            .modal-info h3 {
                color: #212529;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
                font-weight: 700;
            }
            .modal-author {
                color: #6C757D;
                margin-bottom: 1rem;
                font-size: 1rem;
            }
            .modal-price {
                font-size: 1.25rem;
                font-weight: 700;
                color: #0077B6;
                margin-bottom: 1.5rem;
            }
            .modal-description {
                margin-bottom: 2rem;
            }
            .modal-description p {
                color: #6C757D;
                line-height: 1.6;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            @media (max-width: 768px) {
                .modal-body {
                    flex-direction: column;
                    padding: 1.5rem;
                }
                .modal-image {
                    max-width: 100%;
                }
            }
        `;
        document.head.appendChild(modalStyles);
        
        // Add to document
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'scale(1)';
        }, 100);
        
        // Close functionality
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('.modal-content').style.transform = 'scale(0.9)';
            setTimeout(() => {
                modal.remove();
                modalStyles.remove();
            }, 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                closeModal();
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ===== LOADING STATES =====
    function initLoadingStates() {
        // Add loading class to body initially
        document.body.classList.add('loading');
        
        // Remove loading when page is fully loaded
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.remove('loading');
            }, 500);
        });
    }

    // ===== PERFORMANCE OPTIMIZATION =====
    function initPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ===== ACCESSIBILITY ENHANCEMENTS =====
    function initAccessibility() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#dashboard';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #0077B6;
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 100;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add aria-labels to buttons without text
        document.querySelectorAll('.btn-wishlist, .user-dropdown-btn').forEach(btn => {
            if (!btn.getAttribute('aria-label')) {
                if (btn.classList.contains('btn-wishlist')) {
                    btn.setAttribute('aria-label', 'Add to wishlist');
                } else if (btn.classList.contains('user-dropdown-btn')) {
                    btn.setAttribute('aria-label', 'User menu');
                }
            }
        });
    }

    // ===== ERROR HANDLING =====
    function initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript error:', e.error);
            // You could send this to a logging service
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            // You could send this to a logging service
        });
    }

    // ===== INITIALIZATION =====
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
        
        try {
            // Initialize all features
            initLoadingStates();
            initSmoothScrolling();
            initAnimationObserver();
            initBookCardInteractions();
            initNewsletterForm();
            initQuickView();
            initPerformanceOptimizations();
            initAccessibility();
            initErrorHandling();
            
            // Add scroll event listener with throttling
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }
                scrollTimeout = setTimeout(handleNavbarScroll, 10);
            });
            
            // Initial navbar state
            handleNavbarScroll();
            
            console.log('✅ Pahana Edu Dashboard initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
        }
    }

    // ===== EXPORT FOR TESTING (if needed) =====
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            init,
            showNotification,
            updateCartCount
        };
    }

    // Start initialization
    init();

})();

/**
 * Additional utility functions
 */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
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
    };
}

// Format currency (Sri Lankan Rupees)
function formatCurrency(amount) {
    return new Intl.NumberFormat('si-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 2
    }).format(amount);
}

// Local storage helpers (for cart, wishlist, etc.)
const storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }
};

// Console welcome message
console.log(`
%c🎓 Welcome to Pahana Edu Dashboard!
%cBuilt with ❤️ for educational excellence
%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`, 
'color: #0077B6; font-size: 16px; font-weight: bold;',
'color: #6C757D; font-size: 12px;',
'color: #90E0EF; font-size: 10px;'
);