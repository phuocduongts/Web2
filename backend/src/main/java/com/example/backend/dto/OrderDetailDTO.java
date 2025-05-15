package com.example.backend.dto;

import com.example.backend.model.OrderDetail;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDetailDTO {
    private Long id;
    private Long orderId;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public OrderDetailDTO() {
    }

    // Constructor from entity
    public OrderDetailDTO(OrderDetail orderDetail) {
        this.id = orderDetail.getId();
        
        if (orderDetail.getOrder() != null) {
            this.orderId = orderDetail.getOrder().getId();
        }
        
        if (orderDetail.getProduct() != null) {
            this.productId = orderDetail.getProduct().getId();
            // Assuming Product has name and image fields
            this.productName = orderDetail.getProduct().getName();  
            this.productImage = orderDetail.getProduct().getImage();
        }
        
        this.quantity = orderDetail.getQuantity();
        this.unitPrice = orderDetail.getUnitPrice();
        this.subtotal = orderDetail.getSubtotal();
        this.discountAmount = orderDetail.getDiscountAmount();
        this.finalPrice = orderDetail.getFinalPrice();
        this.createdAt = orderDetail.getCreatedAt();
        this.updatedAt = orderDetail.getUpdatedAt();
    }

    // Convert DTO to entity (note: order and product must be set separately)
    public OrderDetail toEntity() {
        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setId(this.id);
        orderDetail.setQuantity(this.quantity);
        orderDetail.setUnitPrice(this.unitPrice);
        orderDetail.setSubtotal(this.subtotal);
        orderDetail.setDiscountAmount(this.discountAmount);
        orderDetail.setFinalPrice(this.finalPrice);
        return orderDetail;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(BigDecimal finalPrice) {
        this.finalPrice = finalPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}