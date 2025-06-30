// File: src/main/java/com/pahanaedu/dao/BookDAO.java
// Updated BookDAO with Reference Number and QR Code Support
package com.pahanaedu.dao;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.pahanaedu.models.Book;
import com.pahanaedu.utils.DatabaseConnection;

public class BookDAO {
    
    // Get all books with category names and reference data
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
    
    // Get book by ID with all reference data
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
    
    // Search book by reference number
    public Book getBookByReferenceNo(String referenceNo) {
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.reference_no = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, referenceNo);
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
    
    // Search book by QR code
    public Book getBookByQrCode(String qrCode) {
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.qr_code = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, qrCode);
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
    
    // Generate next reference number
    public String generateReferenceNumber() {
        String sql = "SELECT generate_reference_no() as ref_no";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                return rs.getString("ref_no");
            }
        } catch (SQLException e) {
            // Fallback to manual generation if function doesn't exist
            return generateReferenceNumberFallback();
        }
        
        return generateReferenceNumberFallback();
    }
    
    // Fallback reference number generation
    private String generateReferenceNumberFallback() {
        String sql = "SELECT COUNT(*) as count FROM books";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                int count = rs.getInt("count") + 1;
                return String.format("BK%d%06d", 
                    java.time.Year.now().getValue(), count);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        // Final fallback
        return "BK" + System.currentTimeMillis();
    }
    
    // Create new book with auto-generated reference
    public boolean createBook(Book book, List<String> imageUrls) {
        String sql = "INSERT INTO books (title, author, category_id, price, offer_price, stock, " +
                    "description, details, status, reference_no, qr_code) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        Connection conn = null;
        PreparedStatement stmt = null;
        PreparedStatement imgStmt = null;
        ResultSet generatedKeys = null;
        
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            // Generate reference number if not provided
            if (book.getReferenceNo() == null || book.getReferenceNo().isEmpty()) {
                book.setReferenceNo(generateReferenceNumber());
            }
            
            // Set QR code data (same as reference number)
            book.setQrCode(book.getReferenceNo());
            
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
            stmt.setString(10, book.getReferenceNo());
            stmt.setString(11, book.getQrCode());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    int bookId = generatedKeys.getInt(1);
                    book.setId(bookId);
                    
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
    
    // Update book (preserving reference number)
    public boolean updateBook(Book book, List<String> imageUrls) {
        String sql = "UPDATE books SET title = ?, author = ?, category_id = ?, " +
                    "price = ?, offer_price = ?, stock = ?, description = ?, details = ?, status = ? " +
                    "WHERE id = ?";
        
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
            
            // Update book (reference_no and qr_code are preserved)
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
    
    // Search books by multiple criteria
    public List<Book> searchBooks(String searchTerm, String category, String status) {
        List<Book> books = new ArrayList<>();
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT b.*, c.name as category_name FROM books b ");
        sql.append("LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1 ");
        
        List<Object> params = new ArrayList<>();
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            sql.append("AND (b.title LIKE ? OR b.author LIKE ? OR b.reference_no LIKE ?) ");
            String searchPattern = "%" + searchTerm.trim() + "%";
            params.add(searchPattern);
            params.add(searchPattern);
            params.add(searchPattern);
        }
        
        if (category != null && !category.trim().isEmpty() && !"all".equals(category)) {
            sql.append("AND c.name = ? ");
            params.add(category);
        }
        
        if (status != null && !status.trim().isEmpty() && !"all".equals(status)) {
            sql.append("AND b.status = ? ");
            params.add(status);
        }
        
        sql.append("ORDER BY b.title");
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
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
    
    // Get all existing methods from original BookDAO...
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
    
    // Update book reference only
    public boolean updateBookReference(Book book) {
        String sql = "UPDATE books SET reference_no = ?, qr_code = ? WHERE id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, book.getReferenceNo());
            stmt.setString(2, book.getQrCode());
            stmt.setInt(3, book.getId());
            
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    // Get books without reference numbers
    public List<Book> getBooksWithoutReferences() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.reference_no IS NULL OR b.reference_no = '' " +
                    "ORDER BY b.id";
        
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
    
    // Check if reference number exists
    public boolean referenceNumberExists(String referenceNo) {
        String sql = "SELECT COUNT(*) FROM books WHERE reference_no = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, referenceNo);
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
    
    // Get books by category for references
    public List<Book> getBooksByCategoryForReferences(int categoryId) {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.category_id = ? " +
                    "ORDER BY b.reference_no, b.title";
        
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
    
    // Get books with offers for references
    public List<Book> getBooksWithOffersForReferences() {
        List<Book> books = new ArrayList<>();
        String sql = "SELECT b.*, c.name as category_name FROM books b " +
                    "LEFT JOIN categories c ON b.category_id = c.id " +
                    "WHERE b.offer_price IS NOT NULL AND b.offer_price > 0 AND b.offer_price < b.price " +
                    "ORDER BY b.reference_no, b.title";
        
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
    
    // Extract book from result set with reference data
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
        book.setReferenceNo(rs.getString("reference_no"));
        book.setQrCode(rs.getString("qr_code"));
        book.setCreatedAt(rs.getTimestamp("created_at"));
        book.setUpdatedAt(rs.getTimestamp("updated_at"));
        
        // Load images for this book
        book.setImages(getBookImages(book.getId()));
        
        return book;
    }
}