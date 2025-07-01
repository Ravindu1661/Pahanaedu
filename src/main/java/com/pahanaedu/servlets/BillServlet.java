// File: src/main/java/com/pahanaedu/servlets/BillServlet.java
package com.pahanaedu.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.pahanaedu.dao.BillDAO;
import com.pahanaedu.models.Bill;
import com.pahanaedu.models.BillItem;

@WebServlet("/bills")
public class BillServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private BillDAO billDAO;
    private Gson gson;
    
    @Override
    public void init() {
        billDAO = new BillDAO();
        gson = new Gson();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        // Check cashier/admin session
        if (!isAuthorized(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        if ("createBill".equals(action)) {
            createBill(request, response);
        } else {
            sendErrorResponse(response, "Invalid action");
        }
    }
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        if (!isAuthorized(request)) {
            sendErrorResponse(response, "Unauthorized access");
            return;
        }
        
        String action = request.getParameter("action");
        
        switch (action != null ? action : "") {
            case "getBill":
                getBill(request, response);
                break;
            case "getAllBills":
                getAllBills(response);
                break;
            case "getMyCashierBills":
                getMyCashierBills(request, response);
                break;
            case "getHistory":
                getBillHistory(request, response);
                break;
            case "getBillDetails":
                getBillDetails(request, response);
                break;
            default:
                sendErrorResponse(response, "Invalid action");
        }
    }
    
    // Create new bill
    private void createBill(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            // Get cashier info from session
            HttpSession session = request.getSession();
            Integer cashierId = (Integer) session.getAttribute("userId");
            String cashierName = session.getAttribute("userFirstName") + " " + 
                               session.getAttribute("userLastName");
            
            // Get request data
            String itemsJson = request.getParameter("items");
            String paymentMethod = request.getParameter("paymentMethod");
            
            if (itemsJson == null || itemsJson.trim().isEmpty()) {
                sendErrorResponse(response, "No items provided");
                return;
            }
            
            // Parse items
            JsonArray itemsArray = JsonParser.parseString(itemsJson).getAsJsonArray();
            List<BillItem> billItems = new ArrayList<>();
            
            for (int i = 0; i < itemsArray.size(); i++) {
                JsonObject itemObj = itemsArray.get(i).getAsJsonObject();
                
                BillItem item = new BillItem();
                item.setBookId(itemObj.get("id").getAsInt());
                item.setBookTitle(itemObj.get("title").getAsString());
                item.setBookReference(itemObj.get("referenceNo").getAsString());
                item.setUnitPrice(new BigDecimal(itemObj.get("price").getAsString()));
                item.setQuantity(itemObj.get("quantity").getAsInt());
                
                billItems.add(item);
            }
            
            if (billItems.isEmpty()) {
                sendErrorResponse(response, "No valid items found");
                return;
            }
            
            // Create bill
            Bill bill = new Bill();
            bill.setCashierId(cashierId);
            bill.setCashierName(cashierName);
            bill.setPaymentMethod(paymentMethod != null ? paymentMethod : Bill.PAYMENT_CASH);
            bill.setItems(billItems);
            
            // Save bill
            if (billDAO.createBill(bill)) {
                JsonObject responseObj = new JsonObject();
                responseObj.addProperty("success", true);
                responseObj.addProperty("message", "Bill created successfully");
                responseObj.addProperty("billNo", bill.getBillNo());
                responseObj.addProperty("totalAmount", bill.getTotalAmount());
                
                sendJsonResponse(response, responseObj);
            } else {
                sendErrorResponse(response, "Failed to create bill");
            }
            
        } catch (Exception e) {
            System.err.println("Error creating bill: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error processing bill: " + e.getMessage());
        }
    }
    
    // Get bill by ID or bill number
    private void getBill(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        String idParam = request.getParameter("id");
        String billNo = request.getParameter("billNo");
        
        Bill bill = null;
        
        if (billNo != null && !billNo.trim().isEmpty()) {
            bill = billDAO.getBillByBillNo(billNo);
        } else if (idParam != null && !idParam.trim().isEmpty()) {
            try {
                int id = Integer.parseInt(idParam);
                bill = billDAO.getBillById(id);
            } catch (NumberFormatException e) {
                sendErrorResponse(response, "Invalid bill ID");
                return;
            }
        } else {
            sendErrorResponse(response, "Bill ID or bill number required");
            return;
        }
        
        if (bill != null) {
            sendJsonResponse(response, bill);
        } else {
            sendErrorResponse(response, "Bill not found");
        }
    }
    
    // Get all bills (admin only)
    private void getAllBills(HttpServletResponse response) throws IOException {
        List<Bill> bills = billDAO.getAllBills();
        sendJsonResponse(response, bills);
    }
    
    // Get bills for current cashier
    private void getMyCashierBills(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        HttpSession session = request.getSession();
        Integer cashierId = (Integer) session.getAttribute("userId");
        
        if (cashierId == null) {
            sendErrorResponse(response, "Cashier ID not found in session");
            return;
        }
        
        List<Bill> bills = billDAO.getBillsByCashier(cashierId);
        sendJsonResponse(response, bills);
    }
    
    // Get bill history for cashier dashboard
    private void getBillHistory(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            HttpSession session = request.getSession();
            String userRole = (String) session.getAttribute("userRole");
            Integer userId = (Integer) session.getAttribute("userId");
            
            List<Bill> bills = new ArrayList<>();
            
            if ("ADMIN".equals(userRole)) {
                // Admin can see all bills
                bills = billDAO.getAllBills();
            } else if ("CASHIER".equals(userRole) && userId != null) {
                // Cashier can see only their own bills
                bills = billDAO.getBillsByCashier(userId);
            } else {
                sendErrorResponse(response, "Unauthorized to view bill history");
                return;
            }
            
            // Create response with simplified bill data for history table
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            
            JsonArray billsArray = new JsonArray();
            
            for (Bill bill : bills) {
                JsonObject billObj = new JsonObject();
                billObj.addProperty("id", bill.getId());
                billObj.addProperty("billNo", bill.getBillNo());
                
                // Use createdAt instead of createdDate (matching your Bill model)
                String createdDate = bill.getCreatedAt() != null ? 
                    bill.getCreatedAt().toString() : 
                    (bill.getBillDate() != null ? bill.getBillDate().toString() : "");
                billObj.addProperty("createdDate", createdDate);
                
                billObj.addProperty("paymentMethod", bill.getPaymentMethod());
                billObj.addProperty("totalAmount", bill.getTotalAmount().toString());
                billObj.addProperty("cashierName", bill.getCashierName());
                
                // Debug: Log bill items for debugging
                System.out.println("Bill " + bill.getBillNo() + " items: " + 
                    (bill.getItems() != null ? bill.getItems().size() : "null"));
                
                // Add item count - ensure items are loaded
                int itemCount = 0;
                if (bill.getItems() != null) {
                    itemCount = bill.getItems().size();
                } else {
                    // If items are null, fetch them directly
                    List<BillItem> items = billDAO.getBillItems(bill.getId());
                    itemCount = items != null ? items.size() : 0;
                    System.out.println("Fetched items directly for bill " + bill.getBillNo() + ": " + itemCount);
                }
                
                billObj.addProperty("itemCount", itemCount);
                
                // Add items array for JavaScript access
                JsonArray itemsArray = new JsonArray();
                List<BillItem> billItems = bill.getItems();
                if (billItems == null) {
                    billItems = billDAO.getBillItems(bill.getId());
                }
                
                if (billItems != null) {
                    for (BillItem item : billItems) {
                        JsonObject itemObj = new JsonObject();
                        itemObj.addProperty("title", item.getBookTitle());
                        itemObj.addProperty("referenceNo", item.getBookReference());
                        itemObj.addProperty("quantity", item.getQuantity());
                        itemObj.addProperty("price", item.getUnitPrice().toString());
                        itemsArray.add(itemObj);
                    }
                }
                billObj.add("items", itemsArray);
                
                billsArray.add(billObj);
            }
            
            responseObj.add("bills", billsArray);
            responseObj.addProperty("message", "Bill history loaded successfully");
            
            sendJsonResponse(response, responseObj);
            
        } catch (Exception e) {
            System.err.println("Error loading bill history: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error loading bill history: " + e.getMessage());
        }
    }
    
    // Get detailed bill information for viewing/reprinting
    private void getBillDetails(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            String billNo = request.getParameter("billNo");
            
            if (billNo == null || billNo.trim().isEmpty()) {
                sendErrorResponse(response, "Bill number is required");
                return;
            }
            
            // Get bill with full details including items (using existing method)
            Bill bill = billDAO.getBillByBillNo(billNo);
            
            if (bill == null) {
                sendErrorResponse(response, "Bill not found");
                return;
            }
            
            // Check if user has permission to view this bill
            HttpSession session = request.getSession();
            String userRole = (String) session.getAttribute("userRole");
            Integer userId = (Integer) session.getAttribute("userId");
            
            if (!"ADMIN".equals(userRole) && !userId.equals(bill.getCashierId())) {
                sendErrorResponse(response, "Unauthorized to view this bill");
                return;
            }
            
            // Create detailed response
            JsonObject responseObj = new JsonObject();
            responseObj.addProperty("success", true);
            
            JsonObject billObj = new JsonObject();
            billObj.addProperty("id", bill.getId());
            billObj.addProperty("billNo", bill.getBillNo());
            
            // Use createdAt for createdDate (matching your Bill model)
            String createdDate = bill.getCreatedAt() != null ? 
                bill.getCreatedAt().toString() : 
                (bill.getBillDate() != null ? bill.getBillDate().toString() : "");
            billObj.addProperty("createdDate", createdDate);
            
            billObj.addProperty("paymentMethod", bill.getPaymentMethod());
            billObj.addProperty("totalAmount", bill.getTotalAmount().toString());
            billObj.addProperty("cashierName", bill.getCashierName());
            billObj.addProperty("cashierId", bill.getCashierId());
            
            // Add items array
            JsonArray itemsArray = new JsonArray();
            
            if (bill.getItems() != null) {
                for (BillItem item : bill.getItems()) {
                    JsonObject itemObj = new JsonObject();
                    itemObj.addProperty("id", item.getId());
                    itemObj.addProperty("bookId", item.getBookId());
                    itemObj.addProperty("title", item.getBookTitle());
                    itemObj.addProperty("referenceNo", item.getBookReference());
                    itemObj.addProperty("price", item.getUnitPrice().toString());
                    itemObj.addProperty("quantity", item.getQuantity());
                    itemObj.addProperty("total", item.getUnitPrice().multiply(
                        new BigDecimal(item.getQuantity())).toString());
                    
                    itemsArray.add(itemObj);
                }
            }
            
            billObj.add("items", itemsArray);
            responseObj.add("bill", billObj);
            responseObj.addProperty("message", "Bill details loaded successfully");
            
            sendJsonResponse(response, responseObj);
            
        } catch (Exception e) {
            System.err.println("Error loading bill details: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, "Error loading bill details: " + e.getMessage());
        }
    }
    
    // Check if user is authorized (cashier or admin)
    private boolean isAuthorized(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return false;
        
        String userRole = (String) session.getAttribute("userRole");
        return "CASHIER".equals(userRole) || "ADMIN".equals(userRole);
    }
    
    // Send JSON response
    private void sendJsonResponse(HttpServletResponse response, Object data) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        PrintWriter out = response.getWriter();
        out.print(gson.toJson(data));
        out.flush();
    }
    
    // Send error response
    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        
        JsonObject errorResponse = new JsonObject();
        errorResponse.addProperty("success", false);
        errorResponse.addProperty("message", message);
        
        sendJsonResponse(response, errorResponse);
    }
}