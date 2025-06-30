// Global variables
let html5QrCode;
let currentProduct = null;
let billItems = [];

// DOM elements
const startScannerBtn = document.getElementById('startScannerBtn');
const stopScannerBtn = document.getElementById('stopScannerBtn');
const resetBtn = document.getElementById('resetBtn');
const scannerContainer = document.getElementById('scannerContainer');
const scannerOverlay = document.getElementById('scannerOverlay');
const qrReader = document.getElementById('qrReader');
const manualRefInput = document.getElementById('manualRefInput');
const manualSearchBtn = document.getElementById('manualSearchBtn');
const productInfo = document.getElementById('productInfo');
const newBillBtn = document.getElementById('newBillBtn');
const billItemsContainer = document.getElementById('billItems');
const printBillBtn = document.getElementById('printBillBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');

// Initialize scanner
function initScanner() {
    html5QrCode = new Html5Qrcode("qrReader");
    
    startScannerBtn.addEventListener('click', startScanner);
    stopScannerBtn.addEventListener('click', stopScanner);
    resetBtn.addEventListener('click', resetScanner);
    manualSearchBtn.addEventListener('click', searchByReference);
    newBillBtn.addEventListener('click', createNewBill);
    printBillBtn.addEventListener('click', printBill);
    checkoutBtn.addEventListener('click', checkout);
    
    // Hide product info initially
    productInfo.classList.remove('visible');
}

// Start QR scanner
function startScanner() {
    const config = { 
        fps: 10,
        qrbox: { width: 250, height: 250 } 
    };
    
    Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
            const cameraId = cameras[0].id;
            
            html5QrCode.start(
                cameraId,
                config,
                onScanSuccess,
                onScanError
            ).then(() => {
                scannerOverlay.classList.add('hidden');
                startScannerBtn.classList.add('hidden');
                stopScannerBtn.classList.remove('hidden');
            }).catch(err => {
                showNotification('Failed to start scanner: ' + err, 'error');
            });
        } else {
            showNotification('No cameras found', 'error');
        }
    }).catch(err => {
        showNotification('Failed to access cameras: ' + err, 'error');
    });
}

// Stop scanner
function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            scannerOverlay.classList.remove('hidden');
            startScannerBtn.classList.remove('hidden');
            stopScannerBtn.classList.add('hidden');
        }).catch(err => {
            showNotification('Failed to stop scanner: ' + err, 'error');
        });
    }
}

// Reset scanner
function resetScanner() {
    stopScanner();
    currentProduct = null;
    productInfo.classList.remove('visible');
    manualRefInput.value = '';
}

// Handle successful scan
function onScanSuccess(referenceNo) {
    // Stop scanner after successful scan
    stopScanner();
    
    // Look up product by reference number
    fetchProduct(referenceNo);
}

// Handle scan error
function onScanError(error) {
    // We'll ignore most errors as they are common during scanning
}

// Search by manual reference input
function searchByReference() {
    const referenceNo = manualRefInput.value.trim();
    if (!referenceNo) {
        showNotification('Please enter a reference number', 'warning');
        return;
    }
    
    fetchProduct(referenceNo);
}

// Fetch product details from server
function fetchProduct(referenceNo) {
    // Show loading state
    productInfo.classList.add('visible');
    productInfo.innerHTML = `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <p>Loading product details...</p>
        </div>
    `;
    
    // In a real application, this would be an API call to your server
    // For demonstration, we'll use mock data
    setTimeout(() => {
        // Mock product data - in real app this would come from your API
        const mockProducts = [
            {
                id: 101,
                title: "Advanced Mathematics for Grade 12",
                author: "Dr. S. Perera",
                category: "Mathematics",
                price: 1250.00,
                stock: 15,
                referenceNo: "BKREF-101-G12",
                status: "In Stock"
            },
            {
                id: 102,
                title: "Physics Concepts and Applications",
                author: "Prof. R. Silva",
                category: "Science",
                price: 1100.00,
                stock: 8,
                referenceNo: "BKREF-102-PHY",
                status: "Low Stock"
            },
            {
                id: 103,
                title: "English Literature Anthology",
                author: "Dr. M. Fernando",
                category: "Languages",
                price: 980.00,
                stock: 0,
                referenceNo: "BKREF-103-ENG",
                status: "Out of Stock"
            }
        ];
        
        // Find product by reference number
        const product = mockProducts.find(p => p.referenceNo === referenceNo);
        
        if (product) {
            currentProduct = product;
            displayProductInfo(product);
        } else {
            showNotification('Product not found with reference: ' + referenceNo, 'error');
            productInfo.classList.remove('visible');
        }
    }, 800);
}

// Display product information
function displayProductInfo(product) {
    productInfo.innerHTML = `
        <div class="product-header">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">₨ ${product.price.toFixed(2)}</div>
        </div>
        
        <div class="product-details">
            <div class="detail-item">
                <div class="detail-label">Reference Number</div>
                <div class="detail-value">${product.referenceNo}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Author</div>
                <div class="detail-value">${product.author}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">${product.category}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Stock Status</div>
                <div class="detail-value">${product.status}</div>
            </div>
        </div>
        
        <div class="scanner-controls" style="margin-top: 1.5rem;">
            <button id="addToBillBtn" class="btn btn-success">
                <i class="fas fa-cart-plus"></i> Add to Bill
            </button>
        </div>
    `;
    
    // Reattach event listener
    document.getElementById('addToBillBtn').addEventListener('click', addToBill);
}

// Add product to bill
function addToBill() {
    if (!currentProduct) {
        showNotification('No product selected', 'warning');
        return;
    }
    
    // Check if product already in bill
    const existingItem = billItems.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        // Increase quantity
        existingItem.quantity++;
    } else {
        // Add new item
        billItems.push({
            id: currentProduct.id,
            title: currentProduct.title,
            referenceNo: currentProduct.referenceNo,
            price: currentProduct.price,
            quantity: 1
        });
    }
    
    // Update bill display
    updateBillDisplay();
    
    showNotification('Added to bill: ' + currentProduct.title, 'success');
    resetScanner();
}

// Update bill display
function updateBillDisplay() {
    if (billItems.length === 0) {
        billItemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt" style="font-size: 3rem; color: #cbd5e1; display: block; text-align: center; margin: 2rem 0;"></i>
                <p style="text-align: center; color: #94a3b8;">No items added to bill</p>
            </div>
        `;
        
        // Update totals
        subtotalEl.textContent = '₨ 0.00';
        taxEl.textContent = '₨ 0.00';
        totalEl.textContent = '₨ 0.00';
        
        return;
    }
    
    // Generate bill items
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
                <div class="item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
                <div class="item-price">₨ ${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    billItemsContainer.innerHTML = itemsHTML;
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, -1));
    });
    
    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', () => adjustQuantity(btn.dataset.id, 1));
    });
    
    // Calculate totals
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    // Update totals
    subtotalEl.textContent = '₨ ' + subtotal.toFixed(2);
    taxEl.textContent = '₨ ' + tax.toFixed(2);
    totalEl.textContent = '₨ ' + total.toFixed(2);
}

// Adjust item quantity
function adjustQuantity(productId, change) {
    const item = billItems.find(item => item.id == productId);
    
    if (item) {
        item.quantity += change;
        
        // Remove item if quantity is zero
        if (item.quantity <= 0) {
            billItems = billItems.filter(i => i.id != productId);
        }
        
        updateBillDisplay();
    }
}

// Create new bill
function createNewBill() {
    if (billItems.length > 0) {
        if (!confirm('Are you sure you want to start a new bill? The current bill will be cleared.')) {
            return;
        }
    }
    
    billItems = [];
    updateBillDisplay();
    showNotification('New bill created', 'success');
}

// Print bill
function printBill() {
    if (billItems.length === 0) {
        showNotification('No items in the bill to print', 'warning');
        return;
    }
    
    // Prepare bill content for printing
    let billContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pahana Edu - Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .receipt-header { text-align: center; margin-bottom: 20px; }
                .receipt-title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                .receipt-info { margin-bottom: 15px; font-size: 14px; }
                .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .receipt-table th, .receipt-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .receipt-table th { background-color: #f2f2f2; }
                .receipt-totals { text-align: right; font-size: 16px; }
                .receipt-totals .total { font-weight: bold; font-size: 18px; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <div class="receipt-title">Pahana Edu</div>
                <div class="receipt-subtitle">Educational Materials</div>
            </div>
            
            <div class="receipt-info">
                <div>Date: ${new Date().toLocaleDateString()}</div>
                <div>Cashier: ${document.querySelector('.cashier-name h3').textContent}</div>
                <div>Bill ID: ${Math.floor(100000 + Math.random() * 900000)}</div>
            </div>
            
            <table class="receipt-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Reference</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    let subtotal = 0;
    
    billItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        billContent += `
            <tr>
                <td>${item.title}</td>
                <td>${item.referenceNo}</td>
                <td>₨ ${item.price.toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>₨ ${itemTotal.toFixed(2)}</td>
            </tr>
        `;
    });
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    billContent += `
                </tbody>
            </table>
            
            <div class="receipt-totals">
                <div>Subtotal: ₨ ${subtotal.toFixed(2)}</div>
                <div>Tax (10%): ₨ ${tax.toFixed(2)}</div>
                <div class="total">Total: ₨ ${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
                Thank you for your purchase!<br>
                Pahana Edu - Quality Educational Materials
            </div>
        </body>
        </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Checkout process
function checkout() {
    if (billItems.length === 0) {
        showNotification('No items in the bill to checkout', 'warning');
        return;
    }
    
    // Calculate total
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    // In a real application, this would process the payment
    // For demonstration, we'll just show a confirmation
    const paymentMethod = prompt('Select payment method:\n1. Cash\n2. Credit Card\n3. Debit Card');
    
    if (!paymentMethod) return;
    
    let methodName = '';
    switch(paymentMethod) {
        case '1': methodName = 'Cash'; break;
        case '2': methodName = 'Credit Card'; break;
        case '3': methodName = 'Debit Card'; break;
        default: methodName = 'Cash';
    }
    
    showNotification(`Payment of ₨ ${total.toFixed(2)} processed via ${methodName}`, 'success');
    
    // Clear bill after successful checkout
    billItems = [];
    updateBillDisplay();
}

// Show notification
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div>${message}</div>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.remove();
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initScanner);