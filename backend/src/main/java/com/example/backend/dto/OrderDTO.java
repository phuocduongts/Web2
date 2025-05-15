package com.example.backend.dto;

import com.example.backend.model.Order;
import com.example.backend.model.OrderDetail;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderDTO {
    private Long id;
    private Long userId;
    private String username;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String shippingPhone;
    private String shippingName;
    private String paymentMethod;
    private String paymentStatus;
    private String orderStatus;
    private String trackingNumber;
    private String notes;
    private List<OrderDetailDTO> orderDetails = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public OrderDTO() {
    }

    // Constructor from entity
    public OrderDTO(Order order) {
        this.id = order.getId();
        if (order.getUser() != null) {
            this.userId = order.getUser().getId();
            this.username = order.getUser().getUsername();
        }
        this.orderDate = order.getOrderDate();
        this.totalAmount = order.getTotalAmount();
        this.shippingAddress = order.getShippingAddress();
        this.shippingPhone = order.getShippingPhone();
        this.shippingName = order.getShippingName();
        this.paymentMethod = order.getPaymentMethod();
        this.paymentStatus = order.getPaymentStatus();
        this.orderStatus = order.getOrderStatus();
        this.trackingNumber = order.getTrackingNumber();
        this.notes = order.getNotes();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
        
        if (order.getOrderDetails() != null) {
            this.orderDetails = order.getOrderDetails().stream()
                    .map(OrderDetailDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Convert DTO to entity
    public Order toEntity() {
        Order order = new Order();
        // Note: User must be set separately as it requires the full User entity
        order.setId(this.id);
        order.setOrderDate(this.orderDate);
        order.setTotalAmount(this.totalAmount);
        order.setShippingAddress(this.shippingAddress);
        order.setShippingPhone(this.shippingPhone);
        order.setShippingName(this.shippingName);
        order.setPaymentMethod(this.paymentMethod);
        order.setPaymentStatus(this.paymentStatus);
        order.setOrderStatus(this.orderStatus);
        order.setTrackingNumber(this.trackingNumber);
        order.setNotes(this.notes);
        return order;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getShippingPhone() {
        return shippingPhone;
    }

    public void setShippingPhone(String shippingPhone) {
        this.shippingPhone = shippingPhone;
    }

    public String getShippingName() {
        return shippingName;
    }

    public void setShippingName(String shippingName) {
        this.shippingName = shippingName;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<OrderDetailDTO> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetailDTO> orderDetails) {
        this.orderDetails = orderDetails;
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