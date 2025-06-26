package com.pahanaedu.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.pahanaedu.dao.UserDAO;
import com.pahanaedu.models.User;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;
    private Gson gson;
    
    @Override
    public void init() throws ServletException {
        userDAO = new UserDAO();
        gson = new Gson();
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin session
        if (!isAdminLoggedIn(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        switch (action != null ? action : "") {
            case "getCustomers":
                getCustomers(response);
                break;
            case "getCashiers":
                getCashiers(response);
                break;
            case "getUser":
                getUser(request, response);
                break;
            case "getStats":
                getStats(response);
                break;
            default:
                sendErrorResponse(response, "Invalid action");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check admin session
        if (!isAdminLoggedIn(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        switch (action != null ? action : "") {
            case "addCustomer":
                addCustomer(request, response);
                break;
            case "addCashier":
                addCashier(request, response);
                break;
            case "updateUser":
                updateUser(request, response);
                break;
            case "deleteUser":
                deleteUser(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid action");
        }
    }
    
    // ========== CUSTOMER OPERATIONS ==========
    
    private void getCustomers(HttpServletResponse response) throws IOException {
        List<User> customers = userDAO.getUsersByRole(User.ROLE_CUSTOMER);
        sendJsonResponse(response, customers);
    }
    
    private void addCustomer(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        // Validation
        if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email) || isEmpty(password)) {
            sendErrorResponse(response, "All fields are required");
            return;
        }
        
        if (userDAO.emailExists(email)) {
            sendErrorResponse(response, "Email already exists");
            return;
        }
        
        // Create customer with phone and status
        User customer = new User();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setPhone(phone);
        customer.setStatus(status != null ? status : User.STATUS_ACTIVE);
        customer.setEmail(email);
        customer.setPassword(password);
        customer.setRole(User.ROLE_CUSTOMER);
        
        if (userDAO.createUserByAdmin(customer)) {
            sendSuccessResponse(response, "Customer added successfully");
        } else {
            sendErrorResponse(response, "Failed to add customer");
        }
    }
    
    // ========== CASHIER OPERATIONS ==========
    
    private void getCashiers(HttpServletResponse response) throws IOException {
        List<User> cashiers = userDAO.getUsersByRole(User.ROLE_CASHIER);
        sendJsonResponse(response, cashiers);
    }
    
    private void addCashier(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        
        // Validation
        if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(email) || isEmpty(password)) {
            sendErrorResponse(response, "All fields are required");
            return;
        }
        
        if (userDAO.emailExists(email)) {
            sendErrorResponse(response, "Email already exists");
            return;
        }
        
        // Create cashier with phone and status
        User cashier = new User();
        cashier.setFirstName(firstName);
        cashier.setLastName(lastName);
        cashier.setPhone(phone);
        cashier.setStatus(status != null ? status : User.STATUS_ACTIVE);
        cashier.setEmail(email);
        cashier.setPassword(password);
        cashier.setRole(User.ROLE_CASHIER);
        
        if (userDAO.createUserByAdmin(cashier)) {
            sendSuccessResponse(response, "Cashier added successfully");
        } else {
            sendErrorResponse(response, "Failed to add cashier");
        }
    }
    
    // ========== GENERAL USER OPERATIONS ==========
    
    private void getUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "User ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            User user = userDAO.getUserById(id);
            
            if (user != null) {
                sendJsonResponse(response, user);
            } else {
                sendErrorResponse(response, "User not found");
            }
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void updateUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        String firstName = request.getParameter("firstName");
        String lastName = request.getParameter("lastName");
        String phone = request.getParameter("phone");
        String status = request.getParameter("status");
        String email = request.getParameter("email");
        
        // Validation
        if (isEmpty(idParam) || isEmpty(firstName) || isEmpty(lastName) || isEmpty(email)) {
            sendErrorResponse(response, "All fields are required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            // Check if email exists for other users
            if (userDAO.emailExistsExcluding(email, id)) {
                sendErrorResponse(response, "Email already exists");
                return;
            }
            
            User user = new User();
            user.setId(id);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPhone(phone);
            user.setStatus(status != null ? status : User.STATUS_ACTIVE);
            user.setEmail(email);
            
            if (userDAO.updateUser(user)) {
                sendSuccessResponse(response, "User updated successfully");
            } else {
                sendErrorResponse(response, "Failed to update user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    private void deleteUser(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        if (isEmpty(idParam)) {
            sendErrorResponse(response, "User ID is required");
            return;
        }
        
        try {
            int id = Integer.parseInt(idParam);
            
            if (userDAO.deleteUser(id)) {
                sendSuccessResponse(response, "User deleted successfully");
            } else {
                sendErrorResponse(response, "Failed to delete user");
            }
            
        } catch (NumberFormatException e) {
            sendErrorResponse(response, "Invalid user ID");
        }
    }
    
    // ========== STATISTICS ==========
    
    private void getStats(HttpServletResponse response) throws IOException {
        int customerCount = userDAO.getUserCountByRole(User.ROLE_CUSTOMER);
        int cashierCount = userDAO.getUserCountByRole(User.ROLE_CASHIER);
        
        // Create stats object
        AdminStats stats = new AdminStats();
        stats.totalCustomers = customerCount;
        stats.totalCashiers = cashierCount;
        stats.totalUsers = customerCount + cashierCount;
        
        sendJsonResponse(response, stats);
    }
    
    // ========== UTILITY METHODS ==========
    
    private boolean isAdminLoggedIn(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        
        String userRole = (String) session.getAttribute("userRole");
        return "ADMIN".equals(userRole);
    }
    
    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
    
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }
    
    private void sendSuccessResponse(HttpServletResponse response, String message) throws IOException {
        ApiResponse apiResponse = new ApiResponse(true, message, null);
        sendJsonResponse(response, apiResponse);
    }
    
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        ApiResponse apiResponse = new ApiResponse(false, message, null);
        sendJsonResponse(response, apiResponse);
    }
    
    // ========== INNER CLASSES FOR JSON RESPONSES ==========
    
    public static class ApiResponse {
        public boolean success;
        public String message;
        public Object data;
        
        public ApiResponse(boolean success, String message, Object data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }
    }
    
    public static class AdminStats {
        public int totalCustomers;
        public int totalCashiers;
        public int totalUsers;
    }
}