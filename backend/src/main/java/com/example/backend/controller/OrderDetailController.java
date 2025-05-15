package com.example.backend.controller;

import com.example.backend.dto.OrderDetailDTO;
import com.example.backend.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order-details")
public class OrderDetailController {
    
    @Autowired
    private OrderDetailService orderDetailService;
    
    /**
     * Get all details for a specific order
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderDetailDTO>> getOrderDetailsByOrderId(@PathVariable Long orderId) {
        List<OrderDetailDTO> orderDetails = orderDetailService.getOrderDetailsByOrderId(orderId);
        return ResponseEntity.ok(orderDetails);
    }
    
    /**
     * Get an order detail by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailDTO> getOrderDetailById(@PathVariable Long id) {
        OrderDetailDTO orderDetail = orderDetailService.getOrderDetailById(id);
        return ResponseEntity.ok(orderDetail);
    }
    
    /**
     * Update order detail quantity
     */
    @PutMapping("/{id}/quantity")
    public ResponseEntity<OrderDetailDTO> updateOrderDetailQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        
        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        OrderDetailDTO updatedDetail = orderDetailService.updateOrderDetailQuantity(id, quantity);
        return ResponseEntity.ok(updatedDetail);
    }
    
    /**
     * Remove an item from an order
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeOrderDetail(@PathVariable Long id) {
        orderDetailService.removeOrderDetail(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Add a new item to an existing order
     */
    @PostMapping("/order/{orderId}")
    public ResponseEntity<OrderDetailDTO> addItemToOrder(
            @PathVariable Long orderId,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        
        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }
        
        OrderDetailDTO newDetail = orderDetailService.addItemToOrder(orderId, productId, quantity);
        return new ResponseEntity<>(newDetail, HttpStatus.CREATED);
    }
    
    /**
     * Get best selling products
     */
    @GetMapping("/best-selling")
    public ResponseEntity<List<Map<String, Object>>> getBestSellingProducts(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Map<String, Object>> bestSellers = orderDetailService.getBestSellingProducts(limit);
        return ResponseEntity.ok(bestSellers);
    }
    
    /**
     * Get total quantity sold for a product
     */
    @GetMapping("/product/{productId}/total-sold")
    public ResponseEntity<Map<String, Object>> getTotalQuantitySoldByProductId(@PathVariable Long productId) {
        Integer totalSold = orderDetailService.getTotalQuantitySoldByProductId(productId);
        
        Map<String, Object> response = Map.of(
            "productId", productId,
            "totalSold", totalSold
        );
        
        return ResponseEntity.ok(response);
    }
}