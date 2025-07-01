<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Security Check
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userRole = (String) session.getAttribute("userRole");
    if (!"ADMIN".equals(userRole)) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String adminName = (String) session.getAttribute("userName");
    String adminEmail = (String) session.getAttribute("userEmail");
    String firstName = (String) session.getAttribute("userFirstName");
    String lastName = (String) session.getAttribute("userLastName");
    
    if (firstName == null) firstName = "Admin";
    if (lastName == null) lastName = "User";
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pahana Edu - Admin Dashboard</title>
    
    <!-- External CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="css/admin.css" rel="stylesheet">
    <link href="css/admin-direct-bill.css" rel="stylesheet">
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <div class="logo">
                <i class="fas fa-graduation-cap"></i>
                <span class="logo-text">Pahana Edu</span>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle">
                <i class="fas fa-bars"></i>
            </button>
        </div>
        
        <div class="admin-profile">
            <div class="profile-img">
                <i class="fas fa-user-shield"></i>
            </div>
            <div class="profile-info">
                <h4><%= firstName %> <%= lastName %></h4>
                <span>System Administrator</span>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            <ul>
                <li class="nav-item active">
                    <a href="#" class="nav-link" data-page="dashboard">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="customers">
                        <i class="fas fa-users"></i>
                        <span>Customers</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="cashiers">
                        <i class="fas fa-user-tie"></i>
                        <span>Cashiers</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="inventory">
                        <i class="fas fa-boxes"></i>
                        <span>Inventory</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="billing">
                        <i class="fas fa-calculator"></i>
                        <span>Billing</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="reports">
                        <i class="fas fa-chart-bar"></i>
                        <span>Reports</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link" data-page="settings">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="logout.jsp" class="nav-link" onclick="return confirm('Are you sure you want to logout?')">
                        <i class="fas fa-sign-out-alt"></i>
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </nav>
    </aside>
    
    <!-- Main Content -->
    <main class="main-content">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <h1 id="pageTitle">Dashboard</h1>
                <p id="pageSubtitle">Welcome to your admin control panel</p>
            </div>
            <div class="header-right">
                <div class="notifications">
                    <i class="fas fa-bell"></i>
                    <span class="notification-count">3</span>
                </div>
                <div class="admin-info">
                    <span><%= adminEmail %></span>
                    <div class="admin-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Content Area -->
        <div class="content" id="mainContent">
            <!-- DASHBOARD CONTENT -->
            <div class="page-content" id="dashboard-content">
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon customers">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalCustomers">0</h3>
                            <p>Total Customers</p>
                            <span class="stat-change positive">+12% this month</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon books">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalBooks">0</h3>
                            <p>Books in Stock</p>
                            <span class="stat-change positive">+8% this week</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon revenue">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalRevenue">₨ 0</h3>
                            <p>Total Revenue</p>
                            <span class="stat-change positive">+15% this month</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon orders">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-info">
                            <h3 id="totalOrders">0</h3>
                            <p>Total Orders</p>
                            <span class="stat-change negative">-3% this week</span>
                        </div>
                    </div>
                </div>
                
                <!-- Charts Section -->
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Sales Overview</h3>
                            <div class="chart-controls">
                                <select id="salesPeriod">
                                    <option value="7">Last 7 days</option>
                                    <option value="30">Last 30 days</option>
                                    <option value="90">Last 90 days</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-body">
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Book Categories</h3>
                        </div>
                        <div class="chart-body">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Activities & Quick Actions -->
                <div class="dashboard-grid">
                    <div class="activity-panel">
                        <div class="panel-header">
                            <h3>Recent Activities</h3>
                            <a href="#" class="view-all">View All</a>
                        </div>
                        <div class="activity-list" id="activityList">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <div class="activity-content">
                                    <p>New customer registered</p>
                                    <span class="activity-time">2 minutes ago</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-book"></i>
                                </div>
                                <div class="activity-content">
                                    <p>New book added to inventory</p>
                                    <span class="activity-time">15 minutes ago</span>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-receipt"></i>
                                </div>
                                <div class="activity-content">
                                    <p>Invoice generated</p>
                                    <span class="activity-time">1 hour ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="quick-actions-panel">
                        <div class="panel-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div class="quick-actions">
                            <button class="action-btn primary" onclick="showAddCustomerModal()">
                                <i class="fas fa-user-plus"></i>
                                Add Customer
                            </button>
                            <button class="action-btn secondary" onclick="showAddBookModal()">
                                <i class="fas fa-book-medical"></i>
                                Add Book
                            </button>
                            <button class="action-btn success" onclick="generateBill()">
                                <i class="fas fa-calculator"></i>
                                Generate Bill
                            </button>
                            <button class="action-btn info" onclick="viewReports()">
                                <i class="fas fa-chart-bar"></i>
                                View Reports
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- System Status -->
                <div class="system-status">
                    <div class="status-header">
                        <h3>System Status</h3>
                        <span class="status-indicator online">All Systems Operational</span>
                    </div>
                    <div class="status-grid">
                        <div class="status-item">
                            <div class="status-icon">
                                <i class="fas fa-server"></i>
                            </div>
                            <div class="status-details">
                                <h4>Server</h4>
                                <p>Running smoothly</p>
                                <div class="status-bar">
                                    <div class="status-fill" style="width: 95%"></div>
                                </div>
                                <span>95% Uptime</span>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon">
                                <i class="fas fa-database"></i>
                            </div>
                            <div class="status-details">
                                <h4>Database</h4>
                                <p>Connected</p>
                                <div class="status-bar">
                                    <div class="status-fill" style="width: 88%"></div>
                                </div>
                                <span>88% Performance</span>
                            </div>
                        </div>
                        <div class="status-item">
                            <div class="status-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="status-details">
                                <h4>Security</h4>
                                <p>All secure</p>
                                <div class="status-bar">
                                    <div class="status-fill" style="width: 100%"></div>
                                </div>
                                <span>100% Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- CUSTOMERS CONTENT -->
            <div class="page-content" id="customers-content" style="display: none;">
                <div class="content-header">
                    <h2>Customer Management</h2>
                    <button class="btn-primary" onclick="showAddCustomerModal()">
                        <i class="fas fa-plus"></i> Add Customer
                    </button>
                </div>
                <div class="table-container">
                    <table class="data-table" id="customersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Customer data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- CASHIERS CONTENT -->
            <div class="page-content" id="cashiers-content" style="display: none;">
                <div class="content-header">
                    <h2>Cashier Management</h2>
                    <button class="btn-primary" onclick="showAddCashierModal()">
                        <i class="fas fa-plus"></i> Add Cashier
                    </button>
                </div>
                <div class="table-container">
                    <table class="data-table" id="cashiersTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Cashier data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- INVENTORY CONTENT -->
            <div class="page-content" id="inventory-content" style="display: none;">
                <div class="content-header">
                    <h2>Inventory Management</h2>
                    <div class="header-actions">
                        <button class="btn-primary" onclick="showAddBookModal()">
                            <i class="fas fa-plus"></i> Add Book
                        </button>
                        <form action="book-references.jsp" method="get" style="display: inline; margin-left: 10px;">
                            <button type="submit" class="btn-secondary">
                                <i class="fas fa-book"></i> Book References
                            </button>
                        </form>
                    </div>
                </div>
                
                <!-- Stats Summary for Inventory -->
                <div class="inventory-stats">
                    <div class="stat-item">
                        <span class="stat-label">Total Books:</span>
                        <span class="stat-value" id="inventoryTotalBooks">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Low Stock:</span>
                        <span class="stat-value warning" id="inventoryLowStock">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Out of Stock:</span>
                        <span class="stat-value danger" id="inventoryOutOfStock">0</span>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="data-table" id="booksTable">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Author</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Book data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- BILLING CONTENT -->
            <div class="page-content" id="billing-content" style="display: none;">
                <div class="content-header">
                    <h2>Billing Management</h2>
                    <div class="billing-tabs">
                        <button class="tab-btn active" id="shoppingTabBtn" onclick="switchBillingTab('shopping')">
                            <i class="fas fa-shopping-cart"></i> Direct Shopping
                        </button>
                        <button class="tab-btn" id="onlineTabBtn" onclick="switchBillingTab('online')">
                            <i class="fas fa-globe"></i> Online Billing
                        </button>
                    </div>
                </div>

                <!-- Direct Shopping Tab -->
                <div class="billing-tab-content" id="shopping-billing" style="display: block;">
                    <div class="billing-stats">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-receipt"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalBills">0</h3>
                                <p>Total Bills</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="totalRevenueBilling">₨ 0</h3>
                                <p>Total Revenue</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="stat-info">
                                <h3 id="todayBills">0</h3>
                                <p>Today's Bills</p>
                            </div>
                        </div>
                    </div>

                    <div class="table-container">
                        <div class="table-header">
                            <h3>Direct Shopping Bills (Cashier Generated)</h3>
                            <div class="table-filters">
                                <input type="date" id="billDateFilter" placeholder="Filter by date">
                                <select id="paymentMethodFilter">
                                    <option value="">All Payment Methods</option>
                                    <option value="CASH">Cash</option>
                                    <option value="CARD">Card</option>
                                </select>
                                <select id="cashierFilter">
                                    <option value="">All Cashiers</option>
                                </select>
                                <button class="btn-primary" onclick="filterBills()">
                                    <i class="fas fa-filter"></i> Filter
                                </button>
                                <button class="btn-secondary" onclick="clearFilters()">
                                    <i class="fas fa-times"></i> Clear
                                </button>
                            </div>
                        </div>
                        <table class="data-table" id="billsTable">
                            <thead>
                                <tr>
                                    <th>Bill No</th>
                                    <th>Cashier</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Items</th>
                                    <th>Payment</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Bills data will be loaded here -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Export Options -->
                    <div class="export-section">
                        <h4>Export Data</h4>
                        <div class="export-buttons">
                            <button class="btn-success" onclick="exportToExcel()">
                                <i class="fas fa-file-excel"></i> Export to Excel
                            </button>
                            <button class="btn-info" onclick="exportToPDF()">
                                <i class="fas fa-file-pdf"></i> Export to PDF
                            </button>
                            <button class="btn-warning" onclick="printReport()">
                                <i class="fas fa-print"></i> Print Report
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Online Billing Tab -->
                <div class="billing-tab-content" id="online-billing" style="display: none;">
                    <div class="online-billing-container">
                        <div class="coming-soon-section">
                            <div class="coming-soon-content">
                                <i class="fas fa-globe-americas"></i>
                                <h3>Online Billing System</h3>
                                <p>Complete e-commerce and online ordering system</p>
                                <div class="features-preview">
                                    <div class="feature-item">
                                        <i class="fas fa-shopping-cart"></i>
                                        <span>Online Store Integration</span>
                                    </div>
                                    <div class="feature-item">
                                        <i class="fas fa-credit-card"></i>
                                        <span>Payment Gateway</span>
                                    </div>
                                    <div class="feature-item">
                                        <i class="fas fa-truck"></i>
                                        <span>Delivery Management</span>
                                    </div>
                                    <div class="feature-item">
                                        <i class="fas fa-users"></i>
                                        <span>Customer Portal</span>
                                    </div>
                                    <div class="feature-item">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Mobile App Integration</span>
                                    </div>
                                    <div class="feature-item">
                                        <i class="fas fa-chart-line"></i>
                                        <span>Advanced Analytics</span>
                                    </div>
                                </div>
                                <div class="development-status">
                                    <span class="status-badge coming-soon">Coming Soon</span>
                                    <p>This feature is under development and will be available in future updates.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Placeholder for Future Online Billing Components -->
                        <div class="online-components-placeholder" style="display: none;">
                            <div class="online-store-section">
                                <h4>Online Store Management</h4>
                                <!-- Content will be added later -->
                            </div>
                            <div class="customer-orders-section">
                                <h4>Customer Orders</h4>
                                <!-- Content will be added later -->
                            </div>
                            <div class="payment-processing-section">
                                <h4>Payment Processing</h4>
                                <!-- Content will be added later -->
                            </div>
                            <div class="delivery-management-section">
                                <h4>Delivery Management</h4>
                                <!-- Content will be added later -->
                            </div>
                            <div class="online-analytics-section">
                                <h4>Online Analytics</h4>
                                <!-- Content will be added later -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- REPORTS CONTENT -->
            <div class="page-content" id="reports-content" style="display: none;">
                <div class="reports-container">
                    <h2>Reports & Analytics</h2>
                    <div class="report-cards">
                        <div class="report-card">
                            <h3>Sales Report</h3>
                            <p>Detailed sales analysis</p>
                            <button class="btn-primary">Generate</button>
                        </div>
                        <div class="report-card">
                            <h3>Customer Report</h3>
                            <p>Customer activity report</p>
                            <button class="btn-primary">Generate</button>
                        </div>
                        <div class="report-card">
                            <h3>Inventory Report</h3>
                            <p>Stock and inventory analysis</p>
                            <button class="btn-primary">Generate</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- SETTINGS CONTENT -->
            <div class="page-content" id="settings-content" style="display: none;">
                <div class="settings-container">
                    <h2>System Settings</h2>
                    <div class="settings-grid">
                        <div class="setting-group">
                            <h3>General Settings</h3>
                            <div class="setting-item">
                                <label>Company Name</label>
                                <input type="text" value="Pahana Edu" />
                            </div>
                            <div class="setting-item">
                                <label>Currency</label>
                                <select>
                                    <option value="LKR">Sri Lankan Rupee (LKR)</option>
                                </select>
                            </div>
                        </div>
                        <div class="setting-group">
                            <h3>Security Settings</h3>
                            <div class="setting-item">
                                <label>Auto Logout (minutes)</label>
                                <input type="number" value="30" />
                            </div>
                            <div class="setting-item">
                                <label>Two-Factor Authentication</label>
                                <label class="toggle">
                                    <input type="checkbox" />
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    
    <!-- Modal -->
    <div class="modal" id="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modalTitle">Modal Title</h3>
                <button class="modal-close" onclick="closeModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Modal content will be loaded here -->
            </div>
        </div>
    </div>
    
    <!-- External Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    
    <!-- Admin Dashboard Modular JavaScript Files -->
    <script src="js/admin/admin-styles.js"></script>
    <script src="js/admin/admin-core.js"></script>
    <script src="js/admin/admin-stats.js"></script>
    <script src="js/admin/admin-charts.js"></script>
    <script src="js/admin/admin-customers.js"></script>
    <script src="js/admin/admin-cashiers.js"></script>
    <script src="js/admin/admin-inventory.js"></script>
    <script src="js/admin/admin-billin.js"></script>
    <script src="js/admin/admin-direct-billing.js"></script>
    
    <!-- Global Function Wrapper Script -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                if (window.adminCore) {
                    window.navigateToPage = window.adminCore.navigateToPage;
                    window.loadAllData = window.adminCore.loadAllData;
                    window.makeApiCall = window.adminCore.makeApiCall;
                    window.showNotification = window.adminCore.showNotification;
                    window.showModal = window.adminCore.showModal;
                    window.closeModal = window.adminCore.closeModal;
                    window.data = window.adminCore.data;
                    window.currentPage = window.adminCore.currentPage;
                }
                
                if (window.adminStats) {
                    window.loadStats = window.adminStats.loadStats;
                    window.updateStats = window.adminStats.updateStats;
                    window.updateInventoryStats = window.adminStats.updateInventoryStats;
                    window.updateInventoryStatsFromBooks = window.adminStats.updateInventoryStatsFromBooks;
                    window.viewReports = window.adminStats.viewReports;
                }
                
                if (window.adminCharts) {
                    window.initializeCharts = window.adminCharts.initializeCharts;
                    window.updateSalesChart = window.adminCharts.updateSalesChart;
                    window.updateCategoryChart = window.adminCharts.updateCategoryChart;
                    window.loadCategoriesWithBookCount = window.adminCharts.loadCategoriesWithBookCount;
                }
                
                if (window.adminCustomers) {
                    window.loadCustomers = window.adminCustomers.loadCustomers;
                    window.displayCustomers = window.adminCustomers.displayCustomers;
                    window.showAddCustomerModal = window.adminCustomers.showAddCustomerModal;
                    window.editCustomer = window.adminCustomers.editCustomer;
                    window.deleteCustomer = window.adminCustomers.deleteCustomer;
                }
                
                if (window.adminCashiers) {
                    window.loadCashiers = window.adminCashiers.loadCashiers;
                    window.displayCashiers = window.adminCashiers.displayCashiers;
                    window.showAddCashierModal = window.adminCashiers.showAddCashierModal;
                    window.editCashier = window.adminCashiers.editCashier;
                    window.deleteCashier = window.adminCashiers.deleteCashier;
                }
                
                if (window.adminInventory) {
                    window.loadBooks = window.adminInventory.loadBooks;
                    window.loadCategories = window.adminInventory.loadCategories;
                    window.displayBooks = window.adminInventory.displayBooks;
                    window.viewBookDetails = window.adminInventory.viewBookDetails;
                    window.showAddBookModal = window.adminInventory.showAddBookModal;
                    window.editBook = window.adminInventory.editBook;
                    window.deleteBook = window.adminInventory.deleteBook;
                    window.changeMainImage = window.adminInventory.changeMainImage;
                }
                
                if (window.adminBilling) {
                    window.initializeBillingSystem = window.adminBilling.initializeBillingSystem;
                    window.addBillItem = window.adminBilling.addBillItem;
                    window.removeBillItem = window.adminBilling.removeBillItem;
                    window.updateBillItemPrice = window.adminBilling.updateBillItemPrice;
                    window.updateBillItemTotal = window.adminBilling.updateBillItemTotal;
                    window.updateBillTotal = window.adminBilling.updateBillTotal;
                    window.generateBill = window.adminBilling.generateBill;
                    window.calculateBill = window.adminBilling.calculateBill;
                    window.printBill = window.adminBilling.printBill;
                    window.clearBill = window.adminBilling.clearBill;
                }
                
                console.log('🎯 All admin dashboard modules loaded and functions made globally available');
                console.log('📋 Available global functions:', Object.keys(window).filter(key => 
                    typeof window[key] === 'function' && 
                    (key.includes('load') || key.includes('show') || key.includes('edit') || 
                     key.includes('delete') || key.includes('add') || key.includes('generate') ||
                     key.includes('update') || key.includes('navigate') || key.includes('view'))
                ));
            }, 100);
        });
    </script>
</body>
</html>