// File: src/main/java/com/pahanaedu/models/Book.java
package com.pahanaedu.models;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class Book {
    // Constants for status
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    
    private int id;
    private String title;
    private String author;
    private String isbn;
    private int categoryId;
    private String categoryName; // For joined queries
    private BigDecimal price;
    private int stock;
    private String description;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    
    // Constructors
    public Book() {
        this.status = STATUS_ACTIVE;
        this.stock = 0;
    }
    
    public Book(String title, String author, String isbn, int categoryId, 
                BigDecimal price, int stock, String description) {
        this();
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.categoryId = categoryId;
        this.price = price;
        this.stock = stock;
        this.description = description;
    }
    
    // Getters and Setters
    public int getId() {
        return id;
    }
    
    public void setId(int id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public String getIsbn() {
        return isbn;
    }
    
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
    
    public int getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }
    
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public int getStock() {
        return stock;
    }
    
    public void setStock(int stock) {
        this.stock = stock;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
    
    public Timestamp getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", isbn='" + isbn + '\'' +
                ", categoryId=" + categoryId +
                ", price=" + price +
                ", stock=" + stock +
                ", status='" + status + '\'' +
                '}';
    }
}