// ==============================================================================
// PAHANA EDU - ADMIN DASHBOARD JAVASCRIPT (WITH ENHANCED INVENTORY MANAGEMENT)
// Complete implementation with Books and Categories management including images and offers
// ==============================================================================

// Global Variables
let currentPage = 'dashboard';
let sidebarCollapsed = false;
let charts = {};
let data = {
    customers: [],
    cashiers: [],
    books: [],
    categories: [],
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
        loadBooks(),
        loadCategories()
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
    updateInventoryStats(); // Add this line
    updateCategoryChart();
    
    // Update displays if we're on the respective pages
    if (currentPage === 'customers') {
        displayCustomers();
    }
    if (currentPage === 'cashiers') {
        displayCashiers();
    }
    if (currentPage === 'inventory') {
        displayBooks();
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
            if (data.books.length > 0) {
                displayBooks();
                updateInventoryStatsFromBooks(data.books); // Add this line
            } else {
                loadBooks();
            }
            break;
        case 'billing':
            initializeBillingSystem();
            break;
        case 'reports':
            loadReports();
            break;
        case 'dashboard':
            updateStats();
            updateInventoryStats(); // Add this line
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
    
    return Promise.all([
        makeApiCall('admin?action=getStats'),
        makeApiCall('admin?action=getOutOfStockBooks'),
        makeApiCall('admin?action=getLowStockBooks')
    ])
    .then(([statsResponse, outOfStockResponse, lowStockResponse]) => {
        console.log('📊 Stats response:', statsResponse);
        console.log('📊 Out of stock response:', outOfStockResponse);
        console.log('📊 Low stock response:', lowStockResponse);
        
        // Handle stats response
        if (statsResponse.totalCustomers !== undefined) {
            data.stats = {
                totalCustomers: statsResponse.totalCustomers || 0,
                totalCashiers: statsResponse.totalCashiers || 0,
                totalUsers: statsResponse.totalUsers || 0,
                totalBooks: statsResponse.totalBooks || 0,
                totalRevenue: 125000,
                totalOrders: 48
            };
        } else if (statsResponse.success && statsResponse.data) {
            data.stats = {
                totalCustomers: statsResponse.data.totalCustomers || 0,
                totalCashiers: statsResponse.data.totalCashiers || 0,
                totalUsers: statsResponse.data.totalUsers || 0,
                totalBooks: statsResponse.data.totalBooks || 0,
                totalRevenue: 125000,
                totalOrders: 48
            };
        }
        
        // Handle out of stock books
        let outOfStockBooks = [];
        if (Array.isArray(outOfStockResponse)) {
            outOfStockBooks = outOfStockResponse;
        } else if (outOfStockResponse.success && Array.isArray(outOfStockResponse.data)) {
            outOfStockBooks = outOfStockResponse.data;
        }
        
        // Handle low stock books
        let lowStockBooks = [];
        if (Array.isArray(lowStockResponse)) {
            lowStockBooks = lowStockResponse;
        } else if (lowStockResponse.success && Array.isArray(lowStockResponse.data)) {
            lowStockBooks = lowStockResponse.data;
        }
        
        // Update inventory stats
        data.stats.outOfStockBooks = outOfStockBooks.length;
        data.stats.lowStockBooks = lowStockBooks.length;
        
        console.log('✅ All stats loaded:', data.stats);
        updateStats();
        updateInventoryStats();
        
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
            totalOrders: 0,
            outOfStockBooks: 0,
            lowStockBooks: 0
        };
        updateStats();
        updateInventoryStats();
        return data.stats;
    });
}

function updateInventoryStats() {
    console.log('📊 Updating inventory stats display...');
    
    const inventoryTotalBooks = document.getElementById('inventoryTotalBooks');
    const inventoryOutOfStock = document.getElementById('inventoryOutOfStock');
    const inventoryLowStock = document.getElementById('inventoryLowStock');
    
    if (inventoryTotalBooks) {
        inventoryTotalBooks.textContent = data.stats.totalBooks || 0;
    }
    
    if (inventoryOutOfStock) {
        inventoryOutOfStock.textContent = data.stats.outOfStockBooks || 0;
    }
    
    if (inventoryLowStock) {
        inventoryLowStock.textContent = data.stats.lowStockBooks || 0;
    }
    
    console.log('✅ Inventory stats updated');
}
function updateInventoryStatsFromBooks(books) {
    if (!books || books.length === 0) return;
    
    const totalBooks = books.length;
    const outOfStockBooks = books.filter(book => book.stock <= 0 || book.status === 'out_of_stock').length;
    const lowStockBooks = books.filter(book => book.stock > 0 && book.stock <= 5 && book.status === 'active').length;
    
    // Update data.stats
    data.stats.totalBooks = totalBooks;
    data.stats.outOfStockBooks = outOfStockBooks;
    data.stats.lowStockBooks = lowStockBooks;
    
    // Update the display
    updateInventoryStats();
}
// ==============================================================================
// CUSTOMER MANAGEMENT
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
            <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
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
// CASHIER MANAGEMENT
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
            <td colspan="6" style="text-align: center; padding: 20px; color: #64748b;">
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
// BOOK MANAGEMENT - ENHANCED WITH IMAGES AND OFFERS
// ==============================================================================
function loadBooks() {
    console.log('📚 Loading books...');
    
    return makeApiCall('admin?action=getBooks')
        .then(response => {
            console.log('📚 Books response:', response);
            
            // Handle different response formats
            let books = [];
            if (Array.isArray(response)) {
                books = response;
            } else if (response.success && Array.isArray(response.data)) {
                books = response.data;
            } else if (response.data && Array.isArray(response.data)) {
                books = response.data;
            }
            
            data.books = books;
            console.log(`✅ Loaded ${books.length} books`);
            
            // Update inventory stats from loaded books data
            updateInventoryStatsFromBooks(books);
            
            if (currentPage === 'inventory') {
                displayBooks();
            }
            
            return books;
        })
        .catch(error => {
            console.error('❌ Failed to load books:', error);
            data.books = [];
            if (currentPage === 'inventory') {
                displayBooks();
            }
            return [];
        });
}
function displayBooks() {
    console.log('🎨 Displaying books...');
    
    const tableBody = document.querySelector('#booksTable tbody');
    if (!tableBody) {
        console.error('❌ Books table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (data.books.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" style="text-align: center; padding: 20px; color: #64748b;">
                <i class="fas fa-book" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                No books found. <a href="#" onclick="showAddBookModal()" style="color: #2563eb;">Add the first book</a>
            </td>
        `;
        tableBody.appendChild(row);
    } else {
        data.books.forEach((book, index) => {
            const row = document.createElement('tr');
            const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
            const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
            
            row.innerHTML = `
                <td>${book.id}</td>
                <td>
                    <div class="book-title-cell">
                        ${book.images && book.images.length > 0 ? 
                            `<img src="${book.images[0]}" alt="${book.title}" class="book-thumbnail" onerror="this.style.display='none'">` 
                            : '<div class="book-no-image"><i class="fas fa-book"></i></div>'
                        }
                        <span>${book.title}</span>
                    </div>
                </td>
                <td>${book.author}</td>
                <td>${book.categoryName || 'No Category'}</td>
                <td>
                    <div class="price-cell">
                        ${hasOffer ? 
                            `<span class="original-price">₨ ${parseFloat(book.price).toLocaleString()}</span>
                             <span class="offer-price">₨ ${parseFloat(book.offerPrice).toLocaleString()}</span>
                             <span class="discount-badge">${discountPercent}% OFF</span>` 
                            : `<span class="current-price">₨ ${parseFloat(book.price).toLocaleString()}</span>`
                        }
                    </div>
                </td>
                <td>
                    <span class="stock-badge ${getStockStatus(book.stock)}">
                        ${book.stock}
                    </span>
                </td>
                <td class="status-cell">
                    <span class="book-status-badge ${getBookStatusClass(book.status, book.stock)}">
                        ${getBookStatusText(book.status, book.stock)}
                    </span>
                </td>
                <td>
                    <button class="btn-sm btn-info" onclick="viewBookDetails(${book.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-info" onclick="editBook(${book.id})" title="Edit Book">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-danger" onclick="deleteBook(${book.id})" title="Delete Book">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    console.log(`✅ Displayed ${data.books.length} books`);
}

// Helper functions for stock and status
function getStockStatus(stock) {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'normal-stock';
}

function getBookStatusClass(status, stock) {
    if (stock <= 0) return 'out-of-stock';
    return status === 'active' ? 'active' : 'inactive';
}

function getBookStatusText(status, stock) {
    if (stock <= 0) return 'Out of Stock';
    return status === 'active' ? 'Active' : 'Inactive';
}

// View Book Details Modal
// Updated viewBookDetails function - Replace your existing one
function viewBookDetails(id) {
    const book = data.books.find(b => b.id === id);
    if (!book) {
        showNotification('Book not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    const hasOffer = book.offerPrice && book.offerPrice > 0 && book.offerPrice < book.price;
    const discountPercent = hasOffer ? Math.round(((book.price - book.offerPrice) / book.price) * 100) : 0;
    
    modalTitle.textContent = 'Book Details';
    modalBody.innerHTML = `
        <div class="book-details-view">
            <div class="book-images-gallery">
                ${book.images && book.images.length > 0 ? 
                    `<div class="main-image">
                        <img src="${book.images[0]}" alt="${book.title}" id="mainBookImage">
                    </div>
                    ${book.images.length > 1 ? 
                        `<div class="thumbnail-images">
                            ${book.images.map((img, index) => 
                                `<img src="${img}" alt="Image ${index + 1}" 
                                     onclick="changeMainImage('${img}')" 
                                     class="thumbnail ${index === 0 ? 'active' : ''}">`
                            ).join('')}
                        </div>` : ''
                    }` : 
                    `<div class="no-image-placeholder">
                        <i class="fas fa-book"></i>
                        <p>No images available</p>
                    </div>`
                }
            </div>
            
            <div class="book-info">
                <h3>${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                
                <div class="book-meta">
                    <div class="meta-item">
                        <label>Category:</label>
                        <span>${book.categoryName || 'No Category'}</span>
                    </div>
                    
                    <div class="meta-item">
                        <label>Price:</label>
                        <div class="price-display">
                            ${hasOffer ? 
                                `<span class="original-price">Rs ${parseFloat(book.price).toLocaleString()}</span>
                                 <span class="offer-price">Rs ${parseFloat(book.offerPrice).toLocaleString()}</span>
                                 <span class="discount-badge">${discountPercent}% OFF</span>` 
                                : `<span class="current-price">Rs ${parseFloat(book.price).toLocaleString()}</span>`
                            }
                        </div>
                    </div>
                    
                    <div class="meta-item">
                        <label>Stock:</label>
                        <span class="stock-badge ${getStockStatus(book.stock)}">
                            ${book.stock} ${book.stock === 1 ? 'copy' : 'copies'}
                        </span>
                    </div>
                    
                    <div class="meta-item">
                        <label>Status:</label>
                        <span class="book-status-badge ${getBookStatusClass(book.status, book.stock)}">
                            ${getBookStatusText(book.status, book.stock)}
                        </span>
                    </div>
                </div>
                
                ${book.description ? 
                    `<div class="book-description">
                        <label>Description:</label>
                        <p>${book.description}</p>
                    </div>` : ''
                }
                
                ${book.details ? 
                    `<div class="book-details">
                        <label>Additional Details:</label>
                        <p>${book.details}</p>
                    </div>` : ''
                }
                
                <div class="modal-actions">
                    <button class="btn-primary" onclick="closeModal(); editBook(${book.id})">
                        <i class="fas fa-edit"></i> Edit Book
                    </button>
                    <button class="btn-secondary" onclick="closeModal()">Close</button>
                </div>
            </div>
        </div>
    `;
    
    showModal();
}

// Change main image in gallery
function changeMainImage(imageSrc) {
    const mainImage = document.getElementById('mainBookImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    thumbnails.forEach(thumb => {
        thumb.classList.remove('active');
        if (thumb.src === imageSrc) {
            thumb.classList.add('active');
        }
    });
}

// Enhanced Add Book Modal
function showAddBookModal() {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Add New Book';
    modalBody.innerHTML = `
        <form id="bookForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" id="bookTitle" required>
                </div>
                <div class="form-group">
                    <label>Author *</label>
                    <input type="text" id="bookAuthor" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Category</label>
                <select id="bookCategory">
                    <option value="">Select Category</option>
                    ${data.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Or Add New Category</label>
                <input type="text" id="newCategoryName" placeholder="Enter new category name">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Regular Price (₨) *</label>
                    <input type="number" id="bookPrice" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label>Offer Price (₨)</label>
                    <input type="number" id="bookOfferPrice" step="0.01" min="0" placeholder="Optional">
                </div>
            </div>
            
            <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" id="bookStock" min="0" required>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea id="bookDescription" rows="2" placeholder="Brief description"></textarea>
            </div>
            
            <div class="form-group">
                <label>Additional Details</label>
                <textarea id="bookDetails" rows="3" placeholder="Detailed information about the book"></textarea>
            </div>
            
            <div class="form-group">
                <label>Book Images</label>
                <input type="file" id="bookImages" multiple accept="image/*" class="file-input">
                <div class="file-input-help">Select up to 5 images (JPG, PNG)</div>
                <div id="imagePreview" class="image-preview"></div>
            </div>
            
            <div class="form-group">
                <label>Status</label>
                <select id="bookStatus">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Add Book</button>
            </div>
        </form>
    `;
    
    showModal();
    initializeBookForm();
}

// Enhanced Edit Book Modal
function editBook(id) {
    const book = data.books.find(b => b.id === id);
    if (!book) {
        showNotification('Book not found', 'error');
        return;
    }
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = 'Edit Book';
    modalBody.innerHTML = `
        <form id="bookForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Title *</label>
                    <input type="text" id="bookTitle" value="${book.title}" required>
                </div>
                <div class="form-group">
                    <label>Author *</label>
                    <input type="text" id="bookAuthor" value="${book.author}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Category</label>
                <select id="bookCategory">
                    <option value="">Select Category</option>
                    ${data.categories.map(cat => 
                        `<option value="${cat.id}" ${cat.id === book.categoryId ? 'selected' : ''}>${cat.name}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Or Add New Category</label>
                <input type="text" id="newCategoryName" placeholder="Enter new category name" value="${book.categoryId ? '' : book.categoryName || ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Regular Price (₨) *</label>
                    <input type="number" id="bookPrice" step="0.01" min="0" value="${book.price}" required>
                </div>
                <div class="form-group">
                    <label>Offer Price (₨)</label>
                    <input type="number" id="bookOfferPrice" step="0.01" min="0" value="${book.offerPrice || ''}" placeholder="Optional">
                </div>
            </div>
            
            <div class="form-group">
                <label>Stock Quantity *</label>
                <input type="number" id="bookStock" min="0" value="${book.stock}" required>
            </div>
            
            <div class="form-group">
                <label>Description</label>
                <textarea id="bookDescription" rows="2" placeholder="Brief description">${book.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Additional Details</label>
                <textarea id="bookDetails" rows="3" placeholder="Detailed information">${book.details || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Book Images</label>
                <input type="file" id="bookImages" multiple accept="image/*" class="file-input">
                <div class="file-input-help">Select up to 5 images (JPG, PNG)</div>
                ${book.images && book.images.length > 0 ? 
                    `<div class="current-images">
                        <label>Current Images:</label>
                        <div class="current-images-grid">
                            ${book.images.map((img, index) => 
                                `<div class="current-image-item">
                                    <img src="${img}" alt="Book image ${index + 1}">
                                    <span>Image ${index + 1}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>` : ''
                }
                <div id="imagePreview" class="image-preview"></div>
            </div>
            
            <div class="form-group">
                <label>Status</label>
                <select id="bookStatus">
                    <option value="active" ${book.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${book.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn-primary">Update Book</button>
            </div>
        </form>
    `;
    
    showModal();
    initializeBookForm(book);
}

// Initialize book form
function initializeBookForm(book = null) {
    const categorySelect = document.getElementById('bookCategory');
    const newCategoryInput = document.getElementById('newCategoryName');
    const priceInput = document.getElementById('bookPrice');
    const offerPriceInput = document.getElementById('bookOfferPrice');
    const fileInput = document.getElementById('bookImages');
    const imagePreview = document.getElementById('imagePreview');
    
    // Category selection logic
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            if (this.value) {
                newCategoryInput.disabled = true;
                newCategoryInput.value = '';
            } else {
                newCategoryInput.disabled = false;
            }
        });
    }
    
    if (newCategoryInput) {
        newCategoryInput.addEventListener('input', function() {
            if (this.value.trim()) {
                categorySelect.disabled = true;
                categorySelect.value = '';
            } else {
                categorySelect.disabled = false;
            }
        });
    }
    
    // Price validation
    if (offerPriceInput) {
        offerPriceInput.addEventListener('input', function() {
            const regularPrice = parseFloat(priceInput.value) || 0;
            const offerPrice = parseFloat(this.value) || 0;
            
            if (offerPrice > 0 && offerPrice >= regularPrice) {
                this.setCustomValidity('Offer price must be less than regular price');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Image preview
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            handleImagePreview(this.files);
        });
    }
    
    // Form submission
    document.getElementById('bookForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', book ? 'updateBook' : 'addBook');
        if (book) formData.append('id', book.id);
        
        formData.append('title', document.getElementById('bookTitle').value);
        formData.append('author', document.getElementById('bookAuthor').value);
        formData.append('categoryId', document.getElementById('bookCategory').value);
        formData.append('newCategoryName', document.getElementById('newCategoryName').value);
        formData.append('price', document.getElementById('bookPrice').value);
        formData.append('offerPrice', document.getElementById('bookOfferPrice').value);
        formData.append('stock', document.getElementById('bookStock').value);
        formData.append('description', document.getElementById('bookDescription').value);
        formData.append('details', document.getElementById('bookDetails').value);
        formData.append('status', document.getElementById('bookStatus').value);
        
        // Add images
        const files = document.getElementById('bookImages').files;
        for (let i = 0; i < files.length && i < 5; i++) {
            formData.append('bookImages', files[i]);
        }
        
        submitBookForm(formData);
    });
}

// Handle image preview
function handleImagePreview(files) {
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return;
    
    imagePreview.innerHTML = '';
    
    if (files.length > 5) {
        showNotification('Maximum 5 images allowed', 'warning');
        return;
    }
    
    Array.from(files).forEach((file, index) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageItem = document.createElement('div');
                imageItem.className = 'image-preview-item';
                imageItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <span>Image ${index + 1}</span>
                `;
                imagePreview.appendChild(imageItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Submit book form
function submitBookForm(formData) {
    fetch('admin', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, 'success');
            closeModal();
            loadBooks();
            loadCategories();
            loadStats();
            loadCategoriesWithBookCount();
        } else {
            showNotification(data.message, 'error');
        }
    })
    .catch(error => {
        showNotification('Failed to save book', 'error');
        console.error('Error:', error);
    });
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        const formData = new URLSearchParams();
        formData.append('action', 'deleteBook');
        formData.append('id', id);
        
        makeApiCall('admin', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.success) {
                showNotification(response.message, 'success');
                loadBooks();
                loadStats();
                loadCategoriesWithBookCount();
            } else {
                showNotification(response.message, 'error');
            }
        })
        .catch(error => {
            showNotification('Failed to delete book', 'error');
        });
    }
}

// ==============================================================================
// CATEGORY MANAGEMENT
// ==============================================================================

function loadCategories() {
    console.log('📂 Loading categories...');
    
    return makeApiCall('admin?action=getCategories')
        .then(response => {
            console.log('📂 Categories response:', response);
            
            // Handle different response formats
            let categories = [];
            if (Array.isArray(response)) {
                categories = response;
            } else if (response.success && Array.isArray(response.data)) {
                categories = response.data;
            } else if (response.data && Array.isArray(response.data)) {
                categories = response.data;
            }
            
            data.categories = categories;
            console.log(`✅ Loaded ${categories.length} categories`);
            
            return categories;
        })
        .catch(error => {
            console.error('❌ Failed to load categories:', error);
            data.categories = [];
            return [];
        });
}

function loadCategoriesWithBookCount() {
    console.log('📂 Loading categories with book count...');
    
    return makeApiCall('admin?action=getCategoriesWithBookCount')
        .then(response => {
            console.log('📂 Categories with book count response:', response);
            
            // Handle different response formats
            let categories = [];
            if (Array.isArray(response)) {
                categories = response;
            } else if (response.success && Array.isArray(response.data)) {
                categories = response.data;
            } else if (response.data && Array.isArray(response.data)) {
                categories = response.data;
            }
            
            // Update category chart
            updateCategoryChart(categories);
            
            return categories;
        })
        .catch(error => {
            console.error('❌ Failed to load categories with book count:', error);
            return [];
        });
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
    
    // Load real category data
    loadCategoriesWithBookCount();
}

function updateCategoryChart(categories = null) {
    if (!charts.categoryChart) return;
    
    if (categories && categories.length > 0) {
        const colors = [
            '#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ];
        
        const labels = categories.map(cat => cat.name);
        const data = categories.map(cat => cat.bookCount);
        const backgroundColors = categories.map((cat, index) => colors[index % colors.length]);
        
        charts.categoryChart.data.labels = labels;
        charts.categoryChart.data.datasets[0].data = data;
        charts.categoryChart.data.datasets[0].backgroundColor = backgroundColors;
        charts.categoryChart.update();
    }
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
        totalBooks.textContent = data.stats.totalBooks || 0;
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
// CUSTOMER MODAL FUNCTIONS
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
// CASHIER MODAL FUNCTIONS
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
    console.log('├── Categories:', data.categories.length);
    console.log('├── Stats:', data.stats);
    console.log('└── Current Page:', currentPage);
}

function refreshAllData() {
    console.log('🔄 Refreshing all data...');
    loadAllData();
}

// Add CSS animations and styles for inventory
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
    .stock-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        color: white;
    }
    .stock-badge.normal-stock {
        background: #10b981;
    }
    .stock-badge.low-stock {
        background: #ef4444;
        animation: pulse 2s infinite;
    }
    .stock-badge.out-of-stock {
        background: #64748b;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
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
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-sizing: border-box;
    }
    .form-group textarea {
        resize: vertical;
        font-family: inherit;
    }
    .form-row {
        display: flex;
        gap: 15px;
    }
    .form-row .form-group {
        flex: 1;
    }
    .book-thumbnail {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 10px;
    }
    .book-no-image {
        width: 40px;
        height: 40px;
        background: #f1f5f9;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;
        color: #94a3b8;
    }
    .price-cell {
        display: flex;
        flex-direction: column;
    }
    .original-price {
        text-decoration: line-through;
        color: #94a3b8;
        font-size: 0.9em;
    }
    .offer-price {
        color: #ef4444;
        font-weight: bold;
    }
    .current-price {
        font-weight: bold;
    }
    .discount-badge {
        background: #fef2f2;
        color: #ef4444;
        padding: 2px 6px;
        border-radius: 12px;
        font-size: 0.8em;
        margin-top: 3px;
        align-self: flex-start;
    }
    .book-details-view {
        display: flex;
        gap: 20px;
        max-height: 80vh;
        overflow: auto;
    }
    .book-images-gallery {
        flex: 1;
        max-width: 50%;
    }
    .main-image img {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        border-radius: 8px;
        background: #f8fafc;
        padding: 20px;
    }
    .thumbnail-images {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        overflow-x: auto;
        padding: 5px;
    }
    .thumbnail {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0.7;
        border: 2px solid transparent;
    }
    .thumbnail.active {
        opacity: 1;
        border-color: #2563eb;
    }
    .book-info {
        flex: 1;
    }
    .book-author {
        color: #64748b;
        margin-bottom: 15px;
    }
    .book-meta {
        background: #f8fafc;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
    }
    .meta-item {
        display: flex;
        margin-bottom: 10px;
    }
    .meta-item label {
        width: 120px;
        font-weight: 600;
    }
    .book-description, .book-details {
        margin-bottom: 15px;
    }
    .book-description p, .book-details p {
        margin-top: 5px;
        line-height: 1.5;
    }
    .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
    }
    .image-preview {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
    }
    .image-preview-item {
        position: relative;
        width: 80px;
    }
    .image-preview-item img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
    }
    .image-preview-item span {
        display: block;
        text-align: center;
        font-size: 0.8em;
        color: #64748b;
    }
    .current-images-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
    }
    .current-image-item {
        position: relative;
        width: 80px;
    }
    .current-image-item img {
        width: 100%;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
    }
    .current-image-item span {
        display: block;
        text-align: center;
        font-size: 0.8em;
        color: #64748b;
    }
`;
document.head.appendChild(style);

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

// Console logging for debugging
console.log('🎯 Admin Dashboard Functions Available:');
console.log('├── Navigation: navigateToPage(page)');
console.log('├── Data Loading: loadAllData(), loadCustomers(), loadCashiers(), loadBooks(), loadCategories()');
console.log('├── Customers: showAddCustomerModal(), editCustomer(id), deleteCustomer(id)');
console.log('├── Cashiers: showAddCashierModal(), editCashier(id), deleteCashier(id)');
console.log('├── Books: showAddBookModal(), editBook(id), deleteBook(id), viewBookDetails(id)');
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
    loadBooks,
    loadCategories,
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
    refreshAllData,
    viewBookDetails,
    editBook,
    deleteBook,
	updateInventoryStats,
	updateInventoryStatsFromBooks
};

