// File: src/main/java/com/pahanaedu/dao/BillDAO.java
package com.pahanaedu.dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Bill;
import com.pahanaedu.models.BillItem;
import com.pahanaedu.utils.DatabaseConnection;

public class BillDAO {
    
    // Generate bill number
    public String generateBillNumber() {
        String sql = "SELECT generate_bill_no() as bill_no";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getString("bill_no");
            }
        } catch (SQLException e) {
            System.out.println("Using fallback bill generation");
            return generateBillNumberFallback();
        }
        
        return generateBillNumberFallback();
    }
    
    // Fallback bill number generation
    private String generateBillNumberFallback() {
        String sql = "SELECT COUNT(*) as count FROM bills WHERE DATE(created_at) = CURDATE()";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                int count = rs.getInt("count") + 1;
                String billNo = String.format("BILL%s%04d", 
                    java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")), 
                    count);
                System.out.println("Generated bill number: " + billNo);
                return billNo;
            }
        } catch (SQLException e) {
            System.err.println("Error generating bill number: " + e.getMessage());
        }
        
        // Final fallback
        return "BILL" + System.currentTimeMillis();
    }
    
    // Create bill with items
    public boolean createBill(Bill bill) {
        Connection conn = null;
        PreparedStatement billStmt = null;
        PreparedStatement itemStmt = null;
        PreparedStatement stockStmt = null;
        ResultSet generatedKeys = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Generate bill number if not provided
            if (bill.getBillNo() == null || bill.getBillNo().isEmpty()) {
                bill.setBillNo(generateBillNumber());
            }
            
            // Set current date and time
            bill.setBillDate(new Date(System.currentTimeMillis()));
            bill.setBillTime(new Time(System.currentTimeMillis()));
            
            // Calculate totals
            bill.calculateTotals();
            
            // Insert bill
            String billSql = "INSERT INTO bills (bill_no, cashier_id, cashier_name, subtotal, " +
                           "tax_amount, total_amount, payment_method, payment_status, bill_date, bill_time) " +
                           "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            billStmt = conn.prepareStatement(billSql, Statement.RETURN_GENERATED_KEYS);
            billStmt.setString(1, bill.getBillNo());
            billStmt.setInt(2, bill.getCashierId());
            billStmt.setString(3, bill.getCashierName());
            billStmt.setBigDecimal(4, bill.getSubtotal());
            billStmt.setBigDecimal(5, bill.getTaxAmount());
            billStmt.setBigDecimal(6, bill.getTotalAmount());
            billStmt.setString(7, bill.getPaymentMethod());
            billStmt.setString(8, bill.getPaymentStatus());
            billStmt.setDate(9, bill.getBillDate());
            billStmt.setTime(10, bill.getBillTime());
            
            int affectedRows = billStmt.executeUpdate();
            
            if (affectedRows > 0) {
                generatedKeys = billStmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int billId = generatedKeys.getInt(1);
                    bill.setId(billId);
                    
                    // Insert bill items and update stock
                    if (bill.getItems() != null && !bill.getItems().isEmpty()) {
                        String itemSql = "INSERT INTO bill_items (bill_id, book_id, book_title, " +
                                       "book_reference, unit_price, quantity, total_price) " +
                                       "VALUES (?, ?, ?, ?, ?, ?, ?)";
                        
                        itemStmt = conn.prepareStatement(itemSql);
                        
                        String stockSql = "UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?";
                        stockStmt = conn.prepareStatement(stockSql);
                        
                        for (BillItem item : bill.getItems()) {
                            // Calculate total price for item
                            item.calculateTotalPrice();
                            
                            // Insert bill item
                            itemStmt.setInt(1, billId);
                            itemStmt.setInt(2, item.getBookId());
                            itemStmt.setString(3, item.getBookTitle());
                            itemStmt.setString(4, item.getBookReference());
                            itemStmt.setBigDecimal(5, item.getUnitPrice());
                            itemStmt.setInt(6, item.getQuantity());
                            itemStmt.setBigDecimal(7, item.getTotalPrice());
                            itemStmt.executeUpdate();
                            
                            // Update book stock
                            stockStmt.setInt(1, item.getQuantity());
                            stockStmt.setInt(2, item.getBookId());
                            stockStmt.setInt(3, item.getQuantity());
                            int stockUpdated = stockStmt.executeUpdate();
                            
                            if (stockUpdated == 0) {
                                System.err.println("Warning: Could not update stock for book ID " + item.getBookId());
                            }
                        }
                    }
                    
                    conn.commit();
                    System.out.println("✅ Bill created successfully: " + bill.getBillNo());
                    return true;
                }
            }
            
            conn.rollback();
            return false;
            
        } catch (SQLException e) {
            System.err.println("❌ Error creating bill: " + e.getMessage());
            e.printStackTrace();
            if (conn != null) {
                try {
                    conn.rollback();
                } catch (SQLException rollbackEx) {
                    rollbackEx.printStackTrace();
                }
            }
            return false;
        } finally {
            try {
                if (generatedKeys != null) generatedKeys.close();
                if (stockStmt != null) stockStmt.close();
                if (itemStmt != null) itemStmt.close();
                if (billStmt != null) billStmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Get bill by ID
    public Bill getBillById(int id) {
        String sql = "SELECT * FROM bills WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(id));
                    return bill;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bill by ID: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Get bill by bill number
    public Bill getBillByBillNo(String billNo) {
        String sql = "SELECT * FROM bills WHERE bill_no = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, billNo);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    return bill;
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bill by number: " + e.getMessage());
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Get bill by bill number with items (alias method for servlet compatibility)
    public Bill getBillByBillNoWithItems(String billNo) {
        // This method is the same as getBillByBillNo since it already includes items
        return getBillByBillNo(billNo);
    }
    
    // Get bill items
    public List<BillItem> getBillItems(int billId) {
        List<BillItem> items = new ArrayList<>();
        String sql = "SELECT * FROM bill_items WHERE bill_id = ? ORDER BY id";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, billId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    BillItem item = extractBillItemFromResultSet(rs);
                    items.add(item);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bill items: " + e.getMessage());
            e.printStackTrace();
        }
        
        return items;
    }
    
    // Get all bills (optimized for history - loads items efficiently)
    public List<Bill> getAllBills() {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills ORDER BY created_at DESC LIMIT 100";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                Bill bill = extractBillFromResultSet(rs);
                
                // Load items for each bill
                List<BillItem> items = getBillItems(bill.getId());
                bill.setItems(items);
                
                System.out.println("Loaded bill " + bill.getBillNo() + " with " + 
                    (items != null ? items.size() : 0) + " items");
                
                bills.add(bill);
            }
        } catch (SQLException e) {
            System.err.println("Error fetching all bills: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get all bills with pagination
    public List<Bill> getAllBills(int limit, int offset) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills ORDER BY created_at DESC LIMIT ? OFFSET ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, limit);
            stmt.setInt(2, offset);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching all bills with pagination: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get bills by cashier
    public List<Bill> getBillsByCashier(int cashierId) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills WHERE cashier_id = ? ORDER BY created_at DESC LIMIT 50";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, cashierId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    
                    // Load items for each bill
                    List<BillItem> items = getBillItems(bill.getId());
                    bill.setItems(items);
                    
                    System.out.println("Loaded cashier bill " + bill.getBillNo() + " with " + 
                        (items != null ? items.size() : 0) + " items");
                    
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bills by cashier: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get bills by cashier with pagination
    public List<Bill> getBillsByCashier(int cashierId, int limit, int offset) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills WHERE cashier_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, cashierId);
            stmt.setInt(2, limit);
            stmt.setInt(3, offset);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bills by cashier with pagination: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get bills by date range
    public List<Bill> getBillsByDateRange(Date startDate, Date endDate) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills WHERE bill_date BETWEEN ? AND ? ORDER BY created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setDate(1, startDate);
            stmt.setDate(2, endDate);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching bills by date range: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get bills count for pagination
    public int getBillsCount() {
        String sql = "SELECT COUNT(*) as count FROM bills";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getInt("count");
            }
        } catch (SQLException e) {
            System.err.println("Error getting bills count: " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    // Get bills count by cashier
    public int getBillsCountByCashier(int cashierId) {
        String sql = "SELECT COUNT(*) as count FROM bills WHERE cashier_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, cashierId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("count");
                }
            }
        } catch (SQLException e) {
            System.err.println("Error getting bills count by cashier: " + e.getMessage());
            e.printStackTrace();
        }
        
        return 0;
    }
    
    // Get today's bills for cashier
    public List<Bill> getTodayBillsByCashier(int cashierId) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills WHERE cashier_id = ? AND DATE(created_at) = CURDATE() ORDER BY created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, cashierId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching today's bills by cashier: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get recent bills (for dashboard/history quick view)
    public List<Bill> getRecentBills(int limit) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills ORDER BY created_at DESC LIMIT ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, limit);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    // For recent bills list, load items too
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching recent bills: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Get recent bills by cashier (for cashier dashboard)
    public List<Bill> getRecentBillsByCashier(int cashierId, int limit) {
        List<Bill> bills = new ArrayList<>();
        String sql = "SELECT * FROM bills WHERE cashier_id = ? ORDER BY created_at DESC LIMIT ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, cashierId);
            stmt.setInt(2, limit);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Bill bill = extractBillFromResultSet(rs);
                    bill.setItems(getBillItems(bill.getId()));
                    bills.add(bill);
                }
            }
        } catch (SQLException e) {
            System.err.println("Error fetching recent bills by cashier: " + e.getMessage());
            e.printStackTrace();
        }
        
        return bills;
    }
    
    // Update bill status
    public boolean updateBillStatus(int billId, String status) {
        String sql = "UPDATE bills SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, status);
            stmt.setInt(2, billId);
            
            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
            
        } catch (SQLException e) {
            System.err.println("Error updating bill status: " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    // Delete bill (soft delete - update status)
    public boolean deleteBill(int billId) {
        return updateBillStatus(billId, Bill.STATUS_CANCELLED);
    }
    
    // Extract bill from result set
    private Bill extractBillFromResultSet(ResultSet rs) throws SQLException {
        Bill bill = new Bill();
        bill.setId(rs.getInt("id"));
        bill.setBillNo(rs.getString("bill_no"));
        bill.setCashierId(rs.getInt("cashier_id"));
        bill.setCashierName(rs.getString("cashier_name"));
        bill.setSubtotal(rs.getBigDecimal("subtotal"));
        bill.setTaxAmount(rs.getBigDecimal("tax_amount"));
        bill.setTotalAmount(rs.getBigDecimal("total_amount"));
        bill.setPaymentMethod(rs.getString("payment_method"));
        bill.setPaymentStatus(rs.getString("payment_status"));
        bill.setBillDate(rs.getDate("bill_date"));
        bill.setBillTime(rs.getTime("bill_time"));
        bill.setCreatedAt(rs.getTimestamp("created_at"));
        bill.setUpdatedAt(rs.getTimestamp("updated_at"));
        return bill;
    }
    
    // Extract bill item from result set
    private BillItem extractBillItemFromResultSet(ResultSet rs) throws SQLException {
        BillItem item = new BillItem();
        item.setId(rs.getInt("id"));
        item.setBillId(rs.getInt("bill_id"));
        item.setBookId(rs.getInt("book_id"));
        item.setBookTitle(rs.getString("book_title"));
        item.setBookReference(rs.getString("book_reference"));
        item.setUnitPrice(rs.getBigDecimal("unit_price"));
        item.setQuantity(rs.getInt("quantity"));
        item.setTotalPrice(rs.getBigDecimal("total_price"));
        item.setCreatedAt(rs.getTimestamp("created_at"));
        return item;
    }
}