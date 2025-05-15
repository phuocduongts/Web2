package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find all orders by user
    List<Order> findByUser(User user);
    
    // Find all orders by user and order status
    List<Order> findByUserAndOrderStatus(User user, String orderStatus);
    
    // Find all orders by user with pagination
    Page<Order> findByUser(User user, Pageable pageable);
    
    // Find orders by status with pagination
    Page<Order> findByOrderStatus(String orderStatus, Pageable pageable);
    
    // Find orders between date ranges
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Count orders by status
    long countByOrderStatus(String orderStatus);
    
    // Find non-trashed orders
    List<Order> findByTrashFalse();
    
    // Find orders by user that are not in trash
    List<Order> findByUserAndTrashFalse(User user);
    
    // Search orders by tracking number
    Order findByTrackingNumber(String trackingNumber);
    
    // Custom query to find orders with search term in various fields
    @Query("SELECT o FROM Order o WHERE " +
           "(CAST(o.id AS string) LIKE %:searchTerm% OR " +
           "o.user.username LIKE %:searchTerm% OR " +
           "o.user.email LIKE %:searchTerm% OR " +
           "o.user.fullName LIKE %:searchTerm% OR " +
           "o.shippingName LIKE %:searchTerm% OR " +
           "o.trackingNumber LIKE %:searchTerm%) " +
           "AND o.trash = false")
    Page<Order> searchOrders(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    // Find recent orders
    @Query("SELECT o FROM Order o WHERE o.trash = false ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(Pageable pageable);

    
}