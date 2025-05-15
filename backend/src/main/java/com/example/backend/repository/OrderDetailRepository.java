package com.example.backend.repository;

import com.example.backend.model.Order;
import com.example.backend.model.OrderDetail;
import com.example.backend.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    // Find all details for a specific order
    List<OrderDetail> findByOrder(Order order);

    // Find all order details for a specific product
    List<OrderDetail> findByProduct(Product product);

    // Find non-trashed order details
    List<OrderDetail> findByTrashFalse();

    // Find order details for an order that are not in trash
    List<OrderDetail> findByOrderAndTrashFalse(Order order);

    // Get total quantity of a product that has been ordered
    @Query(value = "SELECT SUM(od.quantity) " +
            "FROM order_details od " +
            "JOIN orders o ON od.order_id = o.id " +
            "WHERE od.product_id = :productId AND o.order_status != 'CANCELLED' AND od.trash = false", nativeQuery = true)
    Integer getTotalQuantitySoldByProductId(@Param("productId") Long productId);

    // Find best selling products
    @Query(value = "SELECT od.product_id, SUM(od.quantity) as total_sold " +
            "FROM order_details od " +
            "JOIN orders o ON od.order_id = o.id " +
            "WHERE o.order_status != 'CANCELLED' AND od.trash = false " +
            "GROUP BY od.product_id " +
            "ORDER BY total_sold DESC", nativeQuery = true)
    List<Object[]> findBestSellingProducts(Pageable pageable);

    // Find products in a specific order
    @Query("SELECT od.product FROM OrderDetail od WHERE od.order.id = :orderId AND od.trash = false")
    List<Product> findProductsByOrderId(@Param("orderId") Long orderId);
}