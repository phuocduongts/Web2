package com.example.backend.controller;

import com.example.backend.dto.CreateOrderRequest;
import com.example.backend.dto.OrderDTO;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * Create a new order
     */
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody CreateOrderRequest request) {
        OrderDTO createdOrder = orderService.createOrder(request);
        return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
    }

    
    /**
     * Get an order by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        OrderDTO order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    /**
     * Get all orders for a user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getUserOrders(@PathVariable Long userId) {
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Get all orders with pagination
     */
    /**
     * Get all orders
     */
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * Search orders
     */
    @GetMapping("/search")
    public ResponseEntity<List<OrderDTO>> searchOrders(@RequestParam String term) {
        List<OrderDTO> orders = orderService.searchOrders(term);
        return ResponseEntity.ok(orders);
    }

    /**
     * Update order status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        OrderDTO updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Update payment status
     */
    @PutMapping("/{id}/payment")
    public ResponseEntity<OrderDTO> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        OrderDTO updatedOrder = orderService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Update tracking information
     */
    @PutMapping("/{id}/tracking")
    public ResponseEntity<OrderDTO> updateTrackingInfo(
            @PathVariable Long id,
            @RequestParam String trackingNumber) {

        OrderDTO updatedOrder = orderService.updateTrackingInfo(id, trackingNumber);
        return ResponseEntity.ok(updatedOrder);
    }

    /**
     * Cancel an order
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        OrderDTO cancelledOrder = orderService.cancelOrder(id);
        return ResponseEntity.ok(cancelledOrder);
    }

    /**
     * Move an order to trash (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> moveOrderToTrash(@PathVariable Long id) {
        orderService.moveOrderToTrash(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Restore an order from trash
     */
    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreOrderFromTrash(@PathVariable Long id) {
        orderService.restoreOrderFromTrash(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get recent orders
     */
    @GetMapping("/recent")
    public ResponseEntity<List<OrderDTO>> getRecentOrders(
            @RequestParam(defaultValue = "5") int limit) {

        List<OrderDTO> recentOrders = orderService.getRecentOrders(limit);
        return ResponseEntity.ok(recentOrders);
    }

    /**
     * Get order statistics
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Long>> getOrderStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("pending", orderService.countOrdersByStatus("PENDING"));
        stats.put("processing", orderService.countOrdersByStatus("PROCESSING"));
        stats.put("shipped", orderService.countOrdersByStatus("SHIPPED"));
        stats.put("delivered", orderService.countOrdersByStatus("DELIVERED"));
        stats.put("cancelled", orderService.countOrdersByStatus("CANCELLED"));

        return ResponseEntity.ok(stats);
    }
}