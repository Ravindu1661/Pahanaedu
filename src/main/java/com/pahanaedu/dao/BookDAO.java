// File: src/main/java/com/pahanaedu/dao/BookDAO.java
package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Book;
import com.pahanaedu.utils.DatabaseConnection;

public class BookDAO {
    
    // Get all books with category names
    public List<Book> getAllBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "ORDER BY b.id DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            while (rs.next()) {
                books.add(extractBookFromResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get book by ID
    public Book getBookById(int id) {
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return extractBookFromResultSet(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Create new book
    public boolean createBook(Book book) {
        String sql = "INSERT INTO books (title, author, isbn, category_id, price, stock, description, status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            stmt.setString(3, book.getIsbn());
            if (book.getCategoryId() > 0) {
                stmt.setInt(4, book.getCategoryId());
            } else {
                stmt.setNull(4, Types.INTEGER);
            }
            stmt.setBigDecimal(5, book.getPrice());
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getStatus());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Update book
    public boolean updateBook(Book book) {
        String sql = "UPDATE books SET title = ?, author = ?, isbn = ?, category_id = ?, " +
                    "price = ?, stock = ?, description = ?, status = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            stmt.setString(3, book.getIsbn());
            if (book.getCategoryId() > 0) {
                stmt.setInt(4, book.getCategoryId());
            } else {
                stmt.setNull(4, Types.INTEGER);
            }
            stmt.setBigDecimal(5, book.getPrice());
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getStatus());
            stmt.setInt(9, book.getId());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Delete book
    public boolean deleteBook(int id) {
        String sql = "DELETE FROM books WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Check if ISBN exists
    public boolean isbnExists(String isbn) {
        String sql = "SELECT COUNT(*) FROM books WHERE isbn = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, isbn);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false;
    }
    
    // Check if ISBN exists excluding current book
    public boolean isbnExistsExcluding(String isbn, int bookId) {
        String sql = "SELECT COUNT(*) FROM books WHERE isbn = ? AND id != ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, isbn);
            stmt.setInt(2, bookId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return false;
    }
    
    // Get total books count
    public int getTotalBooksCount() {
        String sql = "SELECT COUNT(*) FROM books WHERE status = 'active'";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return 0;
    }
    
    // Get low stock books
    public List<Book> getLowStockBooks(int threshold) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.stock <= ? AND b.status = 'active' " +
                    "ORDER BY b.stock ASC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, threshold);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    books.add(extractBookFromResultSet(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get books by category
    public List<Book> getBooksByCategory(int categoryId) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.category_id = ? AND b.status = 'active' " +
                    "ORDER BY b.title";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, categoryId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    books.add(extractBookFromResultSet(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Extract book from result set
    private Book extractBookFromResultSet(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getInt("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setIsbn(rs.getString("isbn"));
        book.setCategoryId(rs.getInt("category_id"));
        book.setCategoryName(rs.getString("category_name"));
        book.setPrice(rs.getBigDecimal("price"));
        book.setStock(rs.getInt("stock"));
        book.setDescription(rs.getString("description"));
        book.setStatus(rs.getString("status"));
        book.setCreatedAt(rs.getTimestamp("created_at"));
        book.setUpdatedAt(rs.getTimestamp("updated_at"));
        return book;
    }
}