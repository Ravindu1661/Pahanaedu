// File: js/cashier-scan.js
// Enhanced QR Scanner with Bill Management and History

// Global variables
let html5QrCode;
let isScanning = false;
let billItems = [];
let currentProduct = null;
let selectedPaymentMethod = 'CASH';
let billHistory = [];

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
const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
const historyTableBody = document.getElementById('historyTableBody');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Enhanced QR Scanner with Bill History...');
    
    // Initialize scanner
    html5QrCode = new Html5Qrcode("qrReader");
    
    // Add event listeners
    startBtn.addEventListener('click', startScanner);
    stopBtn.addEventListener('click', stopScanner);
    searchBtn.addEventListener('click', searchProduct);
    newBillBtn.addEventListener('click', newBill);
    printBtn.addEventListener('click', printBill);
    checkoutBtn.addEventListener('click', checkout);
    refreshHistoryBtn.addEventListener('click', loadBillHistory);
    
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedPaymentMethod = this.dataset.method;
            showNotification(`Payment method: ${selectedPaymentMethod}`, 'info');
        });
    });
    
    // Manual input Enter key
    manualInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProduct();
        }
    });
    
    // Start datetime update
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load initial bill history
    loadBillHistory();
    
    // Focus manual input
    manualInput.focus();
    
    showNotification('QR Scanner ready! 📱', 'success');
    console.log('✅ Enhanced scanner with bill history initialized');
});

// Update current date and time
function updateDateTime() {
    const now = new Date();
    const dateTimeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.textContent = dateTimeStr;
    }
}

// Load bill history from server
function loadBillHistory() {
    console.log('📋 Loading bill history...');
    showNotification('Loading bill history...', 'info');
    
    // Show loading state
    historyTableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #a0aec0;">
                <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
                <p>Loading bill history...</p>
            </td>
        </tr>
    `;
    
    // Fetch bill history from server
    fetch('bills?action=getHistory')
        .then(response => response.json())
        .then(data => {
            console.log('📊 History response:', data);
            
            if (data.success && data.bills) {
                billHistory = data.bills;
                displayBillHistory(data.bills);
                showNotification(`Loaded ${data.bills.length} bills`, 'success');
            } else {
                billHistory = [];
                displayBillHistory([]);
                showNotification('No bill history found', 'info');
            }
        })
        .catch(error => {
            console.error('❌ History load error:', error);
            billHistory = [];
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #e53e3e;">
                        <div style="font-size: 24px; margin-bottom: 10px;">❌</div>
                        <p>Failed to load bill history</p>
                        <p style="font-size: 12px; margin-top: 5px;">Check your connection and try again</p>
                    </td>
                </tr>
            `;
            showNotification('Failed to load bill history', 'error');
        });
}

// Display bill history in table
function displayBillHistory(bills) {
    if (!bills || bills.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #a0aec0;">
                    <div style="font-size: 48px; margin-bottom: 15px;">📄</div>
                    <p>No bills found</p>
                    <p style="font-size: 14px; margin-top: 10px;">Bills will appear here after checkout</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort bills by date (newest first)
    const sortedBills = bills.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    let historyHTML = '';
    
    sortedBills.forEach(bill => {
        const billDate = new Date(bill.createdDate);
        const formattedDate = billDate.toLocaleDateString();
        const formattedTime = billDate.toLocaleTimeString();
        
        // Get item count - try multiple sources
        let itemCount = 0;
        if (bill.itemCount !== undefined && bill.itemCount !== null) {
            itemCount = bill.itemCount;
        } else if (bill.items && Array.isArray(bill.items)) {
            itemCount = bill.items.length;
        } else {
            itemCount = 0;
        }
        
        const paymentBadgeClass = bill.paymentMethod === 'CASH' ? 'payment-cash' : 'payment-card';
        
        console.log(`Bill ${bill.billNo}: itemCount=${itemCount}, items=${bill.items ? bill.items.length : 'null'}`);
        
        historyHTML += `
            <tr>
                <td class="bill-no">${bill.billNo}</td>
                <td>${formattedDate}</td>
                <td>${formattedTime}</td>
                <td>${itemCount} items</td>
                <td>
                    <span class="payment-badge ${paymentBadgeClass}">
                        ${bill.paymentMethod === 'CASH' ? '💵' : '💳'} ${bill.paymentMethod}
                    </span>
                </td>
                <td class="amount">₨ ${parseFloat(bill.totalAmount).toFixed(2)}</td>
                <td>
                    <button onclick="viewBillDetails('${bill.billNo}')" class="btn btn-primary btn-small">
                        👁️ View
                    </button>
                    <button onclick="reprintBill('${bill.billNo}')" class="btn btn-success btn-small" style="margin-left: 5px;">
                        🖨️ Print
                    </button>
                </td>
            </tr>
        `;
    });
    
    historyTableBody.innerHTML = historyHTML;
}

// View bill details
function viewBillDetails(billNo) {
    console.log('👁️ Viewing bill:', billNo);
    
    const bill = billHistory.find(b => b.billNo === billNo);
    if (!bill) {
        showNotification('Bill not found', 'error');
        return;
    }
    
    showNotification('Loading bill details...', 'info');
    
    // Fetch detailed bill information
    fetch(`bills?action=getBillDetails&billNo=${encodeURIComponent(billNo)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bill) {
                displayBillDetailsModal(data.bill);
            } else {
                showNotification('Failed to load bill details', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Bill details error:', error);
            showNotification('Failed to load bill details', 'error');
        });
}

// Display bill details in modal
function displayBillDetailsModal(bill) {
    const billDate = new Date(bill.createdDate);
    const formattedDate = billDate.toLocaleDateString();
    const formattedTime = billDate.toLocaleTimeString();
    
    // Calculate totals
    let subtotal = 0;
    let itemsHTML = '';
    
    if (bill.items && bill.items.length > 0) {
        bill.items.forEach(item => {
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            subtotal += itemTotal;
            
            itemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <div>
                        <div style="font-weight: 500; color: #2d3748;">${item.title}</div>
                        <div style="font-size: 12px; color: #718096;">Ref: ${item.referenceNo || 'N/A'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 14px;">₨ ${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                        <div style="font-weight: bold; color: #38a169;">₨ ${itemTotal.toFixed(2)}</div>
                    </div>
                </div>
            `;
        });
    }
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; width: 90%; max-width: 600px; max-height: 90%; overflow-y: auto; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <div style="background: #2d3748; color: white; padding: 20px; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 20px;">📄 Bill Details</h2>
                <button onclick="this.closest('div').parentElement.remove()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px;">×</button>
            </div>
            
            <div style="padding: 20px;">
                <div style="background: #f7fafc; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #2d3748;">Bill Information</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
                        <div><strong>Bill No:</strong> ${bill.billNo}</div>
                        <div><strong>Date:</strong> ${formattedDate}</div>
                        <div><strong>Time:</strong> ${formattedTime}</div>
                        <div><strong>Payment:</strong> 
                            <span class="payment-badge ${bill.paymentMethod === 'CASH' ? 'payment-cash' : 'payment-card'}">
                                ${bill.paymentMethod === 'CASH' ? '💵' : '💳'} ${bill.paymentMethod}
                            </span>
                        </div>
                        <div><strong>Items:</strong> ${bill.items ? bill.items.length : 0}</div>
                        <div><strong>Cashier:</strong> ${bill.cashierName || 'N/A'}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3 style="margin: 0 0 15px 0; color: #2d3748;">Items</h3>
                    <div style="background: #f7fafc; border-radius: 8px; padding: 15px;">
                        ${itemsHTML || '<p style="text-align: center; color: #a0aec0;">No items found</p>'}
                    </div>
                </div>
                
                <div style="background: #f7fafc; border-radius: 8px; padding: 15px;">
                    <h3 style="margin: 0 0 15px 0; color: #2d3748;">Bill Summary</h3>
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0;">
                        <span>Subtotal:</span>
                        <span>₨ ${subtotal.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #e2e8f0;">
                        <span>Tax (10%):</span>
                        <span>₨ ${tax.toFixed(2)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 15px 0 5px 0; border-top: 2px solid #2d3748; margin-top: 10px; font-size: 18px; font-weight: bold;">
                        <span>Total:</span>
                        <span style="color: #38a169;">₨ ${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button onclick="reprintBill('${bill.billNo}')" class="btn btn-primary" style="margin-right: 10px;">
                        🖨️ Print Bill
                    </button>
                    <button onclick="this.closest('div').parentElement.remove()" class="btn btn-primary">
                        ✅ Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    showNotification('Bill details loaded', 'success');
}

// Reprint bill
function reprintBill(billNo) {
    console.log('🖨️ Reprinting bill:', billNo);
    
    const bill = billHistory.find(b => b.billNo === billNo);
    if (!bill) {
        showNotification('Bill not found', 'error');
        return;
    }
    
    showNotification('Preparing to print...', 'info');
    
    // Fetch detailed bill for printing
    fetch(`bills?action=getBillDetails&billNo=${encodeURIComponent(billNo)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.bill) {
                printBillFromHistory(data.bill);
                showNotification('Bill sent to printer! 🖨️', 'success');
            } else {
                showNotification('Failed to load bill for printing', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Reprint error:', error);
            showNotification('Failed to reprint bill', 'error');
        });
}

// Print bill from history
function printBillFromHistory(bill) {
    const billDate = new Date(bill.createdDate);
    const formattedDate = billDate.toLocaleDateString();
    const formattedTime = billDate.toLocaleTimeString();
    
    // Calculate totals
    let subtotal = 0;
    let itemsHTML = '';
    
    if (bill.items && bill.items.length > 0) {
        bill.items.forEach(item => {
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            subtotal += itemTotal;
            
            itemsHTML += `
                <div class="item">
                    <div>
                        <div><strong>${item.title}</strong></div>
                        <div style="font-size: 11px; color: #666;">Ref: ${item.referenceNo || 'N/A'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>₨ ${parseFloat(item.price).toFixed(2)} x ${item.quantity}</div>
                        <div><strong>₨ ${itemTotal.toFixed(2)}</strong></div>
                    </div>
                </div>
            `;
        });
    }
    
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill Reprint - ${bill.billNo}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .bill-info { margin: 15px 0; font-size: 12px; background: #f9f9f9; padding: 10px; border-radius: 5px; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                .totals { margin-top: 20px; text-align: right; }
                .total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .bill-ref { font-size: 16px; font-weight: bold; color: #333; text-align: center; margin: 10px 0; }
                .reprint-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 5px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Pahana Edu</h2>
                <p>Educational Materials & Books</p>
            </div>
            
            <div class="reprint-notice">
                <strong>REPRINT COPY</strong><br>
                Original Date: ${formattedDate} ${formattedTime}
            </div>
            
            <div class="bill-ref">BILL REFERENCE: ${bill.billNo}</div>
            
            <div class="bill-info">
                <div><strong>Original Date:</strong> ${formattedDate}</div>
                <div><strong>Original Time:</strong> ${formattedTime}</div>
                <div><strong>Payment Method:</strong> ${bill.paymentMethod}</div>
                <div><strong>Items Count:</strong> ${bill.items ? bill.items.length : 0}</div>
                <div><strong>Cashier:</strong> ${bill.cashierName || 'N/A'}</div>
                <div><strong>Reprinted:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <div class="items">
                ${itemsHTML}
            </div>
            
            <div class="totals">
                <div>Subtotal: ₨ ${subtotal.toFixed(2)}</div>
                <div>Tax (10%): ₨ ${tax.toFixed(2)}</div>
                <div class="total">Total: ₨ ${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
                <p><strong>Pahana Educational Services</strong></p>
                <p>This is a reprint copy of the original bill</p>
                <p>Keep this receipt for your records</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

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
    
    // Show loading
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
        
        <div style="margin: 15px 0;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Reference:</span>
                <span>${product.referenceNo || 'N/A'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Author:</span>
                <span>${product.author}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                <span>Stock:</span>
                <span style="color: ${stockColor};">${stockStatus}</span>
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
    
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    const billRef = 'BILL' + Date.now();
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Bill - Pahana Edu</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .bill-info { margin: 10px 0; font-size: 12px; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                .totals { margin-top: 20px; text-align: right; }
                .total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Pahana Edu</h2>
                <p>Educational Materials & Books</p>
            </div>
            
            <div class="bill-info">
                <div><strong>Bill Reference:</strong> ${billRef}</div>
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Payment:</strong> ${selectedPaymentMethod}</div>
            </div>
            
            <div class="items">
                ${billItems.map(item => `
                    <div class="item">
                        <div>
                            <div><strong>${item.title}</strong></div>
                            <div style="font-size: 11px; color: #666;">${item.referenceNo}</div>
                        </div>
                        <div style="text-align: right;">
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
            
            <div class="footer">
                <p>Thank you for your purchase!</p>
                <p>Pahana Educational Services</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    showNotification('Bill printed! 🖨️', 'success');
}

// Checkout and save bill
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
        `Payment Method: ${selectedPaymentMethod}\n` +
        `Total: ₨ ${total.toFixed(2)}\n` +
        `Items: ${billItems.length}`
    );
    
    if (!confirmed) return;
    
    console.log('💳 Processing checkout...');
    showNotification('Processing payment...', 'info');
    
    // Prepare bill data
    const billData = {
        action: 'createBill',
        items: JSON.stringify(billItems),
        paymentMethod: selectedPaymentMethod
    };
    
    // Save bill to database
    fetch('bills', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(billData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(`Payment completed! Bill: ${data.billNo} 💳`, 'success');
            
            // Auto print receipt
            setTimeout(() => {
                printBillWithReference(data.billNo);
            }, 1000);
            
            // Reload bill history
            setTimeout(() => {
                loadBillHistory();
            }, 1500);
            
            // Clear bill
            setTimeout(() => {
                newBill();
                showNotification('Ready for next customer 😊', 'info');
            }, 2000);
        } else {
            showNotification('Failed to save bill: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('❌ Checkout error:', error);
        showNotification('Checkout failed. Please try again.', 'error');
    });
}

// Print bill with reference number
function printBillWithReference(billNo) {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Official Bill - ${billNo}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .bill-info { margin: 15px 0; font-size: 12px; background: #f9f9f9; padding: 10px; border-radius: 5px; }
                .item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
                .totals { margin-top: 20px; text-align: right; }
                .total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                .bill-ref { font-size: 16px; font-weight: bold; color: #333; text-align: center; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Pahana Edu</h2>
                <p>Educational Materials & Books</p>
            </div>
            
            <div class="bill-ref">BILL REFERENCE: ${billNo}</div>
            
            <div class="bill-info">
                <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
                <div><strong>Time:</strong> ${new Date().toLocaleTimeString()}</div>
                <div><strong>Payment Method:</strong> ${selectedPaymentMethod}</div>
                <div><strong>Items Count:</strong> ${billItems.length}</div>
            </div>
            
            <div class="items">
                ${billItems.map(item => `
                    <div class="item">
                        <div>
                            <div><strong>${item.title}</strong></div>
                            <div style="font-size: 11px; color: #666;">Ref: ${item.referenceNo}</div>
                        </div>
                        <div style="text-align: right;">
                            <div>₨ ${item.price.toFixed(2)} x ${item.quantity}</div>
                            <div><strong>₨ ${(item.price * item.quantity).toFixed(2)}</strong></div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="totals">
                <div>Subtotal: ₨ ${subtotal.toFixed(2)}</div>
                <div>Tax (10%): ₨ ${tax.toFixed(2)}</div>
                <div class="total">Total Paid: ₨ ${total.toFixed(2)}</div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for your purchase!</strong></p>
                <p>Pahana Educational Services</p>
                <p>Keep this receipt for your records</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
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
    
    // Enter to checkout
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT') {
        if (billItems.length > 0) {
            checkout();
        }
    }
    
    // F5 to refresh history
    if (e.key === 'F5') {
        e.preventDefault();
        loadBillHistory();
    }
});

// Global functions for bill management
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
window.viewBillDetails = viewBillDetails;
window.reprintBill = reprintBill;

console.log('✅ Enhanced QR Scanner with complete bill history management loaded successfully!');