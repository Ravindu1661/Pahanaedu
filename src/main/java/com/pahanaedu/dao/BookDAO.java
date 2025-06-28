// File: src/main/java/com/pahanaedu/dao/BookDAO.java
// Clean Production Version - No Debug Messages
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
                Book book = extractBookFromResultSet(rs);
                books.add(book);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return books;
    }
    
    // Get book by ID with images
    public Book getBookById(int id) {
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Book book = extractBookFromResultSet(rs);
                    return book;
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return null;
    }
    
    // Create new book with images
    public boolean createBook(Book book, List<String> imageUrls) {
        String sql = "INSERT INTO books (title, author, category_id, price, offer_price, stock, description, details, status) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement imgStmt = null;
        ResultSet generatedKeys = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Auto-set status based on stock
            if (book.getStock() <= 0) {
                book.setStatus("out_of_stock");
            } else if (book.getStatus() == null || book.getStatus().isEmpty()) {
                book.setStatus("active");
            }
            
            // Insert book
            stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            
            if (book.getCategoryId() > 0) {
                stmt.setInt(3, book.getCategoryId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            
            stmt.setBigDecimal(4, book.getPrice());
            
            if (book.getOfferPrice() != null && book.getOfferPrice().compareTo(BigDecimal.ZERO) > 0) {
                stmt.setBigDecimal(5, book.getOfferPrice());
            } else {
                stmt.setNull(5, Types.DECIMAL);
            }
            
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getDetails());
            stmt.setString(9, book.getStatus());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int bookId = generatedKeys.getInt(1);
                    
                    // Save images if provided
                    if (imageUrls != null && !imageUrls.isEmpty()) {
                        String imgSql = "INSERT INTO book_images (book_id, image_url, is_primary) VALUES (?, ?, ?)";
                        imgStmt = conn.prepareStatement(imgSql);
                        
                        for (int i = 0; i < imageUrls.size() && i < 5; i++) {
                            imgStmt.setInt(1, bookId);
                            imgStmt.setString(2, imageUrls.get(i));
                            imgStmt.setBoolean(3, i == 0);
                            imgStmt.executeUpdate();
                        }
                    }
                    
                    conn.commit();
                    return true;
                }
            }
            
            conn.rollback();
            return false;
            
        } catch (SQLException e) {
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
                if (imgStmt != null) imgStmt.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Simplified createBook without images
    public boolean createBook(Book book) {
        return createBook(book, null);
    }
    
    // Update book with images
    public boolean updateBook(Book book, List<String> imageUrls) {
        String sql = "UPDATE books SET title = ?, author = ?, category_id = ?, " +
                    "price = ?, offer_price = ?, stock = ?, description = ?, details = ?, status = ? WHERE id = ?";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement deleteImgStmt = null;
        PreparedStatement insertImgStmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Auto-set status based on stock
            if (book.getStock() <= 0) {
                book.setStatus("out_of_stock");
            } else if ("out_of_stock".equals(book.getStatus()) && book.getStock() > 0) {
                book.setStatus("active");
            }
            
            // Update book
            stmt = conn.prepareStatement(sql);
            stmt.setString(1, book.getTitle());
            stmt.setString(2, book.getAuthor());
            
            if (book.getCategoryId() > 0) {
                stmt.setInt(3, book.getCategoryId());
            } else {
                stmt.setNull(3, Types.INTEGER);
            }
            
            stmt.setBigDecimal(4, book.getPrice());
            
            if (book.getOfferPrice() != null && book.getOfferPrice().compareTo(BigDecimal.ZERO) > 0) {
                stmt.setBigDecimal(5, book.getOfferPrice());
            } else {
                stmt.setNull(5, Types.DECIMAL);
            }
            
            stmt.setInt(6, book.getStock());
            stmt.setString(7, book.getDescription());
            stmt.setString(8, book.getDetails());
            stmt.setString(9, book.getStatus());
            stmt.setInt(10, book.getId());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                // Update images if provided
                if (imageUrls != null) {
                    // Delete old images
                    deleteImgStmt = conn.prepareStatement("DELETE FROM book_images WHERE book_id = ?");
                    deleteImgStmt.setInt(1, book.getId());
                    deleteImgStmt.executeUpdate();
                    
                    // Insert new images
                    if (!imageUrls.isEmpty()) {
                        insertImgStmt = conn.prepareStatement("INSERT INTO book_images (book_id, image_url, is_primary) VALUES (?, ?, ?)");
                        
                        for (int i = 0; i < imageUrls.size() && i < 5; i++) {
                            insertImgStmt.setInt(1, book.getId());
                            insertImgStmt.setString(2, imageUrls.get(i));
                            insertImgStmt.setBoolean(3, i == 0);
                            insertImgStmt.executeUpdate();
                        }
                    }
                }
                
                conn.commit();
                return true;
            }
            
            conn.rollback();
            return false;
            
        } catch (SQLException e) {
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
                if (insertImgStmt != null) insertImgStmt.close();
                if (deleteImgStmt != null) deleteImgStmt.close();
                if (stmt != null) stmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Simplified updateBook without images
    public boolean updateBook(Book book) {
        return updateBook(book, null);
    }
    
    // Delete book and its images
    public boolean deleteBook(int id) {
        Connection conn = null;
        PreparedStatement deleteImgStmt = null;
        PreparedStatement deleteBookStmt = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Delete images first
            deleteImgStmt = conn.prepareStatement("DELETE FROM book_images WHERE book_id = ?");
            deleteImgStmt.setInt(1, id);
            deleteImgStmt.executeUpdate();
            
            // Delete book
            deleteBookStmt = conn.prepareStatement("DELETE FROM books WHERE id = ?");
            deleteBookStmt.setInt(1, id);
            int affectedRows = deleteBookStmt.executeUpdate();
            
            if (affectedRows > 0) {
                conn.commit();
                return true;
            }
            
            conn.rollback();
            return false;
            
        } catch (SQLException e) {
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
                if (deleteBookStmt != null) deleteBookStmt.close();
                if (deleteImgStmt != null) deleteImgStmt.close();
                if (conn != null) {
                    conn.setAutoCommit(true);
                    conn.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
    
    // Get total books count
    public int getTotalBooksCount() {
        String sql = "SELECT COUNT(*) FROM books WHERE status != 'out_of_stock'";
        
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
    
    // Get out of stock books
    public List<Book> getOutOfStockBooks() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.stock = 0 OR b.status = 'out_of_stock' " +
                    "ORDER BY b.title";
        
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
    
    // Get low stock books
    public List<Book> getLowStockBooks(int threshold) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.stock > 0 AND b.stock <= ? AND b.status = 'active' " +
                    "ORDER BY b.stock ASC, b.title";
        
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
    
    // Get book images
    public List<String> getBookImages(int bookId) {
        List<String> images = new ArrayList<>();
        String sql = "SELECT image_url FROM book_images WHERE book_id = ? ORDER BY is_primary DESC, id";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, bookId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    images.add(rs.getString("image_url"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return images;
    }
    
    // Search books by title or author
    public List<Book> searchBooks(String searchTerm) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE (b.title LIKE ? OR b.author LIKE ?) AND b.status = 'active' " +
                    "ORDER BY b.title";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String searchPattern = "%" + searchTerm + "%";
            stmt.setString(1, searchPattern);
            stmt.setString(2, searchPattern);
            
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
    
    // Get books with offers
    public List<Book> getBooksWithOffers() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.offer_price IS NOT NULL AND b.offer_price > 0 AND b.offer_price < b.price " +
                    "AND b.status = 'active' " +
                    "ORDER BY ((b.price - b.offer_price) / b.price) DESC";
        
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
    
    // Update stock quantity
    public boolean updateStock(int bookId, int newStock) {
        String sql = "UPDATE books SET stock = ?, status = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String status = newStock <= 0 ? "out_of_stock" : "active";
            
            stmt.setInt(1, newStock);
            stmt.setString(2, status);
            stmt.setInt(3, bookId);
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Extract book from result set
    private Book extractBookFromResultSet(ResultSet rs) throws SQLException {
        Book book = new Book();
        book.setId(rs.getInt("id"));
        book.setTitle(rs.getString("title"));
        book.setAuthor(rs.getString("author"));
        book.setCategoryId(rs.getInt("category_id"));
        book.setCategoryName(rs.getString("category_name"));
        book.setPrice(rs.getBigDecimal("price"));
        book.setOfferPrice(rs.getBigDecimal("offer_price"));
        book.setStock(rs.getInt("stock"));
        book.setDescription(rs.getString("description"));
        book.setDetails(rs.getString("details"));
        book.setStatus(rs.getString("status"));
        book.setCreatedAt(rs.getTimestamp("created_at"));
        book.setUpdatedAt(rs.getTimestamp("updated_at"));
        
        // Load images for this book
        book.setImages(getBookImages(book.getId()));
        
        return book;
    }
}