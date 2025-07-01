/**
 * 
 *//**
 * Shopping Billing Management System for Admin Dashboard
 * With PDF/Excel Export Functionality
 */
(function() {
    'use strict';

    // Shopping Billing Module
    const AdminShoppingBilling = {
        // State management
        state: {
            bills: [],
            cashiers: [],
            initialized: false
        },

        // Initialize shopping billing system
        async init() {
            if (this.state.initialized) {
                console.log('🧾 Shopping Billing already initialized, skipping...');
                return;
            }
            
            console.log('🧾 Initializing Shopping Billing System...');
            try {
                await this.loadCashiers(); // Load cashiers first
                await this.loadBills();
                this.state.initialized = true;
                console.log('✅ Shopping Billing System initialized');
            } catch (error) {
                console.error('❌ Error initializing shopping billing:', error);
            }
        },

        // Load cashiers
        async loadCashiers() {
            try {
                const response = await fetch('admin?action=getCashiers');
                if (!response.ok) throw new Error('Failed to fetch cashiers');
                
                const cashiers = await response.json();
                this.state.cashiers = Array.isArray(cashiers) ? cashiers : [];
                this.populateCashierDropdown();
                console.log(`👤 Loaded ${this.state.cashiers.length} cashiers`);
                return this.state.cashiers;
            } catch (error) {
                console.error('❌ Error loading cashiers:', error);
                this.state.cashiers = [];
                return [];
            }
        },

        // Populate cashier dropdown
        populateCashierDropdown() {
            const cashierSelect = document.getElementById('cashierFilter');
            if (!cashierSelect) return;

            cashierSelect.innerHTML = '<option value="">All Cashiers</option>';
            
            this.state.cashiers
                .filter(cashier => cashier.status === 'active')
                .forEach(cashier => {
                    const option = document.createElement('option');
                    option.value = cashier.id;
                    option.textContent = `${cashier.firstName} ${cashier.lastName}`;
                    cashierSelect.appendChild(option);
                });
        },

        // Load bills with proper error handling
        async loadBills() {
            try {
                const response = await fetch('bills?action=getAllBills');
                if (!response.ok) throw new Error('Failed to fetch bills');
                
                const bills = await response.json();
                this.state.bills = Array.isArray(bills) ? bills : [];
                this.displayBills();
                this.updateBillingStats();
                console.log(`📊 Loaded ${this.state.bills.length} bills`);
                return this.state.bills;
            } catch (error) {
                console.error('❌ Error loading bills:', error);
                this.state.bills = [];
                this.displayBills(); // Show empty state
                this.updateBillingStats();
                return [];
            }
        },

        // Display bills in table
        displayBills() {
            const tableBody = document.querySelector('#billsTable tbody');
            if (!tableBody) {
                console.warn('Bills table body not found');
                return;
            }

            if (this.state.bills.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                            No bills found<br>
                            <small>Bills will appear here once created</small>
                        </td>
                    </tr>
                `;
                return;
            }

            // Sort bills by date (newest first)
            const sortedBills = [...this.state.bills].sort((a, b) => {
                const dateA = new Date(a.billDate + ' ' + (a.billTime || '00:00:00'));
                const dateB = new Date(b.billDate + ' ' + (b.billTime || '00:00:00'));
                return dateB - dateA;
            });

            tableBody.innerHTML = sortedBills.map(bill => {
                // Find cashier name
                const cashier = this.state.cashiers.find(c => c.id === bill.cashierId);
                const cashierName = cashier 
                    ? `${cashier.firstName} ${cashier.lastName}` 
                    : bill.cashierName || 'Unknown';
                
                return `
                <tr>
                    <td class="bill-no">${bill.billNo || 'N/A'}</td>
                    <td>${cashierName}</td>
                    <td>${bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}</td>
                    <td>${bill.billTime || 'N/A'}</td>
                    <td>${bill.items ? bill.items.length : 0} items</td>
                    <td>
                        <span class="payment-badge ${bill.paymentMethod === 'CASH' ? 'payment-cash' : 'payment-card'}">
                            ${bill.paymentMethod === 'CASH' ? '💵 Cash' : '💳 Card'}
                        </span>
                    </td>
                    <td class="amount">₨ ${parseFloat(bill.totalAmount || 0).toFixed(2)}</td>
                    <td>
                        <button class="btn-view" onclick="window.shoppingBilling.viewBillDetails('${bill.billNo}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-print" onclick="window.shoppingBilling.reprintBill('${bill.billNo}')" title="Reprint">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                </tr>
                `;
            }).join('');
        },

        // Update billing stats
        updateBillingStats() {
            const totalBills = this.state.bills.length;
            const totalRevenue = this.state.bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0);
            
            const today = new Date().toDateString();
            const todayBills = this.state.bills.filter(bill => 
                bill.billDate && new Date(bill.billDate).toDateString() === today
            ).length;

            // Update stats display
            const elements = {
                totalBills: document.getElementById('totalBills'),
                totalRevenueBilling: document.getElementById('totalRevenueBilling'),
                todayBills: document.getElementById('todayBills')
            };

            if (elements.totalBills) elements.totalBills.textContent = totalBills;
            if (elements.totalRevenueBilling) elements.totalRevenueBilling.textContent = `₨ ${totalRevenue.toFixed(2)}`;
            if (elements.todayBills) elements.todayBills.textContent = todayBills;
        },

        // View bill details
        viewBillDetails(billNo) {
            const bill = this.state.bills.find(b => b.billNo === billNo);
            if (!bill) {
                this.showNotification('Bill not found', 'error');
                return;
            }

            // Find cashier name
            const cashier = this.state.cashiers.find(c => c.id === bill.cashierId);
            const cashierName = cashier 
                ? `${cashier.firstName} ${cashier.lastName}` 
                : bill.cashierName || 'Unknown';

            const billHTML = `
                <div style="max-width: 600px; font-family: Arial, sans-serif;">
                    <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px;">
                        <h2 style="margin: 0; color: #333;">Pahana Edu</h2>
                        <p>Educational Materials & Books</p>
                        <div style="background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; display: inline-block;">OFFICIAL BILL</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <div><strong>Bill No:</strong> ${bill.billNo}</div>
                            <div><strong>Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}</div>
                            <div><strong>Time:</strong> ${bill.billTime}</div>
                            <div><strong>Payment:</strong> ${bill.paymentMethod}</div>
                            <div><strong>Cashier:</strong> ${cashierName}</div>
                        </div>
                        <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                            <strong>Customer:</strong> ${bill.customerName || 'Walk-in Customer'}
                            ${bill.customerEmail ? `<br><strong>Email:</strong> ${bill.customerEmail}` : ''}
                            ${bill.customerPhone ? `<br><strong>Phone:</strong> ${bill.customerPhone}` : ''}
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Price</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Qty</th>
                                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.items ? bill.items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                        <div style="font-weight: bold;">${item.bookTitle}</div>
                                        ${item.bookReference ? `<div style="font-size: 12px; color: #666;">Ref: ${item.bookReference}</div>` : ''}
                                    </td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">₨ ${parseFloat(item.unitPrice).toFixed(2)}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
                                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">₨ ${parseFloat(item.totalPrice).toFixed(2)}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="4" style="text-align: center; padding: 20px;">No items found</td></tr>'}
                        </tbody>
                    </table>
                    
                    <div style="border-top: 2px solid #333; padding-top: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Subtotal:</span>
                            <span>₨ ${parseFloat(bill.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span>Tax (10%):</span>
                            <span>₨ ${parseFloat(bill.taxAmount || 0).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 1px solid #666; padding-top: 10px; margin-top: 10px;">
                            <span>Total:</span>
                            <span>₨ ${parseFloat(bill.totalAmount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
            
            this.showModal('Bill Details', billHTML);
        },

        // Reprint bill
        reprintBill(billNo) {
            const bill = this.state.bills.find(b => b.billNo === billNo);
            if (!bill) {
                this.showNotification('Bill not found', 'error');
                return;
            }

            // Find cashier name
            const cashier = this.state.cashiers.find(c => c.id === bill.cashierId);
            const cashierName = cashier 
                ? `${cashier.firstName} ${cashier.lastName}` 
                : bill.cashierName || 'Unknown';

            this.showNotification('Opening print window...', 'info');
            
            setTimeout(() => {
                const printWindow = window.open('', '_blank', 'width=800,height=600');
                if (printWindow) {
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>REPRINT - ${billNo}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; line-height: 1.4; }
                                .bill-document { max-width: 600px; margin: 0 auto; }
                                .reprint-notice { background: #ffc107; color: #856404; padding: 10px; text-align: center; margin-bottom: 20px; border-radius: 5px; font-weight: bold; }
                                .bill-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                                .bill-header h2 { margin: 0; color: #333; }
                                .official-stamp { background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; display: inline-block; }
                                .bill-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                                .customer-info { background: #f8f9fa; padding: 10px; border-radius: 5px; }
                                .bill-items table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                .bill-items th, .bill-items td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                                .bill-items th { background: #f8f9fa; font-weight: bold; }
                                .item-name { font-weight: bold; }
                                .item-ref { font-size: 12px; color: #666; }
                                .bill-totals { border-top: 2px solid #333; padding-top: 15px; }
                                .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                                .final-total { font-size: 18px; font-weight: bold; border-top: 1px solid #666; padding-top: 10px; margin-top: 10px; }
                                .bill-footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                                @media print { .no-print { display: none; } }
                            </style>
                        </head>
                        <body>
                            <div class="reprint-notice">
                                ⚠️ DUPLICATE COPY - REPRINT<br>
                                Original Date: ${new Date(bill.billDate).toLocaleDateString()}<br>
                                Reprinted: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                            </div>
                            <div class="bill-document">
                                <div class="bill-header">
                                    <h2>Pahana Edu</h2>
                                    <p>Educational Materials & Books</p>
                                    <div class="official-stamp">OFFICIAL BILL</div>
                                </div>
                                <div class="bill-info">
                                    <div>
                                        <div><strong>Bill No:</strong> ${bill.billNo}</div>
                                        <div><strong>Date:</strong> ${new Date(bill.billDate).toLocaleDateString()}</div>
                                        <div><strong>Time:</strong> ${bill.billTime}</div>
                                        <div><strong>Payment:</strong> ${bill.paymentMethod}</div>
                                        <div><strong>Cashier:</strong> ${cashierName}</div>
                                    </div>
                                    <div class="customer-info">
                                        <strong>Customer:</strong> ${bill.customerName || 'Walk-in Customer'}
                                        ${bill.customerEmail ? `<br><strong>Email:</strong> ${bill.customerEmail}` : ''}
                                        ${bill.customerPhone ? `<br><strong>Phone:</strong> ${bill.customerPhone}` : ''}
                                    </div>
                                </div>
                                <div class="bill-items">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Price</th>
                                                <th>Qty</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${bill.items ? bill.items.map(item => `
                                                <tr>
                                                    <td>
                                                        <div class="item-name">${item.bookTitle}</div>
                                                        ${item.bookReference ? `<div class="item-ref">Ref: ${item.bookReference}</div>` : ''}
                                                    </td>
                                                    <td>₨ ${parseFloat(item.unitPrice).toFixed(2)}</td>
                                                    <td>${item.quantity}</td>
                                                    <td>₨ ${parseFloat(item.totalPrice).toFixed(2)}</td>
                                                </tr>
                                            `).join('') : '<tr><td colspan="4">No items found</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                                <div class="bill-totals">
                                    <div class="total-row">
                                        <span>Subtotal:</span>
                                        <span>₨ ${parseFloat(bill.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div class="total-row">
                                        <span>Tax (10%):</span>
                                        <span>₨ ${parseFloat(bill.taxAmount || 0).toFixed(2)}</span>
                                    </div>
                                    <div class="total-row final-total">
                                        <span>Total:</span>
                                        <span>₨ ${parseFloat(bill.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div class="bill-footer">
                                    <p>Thank you for your business!</p>
                                    <p>Pahana Educational Services</p>
                                    <p>Keep this receipt for your records</p>
                                </div>
                            </div>
                            <div class="no-print" style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Bill</button>
                                <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
                            </div>
                        </body>
                        </html>
                    `);
                    printWindow.document.close();
                    
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                    
                    this.showNotification('Bill reprinted successfully', 'success');
                } else {
                    this.showNotification('Failed to open print window. Please check popup blocker.', 'error');
                }
            }, 100);
        },

        // Export to Excel
        exportToExcel() {
            try {
                this.showNotification('Generating Excel file...', 'info');
                
                if (this.state.bills.length === 0) {
                    this.showNotification('No bills data to export', 'warning');
                    return;
                }

                // Prepare data for Excel
                const excelData = this.state.bills.map(bill => {
                    // Find cashier name
                    const cashier = this.state.cashiers.find(c => c.id === bill.cashierId);
                    const cashierName = cashier 
                        ? `${cashier.firstName} ${cashier.lastName}` 
                        : bill.cashierName || 'Unknown';
                    
                    return {
                        'Bill No': bill.billNo || 'N/A',
                        'Date': bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A',
                        'Time': bill.billTime || 'N/A',
                        'Cashier': cashierName,
                        'Customer': bill.customerName || 'Walk-in Customer',
                        'Payment Method': bill.paymentMethod || 'N/A',
                        'Items Count': bill.items ? bill.items.length : 0,
                        'Subtotal': parseFloat(bill.subtotal || 0).toFixed(2),
                        'Tax Amount': parseFloat(bill.taxAmount || 0).toFixed(2),
                        'Total Amount': parseFloat(bill.totalAmount || 0).toFixed(2)
                    };
                });

                // Create CSV content
                const headers = Object.keys(excelData[0]);
                const csvContent = [
                    // Header row
                    headers.join(','),
                    // Data rows
                    ...excelData.map(row => 
                        headers.map(header => {
                            const value = row[header];
                            // Escape commas and quotes in values
                            return typeof value === 'string' && value.includes(',') 
                                ? `"${value.replace(/"/g, '""')}"` 
                                : value;
                        }).join(',')
                    )
                ].join('\n');

                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `Pahana_Edu_Bills_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                this.showNotification('Excel file downloaded successfully!', 'success');
                
            } catch (error) {
                console.error('Error exporting to Excel:', error);
                this.showNotification('Failed to export Excel file', 'error');
            }
        },

        // Export to PDF
        exportToPDF() {
            try {
                this.showNotification('Generating PDF file...', 'info');
                
                if (this.state.bills.length === 0) {
                    this.showNotification('No bills data to export', 'warning');
                    return;
                }

                // Create PDF content
                const pdfWindow = window.open('', '_blank', 'width=800,height=600');
                if (pdfWindow) {
                    const totalRevenue = this.state.bills.reduce((sum, bill) => sum + parseFloat(bill.totalAmount || 0), 0);
                    const today = new Date().toDateString();
                    const todayBills = this.state.bills.filter(bill => 
                        bill.billDate && new Date(bill.billDate).toDateString() === today
                    ).length;

                    pdfWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Pahana Edu - Bills Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; line-height: 1.4; }
                                .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px; }
                                .header h1 { margin: 0; color: #333; font-size: 24px; }
                                .header p { margin: 5px 0; color: #666; }
                                .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
                                .summary-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #ddd; }
                                .summary-card h3 { margin: 0 0 10px 0; color: #333; font-size: 18px; }
                                .summary-card p { margin: 0; color: #666; font-size: 14px; }
                                .bills-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                .bills-table th, .bills-table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                                .bills-table th { background: #f8f9fa; font-weight: bold; }
                                .bills-table tr:nth-child(even) { background: #f9f9f9; }
                                .payment-cash { background: #d4edda; color: #155724; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
                                .payment-card { background: #cce7ff; color: #004085; padding: 3px 8px; border-radius: 12px; font-size: 10px; }
                                .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; }
                                @media print { 
                                    .no-print { display: none; } 
                                    body { margin: 10px; }
                                    .summary { grid-template-columns: repeat(3, 1fr); }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Pahana Edu</h1>
                                <p>Educational Materials & Books</p>
                                <p><strong>Bills Report</strong></p>
                                <p>Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                            </div>
                            
                            <div class="summary">
                                <div class="summary-card">
                                    <h3>${this.state.bills.length}</h3>
                                    <p>Total Bills</p>
                                </div>
                                <div class="summary-card">
                                    <h3>₨ ${totalRevenue.toFixed(2)}</h3>
                                    <p>Total Revenue</p>
                                </div>
                                <div class="summary-card">
                                    <h3>${todayBills}</h3>
                                    <p>Today's Bills</p>
                                </div>
                            </div>
                            
                            <table class="bills-table">
                                <thead>
                                    <tr>
                                        <th>Bill No</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Cashier</th>
                                        <th>Customer</th>
                                        <th>Payment</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.state.bills.map(bill => {
                                        // Find cashier name
                                        const cashier = this.state.cashiers.find(c => c.id === bill.cashierId);
                                        const cashierName = cashier 
                                            ? `${cashier.firstName} ${cashier.lastName}` 
                                            : bill.cashierName || 'Unknown';
                                        
                                        return `
                                        <tr>
                                            <td>${bill.billNo || 'N/A'}</td>
                                            <td>${bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}</td>
                                            <td>${bill.billTime || 'N/A'}</td>
                                            <td>${cashierName}</td>
                                            <td>${bill.customerName || 'Walk-in'}</td>
                                            <td><span class="payment-${bill.paymentMethod === 'CASH' ? 'cash' : 'card'}">${bill.paymentMethod || 'N/A'}</span></td>
                                            <td>${bill.items ? bill.items.length : 0}</td>
                                            <td>₨ ${parseFloat(bill.totalAmount || 0).toFixed(2)}</td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                            
                            <div class="footer">
                                <p>Pahana Educational Services</p>
                                <p>This is a computer-generated report</p>
                            </div>
                            
                            <div class="no-print" style="text-align: center; margin-top: 30px;">
                                <button onclick="window.print()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                                    <i class="fas fa-file-pdf"></i> Save as PDF
                                </button>
                                <button onclick="window.close()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                                    Close
                                </button>
                            </div>
                        </body>
                        </html>
                    `);
                    
                    pdfWindow.document.close();
                    
                    setTimeout(() => {
                        pdfWindow.print();
                    }, 500);
                    
                    this.showNotification('PDF report opened successfully!', 'success');
                } else {
                    this.showNotification('Failed to open PDF window. Please check popup blocker.', 'error');
                }
                
            } catch (error) {
                console.error('Error exporting to PDF:', error);
                this.showNotification('Failed to export PDF file', 'error');
            }
        },

        // Filter bills
        filterBills() {
            const dateFilter = document.getElementById('billDateFilter')?.value;
            const paymentFilter = document.getElementById('paymentMethodFilter')?.value;
            const cashierFilter = document.getElementById('cashierFilter')?.value;

            let filteredBills = [...this.state.bills];

            if (dateFilter) {
                filteredBills = filteredBills.filter(bill => 
                    bill.billDate === dateFilter
                );
            }

            if (paymentFilter) {
                filteredBills = filteredBills.filter(bill => 
                    bill.paymentMethod === paymentFilter
                );
            }

            if (cashierFilter) {
                filteredBills = filteredBills.filter(bill => 
                    bill.cashierId == cashierFilter
                );
            }

            // Temporarily update bills for display
            const originalBills = this.state.bills;
            this.state.bills = filteredBills;
            this.displayBills();
            this.state.bills = originalBills;

            this.showNotification(`Showing ${filteredBills.length} bills`, 'info');
        },

        // Clear filters
        clearFilters() {
            const elements = ['billDateFilter', 'paymentMethodFilter', 'cashierFilter'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            
            this.displayBills();
            this.showNotification('Filters cleared, showing all bills', 'info');
        },

        // Utility methods
        showNotification(message, type) {
            if (window.adminCore && window.adminCore.showNotification) {
                window.adminCore.showNotification(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        },

        showModal(title, content) {
            if (window.adminCore && window.adminCore.showModal) {
                window.adminCore.showModal(title, content);
            } else {
                alert(title);
            }
        }
    };

    // Global export functions
    window.exportToExcel = function() {
        if (window.shoppingBilling && window.shoppingBilling.exportToExcel) {
            window.shoppingBilling.exportToExcel();
        } else {
            console.warn('Shopping billing module not available');
            if (window.adminCore && window.adminCore.showNotification) {
                window.adminCore.showNotification('Export function not available', 'error');
            }
        }
    };

    window.exportToPDF = function() {
        if (window.shoppingBilling && window.shoppingBilling.exportToPDF) {
            window.shoppingBilling.exportToPDF();
        } else {
            console.warn('Shopping billing module not available');
            if (window.adminCore && window.adminCore.showNotification) {
                window.adminCore.showNotification('Export function not available', 'error');
            }
        }
    };

    window.printReport = function() {
        // Print current page
        window.print();
    };

    window.clearFilters = function() {
        if (window.shoppingBilling && window.shoppingBilling.clearFilters) {
            window.shoppingBilling.clearFilters();
        } else {
            console.warn('Shopping billing module not available');
        }
    };

    // Enhanced tab switching
    window.switchBillingTab = function(tab) {
        console.log(`🔄 Switching to billing tab: ${tab}`);
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const targetTabBtn = document.getElementById(`${tab}TabBtn`);
        if (targetTabBtn) {
            targetTabBtn.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.billing-tab-content').forEach(content => {
            content.style.display = 'none';
        });
        const targetContent = document.getElementById(`${tab}-billing`);
        if (targetContent) {
            targetContent.style.display = 'block';
        }

        // Initialize appropriate system
        if (tab === 'shopping') {
            setTimeout(() => {
                window.shoppingBilling.init().then(() => {
                    window.shoppingBilling.loadBills();
                    console.log('✅ Shopping tab initialized with data');
                    if (window.adminCore && window.adminCore.showNotification) {
                        window.adminCore.showNotification('Shopping data loaded!', 'success');
                    }
                });
            }, 100);
        } else if (tab === 'online') {
            if (window.adminCore && window.adminCore.showNotification) {
                window.adminCore.showNotification('Online billing system coming soon!', 'info');
            }
        }
    };

    // Auto-initialize when billing page loads
    function initializeBillingOnPageLoad() {
        const billingContent = document.getElementById('billing-content');
        const shoppingBilling = document.getElementById('shopping-billing');
        
        if (billingContent && billingContent.style.display !== 'none' &&
            shoppingBilling && shoppingBilling.style.display !== 'none') {
            
            console.log('🧾 Auto-initializing billing system on page load...');
            setTimeout(() => {
                window.shoppingBilling.init().then(() => {
                    console.log('✅ Billing system auto-initialized successfully');
                    if (window.adminCore && window.adminCore.showNotification) {
                        window.adminCore.showNotification('Shopping system ready!', 'success');
                    }
                });
            }, 200);
        }
    }

    // Global functions
    window.shoppingBilling = AdminShoppingBilling;
    window.filterBills = () => window.shoppingBilling.filterBills ? window.shoppingBilling.filterBills() : null;

    // Enhanced page navigation detection
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = function(type, listener, options) {
        if (type === 'click') {
            const enhancedListener = function(e) {
                // Check if billing navigation was clicked
                if (e.target.closest('.nav-link[data-page="billing"]')) {
                    console.log('🧾 Billing navigation detected, scheduling initialization...');
                    setTimeout(() => {
                        initializeBillingOnPageLoad();
                    }, 300);
                }
                return listener.call(this, e);
            };
            return originalAddEventListener.call(this, type, enhancedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🧾 Shopping Billing System Ready');
            setTimeout(initializeBillingOnPageLoad, 500);
        });
    } else {
        console.log('🧾 Shopping Billing System Ready (DOM already loaded)');
        setTimeout(initializeBillingOnPageLoad, 500);
    }

    // Periodic check for billing page visibility
    setInterval(() => {
        const billingContent = document.getElementById('billing-content');
        const shoppingBilling = document.getElementById('shopping-billing');
        
        if (billingContent && billingContent.style.display !== 'none' &&
            shoppingBilling && shoppingBilling.style.display !== 'none' &&
            !window.shoppingBilling.state.initialized) {
            
            console.log('🔄 Periodic check: Initializing billing system...');
            window.shoppingBilling.init();
        }
    }, 2000);

    console.log('✅ Admin Shopping Billing System with Export Functions loaded and ready');
    console.log('📊 Export Functions Available:');
    console.log('├── exportToExcel() - Export bills to CSV/Excel format');
    console.log('├── exportToPDF() - Export bills to PDF report');
    console.log('├── printReport() - Print current page');
    console.log('└── clearFilters() - Clear all applied filters');

})();