<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check if user is logged in and is a cashier
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"CASHIER".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    String firstName = (String) session.getAttribute("userFirstName");
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Cashier Dashboard - Pahana Edu</title>
    <!-- External CSS Links -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="css/style.css" rel="stylesheet">
    <link href="css/dashboard.css" rel="stylesheet">
    <link href="css/cashier.css" rel="stylesheet">
</head>
<body>
    <!-- Cashier Header -->
    <header class="header cashier-header" id="header">
        <nav class="nav-container">
            <a href="#" class="logo">
                <i class="fas fa-cash-register"></i>
                Pahana Edu - Cashier
            </a>

            <ul class="nav-menu">
                <li><a href="#dashboard">Dashboard</a></li>
                <li><a href="#billing">Billing</a></li>
                <li><a href="#inventory">Inventory</a></li>
                <li><a href="#customers">Customers</a></li>
                <li><a href="#reports">Reports</a></li>
            </ul>

            <div class="nav-actions logged-in">
                <div class="user-info cashier-info">
                    <div class="user-avatar cashier-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="user-details">
                        <span class="user-name">Cashier: <%= firstName %></span>
                        <span class="user-email"><%= userEmail %></span>
                    </div>
                </div>
                <div class="user-menu">
                    <button class="user-menu-toggle" id="userMenuToggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="#settings" class="dropdown-item">
                            <i class="fas fa-cog"></i>
                            Settings
                        </a>
                        <a href="#shift" class="dropdown-item">
                            <i class="fas fa-clock"></i>
                            Shift Info
                        </a>
                        <a href="#help" class="dropdown-item">
                            <i class="fas fa-question-circle"></i>
                            Help
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="logout.jsp" class="dropdown-item logout">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </div>
                </div>
            </div>

            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </header>

    <!-- Cashier Dashboard Hero -->
    <section class="cashier-hero" id="dashboard">
        <div class="cashier-hero-container">
            <div class="welcome-section">
                <h1 class="welcome-title">Welcome, <%= firstName %>!</h1>
                <p class="welcome-subtitle">Manage sales, inventory, and customer service efficiently.</p>
                <div class="cashier-stats">
                    <div class="stat-card cashier-stat">
                        <div class="stat-icon">
                            <i class="fas fa-rupee-sign"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">₨ 0</span>
                            <span class="stat-label">Today's Sales</span>
                        </div>
                    </div>
                    <div class="stat-card cashier-stat">
                        <div class="stat-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Transactions</span>
                        </div>
                    </div>
                    <div class="stat-card cashier-stat">
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-number">0</span>
                            <span class="stat-label">Customers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Cashier Quick Actions -->
    <section class="cashier-actions">
        <div class="cashier-actions-container">
            <h2 class="section-title">Cashier Operations</h2>
            <div class="actions-grid">
                <div class="action-card cashier-action">
                    <div class="action-icon">
                        <i class="fas fa-cash-register"></i>
                    </div>
                    <h3>New Sale</h3>
                    <p>Process a new sale transaction</p>
                    <a href="#billing" class="action-btn">Start Billing</a>
                </div>
                
                <div class="action-card cashier-action">
                    <div class="action-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>Find Product</h3>
                    <p>Search for books and check availability</p>
                    <a href="#inventory" class="action-btn">Search Books</a>
                </div>
                
                <div class="action-card cashier-action">
                    <div class="action-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                    <h3>Customer Info</h3>
                    <p>Manage customer information and history</p>
                    <a href="#customers" class="action-btn">View Customers</a>
                </div>
                
                <div class="action-card cashier-action">
                    <div class="action-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3>Daily Report</h3>
                    <p>View sales report and statistics</p>
                    <a href="#reports" class="action-btn">View Reports</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Billing Section -->
    <section class="billing-section" id="billing">
        <div class="billing-container">
            <h2 class="section-title">Billing System</h2>
            <div class="billing-interface">
                <div class="product-search">
                    <div class="search-box">
                        <input type="text" id="productSearch" placeholder="Search for books by title, author, or ISBN...">
                        <button class="search-btn"><i class="fas fa-search"></i></button>
                    </div>
                </div>
                
                <div class="billing-content">
                    <div class="bill-items">
                        <h3>Current Bill</h3>
                        <div class="bill-list" id="billList">
                            <div class="empty-bill">
                                <i class="fas fa-receipt"></i>
                                <p>No items in current bill</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bill-summary">
                        <h3>Bill Summary</h3>
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span id="subtotal">₨ 0.00</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax (VAT):</span>
                            <span id="tax">₨ 0.00</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span id="total">₨ 0.00</span>
                        </div>
                        <div class="bill-actions">
                            <button class="btn-clear">Clear Bill</button>
                            <button class="btn-print">Print Bill</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Recent Activities -->
    <section class="cashier-activities">
        <div class="activities-container">
            <h2 class="section-title">Recent Activities</h2>
            <div class="activity-list">
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-sign-in-alt"></i>
                    </div>
                    <div class="activity-content">
                        <h4>Shift Started</h4>
                        <p>You have successfully logged in to the cashier system.</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer cashier-footer">
        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>Pahana Edu - Cashier Portal</h3>
                    <p>Professional billing and inventory management system for cashiers.</p>
                </div>

                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#billing">Billing System</a></li>
                        <li><a href="#inventory">Inventory</a></li>
                        <li><a href="#customers">Customers</a></li>
                        <li><a href="#reports">Reports</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Support</h4>
                    <ul>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Admin</a></li>
                        <li><a href="#">System Status</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>&copy; 2024 Pahana Edu. All rights reserved. | Cashier Portal</p>
            </div>
        </div>
    </footer>

    <!-- Custom JavaScript -->
    <script src="js/script.js"></script>
    <script src="js/dashboard.js"></script>
    <script src="js/cashier.js"></script>

</body>
</html>