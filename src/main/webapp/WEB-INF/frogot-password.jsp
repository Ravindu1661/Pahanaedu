<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>

<%
    // Redirect if already logged in
    if (session.getAttribute("user") != null) {
        response.sendRedirect("index2.jsp");
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Pahana Edu - Reset Password</title>
<link rel="stylesheet" href="css/login.css">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
.reset-container {
    max-width: 500px;
    margin: 50px auto;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.reset-header {
    text-align: center;
    margin-bottom: 30px;
}

.reset-header h2 {
    color: #2C3E50;
    font-size: 28px;
    margin-bottom: 10px;
}

.reset-header p {
    color: #7F8C8D;
    font-size: 16px;
}

.step-indicator {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

.step {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #BDC3C7;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    position: relative;
}

.step.active {
    background: #3498DB;
}

.step.completed {
    background: #27AE60;
}

.step:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -30px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 2px;
    background: #BDC3C7;
}

.step.completed:not(:last-child)::after {
    background: #27AE60;
}

.back-link {
    display: inline-flex;
    align-items: center;
    color: #3498DB;
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 20px;
    transition: color 0.3s ease;
}

.back-link:hover {
    color: #2980B9;
}

.back-link i {
    margin-right: 8px;
}

.info-box {
    background: #F8F9FA;
    border-left: 4px solid #3498DB;
    padding: 15px;
    margin: 20px 0;
    border-radius: 4px;
}

.info-box.success {
    border-left-color: #27AE60;
    background: #F8FFF8;
}

.hidden {
    display: none !important;
}
</style>
</head>
<body>
<div class="container">
    <!-- Background Animation -->
    <div class="background-animation">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
        <div class="floating-shape shape-4"></div>
    </div>

    <div class="reset-container">
        <a href="login.jsp" class="back-link">
            <i class="fas fa-arrow-left"></i>
            Back to Login
        </a>

        <!-- Step 1: Email Entry -->
        <div id="step1" class="reset-step">
            <div class="reset-header">
                <h2>Reset Password</h2>
                <p>Enter your email address and we'll help you reset your password</p>
            </div>

            <div class="step-indicator">
                <div class="step active">1</div>
                <div class="step">2</div>
                <div class="step">3</div>
            </div>

            <form id="emailForm" class="auth-form">
                <div class="input-group">
                    <div class="input-container">
                        <i class="fas fa-envelope input-icon"></i>
                        <input type="email" id="resetEmail" name="email" required>
                        <label for="resetEmail">Email Address</label>
                        <div class="input-underline"></div>
                    </div>
                </div>

                <div class="info-box">
                    <i class="fas fa-info-circle"></i>
                    We'll send you a secure code to reset your password.
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane"></i>
                    Send Reset Code
                </button>
            </form>
        </div>

        <!-- Step 2: Code Verification -->
        <div id="step2" class="reset-step hidden">
            <div class="reset-header">
                <h2>Enter Reset Code</h2>
                <p>We've sent a 6-digit code to your email</p>
            </div>

            <div class="step-indicator">
                <div class="step completed">1</div>
                <div class="step active">2</div>
                <div class="step">3</div>
            </div>

            <form id="codeForm" class="auth-form">
                <div class="input-group">
                    <div class="input-container">
                        <i class="fas fa-key input-icon"></i>
                        <input type="text" id="resetCode" name="code" maxlength="6" required
                               placeholder="000000" style="text-align: center; font-size: 24px; letter-spacing: 5px;">
                        <label for="resetCode">6-Digit Code</label>
                        <div class="input-underline"></div>
                    </div>
                </div>

                <div class="info-box">
                    <i class="fas fa-clock"></i>
                    Code expires in <span id="countdown">10:00</span>
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-check"></i>
                    Verify Code
                </button>

                <div style="text-align: center; margin-top: 15px;">
                    <button type="button" id="resendBtn" class="back-link" style="border: none; background: none;">
                        <i class="fas fa-refresh"></i>
                        Resend Code
                    </button>
                </div>
            </form>
        </div>

        <!-- Step 3: New Password -->
        <div id="step3" class="reset-step hidden">
            <div class="reset-header">
                <h2>Set New Password</h2>
                <p>Enter your new password</p>
            </div>

            <div class="step-indicator">
                <div class="step completed">1</div>
                <div class="step completed">2</div>
                <div class="step active">3</div>
            </div>

            <form id="passwordForm" class="auth-form">
                <div class="input-group">
                    <div class="input-container">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" id="newPassword" name="password" required>
                        <label for="newPassword">New Password</label>
                        <button type="button" class="toggle-password" onclick="togglePassword('newPassword')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <div class="input-underline"></div>
                    </div>
                </div>

                <div class="input-group">
                    <div class="input-container">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" id="confirmNewPassword" name="confirmPassword" required>
                        <label for="confirmNewPassword">Confirm New Password</label>
                        <button type="button" class="toggle-password" onclick="togglePassword('confirmNewPassword')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <div class="input-underline"></div>
                    </div>
                </div>

                <div class="info-box success">
                    <i class="fas fa-shield-alt"></i>
                    Password must be at least 6 characters long
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-check-circle"></i>
                    Update Password
                </button>
            </form>
        </div>

        <!-- Success Message -->
        <div id="successStep" class="reset-step hidden">
            <div class="reset-header">
                <i class="fas fa-check-circle" style="font-size: 64px; color: #27AE60; margin-bottom: 20px;"></i>
                <h2>Password Updated!</h2>
                <p>Your password has been successfully updated</p>
            </div>

            <div class="info-box success">
                <i class="fas fa-info-circle"></i>
                You can now login with your new password
            </div>

            <a href="login.jsp" class="submit-btn" style="display: inline-block; text-decoration: none; text-align: center;">
                <i class="fas fa-sign-in-alt"></i>
                Login Now
            </a>
        </div>

        <!-- Message Container -->
        <div class="message-container" id="messageContainer"></div>
    </div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-spinner">
            <i class="fas fa-key"></i>
        </div>
        <p>Processing your request...</p>
    </div>
</div>

<script src="js/forgot-password.js"></script>
</body>
</html>