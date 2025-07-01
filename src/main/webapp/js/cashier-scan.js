// Simple QR Scanner JavaScript
// File: simple-scanner.js

// Global variables
let html5QrCode;
let isScanning = false;
let billItems = [];
let currentProduct = null;

// DOM elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const scannerOverlay = document.getElementById('scannerOverlay');
const manualInput = document.getElementById('manualInput');
const searchBtn = document.getElementById('searchBtn');
const productInfo = document.getElementById('productInfo');
const newBillBtn = document.getElementById('newBillBtn');
const billItemsContainer = document.getElementById('billItems');
const printBtn = document.getElementById('printBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing QR Scanner...');
    
    // Initialize scanner
    html5QrCode = new Html5Qrcode("qrReader");
    
    // Add event listeners
    startBtn.addEventListener('click', startScanner);
    stopBtn.addEventListener('click', stopScanner);
    searchBtn.addEventListener('click', searchProduct);
    newBillBtn.addEventListener('click', newBill);
    printBtn.addEventListener('click', printBill);
    checkoutBtn.addEventListener('click', checkout);
    
    // Manual input Enter key
    manualInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProduct();
        }
    });
    
    // Focus manual input
    manualInput.focus();
    
    showNotification('QR Scanner ready! 📱', 'success');
    console.log('✅ Scanner initialized');
});

// Start QR scanner
function startScanner() {
    if (isScanning) return;
    
    console.log('📸 Starting scanner...');
    showNotification('Starting camera...', 'info');
    
    const config = { 
        fps: 10,
        qrbox: { width: 200, height: 200 }
    };
    
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            html5QrCode.start(
                cameras[0].id,
                config,
                onScanSuccess,
                onScanError
            ).then(() => {
                isScanning = true;
                scannerOverlay.style.display = 'none';
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                showNotification('Scanner started! 📷', 'success');
            }).catch(err => {
                console.error('❌ Start error:', err);
                showNotification('Failed to start scanner', 'error');
            });
        } else {
            showNotification('No camera found', 'error');
        }
    }).catch(err => {
        console.error('❌ Camera error:', err);
        showNotification('Camera access denied', 'error');
    });
}

// Stop scanner
function stopScanner() {
    if (!isScanning) return;
    
    console.log('⏹️ Stopping scanner...');
    
    html5QrCode.stop().then(() => {
        isScanning = false;
        scannerOverlay.style.display = 'block';
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        showNotification('Scanner stopped', 'info');
    }).catch(err => {
        console.error('❌ Stop error:', err);
    });
}

// Handle successful QR scan
function onScanSuccess(result) {
    console.log('📱 QR Scanned:', result);
    
    // Stop scanner
    stopScanner();
    
    // Set manual input
    manualInput.value = result;
    
    // Vibrate if supported
    if (navigator.vibrate) {
        navigator.vibrate(100);
    }
    
    // Search product
    searchProduct();
}

// Handle scan errors (silent)
function onScanError(error) {
    // Silent - normal during scanning
}

// Search product by reference
function searchProduct() {
    const reference = manualInput.value.trim();
    if (!reference) {
        showNotification('Please enter reference number', 'warning');
        manualInput.focus();
        return;
    }
    
    console.log('🔍 Searching:', reference);
    showNotification('Searching product...', 'info');
    
    // Show loading in product info
    productInfo.classList.add('visible');
    productInfo.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
            <p>Searching for product...</p>
            <p style="font-size: 14px; color: #666;">Ref: ${reference}</p>
        </div>
    `;
    
    // Make API call
    fetch(`productSearch?reference=${encodeURIComponent(reference)}`)
        .then(response => response.json())
        .then(data => {
            console.log('📦 Response:', data);
            
            if (data.success && data.data) {
                currentProduct = data.data;
                displayProduct(data.data);
                showNotification('Product found! ✅', 'success');
            } else {
                currentProduct = null;
                productInfo.classList.remove('visible');
                showNotification('Product not found ❌', 'error');
                manualInput.value = '';
                manualInput.focus();
            }
        })
        .catch(error => {
            console.error('❌ Search error:', error);
            currentProduct = null;
            productInfo.classList.remove('visible');
            showNotification('Search failed. Check connection.', 'error');
            manualInput.value = '';
            manualInput.focus();
        });
}

// Display product information
function displayProduct(product) {
    console.log('📄 Displaying:', product.title);
    
    const hasOffer = product.offerPrice && product.offerPrice > 0 && product.offerPrice < product.price;
    const effectivePrice = hasOffer ? product.offerPrice : product.price;
    const stockStatus = product.stock <= 0 ? 'Out of Stock' : `${product.stock} units`;
    const stockColor = product.stock <= 0 ? '#e53e3e' : (product.stock <= 5 ? '#d69e2e' : '#38a169');
    
    productInfo.innerHTML = `
        <div class="product-title">${product.title}</div>
        
        <div class="product-price">
            ${hasOffer ? `
                <span style="text-decoration: line-through; font-size: 16px; color: #666;">₨ ${parseFloat(product.price).toFixed(2)}</span>
                <br>₨ ${parseFloat(product.offerPrice).toFixed(2)}
                <span style="background: #e53e3e; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin-left: 10px;">
                    ${Math.round(((product.price - product.offerPrice) / product.price) * 100)}% OFF
                </span>
            ` : `₨ ${parseFloat(product.price).toFixed(2)}`}
        </div>
        
        <div class="product-details">
            <div class="detail-item">
                <span class="detail-label">Reference:</span>
                <span class="detail-value">${product.referenceNo || 'N/A'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Author:</span>
                <span class="detail-value">${product.author}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${product.categoryName || 'N/A'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Stock:</span>
                <span class="detail-value" style="color: ${stockColor};">${stockStatus}</span>
            </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
            <button id="addToBillBtn" class="btn btn-primary" ${product.stock <= 0 ? 'disabled' : ''}>
                🛒 ${product.stock <= 0 ? 'Out of Stock' : 'Add to Bill'}
            </button>
            <button id="continueScanBtn" class="btn btn-primary" style="margin-left: 10px;">
                📷 Continue Scanning
            </button>
        </div>
    `;
    
    // Add event listeners
    const addToBillBtn = document.getElementById('addToBillBtn');
    const continueScanBtn = document.getElementById('continueScanBtn');
    
    if (addToBillBtn && product.stock > 0) {
        addToBillBtn.addEventListener('click', addToBill);
    }
    
    if (continueScanBtn) {
        continueScanBtn.addEventListener('click', () => {
            manualInput.value = '';
            manualInput.focus();
            startScanner();
        });
    }
}

// Add product to bill
function addToBill() {
    if (!currentProduct || currentProduct.stock <= 0) {
        showNotification('Cannot add product to bill', 'error');
        return;
    }
    
    console.log('🛒 Adding to bill:', currentProduct.title);
    
    // Check if product already exists
    const existingItem = billItems.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        if (existingItem.quantity >= currentProduct.stock) {
            showNotification('Maximum stock reached', 'warning');
            return;
        }
        existingItem.quantity++;
    } else {
        const effectivePrice = (currentProduct.offerPrice && currentProduct.offerPrice > 0 && currentProduct.offerPrice < currentProduct.price) 
            ? currentProduct.offerPrice : currentProduct.price;
        
        billItems.push({
            id: currentProduct.id,
            title: currentProduct.title,
            referenceNo: currentProduct.referenceNo,
            price: parseFloat(effectivePrice),
            quantity: 1,
            maxStock: currentProduct.stock
        });
    }
    
    updateBillDisplay();
    showNotification('Added to bill! 🛒', 'success');
    
    // Clear and prepare for next scan
    manualInput.value = '';
    manualInput.focus();
    currentProduct = null;
    productInfo.classList.remove('visible');
    
    // Auto start scanner
    setTimeout(() => {
        if (!isScanning) {
            startScanner();
        }
    }, 1000);
}

// Update bill display
function updateBillDisplay() {
    if (billItems.length === 0) {
        billItemsContainer.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 48px; margin-bottom: 15px;">🛒</div>
                <p>No items in bill</p>
                <p style="font-size: 14px; margin-top: 10px;">Scan a QR code to add items</p>
            </div>
        `;
        
        subtotalEl.textContent = '₨ 0.00';
        taxEl.textContent = '₨ 0.00';
        totalEl.textContent = '₨ 0.00';
        
        printBtn.disabled = true;
        checkoutBtn.disabled = true;
        return;
    }
    
    // Enable buttons
    printBtn.disabled = false;
    checkoutBtn.disabled = false;
    
    // Generate bill items HTML
    let itemsHTML = '';
    let subtotal = 0;
    
    billItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        itemsHTML += `
            <div class="bill-item">
                <div class="item-info">
                    <div class="item-name">${item.title}</div>
                    <div class="item-ref">${item.referenceNo}</div>
                </div>
                <div style="text-align: center;">
                    <button onclick="changeQuantity(${item.id}, -1)" style="border: none; background: #e2e8f0; padding: 5px 10px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, 1)" style="border: none; background: #e2e8f0; padding: 5px 10px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
                <div class="item-price">₨ ${itemTotal.toFixed(2)}</div>
                <button onclick="removeItem(${item.id})" style="border: none; background: #e53e3e; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </div>
        `;
    });
    
    billItemsContainer.innerHTML = itemsHTML;
    
    // Calculate totals
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    subtotalEl.textContent = '₨ ' + subtotal.toFixed(2);
    taxEl.textContent = '₨ ' + tax.toFixed(2);
    totalEl.textContent = '₨ ' + total.toFixed(2);
    
    console.log('💰 Bill updated - Total: ₨', total.toFixed(2));
}

// Change quantity
function changeQuantity(productId, change) {
    const item = billItems.find(item => item.id == productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeItem(productId);
        return;
    }
    
    if (newQuantity > item.maxStock) {
        showNotification('Maximum stock reached', 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    updateBillDisplay();
    showNotification('Quantity updated', 'info');
}

// Remove item
function removeItem(productId) {
    const item = billItems.find(item => item.id == productId);
    if (item && confirm(`Remove "${item.title}" from bill?`)) {
        billItems = billItems.filter(item => item.id != productId);
        updateBillDisplay();
        showNotification('Item removed', 'info');
    }
}

// New bill
function newBill() {
    if (billItems.length > 0) {
        if (!confirm('Start new bill? Current bill will be cleared.')) {
            return;
        }
    }
    
    billItems = [];
    currentProduct = null;
    updateBillDisplay();
    productInfo.classList.remove('visible');
    manualInput.value = '';
    manualInput.focus();
    showNotification('New bill created', 'success');
}

// Print bill
function printBill() {
    if (billItems.length === 0) {
        showNotification('No items to print', 'warning');
        return;
    }
    
    console.log('🖨️ Printing bill...');
    
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - Pahana Edu</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                .totals { margin-top: 20px; text-align: right; }
                .total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Pahana Edu</h1>
                <p>Educational Materials & Books</p>
                <p>Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            </div>
            
            <div class="items">
                ${billItems.map(item => `
                    <div class="item">
                        <div>
                            <div><strong>${item.title}</strong></div>
                            <div style="font-size: 12px; color: #666;">${item.referenceNo}</div>
                        </div>
                        <div>
                            <div>₨ ${item.price.toFixed(2)} x ${item.quantity}</div>
                            <div><strong>₨ ${(item.price * item.quantity).toFixed(2)}</strong></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="totals">
                <div>Subtotal: ₨ ${subtotal.toFixed(2)}</div>
                <div>Tax (10%): ₨ ${tax.toFixed(2)}</div>
                <div class="total">Total: ₨ ${total.toFixed(2)}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #666;">
                <p>Thank you for your purchase!</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Bill sent to printer 🖨️', 'success');
}

// Checkout
function checkout() {
    if (billItems.length === 0) {
        showNotification('No items to checkout', 'warning');
        return;
    }
    
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    const confirmed = confirm(
        `Complete checkout?\n\n` +
        `Total: ₨ ${total.toFixed(2)}\n` +
        `Items: ${billItems.length}`
    );
    
    if (!confirmed) return;
    
    console.log('💳 Processing checkout...');
    showNotification('Processing payment...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
        showNotification(`Payment of ₨ ${total.toFixed(2)} completed! 💳`, 'success');
        
        // Auto print receipt
        setTimeout(() => {
            printBill();
        }, 1000);
        
        // Clear bill
        setTimeout(() => {
            newBill();
            showNotification('Ready for next customer 😊', 'info');
        }, 2000);
    }, 1500);
}

// Show notification
function showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
    
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC to stop scanner
    if (e.key === 'Escape') {
        if (isScanning) {
            stopScanner();
        }
        manualInput.focus();
    }
    
    // F1 to start scanner
    if (e.key === 'F1') {
        e.preventDefault();
        if (!isScanning) {
            startScanner();
        }
    }
    
    // Ctrl+N for new bill
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        newBill();
    }
    
    // Ctrl+P to print
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (billItems.length > 0) {
            printBill();
        }
    }
});

// Global functions for bill management
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;

console.log('✅ Simple QR Scanner loaded successfully!')