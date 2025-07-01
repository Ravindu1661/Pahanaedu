// File: src/main/java/com/pahanaedu/models/Bill.java
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.util.List;

public class Bill {
    // Payment methods
    public static final String PAYMENT_CASH = "CASH";
    public static final String PAYMENT_CARD = "CARD";
    
    // Payment status
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";
    
    private int id;
    private String billNo;
    private int cashierId;
    private String cashierName;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private Date billDate;
    private Time billTime;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Bill items
    private List<BillItem> items;
    
    public Bill() {
        this.subtotal = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        this.totalAmount = BigDecimal.ZERO;
        this.paymentMethod = PAYMENT_CASH;
        this.paymentStatus = STATUS_COMPLETED;
    }
    
    // Calculate totals
    public void calculateTotals() {
        if (items != null && !items.isEmpty()) {
            subtotal = items.stream()
                .map(BillItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            taxAmount = subtotal.multiply(new BigDecimal("0.10")); // 10% tax
            totalAmount = subtotal.add(taxAmount);
        }
    }
    
    // Get formatted bill number
    public String getFormattedBillNo() {
        return billNo != null ? billNo : "N/A";
    }
    
    // Get item count
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }
    
    // Get total quantity
    public int getTotalQuantity() {
        return items != null ? 
            items.stream().mapToInt(BillItem::getQuantity).sum() : 0;
    }
    
    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    
    public String getBillNo() { return billNo; }
    public void setBillNo(String billNo) { this.billNo = billNo; }
    
    public int getCashierId() { return cashierId; }
    public void setCashierId(int cashierId) { this.cashierId = cashierId; }
    
    public String getCashierName() { return cashierName; }
    public void setCashierName(String cashierName) { this.cashierName = cashierName; }
    
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public Date getBillDate() { return billDate; }
    public void setBillDate(Date billDate) { this.billDate = billDate; }
    
    public Time getBillTime() { return billTime; }
    public void setBillTime(Time billTime) { this.billTime = billTime; }
    
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
    
    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }
    
    public List<BillItem> getItems() { return items; }
    public void setItems(List<BillItem> items) { 
        this.items = items;
        calculateTotals();
    }
    
    @Override
    public String toString() {
        return "Bill{" +
                "id=" + id +
                ", billNo='" + billNo + '\'' +
                ", cashierName='" + cashierName + '\'' +
                ", totalAmount=" + totalAmount +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", itemCount=" + getItemCount() +
                '}';
    }
}