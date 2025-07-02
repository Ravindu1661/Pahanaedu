<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Check if user is logged in, redirect to login if not
    if (session.getAttribute("user") == null) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    String userName = (String) session.getAttribute("userName");
    String userEmail = (String) session.getAttribute("userEmail");
    String firstName = userName.split(" ")[0]; // Get first name only
%>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Pahana Edu</title>
    
    <!-- External CSS Links -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="css/customer-style.css" rel="stylesheet">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg fixed-top custom-navbar">
        <div class="container">
            <!-- Brand Logo -->
            <a class="navbar-brand" href="#dashboard">
                <i class="fas fa-book-open me-2"></i>
                <span class="brand-text">Pahana Edu</span>
            </a>
            
            <!-- Mobile Toggle Button -->
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            
            <!-- Navigation Menu -->
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="#dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#books">Books</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#orders">My Orders</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#profile">Profile</a>
                    </li>
                </ul>
                
                <!-- Cart and Wishlist Icons -->
                <div class="nav-icons me-3">
                    <button class="icon-btn" id="cartBtn" data-bs-toggle="modal" data-bs-target="#cartModal">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="badge" id="cartCount">5</span>
                    </button>
                    <button class="icon-btn" id="wishlistBtn" data-bs-toggle="modal" data-bs-target="#wishlistModal">
                        <i class="fas fa-heart"></i>
                        <span class="badge" id="wishlistCount">12</span>
                    </button>
                </div>
                
                <!-- User Section -->
                <div class="user-section d-flex align-items-center">
                    <div class="user-info me-3">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <span class="user-name">Hello, <%= firstName %>!</span>
                            <small class="user-email"><%= userEmail %></small>
                        </div>
                    </div>
                    
                    <!-- User Dropdown -->
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle user-dropdown-btn" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-cog"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#profile">
                                <i class="fas fa-user-cog me-2"></i>Account Settings
                            </a></li>
                            <li><a class="dropdown-item" href="#orders">
                                <i class="fas fa-shopping-bag me-2"></i>My Orders
                            </a></li>
                            <li><a class="dropdown-item" href="#help">
                                <i class="fas fa-question-circle me-2"></i>Help & Support
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="logout.jsp">
                                <i class="fas fa-sign-out-alt me-2"></i>Logout
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section with Video Background -->
    <section class="hero-section" id="dashboard">
        <div class="video-background">
            <video autoplay muted loop playsinline>
                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4">
            </video>
            <div class="video-overlay"></div>
        </div>
        
        <div class="container">
            <div class="row align-items-center min-vh-100">
                <div class="col-lg-8">
                    <div class="hero-content animate-slide-up">
                        <h1 class="hero-title">Welcome Back, <span class="text-accent"><%= firstName %>!</span></h1>
                        <p class="hero-subtitle">Discover amazing books and manage your educational journey with Pahana Edu</p>
                        
                        <!-- Quick Stats -->
                        <div class="hero-stats">
                            <div class="stat-item animate-fade-in">
                                <div class="stat-icon">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">5</span>
                                    <span class="stat-label">Cart Items</span>
                                </div>
                            </div>
                            <div class="stat-item animate-fade-in" style="animation-delay: 0.2s;">
                                <div class="stat-icon">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">12</span>
                                    <span class="stat-label">Wishlist</span>
                                </div>
                            </div>
                            <div class="stat-item animate-fade-in" style="animation-delay: 0.4s;">
                                <div class="stat-icon">
                                    <i class="fas fa-box"></i>
                                </div>
                                <div class="stat-content">
                                    <span class="stat-number">8</span>
                                    <span class="stat-label">Orders</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Hero Actions -->
                        <div class="hero-actions">
                            <a href="#books" class="btn btn-primary btn-lg me-3">Browse Books</a>
                            <a href="#orders" class="btn btn-outline-light btn-lg">View Orders</a>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="hero-content-right animate-slide-right">
                        <div class="hero-text-card">
                            <h3>Start Your Learning Journey</h3>
                            <p>Access thousands of educational books and resources to enhance your knowledge.</p>
                            <div class="features-list">
                                <div class="feature-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Wide Selection of Books</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Fast Delivery</span>
                                </div>
                                <div class="feature-item">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Best Prices</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Actions Section -->
    <section class="quick-actions py-5" id="actions">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center mb-5">
                    <h2 class="section-title animate-slide-up">Quick Actions</h2>
                    <p class="section-subtitle">Everything you need at your fingertips</p>
                </div>
            </div>
            
            <div class="row g-4">
                <div class="col-lg-3 col-md-6">
                    <div class="action-card animate-fade-in">
                        <div class="action-icon">
                            <i class="fas fa-search"></i>
                        </div>
                        <h4>Browse Books</h4>
                        <p>Explore our vast collection of educational books</p>
                        <a href="#books" class="btn btn-primary">Browse Now</a>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="action-card animate-fade-in" style="animation-delay: 0.1s;">
                        <div class="action-icon">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <h4>My Orders</h4>
                        <p>Track your orders and purchase history</p>
                        <a href="#orders" class="btn btn-primary">View Orders</a>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="action-card animate-fade-in" style="animation-delay: 0.2s;">
                        <div class="action-icon">
                            <i class="fas fa-user-edit"></i>
                        </div>
                        <h4>Profile Settings</h4>
                        <p>Update your personal information</p>
                        <a href="#profile" class="btn btn-primary">Edit Profile</a>
                    </div>
                </div>
                
                <div class="col-lg-3 col-md-6">
                    <div class="action-card animate-fade-in" style="animation-delay: 0.3s;">
                        <div class="action-icon">
                            <i class="fas fa-headset"></i>
                        </div>
                        <h4>Support</h4>
                        <p>Get help from our support team</p>
                        <a href="#support" class="btn btn-primary">Get Help</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Featured Books Section -->
    <section class="featured-books py-5" id="books">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center mb-5">
                    <h2 class="section-title">Featured Books</h2>
                    <p class="section-subtitle">Discover our latest collection</p>
                </div>
            </div>
            
            <div class="row g-4">
                <!-- Book Card 1 -->
                <div class="col-lg-3 col-md-6">
                    <div class="book-card">
                        <div class="book-image">
                            <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                                 alt="Advanced Programming">
                            <div class="book-overlay">
                                <button class="btn btn-light btn-sm">Quick View</button>
                            </div>
                            <div class="book-badge">New</div>
                        </div>
                        <div class="book-info">
                            <h5>Advanced Programming Concepts</h5>
                            <p class="book-author">by John Smith</p>
                            <div class="book-category">Programming</div>
                            <div class="book-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span>(4.8)</span>
                            </div>
                            <div class="book-price">
                                <span class="offer-price">₨ 2,250.00</span>
                                <span class="regular-price">₨ 2,500.00</span>
                            </div>
                            <div class="stock-info">
                                <span class="stock-quantity">Stock: 15</span>
                            </div>
                            <div class="book-actions">
                                <button class="btn btn-primary btn-sm flex-fill add-to-cart" 
                                        data-book-id="1" 
                                        data-book-title="Advanced Programming Concepts"
                                        data-book-price="2250"
                                        data-book-image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-primary btn-sm add-to-wishlist" 
                                        data-book-id="1"
                                        data-book-title="Advanced Programming Concepts"
                                        data-book-price="2250"
                                        data-book-image="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Book Card 2 -->
                <div class="col-lg-3 col-md-6">
                    <div class="book-card">
                        <div class="book-image">
                            <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                                 alt="Higher Mathematics">
                            <div class="book-overlay">
                                <button class="btn btn-light btn-sm">Quick View</button>
                            </div>
                        </div>
                        <div class="book-info">
                            <h5>Higher Mathematics</h5>
                            <p class="book-author">by Sarah Johnson</p>
                            <div class="book-category">Mathematics</div>
                            <div class="book-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span>(4.2)</span>
                            </div>
                            <div class="book-price">
                                <span class="offer-price">₨ 1,800.00</span>
                            </div>
                            <div class="stock-info">
                                <span class="stock-quantity">Stock: 8</span>
                            </div>
                            <div class="book-actions">
                                <button class="btn btn-primary btn-sm flex-fill add-to-cart" 
                                        data-book-id="2" 
                                        data-book-title="Higher Mathematics"
                                        data-book-price="1800"
                                        data-book-image="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-primary btn-sm add-to-wishlist" 
                                        data-book-id="2"
                                        data-book-title="Higher Mathematics"
                                        data-book-price="1800"
                                        data-book-image="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Book Card 3 -->
                <div class="col-lg-3 col-md-6">
                    <div class="book-card">
                        <div class="book-image">
                            <img src="https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                                 alt="Modern Physics">
                            <div class="book-overlay">
                                <button class="btn btn-light btn-sm">Quick View</button>
                            </div>
                            <div class="book-badge bestseller">Bestseller</div>
                        </div>
                        <div class="book-info">
                            <h5>Modern Physics</h5>
                            <p class="book-author">by Dr. Michael Brown</p>
                            <div class="book-category">Science</div>
                            <div class="book-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <span>(4.9)</span>
                            </div>
                            <div class="book-price">
                                <span class="offer-price">₨ 2,880.00</span>
                                <span class="regular-price">₨ 3,200.00</span>
                            </div>
                            <div class="stock-info">
                                <span class="stock-quantity">Stock: 12</span>
                            </div>
                            <div class="book-actions">
                                <button class="btn btn-primary btn-sm flex-fill add-to-cart" 
                                        data-book-id="3" 
                                        data-book-title="Modern Physics"
                                        data-book-price="2880"
                                        data-book-image="https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-primary btn-sm add-to-wishlist" 
                                        data-book-id="3"
                                        data-book-title="Modern Physics"
                                        data-book-price="2880"
                                        data-book-image="https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Book Card 4 -->
                <div class="col-lg-3 col-md-6">
                    <div class="book-card">
                        <div class="book-image">
                            <img src="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                                 alt="English Literature">
                            <div class="book-overlay">
                                <button class="btn btn-light btn-sm">Quick View</button>
                            </div>
                        </div>
                        <div class="book-info">
                            <h5>English Literature</h5>
                            <p class="book-author">by Emily Davis</p>
                            <div class="book-category">Literature</div>
                            <div class="book-rating">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="far fa-star"></i>
                                <span>(4.1)</span>
                            </div>
                            <div class="book-price">
                                <span class="offer-price">₨ 1,500.00</span>
                            </div>
                            <div class="stock-info">
                                <span class="stock-quantity">Stock: 20</span>
                            </div>
                            <div class="book-actions">
                                <button class="btn btn-primary btn-sm flex-fill add-to-cart" 
                                        data-book-id="4" 
                                        data-book-title="English Literature"
                                        data-book-price="1500"
                                        data-book-image="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    Add to Cart
                                </button>
                                <button class="btn btn-outline-primary btn-sm add-to-wishlist" 
                                        data-book-id="4"
                                        data-book-title="English Literature"
                                        data-book-price="1500"
                                        data-book-image="https://images.unsplash.com/photo-1592496431122-2349e0fbc666?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-5">
                <a href="#" class="btn btn-primary btn-lg">View All Books</a>
            </div>
        </div>
    </section>

    <!-- Recent Activity Section -->
    <section class="recent-activity py-5">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center mb-5">
                    <h2 class="section-title">Recent Activity</h2>
                    <p class="section-subtitle">Your latest interactions</p>
                </div>
            </div>
            
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="activity-list">
                        <div class="activity-item">
                            <div class="activity-icon">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="activity-content">
                                <h5>Welcome to Pahana Edu!</h5>
                                <p>Your account has been successfully created. Start exploring our book collection.</p>
                                <span class="activity-time">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section py-5">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6 text-center">
                    <h3>Stay Updated</h3>
                    <p>Get the latest updates about new books and special offers</p>
                    <div class="newsletter-form">
                        <div class="input-group">
                            <input type="email" class="form-control" placeholder="Enter your email">
                            <button class="btn btn-primary" type="button">Subscribe</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer py-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-4 mb-4">
                    <div class="footer-brand">
                        <h4><i class="fas fa-book-open me-2"></i>Pahana Edu</h4>
                        <p>Your trusted partner in academic excellence. Serving students and educators with quality books and reliable service since 2020.</p>
                        <div class="social-links">
                            <a href="#" title="Facebook"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" title="Twitter"><i class="fab fa-twitter"></i></a>
                            <a href="#" title="Instagram"><i class="fab fa-instagram"></i></a>
                            <a href="#" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <h5>Quick Links</h5>
                    <ul class="footer-links">
                        <li><a href="#books">Browse Books</a></li>
                        <li><a href="#orders">My Orders</a></li>
                        <li><a href="#profile">Account Settings</a></li>
                        <li><a href="#support">Support</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <h5>Categories</h5>
                    <ul class="footer-links">
                        <li><a href="#">Academic Books</a></li>
                        <li><a href="#">Programming</a></li>
                        <li><a href="#">Mathematics</a></li>
                        <li><a href="#">Science</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <h5>Support</h5>
                    <ul class="footer-links">
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Contact Us</a></li>
                        <li><a href="#">Returns</a></li>
                        <li><a href="#">Shipping Info</a></li>
                    </ul>
                </div>
                
                <div class="col-lg-2 col-md-6 mb-4">
                    <h5>Contact</h5>
                    <div class="contact-info">
                        <p><i class="fas fa-map-marker-alt me-2"></i>Colombo, Sri Lanka</p>
                        <p><i class="fas fa-phone me-2"></i>+94 11 234 5678</p>
                        <p><i class="fas fa-envelope me-2"></i>info@pahanaedu.com</p>
                    </div>
                </div>
            </div>
            
            <hr class="footer-divider">
            
            <div class="row">
                <div class="col-12 text-center">
                    <p class="footer-copyright">&copy; 2024 Pahana Edu. All rights reserved. | Your trusted educational partner.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Cart Modal -->
    <div class="modal fade" id="cartModal" tabindex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cartModalLabel">
                        <i class="fas fa-shopping-cart me-2"></i>Shopping Cart
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="cartItems">
                        <!-- Cart items will be dynamically loaded here -->
                    </div>
                    <div class="cart-empty" id="cartEmpty" style="display: none;">
                        <div class="text-center py-5">
                            <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                            <h5>Your cart is empty</h5>
                            <p class="text-muted">Start adding some books to your cart!</p>
                            <a href="#books" class="btn btn-primary" data-bs-dismiss="modal">Browse Books</a>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="cart-total">
                        <h5>Total: ₨ <span id="cartTotal">0.00</span></h5>
                    </div>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Continue Shopping</button>
                    <button type="button" class="btn btn-primary" id="checkoutBtn">Proceed to Checkout</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Wishlist Modal -->
    <div class="modal fade" id="wishlistModal" tabindex="-1" aria-labelledby="wishlistModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="wishlistModalLabel">
                        <i class="fas fa-heart me-2"></i>My Wishlist
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="wishlistItems">
                        <!-- Wishlist items will be dynamically loaded here -->
                    </div>
                    <div class="wishlist-empty" id="wishlistEmpty" style="display: none;">
                        <div class="text-center py-5">
                            <i class="far fa-heart fa-3x text-muted mb-3"></i>
                            <h5>Your wishlist is empty</h5>
                            <p class="text-muted">Save your favorite books for later!</p>
                            <a href="#books" class="btn btn-primary" data-bs-dismiss="modal">Browse Books</a>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="addAllToCart">Add All to Cart</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JavaScript -->
    <script src="js/customer-script.js"></script>
</body>
</html>