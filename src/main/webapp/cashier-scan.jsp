<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Security check - only cashiers can access
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"CASHIER".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    if (firstName == null) firstName = "Cashier";
    if (lastName == null) lastName = "";
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - QR Scanning & Billing</title>
    
    <!-- External Libraries -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js"></script>
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="css/cashier-scan.css">
</head>
<body>
    <!-- Header -->
    <header class="cashier-header">
        <div class="logo">
            <i class="fas fa-cash-register"></i>
            <h1>Pahana Edu - QR Scanning</h1>
        </div>
        <div class="cashier-info">
            <div class="cashier-name">
                <h3><%= firstName %> <%= lastName %></h3>
                <span>Cashier</span>
            </div>
            <div class="cashier-avatar">
                <i class="fas fa-user"></i>
            </div>
        </div>
    </header>
    
    <!-- Main Content -->
    <div class="main-container">
        <!-- QR Scanning Section -->
        <section class="scan-section">
            <h2 class="section-title">
                <i class="fas fa-qrcode"></i>
                QR Code Scanner
            </h2>
            
            <div class="scanner-controls">
                <button id="startScannerBtn" class="btn btn-primary">
                    <i class="fas fa-camera"></i> Start Scanner
                </button>
                <button id="stopScannerBtn" class="btn btn-secondary hidden">
                    <i class="fas fa-stop"></i> Stop Scanner
                </button>
                <button id="resetBtn" class="btn btn-danger">
                    <i class="fas fa-redo"></i> Reset
                </button>
            </div>
            
            <div class="qr-scanner-container" id="scannerContainer">
                <div class="scanner-overlay" id="scannerOverlay">
                    <i class="fas fa-camera fa-3x" style="margin-bottom: 1rem;"></i>
                    <h3>QR Scanner</h3>
                    <p>Click "Start Scanner" to begin scanning book reference QR codes</p>
                </div>
                <div id="qrReader" style="width: 100%;"></div>
            </div>
            
            <div class="manual-scan">
                <input type="text" id="manualRefInput" placeholder="Enter reference number manually">
                <button id="manualSearchBtn" class="btn btn-primary">
                    <i class="fas fa-search"></i> Search
                </button>
            </div>
            
            <div class="product-info" id="productInfo">
                <!-- Product info will be loaded here dynamically -->
            </div>
        </section>
        
        <!-- Billing Section -->
        <section class="billing-section">
            <div class="bill-header">
                <h2 class="bill-title">Current Bill</h2>
                <button id="newBillBtn" class="btn btn-secondary">
                    <i class="fas fa-receipt"></i> New Bill
                </button>
            </div>
            
            <div class="bill-items" id="billItems">
                <div class="empty-state">
                    <i class="fas fa-receipt" style="font-size: 3rem; color: #cbd5e1; display: block; text-align: center; margin: 2rem 0;"></i>
                    <p style="text-align: center; color: #94a3b8;">No items added to bill</p>
                </div>
            </div>
            
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
            
            <div class="bill-actions">
                <button id="printBillBtn" class="btn btn-success">
                    <i class="fas fa-print"></i> Print Bill
                </button>
                <button id="checkoutBtn" class="btn btn-primary">
                    <i class="fas fa-check-circle"></i> Checkout
                </button>
            </div>
        </section>
    </div>
    
    <!-- JavaScript -->
    <script src="js/cashier-scan.js"></script>
</body>
</html>