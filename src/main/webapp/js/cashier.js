/**
 * ==============================================================================
 * PAHANA EDU - CASHIER DASHBOARD JAVASCRIPT
 * ==============================================================================
 * Cashier-specific functionality for billing and inventory management
 * ==============================================================================
 */

// Cashier Global Variables
let currentBill = [];
let billTotal = 0;
let currentTransactionId = null;

// ==============================================================================
// DOCUMENT READY STATE
// ==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pahana Edu Cashier Dashboard - JavaScript Loaded Successfully');
    
    // Initialize cashier functionality
    initCashierDashboard();
    initBillingSystem();
    initProductSearch();
    initBillActions();
    initCashierStats();
});

// ==============================================================================
// CASHIER DASHBOARD INITIALIZATION
// ==============================================================================

function initCashierDashboard() {
    // Update current time
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Initialize shift information
    initShiftInfo();
    
    // Start periodic updates
    startPeriodicUpdates();
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    
    // Update time display if element exists
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = `${dateString} ${timeString}`;
    }
}

function initShiftInfo() {
    const shiftStart = new Date();
    sessionStorage.setItem('shiftStartTime', shiftStart.toISOString());
    
    console.log('Shift started at:', shiftStart.toLocaleString());
}

// ==============================================================================
// BILLING SYSTEM
// ==============================================================================

function initBillingSystem() {
    // Clear any existing bill
    clearBill();
    
    // Generate new transaction ID
    currentTransactionId = generateTransactionId();
    console.log('New transaction ID:', currentTransactionId);
}

function initProductSearch() {
    const searchInput = document.getElementById('productSearch');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', function() {
            performProductSearch(searchInput.value);
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performProductSearch(this.value);
            }
        });
        
        // Real-time search suggestions (debounced)
        searchInput.addEventListener('input', debounce(function() {
            if (this.value.length > 2) {
                showSearchSuggestions(this.value);
            }
        }, 300));
    }
}

function performProductSearch(query) {
    if (!query.trim()) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    console.log('Searching for:', query);
    
    // Simulate product search (replace with actual API call)
    const mockProducts = [
        { id: 1, title: 'Advanced Programming Concepts', author: 'John Smith', price: 2500, stock: 15 },
        { id: 2, title: 'Higher Mathematics', author: 'Sarah Johnson', price: 1800, stock: 8 },
        { id: 3, title: 'Modern Physics', author: 'Dr. Michael Brown', price: 3200, stock: 12 },
        { id: 4, title: 'English Literature', author: 'Emily Davis', price: 1500, stock: 20 }
    ];
    
    const results = mockProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.author.toLowerCase().includes(query.toLowerCase())
    );
    
    displaySearchResults(results);
}

function displaySearchResults(products) {
    // For now, just show a notification with results count
    if (products.length > 0) {
        showNotification(`Found ${products.length} product(s)`, 'success');
        
        // In a real implementation, you would display the products
        // and allow the cashier to add them to the bill
        console.log('Search results:', products);
    } else {
        showNotification('No products found', 'info');
    }
}

function showSearchSuggestions(query) {
    // Implementation for search suggestions dropdown
    console.log('Showing suggestions for:', query);
}

// ==============================================================================
// BILL MANAGEMENT
// ==============================================================================

function initBillActions() {
    const clearBtn = document.querySelector('.btn-clear');
    const printBtn = document.querySelector('.btn-print');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (currentBill.length > 0) {
                if (confirm('Are you sure you want to clear the current bill?')) {
                    clearBill();
                }
            } else {
                showNotification('Bill is already empty', 'info');
            }
        });
    }
    
    if (printBtn) {
        printBtn.addEventListener('click', function() {
            if (currentBill.length > 0) {
                printBill();
            } else {
                showNotification('Cannot print empty bill', 'warning');
            }
        });
    }
}

function addToBill(product) {
    const existingItem = currentBill.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentBill.push({
            ...product,
            quantity: 1
        });
    }
    
    updateBillDisplay();
    showNotification(`${product.title} added to bill`, 'success');
}

function removeFromBill(productId) {
    currentBill = currentBill.filter(item => item.id !== productId);
    updateBillDisplay();
    showNotification('Item removed from bill', 'info');
}

function updateBillDisplay() {
    const billList = document.getElementById('billList');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!billList) return;
    
    // Clear existing content
    billList.innerHTML = '';
    
    if (currentBill.length === 0) {
        billList.innerHTML = `
            <div class="empty-bill">
                <i class="fas fa-receipt"></i>
                <p>No items in current bill</p>
            </div>
        `;
        updateBillTotals(0, 0, 0);
        return;
    }
    
    // Calculate totals
    let subtotal = 0;
    
    currentBill.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const billItem = document.createElement('div');
        billItem.className = 'bill-item';
        billItem.innerHTML = `
            <div class="item-info">
                <h4>${item.title}</h4>
                <p>₨ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="item-total">
                <span>₨ ${itemTotal.toFixed(2)}</span>
                <button onclick="removeFromBill(${item.id})" class="remove-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        billList.appendChild(billItem);
    });
    
    // Calculate tax (assuming 10% VAT)
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    updateBillTotals(subtotal, tax, total);
}

function updateBillTotals(subtotal, tax, total) {
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `₨ ${subtotal.toFixed(2)}`;
    if (taxElement) taxElement.textContent = `₨ ${tax.toFixed(2)}`;
    if (totalElement) totalElement.textContent = `₨ ${total.toFixed(2)}`;
    
    billTotal = total;
}

function clearBill() {
    currentBill = [];
    updateBillDisplay();
    currentTransactionId = generateTransactionId();
    showNotification('Bill cleared', 'info');
}

function printBill() {
    if (currentBill.length === 0) {
        showNotification('Cannot print empty bill', 'warning');
        return;
    }
    
    // In a real implementation, this would send the bill to a printer
    // For now, we'll just show a success message
    showNotification('Bill sent to printer', 'success');
    
    // Update daily stats
    updateDailyStats(billTotal);
    
    // Clear bill after printing
    setTimeout(() => {
        clearBill();
    }, 1000);
}

// ==============================================================================
// CASHIER STATISTICS
// ==============================================================================

function initCashierStats() {
    // Initialize stats from sessionStorage or set to 0
    const todaysSales = sessionStorage.getItem('todaysSales') || '0';
    const todaysTransactions = sessionStorage.getItem('todaysTransactions') || '0';
    const todaysCustomers = sessionStorage.getItem('todaysCustomers') || '0';
    
    updateStatDisplay('todaysSales', `₨ ${parseFloat(todaysSales).toFixed(2)}`);
    updateStatDisplay('todaysTransactions', todaysTransactions);
    updateStatDisplay('todaysCustomers', todaysCustomers);
}

function updateDailyStats(amount) {
    // Update sales
    const currentSales = parseFloat(sessionStorage.getItem('todaysSales') || '0');
    const newSales = currentSales + amount;
    sessionStorage.setItem('todaysSales', newSales.toString());
    
    // Update transactions
    const currentTransactions = parseInt(sessionStorage.getItem('todaysTransactions') || '0');
    const newTransactions = currentTransactions + 1;
    sessionStorage.setItem('todaysTransactions', newTransactions.toString());
    
    // Update customers (for now, assume 1 customer per transaction)
    const currentCustomers = parseInt(sessionStorage.getItem('todaysCustomers') || '0');
    const newCustomers = currentCustomers + 1;
    sessionStorage.setItem('todaysCustomers', newCustomers.toString());
    
    // Update display
    updateStatDisplay('todaysSales', `₨ ${newSales.toFixed(2)}`);
    updateStatDisplay('todaysTransactions', newTransactions);
    updateStatDisplay('todaysCustomers', newCustomers);
}

function updateStatDisplay(statType, value) {
    // Find the stat card and update its value
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((element, index) => {
        if (index === 0 && statType === 'todaysSales') {
            element.textContent = value;
        } else if (index === 1 && statType === 'todaysTransactions') {
            element.textContent = value;
        } else if (index === 2 && statType === 'todaysCustomers') {
            element.textContent = value;
        }
    });
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TXN${timestamp}${random}`;
}

function startPeriodicUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        // Could refresh data from server here
        console.log('Periodic update check');
    }, 30000);
}

// Cashier-specific notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification cashier-notification notification-${type}`;
    
    const colors = {
        success: 'var(--cashier-success)',
        error: 'var(--cashier-danger)',
        info: 'var(--cashier-accent)',
        warning: 'var(--cashier-warning)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease;
        background: ${colors[type] || colors.info};
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Debounce function for search
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

// ==============================================================================
// KEYBOARD SHORTCUTS
// ==============================================================================

document.addEventListener('keydown', function(e) {
    // F1 - New Bill
    if (e.key === 'F1') {
        e.preventDefault();
        clearBill();
        document.getElementById('productSearch').focus();
    }
    
    // F2 - Print Bill
    if (e.key === 'F2') {
        e.preventDefault();
        printBill();
    }
    
    // F3 - Focus Search
    if (e.key === 'F3') {
        e.preventDefault();
        document.getElementById('productSearch').focus();
    }
    
    // Escape - Clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.blur();
        }
    }
});

// ==============================================================================
// CONSOLE LOGGING
// ==============================================================================

console.log('Cashier Dashboard Features Initialized:');
console.log('- Billing system');
console.log('- Product search');
console.log('- Bill management');
console.log('- Daily statistics');
console.log('- Keyboard shortcuts (F1, F2, F3, Escape)');
console.log('- Session management');