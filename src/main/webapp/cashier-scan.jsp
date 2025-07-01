<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    // Security check
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"CASHIER".equals(userRole) && !"ADMIN".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    String contextPath = request.getContextPath();
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Scanner - Pahana Edu</title>
    
    <!-- QR Code Scanner Library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #2d3748;
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 24px;
        }
        
        .user-info {
            font-size: 14px;
        }
        
        .main-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
        }
        
        .scanner-section {
            text-align: center;
        }
        
        .scanner-title {
            font-size: 20px;
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .scanner-controls {
            margin-bottom: 20px;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin: 5px;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5a67d8;
        }
        
        .btn-danger {
            background: #e53e3e;
            color: white;
        }
        
        .btn-danger:hover {
            background: #c53030;
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .scanner-container {
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .scanner-overlay {
            padding: 40px;
            background: #f7fafc;
            text-align: center;
            color: #718096;
        }
        
        .scanner-overlay h3 {
            margin: 15px 0;
            color: #2d3748;
        }
        
        #qrReader {
            width: 100%;
        }
        
        .manual-input {
            margin: 20px 0;
            display: flex;
            gap: 10px;
        }
        
        .manual-input input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
        }
        
        .manual-input input:focus {
            border-color: #667eea;
            outline: none;
        }
        
        .product-info {
            background: #f7fafc;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            display: none;
            border-left: 4px solid #667eea;
        }
        
        .product-info.visible {
            display: block;
        }
        
        .product-title {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .product-price {
            font-size: 24px;
            color: #38a169;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .product-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin: 15px 0;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .detail-label {
            font-weight: 500;
            color: #4a5568;
        }
        
        .detail-value {
            color: #2d3748;
        }
        
        .bill-section {
            background: #f7fafc;
            border-radius: 10px;
            padding: 20px;
        }
        
        .bill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .bill-title {
            font-size: 20px;
            color: #2d3748;
        }
        
        .bill-items {
            min-height: 200px;
            background: white;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .empty-state {
            text-align: center;
            color: #a0aec0;
            padding: 40px 20px;
        }
        
        .bill-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .item-info {
            flex: 1;
        }
        
        .item-name {
            font-weight: 500;
            color: #2d3748;
        }
        
        .item-ref {
            font-size: 12px;
            color: #718096;
        }
        
        .item-price {
            font-weight: bold;
            color: #38a169;
        }
        
        .bill-summary {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .summary-row.total {
            font-size: 18px;
            font-weight: bold;
            border-top: 2px solid #2d3748;
            border-bottom: none;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            min-width: 300px;
        }
        
        .notification.success {
            background: #38a169;
        }
        
        .notification.error {
            background: #e53e3e;
        }
        
        .notification.warning {
            background: #d69e2e;
        }
        
        .notification.info {
            background: #3182ce;
        }
        
        @media (max-width: 768px) {
            .main-content {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .header {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="container">
        <div class="header">
            <h1>📱 QR Scanner - Pahana Edu</h1>
            <div class="user-info">
                <div><%= firstName %> <%= lastName %></div>
                <div><%= userRole %></div>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="main-content">
            <!-- Scanner Section -->
            <div class="scanner-section">
                <h2 class="scanner-title">🔍 QR Code Scanner</h2>
                
                <!-- Scanner Controls -->
                <div class="scanner-controls">
                    <button id="startBtn" class="btn btn-primary">📷 Start Scanner</button>
                    <button id="stopBtn" class="btn btn-danger" style="display: none;">⏹️ Stop Scanner</button>
                </div>
                
                <!-- Scanner Container -->
                <div class="scanner-container">
                    <div id="scannerOverlay" class="scanner-overlay">
                        <div style="font-size: 48px;">📷</div>
                        <h3>QR Scanner Ready</h3>
                        <p>Click "Start Scanner" to begin</p>
                    </div>
                    <div id="qrReader"></div>
                </div>
                
                <!-- Manual Input -->
                <div class="manual-input">
                    <input type="text" id="manualInput" placeholder="Enter reference number..." maxlength="50">
                    <button id="searchBtn" class="btn btn-primary">🔍 Search</button>
                </div>
                
                <!-- Product Info -->
                <div id="productInfo" class="product-info">
                    <!-- Product details will appear here -->
                </div>
            </div>
            
            <!-- Bill Section -->
            <div class="bill-section">
                <div class="bill-header">
                    <h2 class="bill-title">🧾 Current Bill</h2>
                    <button id="newBillBtn" class="btn btn-primary">📄 New Bill</button>
                </div>
                
                <!-- Bill Items -->
                <div id="billItems" class="bill-items">
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 15px;">🛒</div>
                        <p>No items in bill</p>
                        <p style="font-size: 14px; margin-top: 10px;">Scan a QR code to add items</p>
                    </div>
                </div>
                
                <!-- Bill Summary -->
                <div class="bill-summary">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span id="subtotal">₨ 0.00</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax (10%):</span>
                        <span id="tax">₨ 0.00</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total:</span>
                        <span id="total">₨ 0.00</span>
                    </div>
                </div>
                
                <!-- Bill Actions -->
                <div style="display: flex; gap: 10px;">
                    <button id="printBtn" class="btn btn-primary" disabled>🖨️ Print Bill</button>
                    <button id="checkoutBtn" class="btn btn-primary" disabled>💳 Checkout</button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- JavaScript -->
    <script src="<%= contextPath %>/js/cashier-scan.js"></script>
    
    <!-- Hidden system info -->
    <div style="display: none;">
        <span id="contextPath"><%= contextPath %></span>
        <span id="userRole"><%= userRole %></span>
    </div>
</body>
</html>