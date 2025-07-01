// File: src/main/java/com/pahanaedu/models/BillItem.java
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class BillItem {
    private int id;
    private int billId;
    private int bookId;
    private String bookTitle;
    private String bookReference;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal totalPrice;
    private Timestamp createdAt;
    
    public BillItem() {
        this.quantity = 1;
        this.unitPrice = BigDecimal.ZERO;
        this.totalPrice = BigDecimal.ZERO;
    }
    
    public BillItem(int bookId, String bookTitle, String bookReference, 
                   BigDecimal unitPrice, int quantity) {
        this();
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookReference = bookReference;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        calculateTotalPrice();
    }
    
    // Calculate total price
    public void calculateTotalPrice() {
        if (unitPrice != null && quantity > 0) {
            totalPrice = unitPrice.multiply(new BigDecimal(quantity));
        } else {
            totalPrice = BigDecimal.ZERO;
        }
    }
    
    // Auto-calculate when setting quantity
    public void setQuantity(int quantity) {
        this.quantity = quantity;
        calculateTotalPrice();
    }
    
    // Auto-calculate when setting unit price
    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateTotalPrice();
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public int getBillId() { return billId; }
    public void setBillId(int billId) { this.billId = billId; }
    
    public int getBookId() { return bookId; }
    public void setBookId(int bookId) { this.bookId = bookId; }
    
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    
    public String getBookReference() { return bookReference; }
    public void setBookReference(String bookReference) { this.bookReference = bookReference; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    
    public int getQuantity() { return quantity; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    @Override
    public String toString() {
        return "BillItem{" +
                "bookTitle='" + bookTitle + '\'' +
                ", bookReference='" + bookReference + '\'' +
                ", unitPrice=" + unitPrice +
                ", quantity=" + quantity +
                ", totalPrice=" + totalPrice +
                '}';
    }
}