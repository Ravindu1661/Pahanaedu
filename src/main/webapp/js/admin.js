// ==============================================================================
// PAHANA EDU - ADMIN DASHBOARD JAVASCRIPT (FULLY UPDATED)
// Added phone number and status fields for customers and cashiers
// ==============================================================================

// Global Variables
let currentPage = 'dashboard';
let sidebarCollapsed = false;
let charts = {};
let data = {
    customers: [],
    cashiers: [],
    books: [],
    bills: [],
    stats: {
        totalCustomers: 0,
        totalCashiers: 0,
        totalBooks: 0,
        totalRevenue: 0,
        totalOrders: 0
    }
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Pahana Edu Admin Dashboard - Initializing...');
    
    initializeEventListeners();
    initializeCharts();
    
    // Load all data on initial load
    loadAllData();
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Admin Dashboard loaded successfully!', 'success');
    }, 1000);
    
    console.log('✅ Admin Dashboard initialized successfully');
});

// ==============================================================================
// LOAD ALL DATA FUNCTION
// ==============================================================================

function loadAllData() {
    console.log('📊 Loading all initial data...');
    
    // Load all data simultaneously
    Promise.all([
        loadStats(),
        loadCustomers(),
        loadCashiers(),
        loadInitialData()
    ]).then(() => {
        console.log('✅ All data loaded successfully');
        updateAllDisplays();
    }).catch(error => {
        console.error('❌ Failed to load initial data:', error);
        showNotification('Failed to load some data. Please refresh the page.', 'error');
    });
}

// ==============================================================================
// UPDATE ALL DISPLAYS AFTER DATA LOAD
// ==============================================================================

function updateAllDisplays() {
    updateStats();
    
    // Update displays if we're on the respective pages
    if (currentPage === 'customers') {
        displayCustomers();
    }
    if (currentPage === 'cashiers') {
        displayCashiers();
    }
    if (currentPage === 'inventory') {
        loadBooks();
    }
}

// ==============================================================================
// NAVIGATION
// ==============================================================================

function navigateToPage(page) {
    console.log(`🔄 Navigating to: ${page}`);
    
    // Update active navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('.nav-link');
        if (link && link.getAttribute('data-page') === page) {
            item.classList.add('active');
        }
    });
    
    // Hide all page contents
    const pageContents = document.querySelectorAll('.page-content');
    pageContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected page content
    const targetContent = document.getElementById(page + '-content');
    if (targetContent) {
        targetContent.style.display = 'block';
    }
    
    // Update page title and subtitle
    updatePageTitle(page);
    
    // Load page-specific data and ensure display
    loadPageData(page);
    
    currentPage = page;
    console.log(`📍 Successfully navigated to: ${page}`);
}

function loadPageData(page) {
    console.log(`📊 Loading data for page: ${page}`);
    
    switch(page) {
        case 'customers':
            if (data.customers.length > 0) {
                displayCustomers();
            } else {
                loadCustomers();
            }
            break;
        case 'cashiers':
            if (data.cashiers.length > 0) {
                displayCashiers();
            } else {
                loadCashiers();
            }
            break;
        case 'inventory':
            loadBooks();
            break;
        case 'billing':
            initializeBillingSystem();
            break;
        case 'reports':
            loadReports();
            break;
        case 'dashboard':
            updateStats();
            break;
    }
}

// ==============================================================================
// BACKEND API CALLS
// ==============================================================================

function makeApiCall(url, options = {}) {
    console.log(`🌐 Making API call to: ${url}`);
    
    return fetch(url, {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            ...options.headers
        },
        body: options.body
    })
    .then(response => {
        console.log(`📡 API Response status: ${response.status}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📦 API Response data:', data);
        return data;
    })
    .catch(error => {
        console.error('❌ API call failed:', error);
        showNotification('Network error: ' + error.message, 'error');
        throw error;
    });
}

function loadStats() {
    console.log('📊 Loading stats...');
    
    return makeApiCall('admin?action=getStats')
        .then(response => {
            console.log('📊 Stats response:', response);
            
            // Handle different response formats
            if (response.totalCustomers !== undefined) {
                data.stats = {
                    totalCustomers: response.totalCustomers || 0,
                    totalCashiers: response.totalCashiers || 0,
                    totalUsers: response.totalUsers || 0,
                    totalBooks: data.books.length || 0,
                    totalRevenue: 125000,
                    totalOrders: 48
                };
            } else if (response.success && response.data) {
                data.stats = {
                    totalCustomers: response.data.totalCustomers || 0,
                    totalCashiers: response.data.totalCashiers || 0,
                    totalUsers: response.data.totalUsers || 0,
                    totalBooks: data.books.length || 0,
                    totalRevenue: 125000,
                    totalOrders: 48
                };
            }
            
            console.log('✅ Stats loaded:', data.stats);
            updateStats();
            return data.stats;
        })
        .catch(error => {
            console.error('❌ Failed to load stats:', error);
            data.stats = {
                totalCustomers: 0,
                totalCashiers: 0,
                totalUsers: 0,
                totalBooks: 0,
                totalRevenue: 0,
                totalOrders: 0
            };
            updateStats();
            return data.stats;
        });
}

// ==============================================================================
// CUSTOMER MANAGEMENT (UPDATED)
// ==============================================================================

function loadCustomers() {
    console.log('👥 Loading customers...');
    
    return makeApiCall('admin?action=getCustomers')
        .then(response => {
            console.log('👥 Customers response:', response);
            
            // Handle different response formats
            let customers = [];
            if (Array.isArray(response)) {
                customers = response;
            } else if (response.success && Array.isArray(response.data)) {
                customers = response.data;
            } else if (response.data && Array.isArray(response.data)) {
                customers = response.data;
            }
            
            data.customers = customers;
            console.log(`✅ Loaded ${customers.length} customers`);
            
            if (currentPage === 'customers') {
                displayCustomers();
            }
            
            return customers;
        })
        .catch(error => {
            console.error('❌ Failed to load customers:', error);
            data.customers = [];
            if (currentPage === 'customers') {
                displayCustomers();
            }
            return [];
        });
}

function displayCustomers() {
    console.log('🎨 Displaying customers...');
    
    const tableBody = document.querySelector('#customersTable tbody');
    if (!tableBody) {
        console.error('❌ Customers table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (data.customers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">
                <i class="fas fa-users" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                No customers found. <a href="#" onclick="showAddCustomerModal()" style="color: #2563eb;">Add the first customer</a>
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.customers.forEach((customer, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.firstName} ${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone || '-'}</td>
                <td>
                    <span class="badge ${customer.status === 'active' ? 'active' : 'inactive'}">
                        ${customer.status || 'active'}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-info" onclick="editCustomer(${customer.id})" title="Edit Customer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteCustomer(${customer.id})" title="Delete Customer">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    console.log(`✅ Displayed ${data.customers.length} customers`);
}

// ==============================================================================
// CASHIER MANAGEMENT (UPDATED)
// ==============================================================================

function loadCashiers() {
    console.log('👔 Loading cashiers...');
    
    return makeApiCall('admin?action=getCashiers')
        .then(response => {
            console.log('👔 Cashiers response:', response);
            
            // Handle different response formats
            let cashiers = [];
            if (Array.isArray(response)) {
                cashiers = response;
            } else if (response.success && Array.isArray(response.data)) {
                cashiers = response.data;
            } else if (response.data && Array.isArray(response.data)) {
                cashiers = response.data;
            }
            
            data.cashiers = cashiers;
            console.log(`✅ Loaded ${cashiers.length} cashiers`);
            
            if (currentPage === 'cashiers') {
                displayCashiers();
            }
            
            return cashiers;
        })
        .catch(error => {
            console.error('❌ Failed to load cashiers:', error);
            data.cashiers = [];
            if (currentPage === 'cashiers') {
                displayCashiers();
            }
            return [];
        });
}

function displayCashiers() {
    console.log('🎨 Displaying cashiers...');
    
    const tableBody = document.querySelector('#cashiersTable tbody');
    if (!tableBody) {
        console.error('❌ Cashiers table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (data.cashiers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">
                <i class="fas fa-user-tie" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                No cashiers found. <a href="#" onclick="showAddCashierModal()" style="color: #2563eb;">Add the first cashier</a>
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.cashiers.forEach((cashier, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${cashier.id}</td>
                <td>${cashier.firstName} ${cashier.lastName}</td>
                <td>${cashier.email}</td>
                <td>${cashier.phone || '-'}</td>
                <td>
                    <span class="badge ${cashier.status === 'active' ? 'active' : 'inactive'}">
                        ${cashier.status || 'active'}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-info" onclick="editCashier(${cashier.id})" title="Edit Cashier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteCashier(${cashier.id})" title="Delete Cashier">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    console.log(`✅ Displayed ${data.cashiers.length} cashiers`);
}

// ==============================================================================
// CHARTS INITIALIZATION
// ==============================================================================

function initializeCharts() {
    initializeSalesChart();
    initializeCategoryChart();
    console.log('📊 Charts initialized');
}

function initializeSalesChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'Sales',
            data: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
        }]
    };
    
    charts.salesChart = new Chart(ctx, {
        type: 'line',
        data: salesData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        callback: function(value) {
                            return '₨ ' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            elements: {
                point: {
                    radius: 6,
                    hoverRadius: 8
                }
            }
        }
    });
}

function initializeCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const categoryData = {
        labels: ['Programming', 'Mathematics', 'Science', 'Literature', 'History'],
        datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
                '#2563eb',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6'
            ],
            borderWidth: 0
        }]
    };
    
    charts.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: categoryData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function updateSalesChart(period) {
    if (!charts.salesChart) return;
    
    // Simulate different data based on period
    let newData;
    switch(period) {
        case '7':
            newData = [5000, 7000, 6000, 8000, 9000, 7500, 8500];
            charts.salesChart.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            break;
        case '30':
            newData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
            charts.salesChart.data.labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            newData = newData.slice(0, 4);
            break;
        case '90':
            newData = [45000, 55000, 48000, 62000, 58000, 70000];
            charts.salesChart.data.labels = ['Month 1', 'Month 2', 'Month 3'];
            newData = newData.slice(0, 3);
            break;
        default:
            newData = [12000, 19000, 15000, 25000, 22000, 30000, 28000];
            charts.salesChart.data.labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    }
    
    charts.salesChart.data.datasets[0].data = newData;
    charts.salesChart.update();
}

// ==============================================================================
// DATA MANAGEMENT
// ==============================================================================

function loadInitialData() {
    // Load dummy book data
    data.books = [
        { id: 1, title: 'Advanced Programming', author: 'John Smith', category: 'Programming', price: 2500, stock: 15 },
        { id: 2, title: 'Mathematics Fundamentals', author: 'Sarah Davis', category: 'Mathematics', price: 1800, stock: 22 },
        { id: 3, title: 'Physics Concepts', author: 'Michael Wilson', category: 'Science', price: 2200, stock: 18 },
        { id: 4, title: 'English Literature', author: 'Emma Thompson', category: 'Literature', price: 1500, stock: 25 }
    ];
    
    console.log('📊 Initial book data loaded');
    return Promise.resolve(data.books);
}

function updateStats() {
    console.log('📊 Updating stats display...');
    
    const totalCustomers = document.getElementById('totalCustomers');
    const totalBooks = document.getElementById('totalBooks');
    const totalRevenue = document.getElementById('totalRevenue');
    const totalOrders = document.getElementById('totalOrders');
    
    if (totalCustomers) {
        totalCustomers.textContent = data.stats.totalCustomers || 0;
    }
    if (totalBooks) {
        totalBooks.textContent = data.stats.totalBooks || data.books.length || 0;
    }
    if (totalRevenue) {
        totalRevenue.textContent = '₨ ' + (data.stats.totalRevenue || 0).toLocaleString();
    }
    if (totalOrders) {
        totalOrders.textContent = data.stats.totalOrders || 0;
    }
}

// ==============================================================================
// EVENT LISTENERS
// ==============================================================================

function initializeEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                if (page) {
                    navigateToPage(page);
                }
            }
        });
    });
    
    // Modal close on overlay click
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Sales period change
    const salesPeriod = document.getElementById('salesPeriod');
    if (salesPeriod) {
        salesPeriod.addEventListener('change', function() {
            updateSalesChart(this.value);
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey) {
            switch(e.key) {
                case 'd':
                case 'D':
                    e.preventDefault();
                    navigateToPage('dashboard');
                    break;
                case 'c':
                case 'C':
                    e.preventDefault();
                    navigateToPage('customers');
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    navigateToPage('inventory');
                    break;
                case 'b':
                case 'B':
                    e.preventDefault();
                    navigateToPage('billing');
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    navigateToPage('reports');
                    break;
            }
        }
    });
    
    console.log('✅ Event listeners initialized');
}

// ==============================================================================
// SIDEBAR FUNCTIONS
// ==============================================================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    sidebarCollapsed = !sidebarCollapsed;
    
    // Update charts on sidebar toggle
    setTimeout(() => {
        if (charts.salesChart) {
            charts.salesChart.resize();
        }
        if (charts.categoryChart) {
            charts.categoryChart.resize();
        }
    }, 300);
}

function updatePageTitle(page) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Welcome to your admin control panel' },
        customers: { title: 'Customer Management', subtitle: 'Manage customer accounts and information' },
        cashiers: { title: 'Cashier Management', subtitle: 'Manage cashier accounts and permissions' },
        inventory: { title: 'Inventory Management', subtitle: 'Manage books and stock levels' },
        billing: { title: 'Billing System', subtitle: 'Create and manage customer bills' },
        reports: { title: 'Reports & Analytics', subtitle: 'View business reports and analytics' },
        settings: { title: 'System Settings', subtitle: 'Configure system preferences' }
    };
    
    const pageInfo = titles[page] || titles.dashboard;
    
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    if (pageTitle) pageTitle.textContent = pageInfo.title;
    if (pageSubtitle) pageSubtitle.textContent = pageInfo.subtitle;
}

// ==============================================================================
// CUSTOMER MODAL FUNCTIONS (UPDATED)
// ==============================================================================

function showAddCustomerModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Add New Customer';
    modalBody.innerHTML = `
        <form id="customerForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="customerFirstName" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="customerLastName" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="customerEmail" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="customerPhone">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="customerStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="customerPassword" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Customer</button>
            </div>
        </form>
    `;
    
    showModal();
    
    // Handle form submission
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new URLSearchParams();
        formData.append('action', 'addCustomer');
        formData.append('firstName', document.getElementById('customerFirstName').value);
        formData.append('lastName', document.getElementById('customerLastName').value);
        formData.append('email', document.getElementById('customerEmail').value);
        formData.append('phone', document.getElementById('customerPhone').value);
        formData.append('status', document.getElementById('customerStatus').value);
        formData.append('password', document.getElementById('customerPassword').value);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                closeModal();
                loadCustomers();
                loadStats();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to add customer', 'error');
        });
    });
}

function editCustomer(id) {
    const customer = data.customers.find(c => c.id === id);
    if (!customer) {
        showNotification('Customer not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Edit Customer';
    modalBody.innerHTML = `
        <form id="customerForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="customerFirstName" value="${customer.firstName}" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="customerLastName" value="${customer.lastName}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="customerEmail" value="${customer.email}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="customerPhone" value="${customer.phone || ''}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="customerStatus">
                    <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Customer</button>
            </div>
        </form>
    `;
    
    showModal();
    
    // Handle form submission
    document.getElementById('customerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new URLSearchParams();
        formData.append('action', 'updateUser');
        formData.append('id', id);
        formData.append('firstName', document.getElementById('customerFirstName').value);
        formData.append('lastName', document.getElementById('customerLastName').value);
        formData.append('email', document.getElementById('customerEmail').value);
        formData.append('phone', document.getElementById('customerPhone').value);
        formData.append('status', document.getElementById('customerStatus').value);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                closeModal();
                loadCustomers();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to update customer', 'error');
        });
    });
}

function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        const formData = new URLSearchParams();
        formData.append('action', 'deleteUser');
        formData.append('id', id);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                loadCustomers();
                loadStats();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to delete customer', 'error');
        });
    }
}

// ==============================================================================
// CASHIER MODAL FUNCTIONS (UPDATED)
// ==============================================================================

function showAddCashierModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Add New Cashier';
    modalBody.innerHTML = `
        <form id="cashierForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="cashierFirstName" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="cashierLastName" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="cashierEmail" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="cashierPhone">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="cashierStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" id="cashierPassword" required>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Cashier</button>
            </div>
        </form>
    `;
    
    showModal();
    
    // Handle form submission
    document.getElementById('cashierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new URLSearchParams();
        formData.append('action', 'addCashier');
        formData.append('firstName', document.getElementById('cashierFirstName').value);
        formData.append('lastName', document.getElementById('cashierLastName').value);
        formData.append('email', document.getElementById('cashierEmail').value);
        formData.append('phone', document.getElementById('cashierPhone').value);
        formData.append('status', document.getElementById('cashierStatus').value);
        formData.append('password', document.getElementById('cashierPassword').value);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                closeModal();
                loadCashiers();
                loadStats();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to add cashier', 'error');
        });
    });
}

function editCashier(id) {
    const cashier = data.cashiers.find(c => c.id === id);
    if (!cashier) {
        showNotification('Cashier not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Edit Cashier';
    modalBody.innerHTML = `
        <form id="cashierForm">
            <div class="form-group">
                <label>First Name</label>
                <input type="text" id="cashierFirstName" value="${cashier.firstName}" required>
            </div>
            <div class="form-group">
                <label>Last Name</label>
                <input type="text" id="cashierLastName" value="${cashier.lastName}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="cashierEmail" value="${cashier.email}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="cashierPhone" value="${cashier.phone || ''}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="cashierStatus">
                    <option value="active" ${cashier.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${cashier.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Cashier</button>
            </div>
        </form>
    `;
    
    showModal();
    
    // Handle form submission
    document.getElementById('cashierForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new URLSearchParams();
        formData.append('action', 'updateUser');
        formData.append('id', id);
        formData.append('firstName', document.getElementById('cashierFirstName').value);
        formData.append('lastName', document.getElementById('cashierLastName').value);
        formData.append('email', document.getElementById('cashierEmail').value);
        formData.append('phone', document.getElementById('cashierPhone').value);
        formData.append('status', document.getElementById('cashierStatus').value);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                closeModal();
                loadCashiers();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to update cashier', 'error');
        });
    });
}

function deleteCashier(id) {
    if (confirm('Are you sure you want to delete this cashier?')) {
        const formData = new URLSearchParams();
        formData.append('action', 'deleteUser');
        formData.append('id', id);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                loadCashiers();
                loadStats();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to delete cashier', 'error');
        });
    }
}

// ==============================================================================
// INVENTORY MANAGEMENT
// ==============================================================================

function loadBooks() {
    const tableBody = document.querySelector('#booksTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    data.books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>₨ ${book.price.toLocaleString()}</td>
            <td>${book.stock}</td>
            <td>
                <button class="btn-sm btn-info" onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-sm btn-danger" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showAddBookModal() {
    showNotification('Book management will be implemented in the next phase', 'info');
}

function editBook(id) {
    showNotification('Book editing will be implemented in the next phase', 'info');
}

function deleteBook(id) {
    showNotification('Book deletion will be implemented in the next phase', 'info');
}

// ==============================================================================
// BILLING SYSTEM
// ==============================================================================

function initializeBillingSystem() {
    const billingCustomer = document.getElementById('billingCustomer');
    const billingDate = document.getElementById('billingDate');
    
    if (billingCustomer && data.customers.length > 0) {
        billingCustomer.innerHTML = '<option value="">Select Customer</option>';
        data.customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.firstName} ${customer.lastName}`;
            billingCustomer.appendChild(option);
        });
    }
    
    if (billingDate) {
        billingDate.value = new Date().toISOString().split('T')[0];
    }
}

function generateBill() {
    const customerId = document.getElementById('billingCustomer').value;
    const date = document.getElementById('billingDate').value;
    
    if (!customerId || !date) {
        showNotification('Please select customer and date', 'warning');
        return;
    }
    
    // Simulate bill generation
    const total = Math.floor(Math.random() * 5000) + 1000;
    document.getElementById('billTotal').textContent = '₨ ' + total.toLocaleString();
    
    showNotification('Bill calculated successfully!', 'success');
}

function calculateBill() {
    generateBill();
}

function printBill() {
    const customerId = document.getElementById('billingCustomer').value;
    if (!customerId) {
        showNotification('Please generate a bill first', 'warning');
        return;
    }
    
    showNotification('Bill sent to printer!', 'success');
    
    // Update stats
    data.stats.totalOrders++;
    updateStats();
}

// ==============================================================================
// REPORTS
// ==============================================================================

function loadReports() {
    console.log('📊 Loading reports...');
}

function viewReports() {
    navigateToPage('reports');
}

// ==============================================================================
// MODAL MANAGEMENT
// ==============================================================================

function showModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// ==============================================================================
// NOTIFICATIONS
// ==============================================================================

function showNotification(message, type = 'info') {
    console.log(`🔔 Notification: ${message} (${type})`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#06b6d4';
    }
}

// ==============================================================================
// DEBUGGING FUNCTIONS
// ==============================================================================

function debugDataState() {
    console.log('🐛 Current Data State:');
    console.log('├── Customers:', data.customers.length);
    console.log('├── Cashiers:', data.cashiers.length);
    console.log('├── Books:', data.books.length);
    console.log('├── Stats:', data.stats);
    console.log('└── Current Page:', currentPage);
}

function refreshAllData() {
    console.log('🔄 Refreshing all data...');
    loadAllData();
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        margin-left: 15px;
    }
    .badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }
    .badge.active {
        background: #10b981;
        color: white;
    }
    .badge.inactive {
        background: #ef4444;
        color: white;
    }
    .btn-sm {
        padding: 6px 12px;
        margin: 0 2px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }
    .btn-info {
        background: #06b6d4;
        color: white;
    }
    .btn-danger {
        background: #ef4444;
        color: white;
    }
    .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    .btn-secondary {
        background: #64748b;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
    }
    .form-group {
        margin-bottom: 15px;
    }
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
    }
    .form-group input, .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-sizing: border-box;
    }
`;
document.head.appendChild(style);

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

// Console logging for debugging
console.log('🎯 Admin Dashboard Functions Available:');
console.log('├── Navigation: navigateToPage(page)');
console.log('├── Data Loading: loadAllData(), loadCustomers(), loadCashiers()');
console.log('├── Customers: showAddCustomerModal(), editCustomer(id), deleteCustomer(id)');
console.log('├── Cashiers: showAddCashierModal(), editCashier(id), deleteCashier(id)');
console.log('├── Books: showAddBookModal(), editBook(id), deleteBook(id)');
console.log('├── Billing: generateBill(), calculateBill(), printBill()');
console.log('├── Debug: debugDataState(), refreshAllData()');
console.log('└── Utilities: showNotification(message, type), showModal(), closeModal()');

console.log('⌨️  Keyboard Shortcuts:');
console.log('├── Ctrl+Alt+D: Dashboard');
console.log('├── Ctrl+Alt+C: Customers');
console.log('├── Ctrl+Alt+I: Inventory');
console.log('├── Ctrl+Alt+B: Billing');
console.log('└── Ctrl+Alt+R: Reports');

// Export functions for global access
window.adminDashboard = {
    navigateToPage,
    loadAllData,
    loadCustomers,
    loadCashiers,
    showAddCustomerModal,
    showAddCashierModal,
    showAddBookModal,
    generateBill,
    calculateBill,
    printBill,
    viewReports,
    showNotification,
    showModal,
    closeModal,
    debugDataState,
    refreshAllData
};